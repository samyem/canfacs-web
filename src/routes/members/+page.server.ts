import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAllMembers, getDb } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	const hasFullAccess = locals.user.role === 'admin' || locals.user.role === 'bod';
	const db = getDb(platform);

	// Only Board of Directors (BOD) and Administrators have access to the full membership directory
	if (!hasFullAccess) {
		return {
			user: locals.user,
			hasAccess: false,
			members: []
		};
	}

	const approvedMembers = await getAllMembers(db, 'approved');
	const { getAllMemberOrganizationalRoles, getOrganizationalRoles } = await import('$lib/server/db');
	const memberOrgRoles = await getAllMemberOrganizationalRoles(db, true);
	const orgRoles = await getOrganizationalRoles(db);

	return {
		user: locals.user,
		hasAccess: true,
		orgRoles,
		members: approvedMembers.map((m) => {
			const activeAssignment = memberOrgRoles.find((mor) => mor.member_id === m.id);
			return {
				...m,
				organizational_role: activeAssignment?.title || m.organizational_role || null,
				org_role_id: activeAssignment?.role_id || null,
				org_category: activeAssignment?.category || null
			};
		})
	};
};
