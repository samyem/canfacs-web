import type { PageServerLoad } from './$types';
import { getDb, getPublishedDocuments, getDocumentCategories } from '$lib/server/db';

export const load: PageServerLoad = async ({ platform, locals, url, setHeaders }) => {
	const db = getDb(platform, locals);
	const selectedCategory = url.searchParams.get('category') || 'all';
	const searchQuery = url.searchParams.get('q') || '';

	const userRole = locals.user?.role || null;

	// Edge & Browser Caching:
	// For anonymous public visitors without active search queries, cache the catalog at Cloudflare Edge CDN.
	if (!locals.user && !searchQuery) {
		setHeaders({
			'cache-control': 'public, max-age=180, stale-while-revalidate=86400',
			'vary': 'Cookie, Accept-Encoding'
		});
	} else {
		setHeaders({
			'cache-control': 'private, no-cache, no-store, must-revalidate'
		});
	}

	const [documents, categories] = await Promise.all([
		getPublishedDocuments(db, selectedCategory, searchQuery, userRole),
		getDocumentCategories(db)
	]);

	// Parse attachments counts and stats
	const enrichedDocs = documents.map((doc) => {
		let parsedAttachments = [];
		try {
			if (doc.attachments) {
				parsedAttachments = JSON.parse(doc.attachments);
			}
		} catch {
			parsedAttachments = [];
		}
		return {
			...doc,
			attachmentList: parsedAttachments
		};
	});

	return {
		documents: enrichedDocs,
		categories,
		selectedCategory,
		searchQuery
	};
};
