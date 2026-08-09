<script lang="ts">
	import { SITE_INFO } from '$lib/data/siteData';

	let { form } = $props();
	let isSubmitting = $state(false);
</script>

<svelte:head>
	<title>Join CANFACS Membership - {SITE_INFO.name}</title>
</svelte:head>

<section class="py-16 bg-slate-950 min-h-[85vh] flex items-center justify-center">
	<div class="max-w-2xl w-full mx-auto px-4 sm:px-6">
		<div class="glass-card p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
			<!-- Glow Accent -->
			<div class="absolute -top-24 -right-24 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>

			<div class="text-center mb-8">
				<span class="inline-block px-3 py-1 text-xs uppercase tracking-wider font-bold text-red-500 bg-red-500/10 rounded-full border border-red-500/20 mb-3">
					Official Membership
				</span>
				<h1 class="text-3xl sm:text-4xl font-extrabold text-white">Join {SITE_INFO.name}</h1>
				<p class="text-slate-400 text-sm mt-2 max-w-md mx-auto">
					Become a registered member of Canada-Nepal Friendship & Cultural Society to connect with members, participate in community discussions, and access member benefits nationwide.
				</p>
			</div>

			{#if form?.success}
				<div class="bg-emerald-950/80 border border-emerald-500/50 p-6 rounded-2xl text-center space-y-4 animate-fade-in">
					<div class="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
						✓
					</div>
					<h3 class="text-xl font-bold text-emerald-300">Application Submitted!</h3>
					<p class="text-sm text-slate-300 leading-relaxed">
						{form.message}
					</p>
					<div class="pt-4 border-t border-emerald-900/60 flex justify-center gap-4 text-xs font-semibold">
						<a href="/login" class="px-5 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-colors">
							Go to Member Login
						</a>
						<a href="/" class="px-5 py-2.5 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 hover:text-white transition-colors">
							Return Home
						</a>
					</div>
				</div>
			{:else}
				{#if form?.error}
					<div class="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-sm flex items-center gap-3">
						<span class="text-lg">⚠️</span>
						<span>{form.error}</span>
					</div>
				{/if}

				<form method="POST" onsubmit={() => (isSubmitting = true)} class="space-y-5">
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
						<div>
							<label for="fullName" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
								Full Name <span class="text-red-400">*</span>
							</label>
							<input
								id="fullName"
								name="fullName"
								type="text"
								required
								placeholder="e.g. Mankajee Shrestha"
								class="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
							/>
						</div>

						<div>
							<label for="email" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
								Email Address <span class="text-red-400">*</span>
							</label>
							<input
								id="email"
								name="email"
								type="email"
								required
								placeholder="name@example.com"
								class="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
							/>
						</div>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
						<div>
							<label for="phone" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
								Phone Number
							</label>
							<input
								id="phone"
								name="phone"
								type="tel"
								placeholder="(604) 555-0199"
								class="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
							/>
						</div>

						<div>
							<label for="profession" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
								Profession / Occupation
							</label>
							<input
								id="profession"
								name="profession"
								type="text"
								placeholder="e.g. Engineer, Educator, Doctor"
								class="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
							/>
						</div>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
						<div>
							<label for="city" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
								City
							</label>
							<input
								id="city"
								name="city"
								type="text"
								placeholder="e.g. Vancouver / Toronto"
								class="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
							/>
						</div>

						<div>
							<label for="province" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
								Province / Region
							</label>
							<select
								id="province"
								name="province"
								class="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
							>
								<option value="BC">British Columbia (BC)</option>
								<option value="ON">Ontario (ON)</option>
								<option value="AB">Alberta (AB)</option>
								<option value="QC">Quebec (QC)</option>
								<option value="NS">Nova Scotia (NS)</option>
								<option value="NB">New Brunswick (NB)</option>
								<option value="MB">Manitoba (MB)</option>
								<option value="SK">Saskatchewan (SK)</option>
								<option value="PE">Prince Edward Island (PE)</option>
								<option value="NL">Newfoundland & Labrador (NL)</option>
								<option value="YT">Yukon (YT)</option>
								<option value="NT">Northwest Territories (NT)</option>
								<option value="NU">Nunavut (NU)</option>
							</select>
						</div>
					</div>

					<div>
						<label for="bio" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
							Brief Bio / Interest in CANFACS
						</label>
						<textarea
							id="bio"
							name="bio"
							rows="3"
							placeholder="Share a short background about yourself or why you would like to join CANFACS..."
							class="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
						></textarea>
					</div>

					<button
						type="submit"
						disabled={isSubmitting}
						class="w-full py-4 rounded-xl font-extrabold text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 shadow-xl shadow-red-600/30 transition-all duration-200 text-base disabled:opacity-50"
					>
						{isSubmitting ? 'Submitting Application...' : 'Submit Application'}
					</button>
				</form>
			{/if}

			<div class="mt-8 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400">
				Already have an approved account?
				<a href="/login" class="text-red-400 font-semibold hover:underline ml-1">Log in here</a>
			</div>
		</div>
	</div>
</section>
