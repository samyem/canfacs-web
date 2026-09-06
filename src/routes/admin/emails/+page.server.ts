import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	getDb,
	getAllMembers,
	getDonations,
	getEmailBatches,
	getEmailLogsByBatch,
	getEmailTemplates,
	createEmailBatch,
	addEmailLog
} from '$lib/server/db';
import { sendCustomEmail } from '$lib/server/email';
import { generateEmailWithGemini } from '$lib/server/gemini';
import { ensureDefaultTemplates, wrapInTemplate, interpolatePlaceholders } from '$lib/server/templates';

export const load: PageServerLoad = async ({ locals, platform, url }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		throw redirect(303, '/login');
	}

	const db = getDb(platform);
	const r2Bucket = platform?.env?.IMAGES_BUCKET;

	// Ensure default branded templates exist
	await ensureDefaultTemplates(db, r2Bucket);

	// Load templates
	const templates = await getEmailTemplates(db);

	// Load member directory for easy recipient picking
	const members = await getAllMembers(db);

	// Load unique donors
	const rawDonations = await getDonations(db);
	const donorMap = new Map<string, { email: string; name: string; totalAmount: number }>();
	for (const don of rawDonations) {
		if (don.email && don.email.includes('@')) {
			const em = don.email.toLowerCase().trim();
			const existing = donorMap.get(em);
			if (existing) {
				existing.totalAmount += Number(don.amount) || 0;
			} else {
				donorMap.set(em, {
					email: em,
					name: don.donor_name || 'Generous Donor',
					totalAmount: Number(don.amount) || 0
				});
			}
		}
	}
	const donors = Array.from(donorMap.values());

	// Load email batches for audit history
	const batches = await getEmailBatches(db);

	// Selected batch logs inspection
	const inspectBatchId = url.searchParams.get('batchId') || (batches.length > 0 ? batches[0].id : null);
	let batchLogs: any[] = [];
	if (inspectBatchId) {
		batchLogs = await getEmailLogsByBatch(db, inspectBatchId);
	}

	const fromEmail =
		platform?.env?.CLOUDFLARE_FROM_EMAIL ||
		process.env.CLOUDFLARE_FROM_EMAIL ||
		'info@canfacs.org';

	return {
		templates,
		members: members.map((m) => ({
			id: m.id,
			name: m.full_name,
			email: m.email,
			city: m.city || '',
			province: m.province || '',
			role: m.role
		})),
		donors,
		batches,
		inspectBatchId,
		batchLogs,
		fromEmail,
		adminEmail: locals.user.email,
		hasGeminiKey: Boolean(platform?.env?.GEMINI_API_KEY || process.env.GEMINI_API_KEY)
	};
};

