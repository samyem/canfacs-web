import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	getDb,
	getAllDocuments,
	getDocumentById,
	createDocument,
	updateDocument,
	deleteDocument,
	getDocumentCategories
} from '$lib/server/db';

export const load: PageServerLoad = async ({ locals, platform, url }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		throw redirect(303, '/login');
	}

	const db = getDb(platform, locals);
	const [rawDocs, categories] = await Promise.all([
		getAllDocuments(db, 'all'),
		getDocumentCategories(db)
	]);

	const editId = url.searchParams.get('edit') || null;
	const isNew = url.searchParams.get('new') === 'true';

	let activeEditDoc = null;
	if (editId) {
		activeEditDoc = await getDocumentById(db, editId);
	}

	const documents = rawDocs.map((doc) => {
		let attachmentList = [];
		try {
			if (doc.attachments) {
				attachmentList = JSON.parse(doc.attachments);
			}
		} catch {
			attachmentList = [];
		}
		return {
			...doc,
			attachmentList
		};
	});

	const totalCount = documents.length;
	const publishedCount = documents.filter((d) => d.status === 'published').length;
	const draftCount = documents.filter((d) => d.status === 'draft').length;
	const totalAttachments = documents.reduce((acc, d) => acc + (d.attachmentList?.length || 0), 0);

	return {
		documents,
		categories,
		stats: {
			totalCount,
			publishedCount,
			draftCount,
			totalAttachments
		},
		activeEditDoc,
		isNew,
		adminName: locals.user.fullName
	};
};

export const actions: Actions = {
	save: async ({ request, locals, platform }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(401, { error: 'Unauthorized. Admin credentials required.' });
		}

		const db = getDb(platform, locals);
		const data = await request.formData();

		const id = (data.get('id') as string) || '';
		const title = ((data.get('title') as string) || '').trim();
		const slug = ((data.get('slug') as string) || '').trim();
		const category = ((data.get('category') as string) || 'General').trim();
		const summary = ((data.get('summary') as string) || '').trim();
		const content_html = ((data.get('content_html') as string) || '').trim();
		const banner_image_url = ((data.get('banner_image_url') as string) || '').trim();
		const attachments = (data.get('attachments') as string) || '[]';
		const status = ((data.get('status') as string) || 'published') as 'published' | 'draft';
		const visibility = ((data.get('visibility') as string) || 'public') as 'public' | 'members' | 'bod' | 'admin';

		if (!title) {
			return fail(400, { error: 'Document title is required.' });
		}

		if (!content_html) {
			return fail(400, { error: 'Document content is required.' });
		}

		try {
			if (id && id !== 'new') {
				const updated = await updateDocument(db, id, {
					title,
					slug: slug || undefined,
					category,
					summary,
					content_html,
					banner_image_url: banner_image_url || null,
					attachments,
					status,
					visibility,
					author_name: locals.user.fullName
				});
				return { success: true, action: 'update', docId: updated?.id || id };
			} else {
				const created = await createDocument(db, {
					title,
					slug: slug || undefined,
					category,
					summary,
					content_html,
					banner_image_url: banner_image_url || null,
					attachments,
					status,
					visibility,
					author_id: locals.user.id,
					author_name: locals.user.fullName
				});
				return { success: true, action: 'create', docId: created.id };
			}
		} catch (err: any) {
			return fail(500, { error: err?.message || 'Failed to save document.' });
		}
	},

	delete: async ({ request, locals, platform }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(401, { error: 'Unauthorized.' });
		}

		const db = getDb(platform, locals);
		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) {
			return fail(400, { error: 'Document ID required.' });
		}

		try {
			await deleteDocument(db, id);
			return { success: true, action: 'delete' };
		} catch (err: any) {
			return fail(500, { error: err?.message || 'Failed to delete document.' });
		}
	},

	toggleStatus: async ({ request, locals, platform }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(401, { error: 'Unauthorized.' });
		}

		const db = getDb(platform, locals);
		const data = await request.formData();
		const id = data.get('id') as string;
		const currentStatus = data.get('currentStatus') as string;

		if (!id) {
			return fail(400, { error: 'Document ID required.' });
		}

		const nextStatus = currentStatus === 'published' ? 'draft' : 'published';

		try {
			await updateDocument(db, id, { status: nextStatus });
			return { success: true, action: 'toggleStatus', nextStatus };
		} catch (err: any) {
			return fail(500, { error: err?.message || 'Failed to toggle status.' });
		}
	}
};
