import { describe, it, expect } from 'vitest';
import {
	containsHtml,
	containsJavaScript,
	containsLinks,
	detectHtmlOrScriptInjection,
	validateMembershipSubmission
} from './spamFilter';

describe('Spam and Malicious Payload Detection Tests', () => {
	describe('containsHtml', () => {
		it('detects standard HTML script, link, and formatting tags', () => {
			expect(containsHtml('<script>alert("xss")</script>')).toBe(true);
			expect(containsHtml('<a href="https://spam.example.com">Cheap Meds</a>')).toBe(true);
			expect(containsHtml('<iframe src="http://evil.com"></iframe>')).toBe(true);
			expect(containsHtml('<img src="x" onerror="evil()">')).toBe(true);
			expect(containsHtml('<b>Bold Text</b>')).toBe(true);
			expect(containsHtml('<div style="display:none">hidden</div>')).toBe(true);
		});

		it('detects HTML entity encoded tags and comments', () => {
			expect(containsHtml('&lt;script&gt;evil()&lt;/script&gt;')).toBe(true);
			expect(containsHtml('&#60;b&#62;spam&#60;/b&#62;')).toBe(true);
			expect(containsHtml('<!-- HTML comment injection -->')).toBe(true);
			expect(containsHtml('<![CDATA[malicious payload]]>')).toBe(true);
		});

		it('allows standard clean human text without HTML', () => {
			expect(containsHtml('Dr. Ram Sharma')).toBe(false);
			expect(containsHtml('Software Engineer & Community Volunteer')).toBe(false);
			expect(containsHtml('Surrey, British Columbia')).toBe(false);
		});
	});

	describe('containsJavaScript', () => {
		it('detects javascript pseudo-protocols and inline event handlers', () => {
			expect(containsJavaScript('javascript:alert(1)')).toBe(true);
			expect(containsJavaScript('javascript : alert(document.cookie)')).toBe(true);
			expect(containsJavaScript('onload=malicious()')).toBe(true);
			expect(containsJavaScript('onerror = alert("xss")')).toBe(true);
			expect(containsJavaScript('onclick=stealData()')).toBe(true);
			expect(containsJavaScript('eval(String.fromCharCode(88,83,83))')).toBe(true);
			expect(containsJavaScript('alert("hacked")')).toBe(true);
			expect(containsJavaScript('document.cookie')).toBe(true);
			expect(containsJavaScript('window.location = "http://bad.com"')).toBe(true);
		});

		it('does not false-positive on legitimate words like "JavaScript" in text', () => {
			expect(containsJavaScript('I am a senior JavaScript and TypeScript developer.')).toBe(false);
			expect(containsJavaScript('Interested in web development and cultural preservation.')).toBe(
				false
			);
		});
	});

	describe('containsLinks', () => {
		it('detects URLs and BBCode links', () => {
			expect(containsLinks('Visit http://spamsite.xyz for prizes')).toBe(true);
			expect(containsLinks('Check out https://scam.org')).toBe(true);
			expect(containsLinks('Go to www.freepromos.top today')).toBe(true);
			expect(containsLinks('[url=http://spam.com]Click Here[/url]')).toBe(true);
		});

		it('returns false for text without links', () => {
			expect(containsLinks('Civil Engineer living in Vancouver, BC')).toBe(false);
		});
	});

	describe('detectHtmlOrScriptInjection', () => {
		it('detects both HTML and Script injections', () => {
			expect(detectHtmlOrScriptInjection('<script>bad()</script>').isSuspicious).toBe(true);
			expect(detectHtmlOrScriptInjection('javascript:bad()').isSuspicious).toBe(true);
			expect(detectHtmlOrScriptInjection('[url=http://bad.com]link[/url]').isSuspicious).toBe(true);
			expect(detectHtmlOrScriptInjection('Clean Bio text').isSuspicious).toBe(false);
		});
	});

	describe('validateMembershipSubmission', () => {
		const validSubmission = {
			fullName: 'Suresh Adhikari',
			email: 'suresh.adhikari@example.com',
			phone: '(604) 555-0199',
			profession: 'Civil Engineer',
			city: 'Vancouver',
			province: 'BC',
			bio: 'Long-time community supporter interested in Nepal-Canada cultural exchange.',
			honeypot: '',
			submissionStart: (Date.now() - 5000).toString() // filled 5 seconds ago
		};

		it('accepts a clean, legitimate registration submission', () => {
			const result = validateMembershipSubmission(validSubmission);
			expect(result.isValid).toBe(true);
			expect(result.isSpam).toBe(false);
		});

		it('detects and blocks HTML in fullName', () => {
			const result = validateMembershipSubmission({
				...validSubmission,
				fullName: '<b>SpamBot</b> <script>alert(1)</script>'
			});
			expect(result.isValid).toBe(false);
			expect(result.isSpam).toBe(true);
			expect(result.reason).toContain('HTML tags');
		});

		it('detects and blocks HTML in bio', () => {
			const result = validateMembershipSubmission({
				...validSubmission,
				bio: 'Hello check out <a href="http://poker.com">online poker</a> now!'
			});
			expect(result.isValid).toBe(false);
			expect(result.isSpam).toBe(true);
		});

		it('detects and blocks JavaScript event handlers in form fields', () => {
			const result = validateMembershipSubmission({
				...validSubmission,
				city: 'Toronto" onerror=alert(1) "'
			});
			expect(result.isValid).toBe(false);
			expect(result.isSpam).toBe(true);
			expect(result.reason).toContain('JavaScript code');
		});

		it('traps bots that fill the invisible honeypot field', () => {
			const result = validateMembershipSubmission({
				...validSubmission,
				honeypot: 'http://automated-bot-site.com'
			});
			expect(result.isValid).toBe(false);
			expect(result.isSpam).toBe(true);
			expect(result.reason).toContain('honeypot');
		});

		it('detects and blocks submissions that happen too quickly (< 2000ms)', () => {
			const now = Date.now();
			const result = validateMembershipSubmission(
				{
					...validSubmission,
					submissionStart: (now - 500).toString() // only 500ms
				},
				now
			);
			expect(result.isValid).toBe(false);
			expect(result.isSpam).toBe(true);
			expect(result.reason).toContain('Automated registration blocked');
		});

		it('rejects URLs dumped into the fullName or profession', () => {
			const result = validateMembershipSubmission({
				...validSubmission,
				fullName: 'https://cheap-loans.xyz'
			});
			expect(result.isValid).toBe(false);
			expect(result.isSpam).toBe(true);
			expect(result.reason).toContain('cannot contain website URLs');
		});

		it('rejects spam link farms in the bio field', () => {
			const result = validateMembershipSubmission({
				...validSubmission,
				bio: 'Buy crypto at https://crypto-exchange-scam.ru now with discount'
			});
			expect(result.isValid).toBe(false);
			expect(result.isSpam).toBe(true);
			expect(result.reason).toContain('promotional URLs');
		});
	});
});
