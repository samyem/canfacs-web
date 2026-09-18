import type { Handle } from '@sveltejs/kit';
import { parseSessionToken } from '$lib/server/auth';
import { getDb, getMemberById } from '$lib/server/db';

export const handle: Handle = async ({ event, resolve }) => {
	const rawDb = event.platform?.env?.DB;
	const d1Bookmark = event.cookies.get('d1_bookmark') || 'first-unconstrained';
	let d1Session: any = rawDb;
	if (rawDb && typeof rawDb.withSession === 'function') {
		try {
			d1Session = rawDb.withSession(d1Bookmark);
		} catch (err) {
			console.warn('Error starting D1 session with bookmark:', err);
			d1Session = rawDb;
		}
	}
	event.locals.db = d1Session;

	const sessionCookie = event.cookies.get('canfacs_session');
	event.locals.user = null;

	if (sessionCookie) {
		const payload = parseSessionToken(sessionCookie);
		if (payload && payload.id) {
			const db = getDb(event.platform, event.locals);
			const member = await getMemberById(db, payload.id);
			if (member && member.status === 'approved') {
				event.locals.user = {
					id: member.id,
					email: member.email,
					fullName: member.full_name,
					avatarUrl: member.avatar_url || null,
					role: member.role,
					status: member.status
				};
			}
		}
	}

	const response = await resolve(event);

	if (d1Session && typeof d1Session.getBookmark === 'function') {
		try {
			const newBookmark = d1Session.getBookmark();
			if (newBookmark && newBookmark !== d1Bookmark) {
				event.cookies.set('d1_bookmark', newBookmark, {
					path: '/',
					httpOnly: true,
					sameSite: 'lax',
					maxAge: 60 * 60 // 1 hour
				});
			}
		} catch {
			// Non-blocking bookmark capture
		}
	}

	return response;
};
