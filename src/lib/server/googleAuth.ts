/**
 * Google OAuth 2.0 Helper for CANFACS
 */

export interface GoogleAuthConfig {
	clientId: string;
	clientSecret: string;
	isConfigured: boolean;
}

export function getGoogleAuthConfig(platform?: App.Platform): GoogleAuthConfig {
	const clientId =
		platform?.env?.GOOGLE_CLIENT_ID ||
		(typeof process !== 'undefined' ? process.env?.GOOGLE_CLIENT_ID || process.env?.VITE_GOOGLE_CLIENT_ID : '') ||
		'';

	const clientSecret =
		platform?.env?.GOOGLE_CLIENT_SECRET ||
		(typeof process !== 'undefined' ? process.env?.GOOGLE_CLIENT_SECRET || process.env?.VITE_GOOGLE_CLIENT_SECRET : '') ||
		'';

	return {
		clientId,
		clientSecret,
		isConfigured: Boolean(clientId && clientSecret)
	};
}
