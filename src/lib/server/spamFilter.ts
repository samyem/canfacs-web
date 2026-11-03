/**
 * Anti-Spam & Malicious Payload Detection Module
 *
 * Protects public registration endpoints (e.g. /join-canfacs) from automated
 * bots, script injection, HTML markup, and malicious spam submissions.
 */

export interface MembershipSubmissionInput {
	fullName: string;
	email: string;
	phone?: string | null;
	profession?: string | null;
	city?: string | null;
	province?: string | null;
	bio?: string | null;
	honeypot?: string | null;
	submissionStart?: string | null;
}

export interface ValidationResult {
	isValid: boolean;
	isSpam: boolean;
	reason?: string;
	field?: string;
}

// Regex patterns to detect HTML markup, tags, and HTML entity encodings
const HTML_TAG_REGEX = /<[a-z!/][\s\S]*?>/i;
const HTML_ENTITY_TAG_REGEX = /(?:&lt;|&gt;|&#60;|&#62;|&#x3c;|&#x3e;)/i;
const HTML_COMMENT_REGEX = /<!--[\s\S]*?-->/;
const CDATA_REGEX = /<!\[CDATA\[[\s\S]*?\]\]>/i;

// Regex patterns to detect JavaScript code, handlers, and pseudo-protocols
const JS_PROTOCOL_REGEX = /(?:javascript|vbscript|data)\s*:/i;
const JS_EVENT_HANDLER_REGEX = /\bon[a-z]{3,}\s*=/i; // e.g. onload=, onerror=, onclick=
const JS_CALLS_REGEX = /\b(eval|alert|prompt|confirm|Function|setTimeout|setInterval)\s*[([]/i;
const JS_DOM_PROPERTIES_REGEX =
	/\b(?:document\.(?:cookie|location|write|domain|getElementById)|window\.(?:location|open|navigate))\b/i;
const SCRIPT_TAG_LIKE_REGEX = /<\s*script\b/i;

// BBCode link injection
const BBCODE_REGEX = /\[(?:url|link|img)[=\]][\s\S]*?\[\/(?:url|link|img)\]/i;

// Common spam / promotional URL pattern
const URL_REGEX = /(?:https?:\/\/|www\.)[a-z0-9._-]+(?::\d+)?(?:\/[^\s]*)?/i;

// Email format RFC standard (strict, no tags or control chars)
const EMAIL_REGEX =
	/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Phone characters (numbers, dashes, parens, plus, spaces, ext)
const PHONE_CHARS_REGEX = /^[0-9+\s\-().extx]{6,30}$/i;

/**
 * Checks if a string contains HTML tags or HTML entity encoded tags.
 */
export function containsHtml(value: string): boolean {
	if (!value) return false;
	return (
		HTML_TAG_REGEX.test(value) ||
		HTML_ENTITY_TAG_REGEX.test(value) ||
		HTML_COMMENT_REGEX.test(value) ||
		CDATA_REGEX.test(value)
	);
}

/**
 * Checks if a string contains JavaScript injection or inline execution patterns.
 */
export function containsJavaScript(value: string): boolean {
	if (!value) return false;
	return (
		JS_PROTOCOL_REGEX.test(value) ||
		JS_EVENT_HANDLER_REGEX.test(value) ||
		JS_CALLS_REGEX.test(value) ||
		JS_DOM_PROPERTIES_REGEX.test(value) ||
		SCRIPT_TAG_LIKE_REGEX.test(value)
	);
}

/**
 * Checks if a string contains web links (http://, https://, or www.)
 */
export function containsLinks(value: string): boolean {
	if (!value) return false;
	return URL_REGEX.test(value) || BBCODE_REGEX.test(value);
}

/**
 * Comprehensive check for HTML and JavaScript injection across any string field.
 */
export function detectHtmlOrScriptInjection(value: string): {
	isSuspicious: boolean;
	reason?: string;
} {
	if (!value) return { isSuspicious: false };

	if (containsHtml(value)) {
		return {
			isSuspicious: true,
			reason: 'HTML tags or markup are not permitted in form fields'
		};
	}

	if (containsJavaScript(value)) {
		return {
			isSuspicious: true,
			reason: 'JavaScript code, execution tokens, or event handlers are not permitted'
		};
	}

	if (BBCODE_REGEX.test(value)) {
		return {
			isSuspicious: true,
			reason: 'BBCode links or formatting tags are not permitted'
		};
	}

	return { isSuspicious: false };
}

/**
 * Validates a membership registration submission for spam, malicious payloads,
 * bot characteristics, and schema violations.
 */
export function validateMembershipSubmission(
	input: MembershipSubmissionInput,
	currentTimeMs: number = Date.now()
): ValidationResult {
	// 1. Honeypot check: Hidden field that only automated bots fill in
	if (input.honeypot && input.honeypot.trim().length > 0) {
		return {
			isValid: false,
			isSpam: true,
			reason: 'Bot honeypot field was populated',
			field: 'honeypot'
		};
	}

	// 2. Submission timing check: Humans take at least 2.5 seconds to fill out the form
	if (input.submissionStart) {
		try {
			// Base64-decoded or numeric epoch timestamp
			let startMs: number;
			if (/^\d+$/.test(input.submissionStart)) {
				startMs = parseInt(input.submissionStart, 10);
			} else {
				// Try parsing base64 timestamp token
				const decoded = atob(input.submissionStart);
				startMs = parseInt(decoded, 10);
			}

			if (!isNaN(startMs) && startMs > 0) {
				const duration = currentTimeMs - startMs;
				// If submitted faster than 2 seconds (2000 ms), flag as bot
				if (duration < 2000) {
					return {
						isValid: false,
						isSpam: true,
						reason: `Form submitted unnaturally fast (${duration}ms). Automated registration blocked.`,
						field: 'submissionTiming'
					};
				}
			}
		} catch {
			// If token was tampered with, continue to next checks
		}
	}

	// 3. Inspect all text fields for HTML or JavaScript injection
	const allFields: { name: string; value?: string | null }[] = [
		{ name: 'fullName', value: input.fullName },
		{ name: 'email', value: input.email },
		{ name: 'phone', value: input.phone },
		{ name: 'profession', value: input.profession },
		{ name: 'city', value: input.city },
		{ name: 'province', value: input.province },
		{ name: 'bio', value: input.bio }
	];

	for (const { name, value } of allFields) {
		if (!value) continue;

		const check = detectHtmlOrScriptInjection(value);
		if (check.isSuspicious) {
			return {
				isValid: false,
				isSpam: true,
				reason: `${check.reason} (detected in field "${name}")`,
				field: name
			};
		}
	}

	// 4. Specific Field Constraints

	// Full Name validation
	const fullName = input.fullName?.trim();
	if (!fullName || fullName.length < 2 || fullName.length > 100) {
		return {
			isValid: false,
			isSpam: false,
			reason: 'Full Name must be between 2 and 100 characters',
			field: 'fullName'
		};
	}

	// Names cannot contain URLs or web domains
	if (containsLinks(fullName)) {
		return {
			isValid: false,
			isSpam: true,
			reason: 'Full Name cannot contain website URLs or domain links',
			field: 'fullName'
		};
	}

	// Names should not have code characters or brackets
	if (new RegExp('[<>{}\\[\\]\\\\/;=*^~]').test(fullName)) {
		return {
			isValid: false,
			isSpam: true,
			reason: 'Full Name contains illegal characters or code syntax',
			field: 'fullName'
		};
	}

	// Email validation
	const email = input.email?.trim();
	if (!email || email.length > 150 || !EMAIL_REGEX.test(email)) {
		return {
			isValid: false,
			isSpam: false,
			reason: 'Please enter a valid email address format',
			field: 'email'
		};
	}

	// Phone validation (if provided)
	if (input.phone) {
		const phone = input.phone.trim();
		if (phone.length > 0) {
			if (containsLinks(phone)) {
				return {
					isValid: false,
					isSpam: true,
					reason: 'Phone number cannot contain URLs',
					field: 'phone'
				};
			}
			if (!PHONE_CHARS_REGEX.test(phone)) {
				return {
					isValid: false,
					isSpam: false,
					reason: 'Phone number contains invalid characters',
					field: 'phone'
				};
			}
		}
	}

	// Profession validation
	if (input.profession) {
		const prof = input.profession.trim();
		if (prof.length > 120) {
			return {
				isValid: false,
				isSpam: false,
				reason: 'Profession exceeds maximum allowed length',
				field: 'profession'
			};
		}
		if (containsLinks(prof)) {
			return {
				isValid: false,
				isSpam: true,
				reason: 'Profession field cannot contain URLs or links',
				field: 'profession'
			};
		}
	}

	// City validation
	if (input.city) {
		const city = input.city.trim();
		if (city.length > 100) {
			return {
				isValid: false,
				isSpam: false,
				reason: 'City exceeds maximum allowed length',
				field: 'city'
			};
		}
		if (containsLinks(city)) {
			return {
				isValid: false,
				isSpam: true,
				reason: 'City cannot contain URLs or links',
				field: 'city'
			};
		}
	}

	// Bio validation
	if (input.bio) {
		const bio = input.bio.trim();
		if (bio.length > 2000) {
			return {
				isValid: false,
				isSpam: false,
				reason: 'Bio must not exceed 2000 characters',
				field: 'bio'
			};
		}
		// Disallow spam link farms in membership application bios
		if (containsLinks(bio)) {
			return {
				isValid: false,
				isSpam: true,
				reason: 'Membership biodata cannot contain promotional URLs or external links',
				field: 'bio'
			};
		}
	}

	return { isValid: true, isSpam: false };
}
