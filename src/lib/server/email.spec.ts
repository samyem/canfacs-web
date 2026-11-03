import { describe, it, expect } from 'vitest';
import {
	sendNewMemberAdminNotificationEmail,
	sendPendingMemberConfirmationEmail,
	buildNewMemberAdminNotificationEmail,
	buildPendingMemberConfirmationEmail,
	escapeHtml,
	sanitizeHeader
} from './email';

describe('New Member Email Notifications & HTML Escaping Unit Tests', () => {
	const mockApplicant = {
		id: 'mem_test_123',
		full_name: 'Milan Adhikari',
		email: 'milan.adhikari@example.com',
		phone: '604-555-9876',
		profession: 'Data Engineer',
		city: 'Surrey',
		province: 'BC',
		country: 'Canada',
		bio: 'Passionate about cultural preservation and community service.'
	};

	describe('escapeHtml & sanitizeHeader utilities', () => {
		it('escapes HTML special characters to prevent HTML injection in email clients', () => {
			expect(escapeHtml('<script>alert("xss")</script>')).toBe(
				'&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
			);
			expect(escapeHtml('Tom & Jerry <tom@example.com>')).toBe(
				'Tom &amp; Jerry &lt;tom@example.com&gt;'
			);
			expect(escapeHtml(`<img src="x" onerror='alert(1)'>`)).toBe(
				'&lt;img src=&quot;x&quot; onerror=&#39;alert(1)&#39;&gt;'
			);
			expect(escapeHtml(null)).toBe('');
			expect(escapeHtml(undefined)).toBe('');
		});

		it('sanitizes headers to prevent email header / CRLF injection', () => {
			const dirtyHeader = 'Legit Subject\r\nBcc: evil@attacker.com\r\n\r\nInjected Body';
			expect(sanitizeHeader(dirtyHeader)).toBe(
				'Legit Subject Bcc: evil@attacker.com Injected Body'
			);
			expect(sanitizeHeader(null)).toBe('');
		});
	});

	describe('Email dispatch simulation', () => {
		it('simulates dispatching new member notification to admins including info@canfacs.org', async () => {
			const result = await sendNewMemberAdminNotificationEmail(
				{
					applicant: mockApplicant,
					adminEmails: ['info@canfacs.org', 'admin@canfacs.org'],
					reviewUrl: 'https://canfacs.org/admin/members'
				},
				undefined // simulation mode without Cloudflare API key / binding
			);

			expect(result.success).toBe(true);
			expect(result.sentCount).toBe(2);
		});

		it('simulates dispatching confirmation receipt to the pending member applicant', async () => {
			const result = await sendPendingMemberConfirmationEmail(
				{
					applicant: mockApplicant
				},
				undefined // simulation mode
			);

			expect(result.success).toBe(true);
			expect(result.delivered).toBe(true);
		});

		it('strictly escapes HTML and JavaScript in admin notification emails to prevent rendering inside Gmail', () => {
			const maliciousApplicant = {
				id: 'mem_malicious_1',
				full_name: '<script>alert("pwned")</script> <h1 style="color:red">FAKE NOTICE</h1>',
				email: 'attacker@evil.com',
				phone: '123-456-7890<script>',
				profession: '<a href="https://phish.example.com">Click to Claim</a>',
				city: '<img src="https://evil.com/track.png" onerror="alert(1)">',
				province: 'BC',
				country: 'Canada',
				bio: '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:white">Phishing Form</div>'
			};

			const built = buildNewMemberAdminNotificationEmail({
				applicant: maliciousApplicant,
				adminEmails: ['admin@canfacs.org'],
				reviewUrl: 'https://canfacs.org/admin/members'
			});

			// Verify HTML output contains escaped entities
			expect(built.html).toContain('&lt;script&gt;alert(&quot;pwned&quot;)&lt;/script&gt;');
			expect(built.html).toContain('&lt;h1 style=&quot;color:red&quot;&gt;FAKE NOTICE&lt;/h1&gt;');
			expect(built.html).toContain('&lt;a href=&quot;https://phish.example.com&quot;&gt;');
			expect(built.html).toContain('&lt;img src=&quot;https://evil.com/track.png&quot;');
			expect(built.html).toContain('&lt;div style=&quot;position:fixed;');

			// Verify raw unescaped HTML elements DO NOT exist in the email HTML body
			expect(built.html).not.toContain('<script>');
			expect(built.html).not.toContain('<h1 style="color:red">');
			expect(built.html).not.toContain('<a href="https://phish.example.com">');
			expect(built.html).not.toContain('<img src="https://evil.com');
			expect(built.html).not.toContain('<div style="position:fixed;');

			// Verify subject is sanitized
			expect(built.subject).not.toContain('\r');
			expect(built.subject).not.toContain('\n');
		});

		it('strictly escapes HTML in applicant confirmation emails to prevent reflected HTML in Gmail', () => {
			const maliciousApplicant = {
				id: 'mem_malicious_2',
				full_name: '<script>alert(1)</script> Attacker',
				email: 'victim@example.com',
				phone: '555-0199',
				profession: '<a href="https://phish.com">Special Offer</a>',
				city: 'Toronto<b>City</b>',
				province: 'ON',
				country: 'Canada',
				bio: null
			};

			const built = buildPendingMemberConfirmationEmail({
				applicant: maliciousApplicant
			});

			expect(built.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
			expect(built.html).toContain('&lt;a href=&quot;https://phish.com&quot;&gt;');
			expect(built.html).toContain('&lt;b&gt;City&lt;/b&gt;');
			expect(built.html).not.toContain('<script>');
			expect(built.html).not.toContain('<a href="https://phish.com">');
			expect(built.html).not.toContain('<b>City</b>');
		});
	});
});
