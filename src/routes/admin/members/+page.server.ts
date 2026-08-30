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
			message: `User ${memberEmail || memberId} role updated to ${newRole === 'admin' ? 'ADMINISTRATOR 👑' : 'MEMBER 👤'}.`
		};
	}
};
