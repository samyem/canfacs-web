<script lang="ts">
	import { SITE_INFO } from '$lib/data/siteData';

	let fullName = $state('');
	let email = $state('');
	let phone = $state('');
	let province = $state('BC');
	let membershipType = $state('General');
	let submitted = $state(false);

	function handleSubmit(e: Event) {
		e.preventDefault();
		submitted = true;
	}
</script>

<svelte:head>
	<title>Join CANFACS Membership - {SITE_INFO.name}</title>
</svelte:head>

<section class="py-20 bg-slate-950">
	<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-12">
			<span class="text-xs uppercase font-bold text-red-500 tracking-wider">Community Membership</span>
			<h1 class="text-4xl sm:text-5xl font-extrabold text-white mt-2 mb-4">Join CANFACS</h1>
			<p class="text-slate-400">
				Become an active member of the Canada-Nepal Friendship and Cultural Society.
			</p>
		</div>

		{#if submitted}
			<div class="glass-panel p-10 rounded-3xl text-center border border-emerald-500/40">
				<div class="w-16 h-16 bg-emerald-950 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold border border-emerald-800">
					✓
				</div>
				<h2 class="text-2xl font-bold text-white mb-2">Membership Application Received!</h2>
				<p class="text-slate-300 text-sm max-w-md mx-auto mb-6">
					Thank you <strong>{fullName}</strong> for joining CANFACS! Our team will reach out to <strong>{email}</strong> with details on upcoming community events and general meetings.
				</p>
				<button
					onclick={() => (submitted = false)}
					class="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm"
				>
					Submit Another Application
				</button>
			</div>
		{:else}
			<form onsubmit={handleSubmit} class="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 space-y-6">
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
					<div>
						<label for="fullName" class="block text-xs font-semibold text-slate-300 uppercase mb-2">Full Name</label>
						<input
							type="text"
							id="fullName"
							bind:value={fullName}
							required
							placeholder="e.g. Ram Shrestha"
							class="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-red-500 text-sm"
						/>
					</div>

					<div>
						<label for="email" class="block text-xs font-semibold text-slate-300 uppercase mb-2">Email Address</label>
						<input
							type="email"
							id="email"
							bind:value={email}
							required
							placeholder="you@example.com"
							class="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-red-500 text-sm"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
					<div>
						<label for="phone" class="block text-xs font-semibold text-slate-300 uppercase mb-2">Phone Number</label>
						<input
							type="tel"
							id="phone"
							bind:value={phone}
							placeholder="604-000-0000"
							class="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-red-500 text-sm"
						/>
					</div>

					<div>
						<label for="province" class="block text-xs font-semibold text-slate-300 uppercase mb-2">Province</label>
						<select
							id="province"
							bind:value={province}
							class="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-red-500 text-sm"
						>
							<option value="BC">British Columbia (BC)</option>
							<option value="ON">Ontario (ON)</option>
							<option value="AB">Alberta (AB)</option>
							<option value="NB">New Brunswick (NB)</option>
							<option value="Other">Other Province / Territory</option>
						</select>
					</div>
				</div>

				<div>
					<label for="membershipType" class="block text-xs font-semibold text-slate-300 uppercase mb-2">Membership Type</label>
					<select
						id="membershipType"
						bind:value={membershipType}
						class="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-red-500 text-sm"
					>
						<option value="General">General Member</option>
						<option value="Life">Life Member</option>
						<option value="Student">Student Member</option>
					</select>
				</div>

				<button
					type="submit"
					class="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-xl shadow-red-600/30 transition-all duration-200"
				>
					Submit Membership Form
				</button>
			</form>
		{/if}
	</div>
</section>
