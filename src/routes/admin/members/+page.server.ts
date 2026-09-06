import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	getAllMembers,
	getDb,
	updateMemberStatus,
	updateMemberRole,
	getOrganizationalRoles,
	getAllMemberOrganizationalRoles,
	assignMemberOrganizationalRole,
	removeMemberOrganizationalRole
} from '$lib/server/db';
import { generateTempPassword, hashPassword } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		throw redirect(303, '/login');
	}

	const db = getDb(platform);
	const members = await getAllMembers(db);
	const orgRoles = await getOrganizationalRoles(db);
	const memberOrgRoles = await getAllMemberOrganizationalRoles(db, false);

	return {
		members: members.map((m) => {
			const activeAssignment = memberOrgRoles.find((mor) => mor.member_id === m.id && (mor.is_active === 1 || mor.is_active === true));
			return {
				...m,
				organizational_role: activeAssignment?.title || m.organizational_role || null,
				org_role_id: activeAssignment?.role_id || null,
				role_start_date: activeAssignment?.start_date || m.role_start_date || null,
				role_end_date: activeAssignment?.end_date || m.role_end_date || null
			};
		}),
		orgRoles,
		memberOrgRoles,
		currentUserId: locals.user.id
	};
};

export const actions: Actions = {
	approve: async ({ request, locals, platform }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const memberId = formData.get('memberId')?.toString();
		const memberEmail = formData.get('memberEmail')?.toString();

		if (!memberId) {
			return fail(400, { error: 'Missing member ID' });
		}

		const tempPassword = generateTempPassword();
		const passwordHash = await hashPassword(tempPassword);
		const db = getDb(platform);

		await updateMemberStatus(db, memberId, 'approved', passwordHash);

		return {
			success: true,
			approvedId: memberId,
			approvedEmail: memberEmail,
			generatedPassword: tempPassword,
			message: `Member ${memberEmail} approved successfully!`
		};
	},

	deny: async ({ request, locals, platform }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const memberId = formData.get('memberId')?.toString();

		if (!memberId) {
			return fail(400, { error: 'Missing member ID' });
		}

		const db = getDb(platform);
		await updateMemberStatus(db, memberId, 'denied');

		return {
			success: true,
			message: 'Member application denied.'
		};
	},

	toggleRole: async ({ request, locals, platform }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const memberId = formData.get('memberId')?.toString();
		const newRole = formData.get('role')?.toString() as 'member' | 'admin';
		const memberEmail = formData.get('memberEmail')?.toString();

		if (!memberId || !newRole) {
			return fail(400, { error: 'Missing member ID or role' });
		}

		if (locals.user.id === memberId && newRole !== 'admin') {
			return fail(400, { error: 'You cannot remove your own admin privileges.' });
		}

		const db = getDb(platform);
		await updateMemberRole(db, memberId, newRole);

		return {
			success: true,
			message: `User ${memberEmail || memberId} role updated to ${newRole.toUpperCase()}.`
		};
	},

	updateProfile: async ({ request, locals, platform }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const memberId = data.get('memberId')?.toString();
		if (!memberId) {
			return fail(400, { error: 'Missing member ID' });
		}

		const full_name = data.get('full_name')?.toString();
		const salutation = data.get('salutation')?.toString();
		const phone = data.get('phone')?.toString();
		const phone_secondary = data.get('phone_secondary')?.toString();
		const profession = data.get('profession')?.toString();
		const organizational_role = data.get('organizational_role')?.toString();
		const role_start_date = data.get('role_start_date')?.toString();
		const role_end_date = data.get('role_end_date')?.toString();
		const address_street = data.get('address_street')?.toString();
		const city = data.get('city')?.toString();
		const province = data.get('province')?.toString();
		const country = data.get('country')?.toString();
		const postal_code = data.get('postal_code')?.toString();
		const facebook_id = data.get('facebook_id')?.toString();
		const instagram_id = data.get('instagram_id')?.toString();
		const associated_organizations = data.get('associated_organizations')?.toString();
		const google_login_enabled = data.get('google_login_enabled') === '1' ? 1 : 0;
		const avatar_url = data.get('avatar_url')?.toString();
		const role = data.get('role')?.toString();

		const org_role_id = data.get('org_role_id')?.toString();
		const org_role_notes = data.get('org_role_notes')?.toString();
		const org_role_active = data.get('org_role_active') !== '0';

		const db = getDb(platform);
		const { updateMemberProfile, getOrganizationalRoles } = await import('$lib/server/db');

		// If org_role_id provided, sync organizational_role title
		let resolvedOrgRoleTitle = organizational_role || null;
		if (org_role_id) {
			const allOrgRoles = await getOrganizationalRoles(db);
			const matched = allOrgRoles.find((r) => r.id === org_role_id);
			if (matched) {
				resolvedOrgRoleTitle = matched.title;
			}
		}

		await updateMemberProfile(db, memberId, {
			...(full_name !== undefined ? { full_name } : {}),
			salutation: salutation || null,
			phone: phone || null,
			phone_secondary: phone_secondary || null,
			profession: profession || null,
			organizational_role: resolvedOrgRoleTitle,
			role_start_date: role_start_date || null,
			role_end_date: role_end_date || null,
			address_street: address_street || null,
			city: city || null,
			province: province || null,
			country: country || 'Canada',
			postal_code: postal_code || null,
			facebook_id: facebook_id || null,
			instagram_id: instagram_id || null,
			associated_organizations: associated_organizations || null,
			google_login_enabled,
			avatar_url: avatar_url || null,
			...(role ? { role } : {})
		});

		// Sync relational table member_organizational_roles
		if (db) {
			if (org_role_id) {
				await db.prepare(`
					INSERT INTO member_organizational_roles (id, member_id, role_id, start_date, end_date, is_active, notes, created_at)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?)
					ON CONFLICT(id) DO UPDATE SET
						role_id = excluded.role_id,
						start_date = excluded.start_date,
						end_date = excluded.end_date,
						is_active = excluded.is_active,
						notes = excluded.notes
				`).bind(
					`mor_${memberId}`,
					memberId,
					org_role_id,
					role_start_date || null,
					role_end_date || null,
					org_role_active ? 1 : 0,
					org_role_notes || null,
					new Date().toISOString()
				).run();
			} else {
				// Mark any existing active role assignment inactive
				await db.prepare(`
					UPDATE member_organizational_roles
					SET is_active = 0, end_date = COALESCE(end_date, DATE('now'))
					WHERE member_id = ? AND is_active = 1
				`).bind(memberId).run();
			}
		}

		return {
			success: true,
			message: `Member profile & organizational roles updated successfully.`
		};
	},

	upsertOrgRole: async ({ request, locals, platform }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const roleId = formData.get('roleId')?.toString();
		const title = formData.get('title')?.toString();
		const category = formData.get('category')?.toString() || 'board';
		const rank_order = Number(formData.get('rank_order')) || 100;
		const description = formData.get('description')?.toString() || '';

		if (!title?.trim()) {
			return fail(400, { error: 'Organizational role title is required.' });
		}

		const db = getDb(platform);
		const { upsertOrganizationalRole } = await import('$lib/server/db');

		const saved = await upsertOrganizationalRole(db, {
			id: roleId || undefined,
			title: title.trim(),
			category: category.trim(),
			rank_order,
			description
		});

		return {
			success: true,
			message: `Organizational role "${saved.title}" saved successfully!`
		};
	},

	deleteOrgRole: async ({ request, locals, platform }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const roleId = formData.get('roleId')?.toString();

		if (!roleId) {
			return fail(400, { error: 'Role ID is required to delete.' });
		}

		const db = getDb(platform);
		const { deleteOrganizationalRole } = await import('$lib/server/db');

		await deleteOrganizationalRole(db, roleId);

		return {
			success: true,
			message: `Organizational role deleted successfully.`
		};
	}
};
