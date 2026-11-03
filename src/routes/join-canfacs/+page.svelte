<script lang="ts">
	import { SITE_INFO } from '$lib/data/siteData';

	let { data, form } = $props();
	let isSubmitting = $state(false);
</script>

<svelte:head>
	<title>Join CANFACS Membership - {SITE_INFO.name}</title>
</svelte:head>

<section class="flex min-h-[85vh] items-center justify-center bg-slate-950 py-16">
	<div class="mx-auto w-full max-w-2xl px-4 sm:px-6">
		<div
			class="glass-card relative overflow-hidden rounded-3xl border border-slate-800 p-8 shadow-2xl sm:p-10"
		>
			<!-- Glow Accent -->
			<div
				class="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-red-600/20 blur-3xl"
			></div>

			<div class="mb-8 text-center">
				<span
					class="mb-3 inline-block rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-bold tracking-wider text-red-500 uppercase"
				>
					Official Membership
				</span>
				<h1 class="text-3xl font-extrabold text-white sm:text-4xl">Join {SITE_INFO.name}</h1>
				<p class="mx-auto mt-2 max-w-md text-sm text-slate-400">
					Become a registered member of Canada-Nepal Friendship & Cultural Society to connect with
					members, participate in community discussions, and access member benefits nationwide.
				</p>
			</div>

			{#if form?.success}
				<div
					class="animate-fade-in space-y-4 rounded-2xl border border-emerald-500/50 bg-emerald-950/80 p-6 text-center"
				>
					<div
						class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-2xl font-bold text-emerald-400"
					>
						✓
					</div>
					<h3 class="text-xl font-bold text-emerald-300">Application Submitted!</h3>
					<p class="text-sm leading-relaxed text-slate-300">
						{form.message}
					</p>
					<div
						class="flex justify-center gap-4 border-t border-emerald-900/60 pt-4 text-xs font-semibold"
					>
						<a
							href="/login"
							class="rounded-xl bg-emerald-600 px-5 py-2.5 text-white transition-colors hover:bg-emerald-500"
						>
							Go to Member Login
						</a>
						<a
							href="/"
							class="rounded-xl border border-slate-800 bg-slate-900 px-5 py-2.5 text-slate-300 transition-colors hover:text-white"
						>
							Return Home
						</a>
					</div>
				</div>
			{:else}
				{#if form?.error}
					<div
						class="mb-6 flex items-center gap-3 rounded-xl border border-red-500/50 bg-red-950/80 p-4 text-sm text-red-300"
					>
						<span class="text-lg">⚠️</span>
						<span>{form.error}</span>
					</div>
				{/if}

				<!-- Quick Google Join -->
				<div class="mb-6 space-y-4">
					<a
						href="/api/auth/google"
						class="group flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:border-slate-600 hover:bg-slate-800"
					>
						<svg class="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
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
						<span>Instant Sign-In with Google</span>
					</a>

					<div class="relative flex items-center justify-center">
						<div class="w-full border-t border-slate-800"></div>
						<span
							class="relative bg-slate-950 px-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase"
						>
							or register with full details
						</span>
					</div>
				</div>

				<form method="POST" onsubmit={() => (isSubmitting = true)} class="space-y-5">
					<!-- Invisible Honeypot anti-bot trap (bots auto-fill, human users cannot see) -->
					<div
						class="sr-only"
						aria-hidden="true"
						style="position: absolute; left: -9999px; opacity: 0; pointer-events: none; width: 0; height: 0; overflow: hidden;"
					>
						<label for="contact_preferred_website">Leave this field blank</label>
						<input
							type="text"
							id="contact_preferred_website"
							name="contact_preferred_website"
							tabindex="-1"
							autocomplete="off"
							value=""
						/>
					</div>

					<!-- Form rendering timestamp token for anti-bot timing verification -->
					<input type="hidden" name="_submission_start" value={data?.submissionToken || ''} />

					<div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
						<div>
							<label
								for="fullName"
								class="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase"
							>
								Full Name <span class="text-red-400">*</span>
							</label>
							<input
								id="fullName"
								name="fullName"
								type="text"
								required
								placeholder="e.g. Mankajee Shrestha"
								class="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white transition-colors focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
							/>
						</div>

						<div>
							<label
								for="email"
								class="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase"
							>
								Email Address <span class="text-red-400">*</span>
							</label>
							<input
								id="email"
								name="email"
								type="email"
								required
								placeholder="name@example.com"
								class="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white transition-colors focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
							/>
						</div>
					</div>

					<div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
						<div>
							<label
								for="phone"
								class="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase"
							>
								Phone Number
							</label>
							<input
								id="phone"
								name="phone"
								type="tel"
								placeholder="(604) 555-0199"
								class="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white transition-colors focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
							/>
						</div>

						<div>
							<label
								for="profession"
								class="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase"
							>
								Profession / Occupation
							</label>
							<input
								id="profession"
								name="profession"
								type="text"
								placeholder="e.g. Engineer, Educator, Doctor"
								class="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white transition-colors focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
							/>
						</div>
					</div>

					<div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
						<div>
							<label
								for="city"
								class="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase"
							>
								City
							</label>
							<input
								id="city"
								name="city"
								type="text"
								placeholder="e.g. Vancouver / Toronto"
								class="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white transition-colors focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
							/>
						</div>

						<div>
							<label
								for="province"
								class="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase"
							>
								Province / Region
							</label>
							<select
								id="province"
								name="province"
								class="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white transition-colors focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
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
						<label
							for="bio"
							class="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase"
						>
							Brief Bio / Interest in CANFACS
						</label>
						<textarea
							id="bio"
							name="bio"
							rows="3"
							placeholder="Share a short background about yourself or why you would like to join CANFACS..."
							class="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white transition-colors focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
						></textarea>
					</div>

					<button
						type="submit"
						disabled={isSubmitting}
						class="w-full rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 py-4 text-base font-extrabold text-white shadow-xl shadow-red-600/30 transition-all duration-200 hover:from-red-500 hover:to-rose-500 disabled:opacity-50"
					>
						{isSubmitting ? 'Submitting Application...' : 'Submit Application'}
					</button>
				</form>
			{/if}

			<div class="mt-8 border-t border-slate-800/80 pt-6 text-center text-xs text-slate-400">
				Already have an approved account?
				<a href="/login" class="ml-1 font-semibold text-red-400 hover:underline">Log in here</a>
			</div>
		</div>
	</div>
</section>
