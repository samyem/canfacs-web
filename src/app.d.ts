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
			};
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties;
		}
	}
}

export {};
