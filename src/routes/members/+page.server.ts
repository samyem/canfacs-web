import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAllMembers, getDb } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	const isAdmin = locals.user.role === 'admin';
	const db = getDb(platform);

	// Only administrators have access to the full membership directory and contact info
	if (!isAdmin) {
		return {
			user: locals.user,
			hasAccess: false,
			members: []
		};
	}

	const approvedMembers = await getAllMembers(db, 'approved');

	return {
		user: locals.user,
		hasAccess: true,
		members: approvedMembers
	};
};
