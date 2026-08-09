import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getAllMembers, getDb, updateMemberStatus } from '$lib/server/db';
import { generateTempPassword, hashPassword } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		throw redirect(303, '/login');
	}

	const db = getDb(platform);
	const members = await getAllMembers(db);

	return {
		members
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
	}
};
