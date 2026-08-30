import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDb, getMemberByEmail } from '$lib/server/db';
import { createSessionToken, verifyPassword } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) {
		throw redirect(303, '/feed');
	}

	const errorParam = url.searchParams.get('error');
	let error: string | null = null;

	if (errorParam === 'google_not_configured') {
		error = 'Google Sign-In is not currently configured.';
	} else if (errorParam === 'google_cancelled') {
		error = 'Google Sign-In was cancelled.';
	} else if (errorParam === 'account_denied') {
		error = 'Your account application has been reviewed and declined.';
	} else if (errorParam === 'invalid_state' || errorParam === 'token_exchange_failed' || errorParam === 'user_info_failed') {
		error = 'Unable to complete Google authentication. Please try again or use email.';
	}

	return { error };
};

export const actions: Actions = {
	default: async ({ request, cookies, platform }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString().trim();
		const password = formData.get('password')?.toString();

		if (!email || !password) {
			return fail(400, { error: 'Please provide both email and password.' });
		}

		const db = getDb(platform);
		const member = await getMemberByEmail(db, email);

		if (!member) {
			return fail(400, { error: 'No account found with this email address.' });
		}

		if (member.status === 'pending') {
			return fail(400, {
				error: 'Your membership application is currently pending administrator approval. Once approved, login credentials will be activated.'
			});
		}

		if (member.status === 'denied') {
			return fail(400, { error: 'Your membership application has been reviewed and declined.' });
		}

		if (!member.password_hash) {
			return fail(400, { error: 'Password has not been set for this account. Please contact CANFACS admin.' });
		}

		const isValid = await verifyPassword(password, member.password_hash);
		if (!isValid) {
			return fail(400, { error: 'Incorrect email or password.' });
		}

		const sessionToken = createSessionToken({
			id: member.id,
			email: member.email,
			fullName: member.full_name,
			role: member.role
		});

		cookies.set('canfacs_session', sessionToken, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7 // 7 days
		});

		if (member.role === 'admin') {
			throw redirect(303, '/admin/members');
		}

		throw redirect(303, '/feed');
	}
};
