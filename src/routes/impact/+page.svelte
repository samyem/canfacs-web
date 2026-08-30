<script lang="ts">
	import {
		SITE_INFO,
		LOCAL_IMPACT_ACTIVITIES,
		GLOBAL_IMPACT_ACTIVITIES,
		NEPAL_FLOOD_RELIEF_CAMPAIGN
	} from '$lib/data/siteData';
	import ShareButtons from '$lib/components/ShareButtons.svelte';

	let activeFilter = $state<'all' | 'local' | 'global'>('all');
	let searchQuery = $state('');

	const allActivities = $derived([
		...LOCAL_IMPACT_ACTIVITIES.map((act) => ({ ...act, scope: 'local' as const })),
		...GLOBAL_IMPACT_ACTIVITIES.map((act) => ({ ...act, scope: 'global' as const }))
	]);

	const filteredActivities = $derived(
		allActivities.filter((act) => {
			const matchesScope = activeFilter === 'all' || act.scope === activeFilter;
			const q = searchQuery.toLowerCase().trim();
			const matchesSearch =
				!q ||
				act.title.toLowerCase().includes(q) ||
				act.summary.toLowerCase().includes(q) ||
				act.category.toLowerCase().includes(q) ||
				act.tags.some((t) => t.toLowerCase().includes(q));
			return matchesScope && matchesSearch;
		})
	);

	const localActivitiesFiltered = $derived(
		filteredActivities.filter((act) => act.scope === 'local')
	);

	const globalActivitiesFiltered = $derived(
		filteredActivities.filter((act) => act.scope === 'global')
	);
</script>

<svelte:head>
	<title>Impact & Initiatives - {SITE_INFO.name}</title>
	<meta
		name="description"
		content="Explore CANFACS initiatives impacting Nepalese-Canadian society locally across Canada and globally in Nepal."
	/>
</svelte:head>

<!-- Hero Section -->
<section class="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 bg-slate-950">
	<!-- Background glow -->
	<div
		class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-gradient-to-r from-red-600/20 via-rose-600/10 to-blue-600/20 rounded-full blur-3xl pointer-events-none z-0"
	></div>

	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
		<!-- Badges -->
		<div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-slate-700/80 text-xs font-semibold text-white mb-6 shadow-lg">
			<span class="text-red-400">🍁 Local Roots</span>
			<span class="text-slate-500">•</span>
			<span class="text-blue-400">🌐 Global Bridges</span>
			<span class="text-slate-500">•</span>
			<span class="text-emerald-400">🤝 Sustainable Impact</span>
		</div>

		<h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
			Our Impact Across <span class="text-gradient-nepal">Canada & Nepal</span>
		</h1>

		<p class="max-w-3xl mx-auto text-lg sm:text-xl text-slate-300 font-normal leading-relaxed mb-10">
			From empowering newcomers and celebrating Himalayan heritage in Canadian cities to supporting rural education, clean energy knowledge transfer, and disaster relief in Nepal, CANFACS is dedicated to uplifting our community locally and globally.
		</p>

		<!-- Quick Impact Highlights / Stat Grid -->
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mt-8">
			<div class="glass-card p-6 rounded-2xl border border-slate-800 text-center">
				<div class="text-3xl font-extrabold text-white mb-1">Coast-to-Coast</div>
				<div class="text-xs uppercase font-semibold tracking-wider text-slate-400">Nationwide Network</div>
				<p class="text-[11px] text-slate-400 mt-2">BC, AB, ON, NB and nationwide community engagement</p>
			</div>

			<div class="glass-card p-6 rounded-2xl border border-slate-800 text-center">
				<div class="text-3xl font-extrabold text-red-400 mb-1">60+ Years</div>
				<div class="text-xs uppercase font-semibold tracking-wider text-slate-400">Diplomatic Ties</div>
				<p class="text-[11px] text-slate-400 mt-2">Bilateral partnership & friendship active since 1965</p>
			</div>

			<div class="glass-card p-6 rounded-2xl border border-slate-800 text-center">
				<div class="text-3xl font-extrabold text-blue-400 mb-1">100%</div>
				<div class="text-xs uppercase font-semibold tracking-wider text-slate-400">Community Driven</div>
				<p class="text-[11px] text-slate-400 mt-2">Registered non-profit volunteer and leadership society</p>
			</div>

			<div class="glass-card p-6 rounded-2xl border border-slate-800 text-center">
				<div class="text-3xl font-extrabold text-emerald-400 mb-1">12+</div>
				<div class="text-xs uppercase font-semibold tracking-wider text-slate-400">Action Initiatives</div>
				<p class="text-[11px] text-slate-400 mt-2">Dedicated local settlement & global philanthropic programs</p>
			</div>
		</div>
	</div>
