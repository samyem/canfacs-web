import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getAllMembers, getDb, updateMemberStatus, updateMemberRole } from '$lib/server/db';
import { generateTempPassword, hashPassword } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		throw redirect(303, '/login');
	}

	const db = getDb(platform);
	const members = await getAllMembers(db);

	return {
		members,
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

		const db = getDb(platform);
		const { updateMemberProfile } = await import('$lib/server/db');

		await updateMemberProfile(db, memberId, {
			...(full_name !== undefined ? { full_name } : {}),
			salutation: salutation || null,
			phone: phone || null,
			phone_secondary: phone_secondary || null,
			profession: profession || null,
			organizational_role: organizational_role || null,
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

		return {
			success: true,
			message: `Member profile attributes updated successfully.`
		};
	}
};
