import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';
import { getGoogleAuthConfig } from '$lib/server/googleAuth';
import { getDb, getMemberByEmail, createMember, updateMemberStatus } from '$lib/server/db';
import { createSessionToken } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url, cookies, platform }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const error = url.searchParams.get('error');

	if (error || !code) {
		console.warn('Google OAuth error or cancelled:', error);
		throw redirect(303, '/login?error=google_cancelled');
	}

	const storedState = cookies.get('oauth_state');
	cookies.delete('oauth_state', { path: '/' });

	if (!state || state !== storedState) {
		console.warn('Google OAuth state mismatch');
		throw redirect(303, '/login?error=invalid_state');
	}

	const { clientId, clientSecret, isConfigured } = getGoogleAuthConfig(platform);
	if (!isConfigured) {
		throw redirect(303, '/login?error=google_not_configured');
	}

	const redirectUri = `${url.origin}/api/auth/google/callback`;

	// Exchange authorization code for tokens
	const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			code,
			client_id: clientId,
			client_secret: clientSecret,
			redirect_uri: redirectUri,
			grant_type: 'authorization_code'
		})
	});

	const tokenData = await tokenResponse.json().catch(() => ({}));
	if (!tokenResponse.ok || !tokenData.access_token) {
		console.error('Failed to exchange Google token:', tokenData);
		throw redirect(303, '/login?error=token_exchange_failed');
	}

	// Fetch user profile from Google
	const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
		headers: { Authorization: `Bearer ${tokenData.access_token}` }
	});

	const googleUser = await userResponse.json().catch(() => ({}));
	if (!userResponse.ok || !googleUser.email) {
		console.error('Failed to fetch Google user info:', googleUser);
		throw redirect(303, '/login?error=user_info_failed');
	}

	const db = getDb(platform);
	const email = googleUser.email.toLowerCase().trim();
	const ADMIN_EMAILS = ['info@canfacs.org', 'samyem@gmail.com', 'samyem@canfacs.org'];
	const isAdmin = ADMIN_EMAILS.includes(email);
	let member = await getMemberByEmail(db, email);

	if (!member) {
		member = await createMember(db, {
			email,
			full_name: googleUser.name || 'Member',
			phone: null,
			profession: null,
			city: null,
			province: null,
			bio: 'Joined via Google Sign-In'
		});

		// Auto-approve verified Google accounts
		await updateMemberStatus(db, member.id, 'approved');
		member.status = 'approved';

		if (isAdmin) {
			member.role = 'admin';
			if (db) {
				try {
					await db.prepare("UPDATE members SET role = 'admin' WHERE id = ?").bind(member.id).run();
				} catch (err) {
					console.warn('Could not set admin role:', err);
				}
			}
		}
	} else {
		if (member.status === 'pending') {
			// Auto-activate member on verified Google sign-in
			await updateMemberStatus(db, member.id, 'approved');
			member.status = 'approved';
		} else if (member.status === 'denied') {
			throw redirect(303, '/login?error=account_denied');
		}

		if (isAdmin && member.role !== 'admin') {
			member.role = 'admin';
			if (db) {
				try {
					await db.prepare("UPDATE members SET role = 'admin' WHERE id = ?").bind(member.id).run();
				} catch (err) {
					console.warn('Could not update admin role:', err);
				}
			}
		}
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
		secure: url.protocol === 'https:',
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 7 // 7 days
	});

	if (member.role === 'admin') {
		throw redirect(303, '/admin/members');
	}

	throw redirect(303, '/feed');
};
