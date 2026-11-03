/**
 * IP Rate Limiting & Cloudflare Throttling Module
 *
 * Implements dual-layer throttling:
 * 1. Cloudflare Workers native rate limiter binding (platform.env.REGISTRATION_RATE_LIMITER)
 * 2. In-memory sliding-window IP rate limiter fallback (for dev/tests and defense-in-depth)
 */

export interface RateLimitCheckOptions {
	maxRequests?: number;
	windowSeconds?: number;
}

export interface RateLimitResult {
	allowed: boolean;
	clientIp: string;
	retryAfterSeconds?: number;
	reason?: string;
}

// In-memory sliding-window store for fallback rate limiting
interface IpAttemptRecord {
	timestamps: number[];
}

const memoryStore = new Map<string, IpAttemptRecord>();
const DEFAULT_MAX_REQUESTS = 5;
const DEFAULT_WINDOW_SECONDS = 600; // 10 minutes

// Periodic cleanup of stale memory records every 5 minutes
let lastCleanup = Date.now();
function cleanupStaleRecords(now: number, windowMs: number) {
	if (now - lastCleanup < 300_000) return;
	lastCleanup = now;

	for (const [ip, record] of memoryStore.entries()) {
		record.timestamps = record.timestamps.filter((t) => now - t < windowMs);
		if (record.timestamps.length === 0) {
			memoryStore.delete(ip);
		}
	}
}

/**
 * Safely extracts the client IP address from Cloudflare headers, proxy headers,
 * or SvelteKit's getClientAddress().
 */
export function getClientIp(event: { request: Request; getClientAddress?: () => string }): string {
	try {
		// 1. Cloudflare primary client IP header
		const cfConnectingIp = event.request.headers.get('cf-connecting-ip');
		if (cfConnectingIp && cfConnectingIp.trim().length > 0) {
			return cfConnectingIp.trim();
		}

		// 2. Standard X-Forwarded-For header
		const xForwardedFor = event.request.headers.get('x-forwarded-for');
		if (xForwardedFor) {
			const firstIp = xForwardedFor.split(',')[0].trim();
			if (firstIp) return firstIp;
		}

		// 3. SvelteKit getClientAddress helper (safe invocation)
		if (typeof event.getClientAddress === 'function') {
			const address = event.getClientAddress();
			if (address) return address.trim();
		}
	} catch {
		// Safe fallback if running in test environment where socket address is absent
	}

	return '127.0.0.1';
}

/**
 * Checks and increments the rate limit for a given client IP.
 * Uses Cloudflare Workers rate limiter binding if available, followed by
 * an in-memory sliding-window check.
 */
export async function checkRegistrationRateLimit(
	event: {
		request: Request;
		platform?: App.Platform;
		getClientAddress?: () => string;
	},
	options: RateLimitCheckOptions = {}
): Promise<RateLimitResult> {
	const maxRequests = options.maxRequests ?? DEFAULT_MAX_REQUESTS;
	const windowSeconds = options.windowSeconds ?? DEFAULT_WINDOW_SECONDS;
	const windowMs = windowSeconds * 1000;
	const clientIp = getClientIp(event);
	const now = Date.now();

	// 1. Check Cloudflare Native Worker Rate Limiting binding if configured
	const cfRateLimiter = event.platform?.env?.REGISTRATION_RATE_LIMITER;
	if (cfRateLimiter && typeof cfRateLimiter.limit === 'function') {
		try {
			const outcome = await cfRateLimiter.limit({ key: clientIp });
			if (!outcome.success) {
				return {
					allowed: false,
					clientIp,
					retryAfterSeconds: 60,
					reason: 'Cloudflare edge rate limiter: too many registration attempts from this IP'
				};
			}
		} catch (cfErr) {
			console.warn(
				'[CANFACS] Cloudflare rate limiter binding exception, falling back to local window:',
				cfErr
			);
		}
	}

	// 2. In-memory sliding-window rate limiting fallback
	cleanupStaleRecords(now, windowMs);

	let record = memoryStore.get(clientIp);
	if (!record) {
		record = { timestamps: [] };
		memoryStore.set(clientIp, record);
	}

	// Filter out timestamps outside the active window
	record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

	if (record.timestamps.length >= maxRequests) {
		const oldestTimestamp = record.timestamps[0];
		const remainingMs = windowMs - (now - oldestTimestamp);
		const retryAfterSeconds = Math.max(1, Math.ceil(remainingMs / 1000));

		return {
			allowed: false,
			clientIp,
			retryAfterSeconds,
			reason: `Too many registration attempts (${record.timestamps.length}/${maxRequests}) from IP ${clientIp}. Please wait ${retryAfterSeconds} seconds.`
		};
	}

	// Record this valid registration attempt
	record.timestamps.push(now);

	return {
		allowed: true,
		clientIp
	};
}

/**
 * Resets the in-memory rate limiter store (useful for tests).
 */
export function resetRateLimitStore(): void {
	memoryStore.clear();
}
