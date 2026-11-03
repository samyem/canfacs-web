/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { actions } from './+page.server';
import { resetRateLimitStore } from '$lib/server/rateLimit';

// Mock DB and Email dependencies so we can verify they are NOT called when spam is submitted
vi.mock('$lib/server/db', () => ({
	getDb: vi.fn(() => ({})),
	getMemberByEmail: vi.fn(),
	createMember: vi.fn(),
	getAdminEmails: vi.fn(() => ['admin@canfacs.org'])
}));

vi.mock('$lib/server/email', () => ({
	sendNewMemberAdminNotificationEmail: vi.fn(),
	sendPendingMemberConfirmationEmail: vi.fn()
}));

import * as dbModule from '$lib/server/db';
import * as emailModule from '$lib/server/email';

describe('Join CANFACS Action Anti-Spam & Throttling Integration Tests', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		resetRateLimitStore();
	});

	function createFormRequest(fields: Record<string, string>, clientIp = '198.51.100.1') {
		const form = new FormData();
		for (const [key, val] of Object.entries(fields)) {
			form.append(key, val);
		}

		const request = new Request('https://canfacs.org/join-canfacs', {
			method: 'POST',
			body: form,
			headers: {
				'cf-connecting-ip': clientIp
			}
		});

		return {
			request,
			platform: undefined,
			url: new URL('https://canfacs.org/join-canfacs'),
			getClientAddress: () => clientIp
		};
	}

	it('blocks spam submission with HTML tags in fullName without calling DB or sending emails', async () => {
		const event = createFormRequest({
			fullName: '<script>alert("xss")</script> Bad Spammer',
			email: 'spammer@spam.org',
			bio: 'Real human applicant bio here'
		});

		const result: any = await actions.default(event as any);

		expect(result.status).toBe(400);
		expect(result.data.error).toContain('Unusual activity detected');

		// Verify database insertion was never attempted
		expect(dbModule.createMember).not.toHaveBeenCalled();

		// Verify no spam emails were triggered
		expect(emailModule.sendNewMemberAdminNotificationEmail).not.toHaveBeenCalled();
		expect(emailModule.sendPendingMemberConfirmationEmail).not.toHaveBeenCalled();
	});

	it('blocks spam submission containing JavaScript in bio', async () => {
		const event = createFormRequest({
			fullName: 'Spam Bot',
			email: 'bot@spam.xyz',
			bio: 'Visit us now! <img src="x" onerror="alert(document.cookie)"/>'
		});

		const result: any = await actions.default(event as any);

		expect(result.status).toBe(400);
		expect(result.data.error).toContain('Unusual activity detected');
		expect(dbModule.createMember).not.toHaveBeenCalled();
		expect(emailModule.sendNewMemberAdminNotificationEmail).not.toHaveBeenCalled();
	});

	it('traps automated bots filling the honeypot field', async () => {
		const event = createFormRequest({
			fullName: 'Honest Looking Bot',
			email: 'bot@automated-traffic.com',
			contact_preferred_website: 'https://spam-affiliate.com' // Honeypot filled!
		});

		const result: any = await actions.default(event as any);

		expect(result.status).toBe(400);
		expect(result.data.error).toContain('Unusual activity detected');
		expect(dbModule.createMember).not.toHaveBeenCalled();
		expect(emailModule.sendNewMemberAdminNotificationEmail).not.toHaveBeenCalled();
	});

	it('blocks loop tries from the same IP with HTTP 429 rate limit error', async () => {
		const clientIp = '203.0.113.88';

		// Fire 5 requests from the same IP (threshold is 5)
		for (let i = 0; i < 5; i++) {
			const event = createFormRequest(
				{
					fullName: '<script>alert(1)</script>',
					email: `spam${i}@test.com`
				},
				clientIp
			);
			await actions.default(event as any);
		}

		// 6th attempt from the same IP must be throttled with 429
		const loopEvent = createFormRequest(
			{
				fullName: 'Legitimate Person',
				email: 'person@example.com'
			},
			clientIp
		);

		const result: any = await actions.default(loopEvent as any);

		expect(result.status).toBe(429);
		expect(result.data.error).toContain('Too many registration attempts');
		expect(dbModule.createMember).not.toHaveBeenCalled();
		expect(emailModule.sendNewMemberAdminNotificationEmail).not.toHaveBeenCalled();
	});

	it('accepts legitimate clean application and invokes email notifications', async () => {
		const legitimateMember = {
			id: 'mem_123',
			full_name: 'Pooja Sharma',
			email: 'pooja.sharma@example.com',
			phone: '604-555-1234',
			profession: 'Physiotherapist',
			city: 'Burnaby',
			province: 'BC',
			bio: 'Eager to volunteer in cultural community programs.'
		};

		vi.mocked(dbModule.getMemberByEmail).mockResolvedValueOnce(null);
		vi.mocked(dbModule.createMember).mockResolvedValueOnce(legitimateMember as any);

		const event = createFormRequest(
			{
				fullName: 'Pooja Sharma',
				email: 'pooja.sharma@example.com',
				phone: '604-555-1234',
				profession: 'Physiotherapist',
				city: 'Burnaby',
				province: 'BC',
				bio: 'Eager to volunteer in cultural community programs.',
				contact_preferred_website: '',
				_submission_start: (Date.now() - 4000).toString()
			},
			'198.51.100.200'
		);

		const result: any = await actions.default(event as any);

		expect(result.success).toBe(true);
		expect(dbModule.createMember).toHaveBeenCalledTimes(1);
		expect(emailModule.sendNewMemberAdminNotificationEmail).toHaveBeenCalledTimes(1);
		expect(emailModule.sendPendingMemberConfirmationEmail).toHaveBeenCalledTimes(1);
	});
});