export const actions: Actions = {
	generateAi: async ({ request, platform, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const prompt = (data.get('prompt') as string) || '';
		const tone = ((data.get('tone') as any) || 'warm') as 'formal' | 'warm' | 'urgent' | 'celebratory';
		const audience = ((data.get('audience') as any) || 'members') as 'members' | 'donors' | 'public' | 'executive';

		if (!prompt.trim()) {
			return fail(400, { error: 'Please enter a prompt instruction for Gemini.' });
		}

		const result = await generateEmailWithGemini(prompt, { tone, audience }, platform?.env);

		if (!result.success) {
			return fail(500, { error: result.error || 'Gemini email generation failed.' });
		}

		return {
			success: true,
			aiResult: {
				subject: result.subject,
				bodyHtml: result.bodyHtml,
				bodyText: result.bodyText,
				suggestedPlaceholders: result.suggestedPlaceholders,
				summary: result.summary
			}
		};
	},

	sendTest: async ({ request, platform, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const testRecipient = (data.get('test_recipient') as string) || locals.user.email;
		const subject = (data.get('subject') as string) || '';
		const contentHtml = (data.get('content_html') as string) || '';
		const templateId = (data.get('template_id') as string) || '';
		const fromEmail = (data.get('from_email') as string) || 'info@canfacs.org';

		if (!subject.trim()) {
			return fail(400, { error: 'Subject is required for test email.' });
		}

		const db = getDb(platform);
		const templates = await getEmailTemplates(db);
		const selectedTemplate = templates.find((t) => t.id === templateId);

		const sampleData = {
			name: locals.user.fullName || 'Admin User',
			email: testRecipient,
			city: 'Vancouver',
			province: 'BC',
			role: 'admin'
		};

		const finalHtml = selectedTemplate
			? wrapInTemplate(selectedTemplate.html_content, contentHtml, sampleData)
			: interpolatePlaceholders(contentHtml, sampleData);

		const finalSubject = `[TEST] ${interpolatePlaceholders(subject, sampleData)}`;

		const result = await sendCustomEmail(
			{
				to: testRecipient,
				subject: finalSubject,
				html: finalHtml,
				fromAddress: fromEmail
			},
			platform?.env
		);

		if (!result.success) {
			return fail(500, { error: result.error || 'Failed to send test email.' });
		}

		return {
			success: true,
			testSentTo: testRecipient,
			simulated: result.error?.includes('simulated locally')
		};
	},

	sendBatch: async ({ request, platform, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const batchLabel = (data.get('batch_label') as string) || `Broadcast - ${new Date().toLocaleDateString()}`;
		const subject = (data.get('subject') as string) || '';
		const contentHtml = (data.get('content_html') as string) || '';
		const templateId = (data.get('template_id') as string) || '';
		const fromEmail = (data.get('from_email') as string) || 'info@canfacs.org';
		const recipientsRaw = (data.get('recipients_data') as string) || '';

		if (!subject.trim()) {
			return fail(400, { error: 'Email subject cannot be empty.' });
		}
		if (!contentHtml.trim()) {
			return fail(400, { error: 'Email content cannot be empty.' });
		}

		let recipientsList: Array<{ email: string; name?: string; city?: string; province?: string; [key: string]: any }> = [];

		try {
			// Try JSON parse first
			if (recipientsRaw.trim().startsWith('[')) {
				recipientsList = JSON.parse(recipientsRaw);
			} else {
				// Parse CSV / Line-delimited list
				const lines = recipientsRaw.split('\n');
				for (const line of lines) {
					const trimmed = line.trim();
					if (!trimmed) continue;

					// Format: "Name <email@example.com>" or "Name, email@example.com, City" or "email@example.com"
					const angleMatch = trimmed.match(/^([^<]+)<([^>]+)>$/);
					if (angleMatch) {
						recipientsList.push({
							name: angleMatch[1].trim(),
							email: angleMatch[2].trim().toLowerCase()
						});
					} else if (trimmed.includes(',')) {
						const parts = trimmed.split(',').map((p) => p.trim());
						if (parts.length >= 2) {
							// Check which one is the email
							const emailIdx = parts.findIndex((p) => p.includes('@'));
							if (emailIdx !== -1) {
								const em = parts[emailIdx];
								const nm = parts[0] !== em ? parts[0] : parts[1];
								recipientsList.push({
									name: nm,
									email: em.toLowerCase(),
									city: parts[2] || '',
									province: parts[3] || ''
								});
							}
						}
					} else if (trimmed.includes('@')) {
						recipientsList.push({
							email: trimmed.toLowerCase(),
							name: trimmed.split('@')[0]
						});
					}
				}
			}
		} catch (e: any) {
			return fail(400, { error: `Failed to parse recipients list: ${e.message}` });
		}

		// Filter invalid
		recipientsList = recipientsList.filter((r) => r.email && r.email.includes('@'));

		if (recipientsList.length === 0) {
			return fail(400, { error: 'No valid recipient email addresses found in list.' });
		}

		const db = getDb(platform);
		const templates = await getEmailTemplates(db);
		const selectedTemplate = templates.find((t) => t.id === templateId);

		// Create batch record in D1
		const batch = await createEmailBatch(db, {
			label: batchLabel,
			subject,
			template_id: templateId || null,
			from_email: fromEmail,
			sender_admin_id: locals.user.id,
			total_recipients: recipientsList.length,
			success_count: 0,
			failure_count: 0,
			status: 'processing'
		});

		let successCount = 0;
		let failureCount = 0;

		// Dispatch emails
		for (const recipient of recipientsList) {
			const mergeData = {
				name: recipient.name || 'Friend of CANFACS',
				email: recipient.email,
				city: recipient.city || '',
				province: recipient.province || '',
				...recipient
			};

			const renderedSubject = interpolatePlaceholders(subject, mergeData);
			const renderedHtml = selectedTemplate
				? wrapInTemplate(selectedTemplate.html_content, contentHtml, mergeData)
				: interpolatePlaceholders(contentHtml, mergeData);

			const sendResult = await sendCustomEmail(
				{
					to: recipient.email,
					subject: renderedSubject,
					html: renderedHtml,
					fromAddress: fromEmail
				},
				platform?.env
			);

			if (sendResult.success) {
				successCount++;
				await addEmailLog(db, {
					batch_id: batch.id,
					recipient_email: recipient.email,
					recipient_name: recipient.name || null,
					status: 'sent'
				});
			} else {
				failureCount++;
				await addEmailLog(db, {
					batch_id: batch.id,
					recipient_email: recipient.email,
					recipient_name: recipient.name || null,
					status: 'failed',
					error_message: sendResult.error || 'Unknown error'
				});
			}
		}

		// Update batch final counts
		if (db) {
			await db.prepare(`
				UPDATE email_batches
				SET success_count = ?, failure_count = ?, status = 'completed'
				WHERE id = ?
			`).bind(successCount, failureCount, batch.id).run();
		}

		return {
			batchCompleted: true,
			batchId: batch.id,
			batchLabel,
			totalRecipients: recipientsList.length,
			successCount,
			failureCount
		};
	}
};
