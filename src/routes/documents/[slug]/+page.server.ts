import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDb, getDocumentBySlug, getPublishedDocuments, canUserViewDocument } from '$lib/server/db';

export const load: PageServerLoad = async ({ params, platform, locals, url, setHeaders }) => {
	const db = getDb(platform, locals);
	const slug = params.slug;

	if (!slug) {
		throw error(404, 'Document slug missing');
	}

	const doc = await getDocumentBySlug(db, slug);

	if (!doc) {
		throw error(404, 'Document not found');
	}

	// Draft documents can only be viewed by administrators
	if (doc.status !== 'published' && (!locals.user || locals.user.role !== 'admin')) {
		throw error(404, 'Document not found');
	}

	// RBAC Visibility Check
	if (!canUserViewDocument(doc, locals.user)) {
		if (!locals.user) {
			// Redirect unauthenticated visitor to login
			throw redirect(303, `/login?redirectTo=${encodeURIComponent(url.pathname)}`);
		}
		const requiredRoleLabel =
			doc.visibility === 'bod'
				? 'Board of Directors (BOD)'
				: doc.visibility === 'members'
					? 'CANFACS Members'
					: 'System Administrators';
		throw error(403, `Access Restricted: This document is reserved for ${requiredRoleLabel}.`);
	}

	// Cloudflare Edge & Browser Caching Strategy:
	// Public documents requested by anonymous visitors are cached at Cloudflare's Edge CDN
	// (max-age=300, stale-while-revalidate=86400), completely eliminating D1 hits for public traffic.
	// Private/internal documents or authenticated user sessions bypass the CDN cache.
	if (!locals.user && doc.visibility === 'public') {
		const docTimestamp = new Date(doc.updated_at || doc.created_at).getTime();
		setHeaders({
			'cache-control': 'public, max-age=300, stale-while-revalidate=86400',
			'vary': 'Cookie, Accept-Encoding',
			'etag': `"doc-${doc.id}-${docTimestamp}"`
		});
	} else {
		setHeaders({
			'cache-control': 'private, no-cache, no-store, must-revalidate'
		});
	}

	let attachments = [];
	try {
		if (doc.attachments) {
			attachments = JSON.parse(doc.attachments);
		}
	} catch {
		attachments = [];
	}

	// Load other published documents in same or general category
	const otherDocs = (await getPublishedDocuments(db)).filter((d) => d.id !== doc.id).slice(0, 3);

	return {
		document: doc,
		attachments,
		relatedDocs: otherDocs,
		isAdmin: locals.user?.role === 'admin'
	};
};