</section>

<!-- Filter & Search Controls Bar -->
<section class="sticky top-20 z-40 bg-slate-900/90 backdrop-blur-md border-y border-slate-800 py-4 shadow-md">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
		<!-- Scope Filter Tabs -->
		<div class="flex items-center gap-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
			<button
				onclick={() => (activeFilter = 'all')}
				class="px-4 py-2 rounded-lg text-sm font-semibold transition-all {activeFilter === 'all'
					? 'bg-red-600 text-white shadow-md'
					: 'text-slate-400 hover:text-white'}"
			>
				All Initiatives ({allActivities.length})
			</button>
			<button
				onclick={() => (activeFilter = 'local')}
				class="px-4 py-2 rounded-lg text-sm font-semibold transition-all {activeFilter === 'local'
					? 'bg-red-600 text-white shadow-md'
					: 'text-slate-400 hover:text-white'}"
			>
				🍁 Local Impact ({LOCAL_IMPACT_ACTIVITIES.length})
			</button>
			<button
				onclick={() => (activeFilter = 'global')}
				class="px-4 py-2 rounded-lg text-sm font-semibold transition-all {activeFilter === 'global'
					? 'bg-blue-600 text-white shadow-md'
					: 'text-slate-400 hover:text-white'}"
			>
				🌐 Global Impact ({GLOBAL_IMPACT_ACTIVITIES.length})
			</button>
		</div>

		<!-- Search Input -->
		<div class="relative w-full md:w-72">
			<span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-sm">
				🔍
			</span>
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search activities or tags..."
				class="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
			/>
		</div>
	</div>
</section>

