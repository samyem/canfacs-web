<script lang="ts">
	import { SITE_INFO } from '$lib/data/siteData';

	let { data, form } = $props();
	let isSubmitting = $state(false);
</script>

<svelte:head>
	<title>Member Login - {SITE_INFO.name}</title>
</svelte:head>

<section class="py-20 bg-slate-950 min-h-[85vh] flex items-center justify-center">
	<div class="max-w-md w-full mx-auto px-4 sm:px-6">
		<div class="glass-card p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
			<!-- Top Banner -->
			<div class="text-center mb-8">
				<div class="w-16 h-16 bg-gradient-to-tr from-red-600 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl shadow-xl shadow-red-900/30">
					🔑
				</div>
				<h1 class="text-3xl font-extrabold text-white">Member Login</h1>
				<p class="text-slate-400 text-xs mt-2">
					Sign in to access CANFACS Member Directory & Community Feed
				</p>
			</div>

			{#if data?.error || form?.error}
				<div class="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs leading-relaxed flex items-start gap-2">
					<span class="text-base">⚠️</span>
					<span>{data?.error || form?.error}</span>
				</div>
			{/if}

			<!-- Google Sign In Button -->
			<div class="space-y-4">
				<a
					href="/api/auth/google"
					class="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all shadow-lg hover:border-slate-600 group"
				>
					<svg class="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
						<path
							fill="#4285F4"
							d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
						/>
						<path
							fill="#34A853"
							d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
						/>
						<path
							fill="#FBBC05"
							d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
						/>
						<path
							fill="#EA4335"
							d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
						/>
					</svg>
					<span>Continue with Google</span>
				</a>

				<div class="relative flex items-center justify-center my-6">
					<div class="border-t border-slate-800 w-full"></div>
					<span class="bg-slate-950 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider relative">
						or sign in with email
					</span>
				</div>
			</div>

			<form method="POST" onsubmit={() => (isSubmitting = true)} class="space-y-5">
				<div>
					<label for="email" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
						Email Address
					</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						placeholder="info@canfacs.org"
						class="w-full px-4 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
					/>
				</div>

				<div>
					<div class="flex justify-between items-center mb-2">
						<label for="password" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
							Password
						</label>
					</div>
					<input
						id="password"
						name="password"
						type="password"
						required
						placeholder="••••••••••••"
						class="w-full px-4 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
					/>
				</div>

				<button
					type="submit"
					disabled={isSubmitting}
					class="w-full py-4 rounded-xl font-extrabold text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 shadow-xl shadow-red-600/30 transition-all text-sm disabled:opacity-50"
				>
					{isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}
				</button>
			</form>

			<div class="mt-8 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400">
				Don't have a CANFACS account yet?
				<a href="/join-canfacs" class="text-red-400 font-semibold hover:underline ml-1">Apply for Membership</a>
			</div>
		</div>
	</div>
</section>
