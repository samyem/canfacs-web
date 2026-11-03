import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createMember, getAdminEmails, getDb, getMemberByEmail } from '$lib/server/db';
import {
	sendNewMemberAdminNotificationEmail,
	sendPendingMemberConfirmationEmail
} from '$lib/server/email';
import { validateMembershipSubmission } from '$lib/server/spamFilter';
import { checkRegistrationRateLimit } from '$lib/server/rateLimit';

export const load: PageServerLoad = async () => {
	// Generates a base64 encoded timestamp token to evaluate submission timing
	const submissionToken = btoa(Date.now().toString());
	return {
		submissionToken
	};
};

export const actions: Actions = {
	default: async ({ request, platform, url, getClientAddress }) => {
		// 1. IP Rate Limiting & Throttling Check (Cloudflare Workers + Sliding Window)
		const rateLimit = await checkRegistrationRateLimit(
			{ request, platform, getClientAddress },
			{ maxRequests: 5, windowSeconds: 600 } // Max 5 attempts per 10 minutes per IP
		);

		if (!rateLimit.allowed) {
			console.warn(
				`[CANFACS Throttling] Loop attempts blocked for IP ${rateLimit.clientIp}: ${rateLimit.reason}`
			);
			return fail(429, {
				error: `Too many registration attempts from this IP address. Please wait ${rateLimit.retryAfterSeconds || 60} seconds before trying again.`
			});
		}

		const formData = await request.formData();
		const fullName = formData.get('fullName')?.toString().trim();
		const email = formData.get('email')?.toString().trim();
		const phone = formData.get('phone')?.toString().trim();
		const profession = formData.get('profession')?.toString().trim();
		const city = formData.get('city')?.toString().trim();
		const province = formData.get('province')?.toString().trim();
		const bio = formData.get('bio')?.toString().trim();
		const honeypot = formData.get('contact_preferred_website')?.toString().trim();
		const submissionStart = formData.get('_submission_start')?.toString().trim();

		// 2. Validate against spam payloads, HTML tags, JavaScript code, URLs, and bot traps
		const spamCheck = validateMembershipSubmission({
			fullName: fullName || '',
			email: email || '',
			phone,
			profession,
			city,
			province,
			bio,
			honeypot,
			submissionStart
		});

		if (!spamCheck.isValid) {
			console.warn(
				`[CANFACS Spam Filter] Blocked registration attempt from IP ${rateLimit.clientIp}: ${spamCheck.reason}`
			);
			return fail(400, {
				error: spamCheck.isSpam
					? 'Unusual activity detected in registration submission. HTML tags, JavaScript code, external links, and automated submissions are strictly prohibited.'
					: spamCheck.reason || 'Invalid form submission.'
			});
		}

		if (!fullName || !email) {
			return fail(400, { error: 'Full Name and Email are required fields.' });
		}

		const db = getDb(platform);
		const existing = await getMemberByEmail(db, email);
		if (existing) {
			return fail(400, {
				error: 'An application or member account already exists with this email address.'
			});
		}

		const newMember = await createMember(db, {
			full_name: fullName,
			email,
			phone: phone || null,
			profession: profession || null,
			city: city || null,
			province: province || null,
			bio: bio || null
		});

		// Dispatch notifications to admins and the applicant
		const adminEmails = await getAdminEmails(db);
		const reviewUrl = `${url.origin}/admin/members?tab=pending`;

		try {
			await Promise.allSettled([
				sendNewMemberAdminNotificationEmail(
					{
						applicant: newMember,
						adminEmails,
						reviewUrl
					},
					platform?.env
				),
				sendPendingMemberConfirmationEmail(
					{
						applicant: newMember
					},
					platform?.env
				)
			]);
		} catch (emailErr) {
			console.warn(
				'[CANFACS] Non-blocking error sending application notification emails:',
				emailErr
			);
		}

		return {
			success: true,
			message:
				'Your membership application has been submitted successfully! An administrator will review your application and provide login credentials upon approval.'
		};
	}
};
