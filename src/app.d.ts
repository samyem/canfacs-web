// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: {
				id: string;
				email: string;
				fullName: string;
				role: 'member' | 'admin';
				status: 'pending' | 'approved' | 'denied';
			} | null;
		}
		interface Platform {
			env: {
				DB?: any;
				IMAGES_BUCKET?: any;
				SQUARE_APPLICATION_ID?: string;
				SQUARE_ACCESS_TOKEN?: string;
				SQUARE_LOCATION_ID?: string;
				SQUARE_ENVIRONMENT?: 'production' | 'sandbox';
			};
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties;
		}
	}
}

export {};
