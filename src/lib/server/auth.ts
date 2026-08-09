// Authentication & Crypto Helpers for CANFACS (Web Crypto compatible)

export async function hashPassword(password: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(password + 'CANFACS_SALT_2026');
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	const computed = await hashPassword(password);
	return computed === hash;
}

export function generateTempPassword(length = 10): string {
	const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
	let pass = '';
	const array = new Uint8Array(length);
	crypto.getRandomValues(array);
	for (let i = 0; i < length; i++) {
		pass += chars[array[i] % chars.length];
	}
	return pass;
}

export function createSessionToken(user: { id: string; email: string; fullName: string; role: string }): string {
	const payload = {
		...user,
		exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
	};
	const json = JSON.stringify(payload);
	return Buffer.from(json).toString('base64url');
}

export function parseSessionToken(token: string) {
	try {
		const json = Buffer.from(token, 'base64url').toString('utf8');
		const payload = JSON.parse(json);
		if (payload.exp < Date.now()) {
			return null;
		}
		return payload;
	} catch {
		return null;
	}
}
