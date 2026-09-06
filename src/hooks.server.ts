import type { Handle } from '@sveltejs/kit';
import { parseSessionToken } from '$lib/server/auth';
import { getDb, getMemberById } from '$lib/server/db';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionCookie = event.cookies.get('canfacs_session');
	event.locals.user = null;

	if (sessionCookie) {
		const payload = parseSessionToken(sessionCookie);
		if (payload && payload.id) {
			const db = getDb(event.platform);
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

	return resolve(event);
};
