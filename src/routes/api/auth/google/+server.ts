import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';
import { getGoogleAuthConfig } from '$lib/server/googleAuth';

export const GET: RequestHandler = async ({ url, cookies, platform }) => {
	const { clientId, isConfigured } = getGoogleAuthConfig(platform);

	if (!isConfigured) {
		throw redirect(303, '/login?error=google_not_configured');
	}

	const redirectUri = `${url.origin}/api/auth/google/callback`;
	const state = crypto.randomUUID();

	cookies.set('oauth_state', state, {
		path: '/',
		httpOnly: true,
		secure: url.protocol === 'https:',
		sameSite: 'lax',
		maxAge: 60 * 10 // 10 minutes
	});

	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: redirectUri,
		response_type: 'code',
		scope: 'openid email profile',
		state,
		prompt: 'select_account',
		access_type: 'online'
	});

	throw redirect(302, `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
};
