import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createMember, getAdminEmails, getDb, getMemberByEmail } from '$lib/server/db';
import {
	sendNewMemberAdminNotificationEmail,
	sendPendingMemberConfirmationEmail
} from '$lib/server/email';

export const actions: Actions = {
	default: async ({ request, platform, url }) => {
		const formData = await request.formData();
		const fullName = formData.get('fullName')?.toString().trim();
		const email = formData.get('email')?.toString().trim();
		const phone = formData.get('phone')?.toString().trim();
		const profession = formData.get('profession')?.toString().trim();
		const city = formData.get('city')?.toString().trim();
		const province = formData.get('province')?.toString().trim();
		const bio = formData.get('bio')?.toString().trim();

		if (!fullName || !email) {
			return fail(400, { error: 'Full Name and Email are required fields.' });
		}

		const db = getDb(platform);
		const existing = await getMemberByEmail(db, email);
		if (existing) {
			return fail(400, { error: 'An application or member account already exists with this email address.' });
		}

		const newMember = await createMember(db, {
			full_name: fullName,
			email,
			phone: phone || null,
			profession: profession || null,
			city: city || null,
			province: province || null,
			bio: bio || null
		});

		// Dispatch notifications to admins and the applicant
		const adminEmails = await getAdminEmails(db);
		const reviewUrl = `${url.origin}/admin/members?tab=pending`;

		try {
			await Promise.allSettled([
				sendNewMemberAdminNotificationEmail(
					{
						applicant: newMember,
						adminEmails,
						reviewUrl
					},
					platform?.env
				),
				sendPendingMemberConfirmationEmail(
					{
						applicant: newMember
					},
					platform?.env
				)
			]);
		} catch (emailErr) {
			console.warn('[CANFACS] Non-blocking error sending application notification emails:', emailErr);
		}

		return {
			success: true,
			message: 'Your membership application has been submitted successfully! An administrator will review your application and provide login credentials upon approval.'
		};
	}
};
