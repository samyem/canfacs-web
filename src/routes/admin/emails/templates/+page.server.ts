import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	getDb,
	getEmailTemplates,
	getEmailTemplateById,
	upsertEmailTemplate,
	deleteEmailTemplate
} from '$lib/server/db';
import { ensureDefaultTemplates } from '$lib/server/templates';

export const load: PageServerLoad = async ({ locals, platform, url }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		throw redirect(303, '/login');
	}

	const db = getDb(platform);
	const r2Bucket = platform?.env?.IMAGES_BUCKET;

	await ensureDefaultTemplates(db, r2Bucket);

	const templates = await getEmailTemplates(db);
	const editId = url.searchParams.get('edit') || null;
	let currentTemplate = editId ? await getEmailTemplateById(db, editId) : null;

	return {
		templates,
		editId,
		currentTemplate
	};
};

export const actions: Actions = {
	saveTemplate: async ({ request, platform, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const id = (data.get('id') as string) || undefined;
		const name = (data.get('name') as string) || '';
		const description = (data.get('description') as string) || '';
		const subject_default = (data.get('subject_default') as string) || '';
		const html_content = (data.get('html_content') as string) || '';

		if (!name.trim()) {
			return fail(400, { error: 'Template name is required.' });
		}
		if (!html_content.trim()) {
			return fail(400, { error: 'Template HTML body cannot be empty.' });
		}

		const db = getDb(platform);
		const r2Bucket = platform?.env?.IMAGES_BUCKET;

		const r2Key = `templates/${id || 'tmpl_' + crypto.randomUUID().slice(0, 8)}.html`;
		if (r2Bucket) {
			try {
				await r2Bucket.put(r2Key, html_content, {
					httpMetadata: { contentType: 'text/html; charset=utf-8' }
				});
			} catch (e) {
				console.warn('[R2 Template Save Warning]', e);
			}
		}

		const saved = await upsertEmailTemplate(db, {
			id,
			name,
			description,
			subject_default,
			r2_key: r2Key,
			html_content
		});

		return {
			success: true,
			savedId: saved.id,
			message: `Template "${saved.name}" saved successfully to system and R2 storage.`
		};
	},

	deleteTemplate: async ({ request, platform, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const id = (data.get('id') as string) || '';

		if (!id) {
			return fail(400, { error: 'Missing template ID' });
		}

		const db = getDb(platform);
		await deleteEmailTemplate(db, id);

		return {
			success: true,
			message: 'Template removed successfully.'
		};
	}
};
