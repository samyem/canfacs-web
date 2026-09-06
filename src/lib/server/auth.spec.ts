import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, generateTempPassword, createSessionToken, parseSessionToken } from './auth';

describe('Authentication & Security Crypto Unit Tests', () => {
	it('hashes passwords consistently using salt and verifyPassword validates match', async () => {
		const raw = 'SuperSecret2026!';
		const hash = await hashPassword(raw);
		expect(hash).toBeDefined();
		expect(hash.length).toBe(64); // SHA-256 produces 64 hex characters

		const matches = await verifyPassword(raw, hash);
		expect(matches).toBe(true);

		const wrong = await verifyPassword('WrongPassword', hash);
		expect(wrong).toBe(false);
	});

	it('generates random temporary passwords with requested length', () => {
		const tempPass = generateTempPassword(12);
		expect(tempPass).toBeDefined();
		expect(tempPass.length).toBe(12);
	});

	it('creates and verifies secure session tokens with expiration', () => {
		const user = {
			id: 'user_123',
			email: 'test@canfacs.org',
			fullName: 'Test User',
			role: 'admin'
		};

		const token = createSessionToken(user);
		expect(token).toBeDefined();

		const parsed = parseSessionToken(token);
		expect(parsed).not.toBeNull();
		expect(parsed.id).toBe(user.id);
		expect(parsed.email).toBe(user.email);
		expect(parsed.role).toBe('admin');
		expect(parsed.exp).toBeGreaterThan(Date.now());
	});

	it('rejects tampered or malformed session tokens', () => {
		const invalid = parseSessionToken('not-a-valid-token-xyz');
		expect(invalid).toBeNull();
	});
});
