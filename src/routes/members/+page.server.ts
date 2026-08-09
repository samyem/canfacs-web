import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAllMembers, getDb } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	const db = getDb(platform);
	const approvedMembers = await getAllMembers(db, 'approved');

	return {
		user: locals.user,
		members: approvedMembers
	};
};
