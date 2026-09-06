// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: {
				id: string;
				email: string;
				fullName: string;
				avatarUrl?: string | null;
				role: 'admin' | 'bod' | 'member' | 'partner' | string;
				status: 'pending' | 'approved' | 'denied';
			} | null;
		}
		interface Platform {
			env: {
				DB?: any;
				IMAGES_BUCKET?: any;
				EMAIL?: any;
				SQUARE_APPLICATION_ID?: string;
				SQUARE_ACCESS_TOKEN?: string;
				SQUARE_LOCATION_ID?: string;
				SQUARE_ENVIRONMENT?: 'production' | 'sandbox';
				CLOUDFLARE_API_TOKEN?: string;
				CLOUDFLARE_ACCOUNT_ID?: string;
				CLOUDFLARE_FROM_EMAIL?: string;
				GOOGLE_CLIENT_ID?: string;
				GOOGLE_CLIENT_SECRET?: string;
				GEMINI_API_KEY?: string;
			};
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties;
		}
	}
}

export {};