<!-- Impact Activities Content Section -->
<section class="py-16 bg-slate-950 min-h-[60vh]">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
		<!-- Featured Emergency Fundraiser Spotlight Card -->
		<div class="relative overflow-hidden rounded-3xl glass-panel border border-red-800/60 p-8 sm:p-10 shadow-2xl">
			<div class="absolute -right-16 -top-16 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none"></div>
			<div class="absolute -left-16 -bottom-16 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

			<div class="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
				<div class="space-y-4 max-w-3xl">
					<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/90 border border-red-800 text-xs font-bold text-red-400 uppercase tracking-wider">
						<span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
						Urgent Humanitarian Appeal • Active Fundraiser
					</div>

					<h2 class="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
						2026 Nepal Flood Emergency Relief Fund
					</h2>

					<p class="text-slate-300 text-sm sm:text-base leading-relaxed">
						On 26 August 2026, a catastrophic glacier collapse and ice avalanche on Langtang Lirung triggered an Ms 5.2 seismic tremor and severe debris flow flash floods surging down the Trishuli River basin across Rasuwa and Nuwakot districts. CANFACS is raising a <strong>$10,000 CAD emergency fund</strong>, which will be <strong>disbursed directly to the Government of Nepal Prime Minister's Disaster Relief Fund (PMO Fund)</strong> on behalf of CANFACS and its members with public tracking.
					</p>

					<div class="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300 pt-1">
						<span class="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
							🎯 Target Goal: <strong class="text-red-400">$10,000 CAD</strong>
						</span>
						<span class="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
							🏛️ Recipient: <strong class="text-amber-400">Nepal PMO Fund</strong>
						</span>
						<span class="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
							💳 Interac e-Transfer: <strong class="text-white font-mono">info@canfacs.org</strong>
						</span>
					</div>
				</div>

				<div class="flex-shrink-0 w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-3">
					<a
						href="/impact/nepal-flood-relief"
						class="px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-center shadow-lg shadow-red-600/30 transition-all transform hover:-translate-y-0.5"
					>
						Donate & View Campaign &rarr;
					</a>
					<div class="flex justify-center">
						<ShareButtons
							title="Nepal Flood Emergency Relief Fund - CANFACS"
							description="Join CANFACS in raising $10,000 CAD for disaster relief and emergency rehabilitation in Nepal."
							url="https://canfacs.org/impact/nepal-flood-relief"
							variant="compact"
						/>
					</div>
					<span class="text-[11px] text-center text-slate-400">
						100% of proceeds go towards relief & rebuilding
					</span>
				</div>
			</div>
		</div>

		<!-- Empty state if search returns nothing -->
		{#if filteredActivities.length === 0}
			<div class="text-center py-20 glass-panel rounded-3xl border border-slate-800 max-w-lg mx-auto p-8">
				<span class="text-4xl mb-4 block">🔍</span>
				<h3 class="text-xl font-bold text-white mb-2">No matching initiatives found</h3>
				<p class="text-sm text-slate-400 mb-6">
					We couldn't find any activities matching "{searchQuery}". Try searching for terms like "mentorship", "education", "Everest", or "relief".
				</p>
				<button
					onclick={() => {
						searchQuery = '';
						activeFilter = 'all';
					}}
					class="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
				>
					Reset Filters
				</button>
			</div>
		{/if}

		<!-- Local Impact Block -->
		{#if (activeFilter === 'all' || activeFilter === 'local') && localActivitiesFiltered.length > 0}
			<div id="local-impact" class="space-y-8">
				<div class="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-800/80 pb-6 gap-4">
					<div>
						<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-800/60 text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
							🍁 Local Impact Across Canada
						</div>
						<h2 class="text-3xl font-extrabold text-white tracking-tight">
							Empowering Nepali-Canadians Coast to Coast
						</h2>
						<p class="text-sm text-slate-400 mt-1 max-w-2xl">
							Strengthening community integration, professional accreditation, cultural heritage, and youth empowerment across Canadian provinces and territories.
						</p>
					</div>
					<span class="text-xs font-semibold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 self-start md:self-auto">
						{localActivitiesFiltered.length} Program{localActivitiesFiltered.length > 1 ? 's' : ''}
					</span>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each localActivitiesFiltered as item}
						<div class="glass-card p-7 rounded-2xl flex flex-col justify-between border border-slate-800/90 relative overflow-hidden group">
							<!-- Red accent gradient strip at top on hover -->
							<div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>

							<div>
								<div class="flex items-start justify-between gap-3 mb-4">
									<div class="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 group-hover:border-red-500/50 transition-all">
										{item.icon}
									</div>
									<span class="text-[11px] font-semibold text-red-400 bg-red-950/60 border border-red-900/50 px-2.5 py-1 rounded-md">
										{item.category}
									</span>
								</div>

								<h3 class="text-lg font-bold text-white mb-2.5 group-hover:text-red-300 transition-colors leading-snug">
									{item.title}
								</h3>

								<p class="text-slate-300 text-xs leading-relaxed mb-5">
									{item.summary}
								</p>

								<div class="space-y-2 mb-6 border-t border-slate-800/80 pt-4">
									<p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Key Activity Areas:</p>
									<ul class="space-y-1.5">
										{#each item.details as detail}
											<li class="text-xs text-slate-300 flex items-start gap-2">
												<span class="text-red-400 font-bold mt-0.5">•</span>
												<span>{detail}</span>
											</li>
										{/each}
									</ul>
								</div>
							</div>

							<div>
								{#if item.beneficiaries}
									<div class="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 mb-4">
										<span class="font-semibold text-slate-300">Target Group:</span> {item.beneficiaries}
									</div>
								{/if}

								<div class="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/60">
									{#each item.tags as tag}
										<span class="text-[10px] font-medium text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
											#{tag}
										</span>
									{/each}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Global Impact Block -->
		{#if (activeFilter === 'all' || activeFilter === 'global') && globalActivitiesFiltered.length > 0}
			<div id="global-impact" class="space-y-8">
				<div class="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-800/80 pb-6 gap-4">
					<div>
						<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800/60 text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
							🌐 Global Impact in Nepal & Worldwide
						</div>
						<h2 class="text-3xl font-extrabold text-white tracking-tight">
							Bilateral Bridges & Humanitarian Cooperation
						</h2>
						<p class="text-sm text-slate-400 mt-1 max-w-2xl">
							Fostering diplomacy, rural education scholarships, disaster resilience, clean technology transfer, and Himalayan conservation in Nepal.
						</p>
					</div>
					<span class="text-xs font-semibold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 self-start md:self-auto">
						{globalActivitiesFiltered.length} Program{globalActivitiesFiltered.length > 1 ? 's' : ''}
					</span>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each globalActivitiesFiltered as item}
						<div class="glass-card p-7 rounded-2xl flex flex-col justify-between border border-slate-800/90 relative overflow-hidden group">
							<!-- Blue accent gradient strip at top on hover -->
							<div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 opacity-80 group-hover:opacity-100 transition-opacity"></div>

							<div>
								<div class="flex items-start justify-between gap-3 mb-4">
									<div class="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 group-hover:border-blue-500/50 transition-all">
										{item.icon}
									</div>
									<span class="text-[11px] font-semibold text-blue-400 bg-blue-950/60 border border-blue-900/50 px-2.5 py-1 rounded-md">
										{item.category}
									</span>
								</div>

								<h3 class="text-lg font-bold text-white mb-2.5 group-hover:text-blue-300 transition-colors leading-snug">
									{item.title}
								</h3>

								<p class="text-slate-300 text-xs leading-relaxed mb-5">
									{item.summary}
								</p>

								<div class="space-y-2 mb-6 border-t border-slate-800/80 pt-4">
									<p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Key Activity Areas:</p>
									<ul class="space-y-1.5">
										{#each item.details as detail}
											<li class="text-xs text-slate-300 flex items-start gap-2">
												<span class="text-blue-400 font-bold mt-0.5">•</span>
												<span>{detail}</span>
											</li>
										{/each}
									</ul>
								</div>
							</div>

							<div>
								{#if item.beneficiaries}
									<div class="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 mb-4">
										<span class="font-semibold text-slate-300">Target Beneficiaries:</span> {item.beneficiaries}
									</div>
								{/if}

								{#if item.id === 'humanitarian-disaster-relief'}
									<div class="mb-4">
										<a
											href="/impact/nepal-flood-relief"
											class="block w-full text-center py-2.5 px-4 rounded-xl text-xs font-bold bg-red-600/90 hover:bg-red-500 text-white shadow-md transition-all"
										>
											🌊 Donate to Flood Relief Campaign ($10k Goal) &rarr;
										</a>
									</div>
								{/if}

								<div class="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/60">
									{#each item.tags as tag}
										<span class="text-[10px] font-medium text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
											#{tag}
										</span>
									{/each}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</section>

<!-- Impact Pillars / Methodology Section -->
<section class="py-20 bg-slate-900/60 border-t border-slate-800/80">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center max-w-3xl mx-auto mb-16">
			<span class="text-xs uppercase font-bold text-red-500 tracking-wider">Our Framework</span>
			<h2 class="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-4">
				How CANFACS Drives Lasting Positive Change
			</h2>
			<p class="text-slate-400 text-sm sm:text-base">
				Our activities are grounded in five foundational pillars defined in our constitutional mandate.
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<div class="glass-panel p-6 rounded-2xl border border-slate-800">
				<div class="w-10 h-10 rounded-xl bg-red-950 text-red-400 border border-red-800 flex items-center justify-center font-bold text-lg mb-4">
					1
				</div>
				<h3 class="text-lg font-bold text-white mb-2">Multicultural Inclusivity</h3>
				<p class="text-xs text-slate-300 leading-relaxed">
					Actively contributing to Canada's rich multicultural fabric by promoting Nepali traditions, music, culinary arts, and language while embracing intercultural harmony.
				</p>
			</div>

			<div class="glass-panel p-6 rounded-2xl border border-slate-800">
				<div class="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 border border-blue-800 flex items-center justify-center font-bold text-lg mb-4">
					2
				</div>
				<h3 class="text-lg font-bold text-white mb-2">Knowledge & Skill Exchange</h3>
				<p class="text-xs text-slate-300 leading-relaxed">
					Connecting Nepali-Canadian doctors, engineers, educators, and IT specialists with peers in Canada and Nepal to drive bilateral technical cooperation.
				</p>
			</div>

			<div class="glass-panel p-6 rounded-2xl border border-slate-800">
				<div class="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold text-lg mb-4">
					3
				</div>
				<h3 class="text-lg font-bold text-white mb-2">Transparent Philanthropy</h3>
				<p class="text-xs text-slate-300 leading-relaxed">
					Ensuring full accountability, integrity, and direct community impact for humanitarian relief, educational grants, and emergency medical missions.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- Call to Action Banner -->
<section class="py-20 bg-slate-950 relative overflow-hidden">
	<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
		<div class="glass-panel rounded-3xl p-8 sm:p-12 border border-red-900/40 text-center relative overflow-hidden">
			<!-- Ambient background flare -->
			<div class="absolute -right-20 -bottom-20 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none"></div>
			<div class="absolute -left-20 -top-20 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

			<span class="inline-block px-3.5 py-1 rounded-full bg-red-950/80 border border-red-800/60 text-xs font-semibold text-red-400 mb-4">
				Get Involved in CANFACS Impact
			</span>

			<h2 class="text-3xl sm:text-4xl font-extrabold text-white mb-4">
				Help Us Make a Difference Locally & Globally
			</h2>

			<p class="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-8">
				Whether you want to mentor a newcomer, propose a bilateral initiative, volunteer at our cultural festivals, or contribute to rural educational scholarships, your voice and passion matter.
			</p>

			<div class="flex flex-col sm:flex-row items-center justify-center gap-4">
				<a
					href="/join-canfacs"
					class="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/30 transition-all transform hover:-translate-y-0.5"
				>
					Join CANFACS Today
				</a>
				<a
					href="/events"
					class="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold glass-panel hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all"
				>
					Attend Upcoming Events
				</a>
				<a
					href="mailto:info@canfacs.org"
					class="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all"
				>
					Propose an Initiative
				</a>
			</div>
		</div>
	</div>
</section>
