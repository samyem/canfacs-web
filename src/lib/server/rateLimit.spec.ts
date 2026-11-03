import { describe, it, expect, beforeEach } from 'vitest';
import { getClientIp, checkRegistrationRateLimit, resetRateLimitStore } from './rateLimit';

describe('Rate Limiting & Throttling Unit Tests', () => {
	beforeEach(() => {
		resetRateLimitStore();
	});

	describe('getClientIp', () => {
		it('extracts IP from cf-connecting-ip header', () => {
			const req = new Request('https://canfacs.org/join-canfacs', {
				headers: {
					'cf-connecting-ip': '203.0.113.195'
				}
			});
			expect(getClientIp({ request: req })).toBe('203.0.113.195');
		});

		it('extracts IP from x-forwarded-for header when cf-connecting-ip is not present', () => {
			const req = new Request('https://canfacs.org/join-canfacs', {
				headers: {
					'x-forwarded-for': '198.51.100.24, 10.0.0.1'
				}
			});
			expect(getClientIp({ request: req })).toBe('198.51.100.24');
		});

		it('falls back to 127.0.0.1 when no headers or getClientAddress exist', () => {
			const req = new Request('https://canfacs.org/join-canfacs');
			expect(getClientIp({ request: req })).toBe('127.0.0.1');
		});
	});

	describe('checkRegistrationRateLimit', () => {
		it('allows submissions under the maximum threshold', async () => {
			const req = new Request('https://canfacs.org/join-canfacs', {
				headers: { 'cf-connecting-ip': '192.0.2.1' }
			});

			for (let i = 0; i < 3; i++) {
				const res = await checkRegistrationRateLimit(
					{ request: req },
					{ maxRequests: 3, windowSeconds: 60 }
				);
				expect(res.allowed).toBe(true);
			}
		});

		it('blocks loop tries from the same IP when the threshold is exceeded', async () => {
			const req = new Request('https://canfacs.org/join-canfacs', {
				headers: { 'cf-connecting-ip': '198.51.100.99' }
			});

			const options = { maxRequests: 3, windowSeconds: 60 };

			// 3 allowed
			for (let i = 0; i < 3; i++) {
				const res = await checkRegistrationRateLimit({ request: req }, options);
				expect(res.allowed).toBe(true);
			}

			// 4th try from same IP is throttled/blocked
			const throttledRes = await checkRegistrationRateLimit({ request: req }, options);
			expect(throttledRes.allowed).toBe(false);
			expect(throttledRes.reason).toContain('Too many registration attempts');
			expect(throttledRes.retryAfterSeconds).toBeGreaterThan(0);
		});

		it('handles Cloudflare Workers native rate limiter binding limit rejection', async () => {
			const mockPlatform = {
				env: {
					REGISTRATION_RATE_LIMITER: {
						limit: async () => ({ success: false }) // simulated Cloudflare throttle
					}
				}
			} as unknown as App.Platform;

			const req = new Request('https://canfacs.org/join-canfacs', {
				headers: { 'cf-connecting-ip': '198.51.100.50' }
			});

			const res = await checkRegistrationRateLimit({
				request: req,
				platform: mockPlatform
			});

			expect(res.allowed).toBe(false);
			expect(res.reason).toContain('Cloudflare edge rate limiter');
		});
	});
});
