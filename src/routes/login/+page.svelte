<script lang="ts">
	import { SITE_INFO } from '$lib/data/siteData';

	let { form } = $props();
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

			{#if form?.error}
				<div class="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs leading-relaxed flex items-start gap-2">
					<span class="text-base">⚠️</span>
					<span>{form.error}</span>
				</div>
			{/if}

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
