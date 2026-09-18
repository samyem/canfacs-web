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
	removeMemberOrganizationalRole,
	softDeleteMember,
	restoreMember,
	unapproveMember
} from '$lib/server/db';
import { generateTempPassword, hashPassword } from '$lib/server/auth';
import { sendPasswordResetEmail } from '$lib/server/email';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		throw redirect(303, '/login');
	}

	const db = getDb(platform, locals);
	const members = await getAllMembers(db, undefined, true);
	const orgRoles = await getOrganizationalRoles(db);
	const memberOrgRoles = await getAllMemberOrganizationalRoles(db, false);

	return {
		members: members.map((m) => {
			const activeAssignment = memberOrgRoles.find((mor) => mor.member_id === m.id && (mor.is_active === 1 || mor.is_active === true));
			return {
				...m,
				organizational_role: activeAssignment?.title || m.organizational_role || null,
				org_role_id: activeAssignment?.role_id || null,
				org_category: activeAssignment?.category || null,
				parent_role_id: activeAssignment?.parent_role_id || null,
				parent_title: activeAssignment?.parent_title || null,
				role_rank_order: activeAssignment?.rank_order ?? orgRoles.find((r) => r.title.toLowerCase() === (m.organizational_role || '').toLowerCase())?.rank_order ?? 100,
				display_order: m.display_order ?? 100,
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
		const db = getDb(platform, locals);

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

		const db = getDb(platform, locals);
		await updateMemberStatus(db, memberId, 'denied');

		return {
			success: true,
			message: 'Member application denied.'
		};
	},

	unapprove: async ({ request, locals, platform }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const memberId = formData.get('memberId')?.toString();
		const memberEmail = formData.get('memberEmail')?.toString();

		if (!memberId) {
			return fail(400, { error: 'Missing member ID' });
		}

		if (locals.user.id === memberId) {
			return fail(400, { error: 'You cannot unapprove your own administrator account.' });
		}

		const db = getDb(platform, locals);
		await unapproveMember(db, memberId);

		return {
			success: true,
			message: `Member ${memberEmail || memberId} reverted to Pending status.`
		};
	},

	softDelete: async ({ request, locals, platform }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const memberId = formData.get('memberId')?.toString();
		const memberEmail = formData.get('memberEmail')?.toString();

		if (!memberId) {
			return fail(400, { error: 'Missing member ID' });
		}

		if (locals.user.id === memberId) {
			return fail(400, { error: 'You cannot delete your own administrator account.' });
		}

		const db = getDb(platform, locals);
		await softDeleteMember(db, memberId);

		return {
			success: true,
			message: `Member ${memberEmail || memberId} moved to Deleted archive.`
		};
	},

	restore: async ({ request, locals, platform }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const memberId = formData.get('memberId')?.toString();
		const memberEmail = formData.get('memberEmail')?.toString();
		const targetStatus = (formData.get('targetStatus')?.toString() || 'approved') as 'approved' | 'pending';

		if (!memberId) {
			return fail(400, { error: 'Missing member ID' });
		}

		const db = getDb(platform, locals);
		await restoreMember(db, memberId, targetStatus);

		return {
			success: true,
			message: `Member ${memberEmail || memberId} restored to ${targetStatus === 'approved' ? 'Approved' : 'Pending'}.`
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

		const db = getDb(platform, locals);
		await updateMemberRole(db, memberId, newRole);

		return {
			success: true,
			message: `User ${memberEmail || memberId} role updated to ${newRole.toUpperCase()}.`
		};
	},

	resetPassword: async ({ request, locals, platform, url }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const memberId = formData.get('memberId')?.toString();
		const memberEmail = formData.get('memberEmail')?.toString();
		const memberName = formData.get('memberName')?.toString() || 'Member';
		const customPassword = formData.get('customPassword')?.toString()?.trim();

		if (!memberId || !memberEmail) {
			return fail(400, { error: 'Missing member ID or email' });
		}

		const tempPassword = customPassword || generateTempPassword();
		const passwordHash = await hashPassword(tempPassword);
		const db = getDb(platform, locals);

		if (db) {
			await db.prepare(`
				UPDATE members
				SET password_hash = ?, status = 'approved'
				WHERE id = ?
			`).bind(passwordHash, memberId).run();
		}

		// Dispatch branded email notification to member
		const origin = url.origin || 'https://canfacs.org';
		const emailResult = await sendPasswordResetEmail(
			{
				to: memberEmail,
				recipientName: memberName,
				tempPassword,
				loginUrl: `${origin}/login`
			},
			platform?.env
		);

		let emailNotice = 'and emailed to member';
		if (!emailResult.success) {
			emailNotice = `(Email notice note: ${emailResult.error || 'simulated/skipped'})`;
		}

		return {
			success: true,
			approvedId: memberId,
			approvedEmail: memberEmail,
			generatedPassword: tempPassword,
			message: `Password for ${memberEmail} reset successfully ${emailNotice}.`
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
		const bio = data.get('bio')?.toString();
		const facebook_id = data.get('facebook_id')?.toString();
		const instagram_id = data.get('instagram_id')?.toString();
		const associated_organizations = data.get('associated_organizations')?.toString();
		const google_login_enabled = data.get('google_login_enabled') === '1' ? 1 : 0;
		const avatar_url = data.get('avatar_url')?.toString();
		const role = data.get('role')?.toString();
		const display_order_raw = data.get('display_order')?.toString();
		const display_order = display_order_raw !== undefined && display_order_raw !== '' ? Number(display_order_raw) : undefined;

		const org_role_id = data.get('org_role_id')?.toString();
		const org_role_notes = data.get('org_role_notes')?.toString();
		const org_role_active = data.get('org_role_active') !== '0';

		const db = getDb(platform, locals);
		const { updateMemberProfile, getOrganizationalRoles, syncMemberOrganizationalRole } = await import('$lib/server/db');

		// Resolve organizational role title based on org_role_id selection
		let resolvedOrgRoleTitle: string | null = null;
		if (org_role_id) {
			const allOrgRoles = await getOrganizationalRoles(db);
			const matched = allOrgRoles.find((r) => r.id === org_role_id);
			resolvedOrgRoleTitle = matched ? matched.title : org_role_id;
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
			bio: bio !== undefined ? (bio.trim() || null) : null,
			facebook_id: facebook_id || null,
			instagram_id: instagram_id || null,
			associated_organizations: associated_organizations || null,
			google_login_enabled,
			avatar_url: avatar_url || null,
			...(display_order !== undefined && !isNaN(display_order) ? { display_order } : {}),
			...(role ? { role } : {})
		});

		// Sync relational role assignment in both D1 and in-memory store
		await syncMemberOrganizationalRole(
			db,
			memberId,
			org_role_id,
			role_start_date || null,
			role_end_date || null,
			org_role_active,
			org_role_notes || null
		);

		return {
			success: true,
			updatedMember: {
				id: memberId,
				...(full_name !== undefined ? { full_name } : {}),
				salutation: salutation || null,
				phone: phone || null,
				phone_secondary: phone_secondary || null,
				profession: profession || null,
				organizational_role: resolvedOrgRoleTitle,
				org_role_id: org_role_id || null,
				role_start_date: role_start_date || null,
				role_end_date: role_end_date || null,
				address_street: address_street || null,
				city: city || null,
				province: province || null,
				country: country || 'Canada',
				postal_code: postal_code || null,
				bio: bio !== undefined ? (bio.trim() || null) : null,
				facebook_id: facebook_id || null,
				instagram_id: instagram_id || null,
				associated_organizations: associated_organizations || null,
				google_login_enabled,
				avatar_url: avatar_url || null,
				...(display_order !== undefined && !isNaN(display_order) ? { display_order } : {}),
				...(role ? { role } : {})
			},
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
		const parent_role_id = formData.get('parent_role_id')?.toString() || null;

		if (!title?.trim()) {
			return fail(400, { error: 'Organizational role title is required.' });
		}

		const db = getDb(platform, locals);
		const { upsertOrganizationalRole } = await import('$lib/server/db');

		const saved = await upsertOrganizationalRole(db, {
			id: roleId || undefined,
			title: title.trim(),
			category: category.trim(),
			rank_order,
			description,
			parent_role_id
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

		const db = getDb(platform, locals);
		const { deleteOrganizationalRole } = await import('$lib/server/db');

		await deleteOrganizationalRole(db, roleId);

		return {
			success: true,
			message: `Organizational role deleted successfully.`
		};
	},

	createMember: async ({ request, locals, platform }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const email = data.get('email')?.toString().trim().toLowerCase();
		const full_name = data.get('full_name')?.toString().trim();
		const salutation = data.get('salutation')?.toString().trim() || null;
		const role = (data.get('role')?.toString() || 'member') as any;
		const org_role_id = data.get('org_role_id')?.toString() || null;
		const profession = data.get('profession')?.toString().trim() || null;
		const phone = data.get('phone')?.toString().trim() || null;
		const city = data.get('city')?.toString().trim() || null;
		const province = data.get('province')?.toString().trim() || null;
		const country = data.get('country')?.toString().trim() || 'Canada';
		const postal_code = data.get('postal_code')?.toString().trim() || null;
		const bio = data.get('bio')?.toString().trim() || null;
		const avatar_url = data.get('avatar_url')?.toString().trim() || null;

		const display_order_raw = data.get('display_order')?.toString();
		const display_order = display_order_raw !== undefined && display_order_raw !== '' ? Number(display_order_raw) : 100;

		if (!email || !full_name) {
			return fail(400, { error: 'Full name and email address are required.' });
		}

		const db = getDb(platform, locals);
		const { getMemberByEmail, updateMemberProfile, getOrganizationalRoles } = await import('$lib/server/db');
		const existing = await getMemberByEmail(db, email);
		if (existing) {
			return fail(400, { error: `A member with email "${email}" already exists.` });
		}

		const tempPassword = generateTempPassword();
		const passwordHash = await hashPassword(tempPassword);
		const id = 'mem_' + crypto.randomUUID().slice(0, 10);
		const now = new Date().toISOString();

		let resolvedOrgRoleTitle: string | null = null;
		if (org_role_id) {
			const allOrgRoles = await getOrganizationalRoles(db);
			const matched = allOrgRoles.find((r) => r.id === org_role_id);
			if (matched) resolvedOrgRoleTitle = matched.title;
		}

		if (db) {
			await db.prepare(`
				INSERT INTO members (
					id, email, password_hash, full_name, salutation, phone, profession,
					organizational_role, city, province, country, postal_code, bio, avatar_url,
					display_order, status, role, google_login_enabled, created_at, approved_at
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?, 1, ?, ?)
			`).bind(
				id, email, passwordHash, full_name, salutation, phone, profession,
				resolvedOrgRoleTitle, city, province, country, postal_code, bio, avatar_url,
				display_order, role, now, now
			).run();

			if (org_role_id) {
				await db.prepare(`
					INSERT INTO member_organizational_roles (id, member_id, role_id, is_active, created_at)
					VALUES (?, ?, ?, 1, ?)
				`).bind(`mor_${id}`, id, org_role_id, now).run();
			}
		}

		return {
			success: true,
			approvedEmail: email,
			generatedPassword: tempPassword,
			message: `New member "${full_name}" created & approved successfully!`
		};
	},

	reorderMember: async ({ request, locals, platform }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}
		const formData = await request.formData();
		const memberId = formData.get('memberId')?.toString();
		const targetMemberId = formData.get('targetMemberId')?.toString();
		const group = formData.get('group')?.toString();

		if (!memberId || !targetMemberId) {
			return fail(400, { error: 'Missing reordering target' });
		}

		const db = getDb(platform, locals);
		const { getAllMembers, getOrganizationalRoles, getAllMemberOrganizationalRoles } = await import('$lib/server/db');

		const members = await getAllMembers(db, 'approved');
		const orgRoles = await getOrganizationalRoles(db);
		const memberOrgRoles = await getAllMemberOrganizationalRoles(db, true);

		// Determine advisory vs bod
		const isAdvisor = (m: any) => {
			const activeAssignment = memberOrgRoles.find((mor) => mor.member_id === m.id && (mor.is_active === 1 || mor.is_active === true));
			const matchedRole = orgRoles.find((r) => r.id === activeAssignment?.role_id || r.title.toLowerCase() === (m.organizational_role || '').toLowerCase());
			const category = activeAssignment?.category || matchedRole?.category || (m.role === 'advisory' ? 'advisory' : 'board');
			const title = (activeAssignment?.title || matchedRole?.title || m.organizational_role || '').toLowerCase();
			return category === 'advisory' || title.includes('advisor') || title.includes('founder') || title.includes('consul');
		};

		const groupMembers = members.filter((m) => {
			if (group === 'advisory') return isAdvisor(m);
			return !isAdvisor(m) && (
				m.role === 'bod' || m.role === 'admin' ||
				m.organizational_role?.toLowerCase().includes('director') ||
				m.organizational_role?.toLowerCase().includes('president') ||
				m.organizational_role?.toLowerCase().includes('secretary') ||
				m.organizational_role?.toLowerCase().includes('treasurer')
			);
		});

		// Sort by current effective order
		groupMembers.sort((a, b) => {
			const activeA = memberOrgRoles.find((mor) => mor.member_id === a.id && (mor.is_active === 1 || mor.is_active === true));
			const activeB = memberOrgRoles.find((mor) => mor.member_id === b.id && (mor.is_active === 1 || mor.is_active === true));
			const roleA = orgRoles.find((r) => r.id === activeA?.role_id || r.title.toLowerCase() === (a.organizational_role || '').toLowerCase());
			const roleB = orgRoles.find((r) => r.id === activeB?.role_id || r.title.toLowerCase() === (b.organizational_role || '').toLowerCase());
			const effA = a.display_order !== 100 ? (a.display_order ?? 100) : (activeA?.rank_order ?? roleA?.rank_order ?? 100);
			const effB = b.display_order !== 100 ? (b.display_order ?? 100) : (activeB?.rank_order ?? roleB?.rank_order ?? 100);
			if (effA !== effB) return effA - effB;
			return (a.full_name || '').localeCompare(b.full_name || '');
		});

		const fromIndex = groupMembers.findIndex((m) => m.id === memberId);
		const toIndex = groupMembers.findIndex((m) => m.id === targetMemberId);

		if (fromIndex !== -1 && toIndex !== -1) {
			const [moved] = groupMembers.splice(fromIndex, 1);
			groupMembers.splice(toIndex, 0, moved);

			if (db) {
				const stmts = groupMembers.map((m, idx) => {
					return db.prepare(`UPDATE members SET display_order = ? WHERE id = ?`).bind(idx + 1, m.id);
				});
				await db.batch(stmts);
			} else {
				groupMembers.forEach((m, idx) => {
					m.display_order = idx + 1;
				});
			}
			const { invalidateTeamLeadershipCache } = await import('$lib/server/db');
			invalidateTeamLeadershipCache();
		}

		return {
			success: true,
			message: 'Presentation order updated.'
		};
	}
};
