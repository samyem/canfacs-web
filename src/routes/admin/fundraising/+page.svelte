<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	// Tabs & Filter State (in campaign detail view)
	let activeDetailTab = $state<'donations' | 'disbursements'>('donations');
	let statusFilter = $state<'all' | 'pledged' | 'received'>('all');
	let searchQuery = $state('');

	// Sorting State for Donations Table
	type SortField = 'date' | 'amount' | 'name' | 'status';
	type SortDir = 'asc' | 'desc';

	let sortField = $state<SortField>('date');
	let sortDirection = $state<SortDir>('desc');

	function toggleSort(field: SortField) {
		if (sortField === field) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortField = field;
			sortDirection = field === 'date' || field === 'amount' ? 'desc' : 'asc';
		}
	}

	// Modals
	let showAddDonationModal = $state(false);
	let showEditDonationModal = $state(false);
	let showAddDisbursementModal = $state(false);
	let showCreateCampaignModal = $state(false);
	let editingDonation = $state<any>(null);

	const filteredDonations = $derived(
		(data.donations || []).filter((d: any) => {
			const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
			const q = searchQuery.toLowerCase();
			const matchesQuery =
				!q ||
				d.donor_name.toLowerCase().includes(q) ||
				(d.email && d.email.toLowerCase().includes(q)) ||
				(d.message && d.message.toLowerCase().includes(q));
			return matchesStatus && matchesQuery;
		})
	);

	const sortedDonations = $derived(
		[...filteredDonations].sort((a: any, b: any) => {
			let diff = 0;
			if (sortField === 'date') {
				diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
			} else if (sortField === 'amount') {
				diff = Number(a.amount) - Number(b.amount);
			} else if (sortField === 'name') {
				diff = a.donor_name.localeCompare(b.donor_name);
			} else if (sortField === 'status') {
				diff = a.status.localeCompare(b.status);
			}
			return sortDirection === 'asc' ? diff : -diff;
		})
	);

	function openEditModal(donation: any) {
		editingDonation = { ...donation };
		showEditDonationModal = true;
	}

	function changeCampaign(e: Event) {
		const select = e.currentTarget as HTMLSelectElement;
		if (select.value === 'all') {
			window.location.href = '/admin/fundraising';
		} else {
			window.location.href = `/admin/fundraising?campaign=${select.value}`;
		}
	}
</script>

<svelte:head>
	<title>
		{data.selectedCampaign ? `${data.selectedCampaign.title} - Admin` : 'Fundraising Initiatives Portfolio - CANFACS'}
	</title>
</svelte:head>

<section class="py-10 bg-slate-950 min-h-screen text-slate-100">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
		<!-- Status / Feedback Notice -->
		{#if form?.message}
			<div class="p-4 rounded-xl {form?.success ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' : 'bg-red-950/80 border-red-500/50 text-red-300'} border text-xs leading-relaxed flex items-center justify-between shadow-lg">
				<span>{form?.success ? '✅' : '⚠️'} {form.message || form.error}</span>
			</div>
		{/if}

		<!-- ========================================================================= -->
		<!-- VIEW 1: INITIATIVES DIRECTORY LANDING PAGE (When no campaign is selected) -->
		<!-- ========================================================================= -->
		{#if !data.selectedCampaignId}
			<!-- Header -->
			<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
				<div>
					<div class="flex items-center gap-2 mb-2">
						<span class="px-3 py-1 text-xs uppercase tracking-wider font-bold text-amber-400 bg-amber-400/10 rounded-full border border-amber-400/20">
							Admin Control Center
						</span>
						<span class="text-xs text-slate-500">•</span>
						<span class="text-xs font-semibold text-slate-400">Initiatives Directory</span>
					</div>
					<h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Fundraising Initiatives & Programs</h1>
					<p class="text-slate-400 text-sm mt-1">
						Portfolio of relief campaigns, philanthropic drives, target goals, and live financial accounting.
					</p>
				</div>

				<div>
					<button
						type="button"
						onclick={() => (showCreateCampaignModal = true)}
						class="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
					>
						<span>+</span>
						<span>Launch New Initiative</span>
					</button>
				</div>
			</div>

			<!-- Society-Wide Portfolio Key Financial Metric Cards -->
			<div>
				<h2 class="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">Society-Wide Portfolio Overview</h2>
				<div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
					<!-- Total Volume Raised -->
					<div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow">
						<div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Raised (All)</div>
						<div class="text-2xl sm:text-3xl font-black text-white mt-1">
							${data.globalStats.totalRaised.toLocaleString('en-CA')}
							<span class="text-xs font-normal text-slate-400">CAD</span>
						</div>
						<div class="text-[11px] text-slate-500 mt-1">{data.globalStats.totalDonors} Total Donors Across Programs</div>
					</div>

					<!-- Verified Cash In Hand -->
					<div class="bg-slate-900/80 p-5 rounded-2xl border border-emerald-900/40 shadow">
						<div class="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
							<span>✅ Received (Cash)</span>
						</div>
						<div class="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
							${data.globalStats.totalReceived.toLocaleString('en-CA')}
						</div>
						<div class="text-[11px] text-slate-400 mt-1">Verified Received</div>
					</div>

					<!-- Pledged / Pending -->
					<div class="bg-slate-900/80 p-5 rounded-2xl border border-amber-900/40 shadow">
						<div class="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
							<span>⏳ Pledged (Awaiting)</span>
						</div>
						<div class="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
							${data.globalStats.totalPledged.toLocaleString('en-CA')}
						</div>
						<div class="text-[11px] text-slate-400 mt-1">Committed Pledges</div>
					</div>

					<!-- Total Disbursed -->
					<div class="bg-slate-900/80 p-5 rounded-2xl border border-blue-900/40 shadow">
						<div class="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Disbursed (Sent)</div>
						<div class="text-2xl sm:text-3xl font-black text-blue-400 mt-1">
							${data.globalStats.totalDisbursed.toLocaleString('en-CA')}
						</div>
						<div class="text-[11px] text-slate-400 mt-1">Relief Tranches Sent</div>
					</div>

					<!-- Available Treasury Balance -->
					<div class="col-span-2 lg:col-span-1 bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-2xl border border-slate-700 shadow">
						<div class="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Net Treasury Reserve</div>
						<div class="text-2xl sm:text-3xl font-black text-white mt-1">
							${data.globalStats.totalNetTreasury.toLocaleString('en-CA')}
						</div>
						<div class="text-[11px] text-emerald-400 font-semibold mt-1">Available for Allocation</div>
					</div>
				</div>
			</div>

			<!-- List of Initiatives Grid -->
			<div class="space-y-4 pt-4">
				<div class="flex items-center justify-between">
					<h2 class="text-lg font-bold text-white flex items-center gap-2">
						<span>🎯 Active & Past Initiatives</span>
						<span class="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">({data.campaigns.length})</span>
					</h2>
					<span class="text-xs text-slate-400">Click any initiative below to view and manage its donations & disbursements</span>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					{#each data.campaigns as camp}
						{@const percent = Math.min(100, Math.round((camp.stats.totalRaised / camp.target_goal) * 100))}
						<div class="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-6 sm:p-7 rounded-3xl space-y-5 shadow-xl transition-all group flex flex-col justify-between">
							<div class="space-y-4">
								<div class="flex items-start justify-between gap-3">
									<div>
										<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider {camp.is_active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}">
											{camp.is_active ? '● Active Initiative' : 'Completed'}
										</span>
										<h3 class="text-xl font-extrabold text-white mt-2 group-hover:text-red-400 transition-colors">
											{camp.title}
										</h3>
										<p class="text-xs text-slate-400 font-mono mt-0.5">ID: {camp.id}</p>
									</div>
									<div class="text-right shrink-0">
										<div class="text-xs text-slate-400">Target Goal</div>
										<div class="text-base font-black text-white">${Number(camp.target_goal).toLocaleString('en-CA')} CAD</div>
									</div>
								</div>

								{#if camp.subtitle}
									<p class="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
										"{camp.subtitle}"
									</p>
								{/if}

								<!-- Progress Bar -->
								<div class="space-y-1.5">
									<div class="flex justify-between text-xs font-semibold">
										<span class="text-slate-400">Funding Progress</span>
										<span class="text-white font-bold">{percent}% (${camp.stats.totalRaised.toLocaleString('en-CA')} of ${Number(camp.target_goal).toLocaleString('en-CA')})</span>
									</div>
									<div class="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
										<div
											class="bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 h-full rounded-full transition-all duration-500"
											style="width: {percent}%"
										></div>
									</div>
								</div>

								<!-- Initiative Key Financial Metric Strip -->
								<div class="grid grid-cols-4 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
									<div>
										<div class="text-[10px] uppercase font-bold text-slate-400">Donors</div>
										<div class="text-sm font-black text-white mt-0.5">{camp.stats.donorCount}</div>
									</div>
									<div>
										<div class="text-[10px] uppercase font-bold text-emerald-400">Received</div>
										<div class="text-sm font-black text-emerald-400 mt-0.5">${camp.stats.totalReceived.toLocaleString('en-CA')}</div>
									</div>
									<div>
										<div class="text-[10px] uppercase font-bold text-amber-400">Pledged</div>
										<div class="text-sm font-black text-amber-400 mt-0.5">${camp.stats.totalPledged.toLocaleString('en-CA')}</div>
									</div>
									<div>
										<div class="text-[10px] uppercase font-bold text-blue-400">Disbursed</div>
										<div class="text-sm font-black text-blue-400 mt-0.5">${camp.stats.totalDisbursed.toLocaleString('en-CA')}</div>
									</div>
								</div>
							</div>

							<!-- Action Buttons -->
							<div class="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
								<a
									href="/admin/fundraising?campaign={camp.id}"
									class="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 transition-all flex items-center gap-1.5"
								>
									<span>👉 Open & Manage Initiative</span>
									<span>&rarr;</span>
								</a>

								{#if camp.id === 'nepal-flood-2024'}
									<a
										href="/impact/nepal-flood-relief"
										target="_blank"
										class="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1"
									>
										<span>Public Page</span>
										<span>↗</span>
									</a>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>

		<!-- ============================================================================ -->
		<!-- VIEW 2: INITIATIVE DETAIL VIEW (When a specific campaign is selected)       -->
		<!-- ============================================================================ -->
		{:else if data.selectedCampaign}
			<!-- Breadcrumbs & Initiative Header -->
			<div class="space-y-4 border-b border-slate-800 pb-6">
				<div class="flex items-center justify-between">
					<a
						href="/admin/fundraising"
						class="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800"
					>
						<span>&larr;</span>
						<span>All Initiatives Directory</span>
					</a>

					<!-- Quick Switcher Dropdown -->
					<div class="flex items-center gap-2">
						<label for="detail_campaign_switcher" class="text-xs text-slate-400 font-semibold hidden sm:inline">Switch Initiative:</label>
						<select
							id="detail_campaign_switcher"
							class="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-red-500 cursor-pointer"
							value={data.selectedCampaignId}
							onchange={changeCampaign}
						>
							<option value="all">📂 View All Initiatives</option>
							{#each data.campaigns as camp}
								<option value={camp.id}>{camp.title}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
					<div>
						<div class="flex items-center gap-2 mb-1.5">
							<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-600/20 text-red-400 border border-red-500/30">
								Managing Initiative
							</span>
							<span class="text-xs font-mono text-slate-500">ID: {data.selectedCampaign.id}</span>
						</div>
						<h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
							{data.selectedCampaign.title}
						</h1>
						{#if data.selectedCampaign.subtitle}
							<p class="text-slate-400 text-xs mt-1 max-w-3xl">
								{data.selectedCampaign.subtitle}
							</p>
						{/if}
					</div>

					<div class="flex items-center gap-2">
						{#if data.selectedCampaign.id === 'nepal-flood-2024'}
							<a
								href="/impact/nepal-flood-relief"
								target="_blank"
								class="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-all flex items-center gap-1.5"
							>
								<span>🌐 View Public Page</span>
								<span>↗</span>
							</a>
						{/if}
					</div>
				</div>
			</div>

			<!-- Key Financial Metric Cards for This Specific Campaign -->
			<div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
				<!-- Total Raised -->
				<div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow">
					<div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Raised (All)</div>
					<div class="text-2xl sm:text-3xl font-black text-white mt-1">
						${data.stats.totalRaised.toLocaleString('en-CA')}
						<span class="text-xs font-normal text-slate-400">CAD</span>
					</div>
					<div class="text-[11px] text-slate-500 mt-1">{data.stats.totalDonors} Total Donors</div>
				</div>

				<!-- Received / Cash In Bank -->
				<div class="bg-slate-900/80 p-5 rounded-2xl border border-emerald-900/40 shadow">
					<div class="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
						<span>✅ Received</span>
					</div>
					<div class="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
						${data.stats.totalReceived.toLocaleString('en-CA')}
					</div>
					<div class="text-[11px] text-slate-400 mt-1">{data.stats.receivedCount} Verified in Bank</div>
				</div>

				<!-- Pledged / Pending -->
				<div class="bg-slate-900/80 p-5 rounded-2xl border border-amber-900/40 shadow">
					<div class="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
						<span>⏳ Pledged</span>
					</div>
					<div class="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
						${data.stats.totalPledged.toLocaleString('en-CA')}
					</div>
					<div class="text-[11px] text-slate-400 mt-1">{data.stats.pledgedCount} Pledges Awaiting</div>
				</div>

				<!-- Total Disbursed -->
				<div class="bg-slate-900/80 p-5 rounded-2xl border border-blue-900/40 shadow">
					<div class="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Disbursed (PMO)</div>
					<div class="text-2xl sm:text-3xl font-black text-blue-400 mt-1">
						${data.stats.totalDisbursed.toLocaleString('en-CA')}
					</div>
					<div class="text-[11px] text-slate-400 mt-1">{data.disbursements.length} Tranches Sent</div>
				</div>

				<!-- Net Available Balance -->
				<div class="col-span-2 lg:col-span-1 bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-2xl border border-slate-700 shadow">
					<div class="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Available for Relief</div>
					<div class="text-2xl sm:text-3xl font-black text-white mt-1">
						${data.stats.netAvailableBalance.toLocaleString('en-CA')}
					</div>
					<div class="text-[11px] text-emerald-400 font-semibold mt-1">Ready for Disbursement</div>
				</div>
			</div>

			<!-- Tabs Bar for Campaign Details & Action Buttons -->
			<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
				<div class="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
					<button
						type="button"
						onclick={() => (activeDetailTab = 'donations')}
						class="px-4 py-2 rounded-lg transition-all {activeDetailTab === 'donations' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'}"
					>
						❤️ Donations & Pledges ({data.donations.length})
					</button>
					<button
						type="button"
						onclick={() => (activeDetailTab = 'disbursements')}
						class="px-4 py-2 rounded-lg transition-all {activeDetailTab === 'disbursements' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'}"
					>
						🏛️ Disbursements Ledger ({data.disbursements.length})
					</button>
				</div>

				<div class="flex items-center gap-2">
					{#if activeDetailTab === 'donations'}
						<button
							type="button"
							onclick={() => (showAddDonationModal = true)}
							class="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition-all flex items-center gap-1.5"
						>
							<span>+ Record Donation / Pledge</span>
						</button>
					{:else}
						<button
							type="button"
							onclick={() => (showAddDisbursementModal = true)}
							class="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5"
						>
							<span>+ Record New Disbursement</span>
						</button>
					{/if}
				</div>
			</div>

			<!-- Detail Tab 1: Donations & Pledges -->
			{#if activeDetailTab === 'donations'}
				<div class="space-y-4">
					<!-- Search, Filter & Quick Sort Controls -->
					<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
						<div class="relative w-full sm:w-80">
							<input
								type="text"
								bind:value={searchQuery}
								placeholder="Search by name, email, note..."
								class="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
							/>
							<span class="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-slate-500">🔍</span>
						</div>

						<div class="flex flex-wrap items-center gap-2">
							<!-- Status Filter Buttons -->
							<div class="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
								<button
									type="button"
									onclick={() => (statusFilter = 'all')}
									class="px-3 py-1.5 rounded-lg {statusFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}"
								>
									All ({data.donations.length})
								</button>
								<button
									type="button"
									onclick={() => (statusFilter = 'received')}
									class="px-3 py-1.5 rounded-lg {statusFilter === 'received' ? 'bg-emerald-950 border border-emerald-800 text-emerald-300' : 'text-slate-400 hover:text-white'}"
								>
									✅ Received ({data.stats.receivedCount})
								</button>
								<button
									type="button"
									onclick={() => (statusFilter = 'pledged')}
									class="px-3 py-1.5 rounded-lg {statusFilter === 'pledged' ? 'bg-amber-950 border border-amber-800 text-amber-300' : 'text-slate-400 hover:text-white'}"
								>
									⏳ Pledged ({data.stats.pledgedCount})
								</button>
							</div>

							<!-- Quick Sort Controls -->
							<div class="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs text-slate-400">
								<span class="text-[11px] font-semibold pl-1">Sort:</span>
								<select
									bind:value={sortField}
									class="bg-slate-950 border border-slate-800 text-white rounded-lg px-2 py-1 text-xs focus:outline-none"
								>
									<option value="date">Date</option>
									<option value="amount">Amount</option>
									<option value="name">Donor Name</option>
									<option value="status">Status</option>
								</select>
								<button
									type="button"
									onclick={() => (sortDirection = sortDirection === 'asc' ? 'desc' : 'asc')}
									class="px-2 py-1 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700"
									title="Toggle sort direction"
								>
									{sortDirection === 'asc' ? '▲ Asc' : '▼ Desc'}
								</button>
							</div>
						</div>
					</div>

					<!-- Table of Donations with Clickable Column Sorting -->
					<div class="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow">
						<div class="overflow-x-auto">
							<table class="w-full text-left text-xs">
								<thead class="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 select-none">
									<tr>
										<th class="py-3.5 px-4 cursor-pointer hover:text-white transition-colors" onclick={() => toggleSort('name')}>
											<div class="flex items-center gap-1.5">
												<span>Donor Name</span>
												{#if sortField === 'name'}
													<span class="text-red-400">{sortDirection === 'asc' ? '▲' : '▼'}</span>
												{:else}
													<span class="text-slate-600">↕</span>
												{/if}
											</div>
										</th>
										<th class="py-3.5 px-4 cursor-pointer hover:text-white transition-colors" onclick={() => toggleSort('amount')}>
											<div class="flex items-center gap-1.5">
												<span>Amount (CAD)</span>
												{#if sortField === 'amount'}
													<span class="text-red-400">{sortDirection === 'asc' ? '▲' : '▼'}</span>
												{:else}
													<span class="text-slate-600">↕</span>
												{/if}
											</div>
										</th>
										<th class="py-3.5 px-4 cursor-pointer hover:text-white transition-colors" onclick={() => toggleSort('status')}>
											<div class="flex items-center gap-1.5">
												<span>Status</span>
												{#if sortField === 'status'}
													<span class="text-red-400">{sortDirection === 'asc' ? '▲' : '▼'}</span>
												{:else}
													<span class="text-slate-600">↕</span>
												{/if}
											</div>
										</th>
										<th class="py-3.5 px-4 cursor-pointer hover:text-white transition-colors" onclick={() => toggleSort('date')}>
											<div class="flex items-center gap-1.5">
												<span>Date</span>
												{#if sortField === 'date'}
													<span class="text-red-400">{sortDirection === 'asc' ? '▲' : '▼'}</span>
												{:else}
													<span class="text-slate-600">↕</span>
												{/if}
											</div>
										</th>
										<th class="py-3.5 px-4">Message / Purpose</th>
										<th class="py-3.5 px-4 text-right">Actions</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-slate-800/60">
									{#if sortedDonations.length === 0}
										<tr>
											<td colspan="6" class="py-8 text-center text-slate-500">
												No donations recorded for this initiative matching current filter.
											</td>
										</tr>
									{:else}
										{#each sortedDonations as don}
											<tr class="hover:bg-slate-800/40 transition-colors">
												<td class="py-3.5 px-4">
													<div class="font-bold text-white flex items-center gap-1.5">
														<span>{don.donor_name}</span>
														{#if don.is_anonymous}
															<span class="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">Anon</span>
														{/if}
													</div>
													{#if don.email}
														<div class="text-[11px] text-slate-400">{don.email}</div>
													{/if}
												</td>

												<td class="py-3.5 px-4 font-black text-white text-sm">
													${Number(don.amount).toLocaleString('en-CA')}
												</td>

												<td class="py-3.5 px-4">
													{#if don.status === 'received'}
														<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-[11px] font-bold text-emerald-400">
															<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
															Received
														</span>
													{:else}
														<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950 border border-amber-800 text-[11px] font-bold text-amber-400">
															<span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
															Pledged
														</span>
													{/if}
												</td>

												<td class="py-3.5 px-4 text-slate-400 whitespace-nowrap">
													{new Date(don.created_at).toLocaleDateString('en-CA', {
														month: 'short',
														day: 'numeric',
														year: 'numeric'
													})}
												</td>

												<td class="py-3.5 px-4 text-slate-300 max-w-xs truncate">
													{don.message || '—'}
												</td>

												<td class="py-3.5 px-4 text-right whitespace-nowrap">
													<div class="flex items-center justify-end gap-2">
														<!-- Toggle Status -->
														<form method="POST" action="?/toggleStatus" use:enhance>
															<input type="hidden" name="id" value={don.id} />
															<input
																type="hidden"
																name="status"
																value={don.status === 'pledged' ? 'received' : 'pledged'}
															/>
															<button
																type="submit"
																title={don.status === 'pledged' ? 'Mark as Received' : 'Mark as Pledged'}
																class="px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all {don.status === 'pledged'
																	? 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-700 text-emerald-300'
																	: 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'}"
															>
																{don.status === 'pledged' ? '✓ Mark Received' : 'Revert to Pledged'}
															</button>
														</form>

														<!-- Edit Button -->
														<button
															type="button"
															onclick={() => openEditModal(don)}
															class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all"
														>
															✏️ Edit
														</button>

														<!-- Delete Button -->
														<form method="POST" action="?/deleteDonation" use:enhance onsubmit={(e) => {
															if (!confirm(`Delete donation record for ${don.donor_name}?`)) {
																e.preventDefault();
															}
														}}>
															<input type="hidden" name="id" value={don.id} />
															<button
																type="submit"
																class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 transition-all"
															>
																🗑️
															</button>
														</form>
													</div>
												</td>
											</tr>
										{/each}
									{/if}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			{/if}

			<!-- Detail Tab 2: Disbursements Ledger -->
			{#if activeDetailTab === 'disbursements'}
				<div class="space-y-4">
					<div class="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow">
						<div class="p-4 border-b border-slate-800 flex items-center justify-between">
							<div>
								<h3 class="font-bold text-white text-sm">Disbursements & Relief Allocations</h3>
								<p class="text-xs text-slate-400">Wire transfers and relief support documented for this specific initiative.</p>
							</div>
						</div>

						<div class="divide-y divide-slate-800/60">
							{#if data.disbursements.length === 0}
								<div class="py-12 text-center text-slate-500 text-xs">
									No disbursements recorded for this initiative yet. Click "+ Record New Disbursement" to add one.
								</div>
							{:else}
								{#each data.disbursements as disb}
									<div class="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-slate-800/30 transition-colors">
										<div class="space-y-2">
											<div class="flex items-center gap-2">
												<span class="text-lg">🏛️</span>
												<span class="font-bold text-white text-base">{disb.recipient}</span>
												<span class="px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-[10px] font-semibold text-blue-300">
													Disbursed
												</span>
											</div>

											<div class="text-xs text-slate-400 space-y-1">
												<div>Date Disbursed: <strong class="text-slate-200">{disb.disbursed_at}</strong></div>
												{#if disb.reference_number}
													<div>Wire / Reference: <code class="font-mono bg-slate-950 px-1.5 py-0.5 rounded text-amber-400">{disb.reference_number}</code></div>
												{/if}
												{#if disb.notes}
													<div class="text-slate-300 italic">"{disb.notes}"</div>
												{/if}
											</div>

											{#if disb.allocated_donations && disb.allocated_donations.length > 0}
												<div class="pt-2 border-t border-slate-800/80">
													<span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
														Allocated From Contributors ({disb.allocated_donations.length}):
													</span>
													<div class="flex flex-wrap gap-1.5">
														{#each disb.allocated_donations as alloc}
															<span class="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300">
																{alloc.donor_name} (${alloc.amount})
															</span>
														{/each}
													</div>
												</div>
											{/if}
										</div>

										<div class="flex flex-col sm:items-end gap-2 shrink-0">
											<div class="text-xl sm:text-2xl font-black text-white">
												${Number(disb.amount).toLocaleString('en-CA')} <span class="text-xs font-semibold text-slate-400">CAD</span>
											</div>

											{#if disb.document_url}
												<a
													href={disb.document_url}
													target="_blank"
													rel="noopener noreferrer"
													class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5"
												>
													📄 View Supporting Document &rarr;
												</a>
											{/if}

											<form method="POST" action="?/deleteDisbursement" use:enhance onsubmit={(e) => {
												if (!confirm(`Delete this disbursement record of $${disb.amount} CAD?`)) {
													e.preventDefault();
												}
											}}>
												<input type="hidden" name="id" value={disb.id} />
												<button
													type="submit"
													class="text-[11px] text-red-400 hover:text-red-300 hover:underline mt-1"
												>
													Delete Record
												</button>
											</form>
										</div>
									</div>
								{/each}
							{/if}
						</div>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</section>

<!-- Modals -->

<!-- Add Donation Modal -->
{#if showAddDonationModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
		<div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
			<div class="flex items-center justify-between border-b border-slate-800 pb-4">
				<h3 class="text-lg font-bold text-white">Record Donation / Pledge</h3>
				<button type="button" onclick={() => (showAddDonationModal = false)} class="text-slate-400 hover:text-white text-lg">✕</button>
			</div>

			<form method="POST" action="?/addDonation" use:enhance={() => {
				showAddDonationModal = false;
			}} class="space-y-4 text-xs">
				<input type="hidden" name="campaign_id" value={data.selectedCampaignId} />

				<div>
					<label for="donor_name" class="block font-bold text-slate-300 mb-1">Donor Name *</label>
					<input
						id="donor_name"
						name="donor_name"
						type="text"
						required
						placeholder="e.g. Dr. Meghraj Gnawali"
						class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-red-500"
					/>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="amount" class="block font-bold text-slate-300 mb-1">Amount (CAD) *</label>
						<input
							id="amount"
							name="amount"
							type="number"
							min="1"
							step="any"
							required
							placeholder="100"
							class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-red-500"
						/>
					</div>

					<div>
						<label for="status" class="block font-bold text-slate-300 mb-1">Status *</label>
						<select
							id="status"
							name="status"
							class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-red-500"
						>
							<option value="received">✅ Received</option>
							<option value="pledged" selected>⏳ Pledged (Awaiting)</option>
						</select>
					</div>
				</div>

				<div>
					<label for="email" class="block font-bold text-slate-300 mb-1">Email Address (Optional)</label>
					<input
						id="email"
						name="email"
						type="email"
						placeholder="donor@example.com"
						class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-red-500"
					/>
				</div>

				<div>
					<label for="message" class="block font-bold text-slate-300 mb-1">Solidarity Message / Note</label>
					<textarea
						id="message"
						name="message"
						rows="2"
						placeholder="Message of hope or administrative note..."
						class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-red-500"
					></textarea>
				</div>

				<div class="flex items-center gap-2">
					<input id="is_anonymous" type="checkbox" name="is_anonymous" class="rounded bg-slate-950 border-slate-700 text-red-600" />
					<label for="is_anonymous" class="text-slate-400 cursor-pointer">Display as "Anonymous Donor" publicly</label>
				</div>

				<div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
					<button
						type="button"
						onclick={() => (showAddDonationModal = false)}
						class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow"
					>
						Save Donation
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Edit Donation Modal -->
{#if showEditDonationModal && editingDonation}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
		<div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
			<div class="flex items-center justify-between border-b border-slate-800 pb-4">
				<h3 class="text-lg font-bold text-white">Edit Contribution Details</h3>
				<button type="button" onclick={() => (showEditDonationModal = false)} class="text-slate-400 hover:text-white text-lg">✕</button>
			</div>

			<form method="POST" action="?/updateDonation" use:enhance={() => {
				showEditDonationModal = false;
			}} class="space-y-4 text-xs">
				<input type="hidden" name="id" value={editingDonation.id} />

				<div>
					<label for="edit_donor_name" class="block font-bold text-slate-300 mb-1">Donor Name *</label>
					<input
						id="edit_donor_name"
						name="donor_name"
						type="text"
						required
						bind:value={editingDonation.donor_name}
						class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-red-500"
					/>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="edit_amount" class="block font-bold text-slate-300 mb-1">Amount (CAD) *</label>
						<input
							id="edit_amount"
							name="amount"
							type="number"
							min="1"
							step="any"
							required
							bind:value={editingDonation.amount}
							class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-red-500"
						/>
					</div>

					<div>
						<label for="edit_status" class="block font-bold text-slate-300 mb-1">Status *</label>
						<select
							id="edit_status"
							name="status"
							bind:value={editingDonation.status}
							class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-red-500"
						>
							<option value="received">✅ Received</option>
							<option value="pledged">⏳ Pledged (Awaiting)</option>
						</select>
					</div>
				</div>

				<div>
					<label for="edit_email" class="block font-bold text-slate-300 mb-1">Email Address</label>
					<input
						id="edit_email"
						name="email"
						type="email"
						bind:value={editingDonation.email}
						class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-red-500"
					/>
				</div>

				<div>
					<label for="edit_message" class="block font-bold text-slate-300 mb-1">Solidarity Message / Note</label>
					<textarea
						id="edit_message"
						name="message"
						rows="2"
						bind:value={editingDonation.message}
						class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-red-500"
					></textarea>
				</div>

				<div class="flex items-center gap-2">
					<input
						id="edit_is_anonymous"
						type="checkbox"
						name="is_anonymous"
						bind:checked={editingDonation.is_anonymous}
						class="rounded bg-slate-950 border-slate-700 text-red-600"
					/>
					<label for="edit_is_anonymous" class="text-slate-400 cursor-pointer">Display as "Anonymous Donor" publicly</label>
				</div>

				<div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
					<button
						type="button"
						onclick={() => (showEditDonationModal = false)}
						class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow"
					>
						Update Record
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Record Disbursement Modal -->
{#if showAddDisbursementModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
		<div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
			<div class="flex items-center justify-between border-b border-slate-800 pb-4">
				<div>
					<h3 class="text-lg font-bold text-white">Record New Disbursement</h3>
					<p class="text-xs text-slate-400">Document funds transferred to authorized relief recipients.</p>
				</div>
				<button type="button" onclick={() => (showAddDisbursementModal = false)} class="text-slate-400 hover:text-white text-lg">✕</button>
			</div>

			<form method="POST" action="?/recordDisbursement" use:enhance={() => {
				showAddDisbursementModal = false;
			}} class="space-y-4 text-xs">
				<input type="hidden" name="campaign_id" value={data.selectedCampaignId} />

				<div>
					<label for="disb_recipient" class="block font-bold text-slate-300 mb-1">Recipient Organization / Agency *</label>
					<input
						id="disb_recipient"
						name="recipient"
						type="text"
						required
						placeholder="e.g. Government of Nepal Prime Minister's Disaster Relief Fund (PMO)"
						class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
					/>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="disb_amount" class="block font-bold text-slate-300 mb-1">Disbursement Amount (CAD) *</label>
						<input
							id="disb_amount"
							name="amount"
							type="number"
							min="1"
							step="any"
							required
							placeholder="1500"
							class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
						/>
					</div>

					<div>
						<label for="disb_date" class="block font-bold text-slate-300 mb-1">Disbursement Date *</label>
						<input
							id="disb_date"
							name="disbursed_at"
							type="date"
							required
							value={new Date().toISOString().split('T')[0]}
							class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
						/>
					</div>
				</div>

				<div>
					<label for="reference_number" class="block font-bold text-slate-300 mb-1">Wire Transfer / Bank Reference No.</label>
					<input
						id="reference_number"
						name="reference_number"
						type="text"
						placeholder="e.g. WT-2026-NPL-001 or SWIFT REF"
						class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 font-mono"
					/>
				</div>

				<div>
					<label for="document_url" class="block font-bold text-slate-300 mb-1">Supporting Document URL / Receipt Link</label>
					<input
						id="document_url"
						name="document_url"
						type="url"
						placeholder="https://... (link to wire confirmation receipt, bank voucher, official acknowledgment)"
						class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
					/>
				</div>

				<div>
					<label for="notes" class="block font-bold text-slate-300 mb-1">Public Notes & Remarks</label>
					<textarea
						id="notes"
						name="notes"
						rows="2"
						placeholder="e.g. Tranche 1 wire transfer disbursed to PMO fund for emergency medical and shelter relief."
						class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
					></textarea>
				</div>

				<!-- Link Received Donations -->
				<div class="space-y-2 pt-2 border-t border-slate-800">
					<div class="block font-bold text-slate-300">
						Allocate from Received Donations (Optional)
					</div>
					<p class="text-[11px] text-slate-400">Select which received donations are tied to this disbursement tranche:</p>

					<div class="max-h-40 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-950 border border-slate-800">
						{#each (data.donations || []).filter((d: any) => d.status === 'received') as receivedDon}
							<label class="flex items-center justify-between p-1.5 rounded hover:bg-slate-900 cursor-pointer">
								<div class="flex items-center gap-2">
									<input type="checkbox" name="donation_ids" value={receivedDon.id} class="rounded bg-slate-900 border-slate-700 text-blue-600" />
									<span class="font-semibold text-slate-200">{receivedDon.donor_name}</span>
								</div>
								<span class="font-black text-emerald-400">${receivedDon.amount} CAD</span>
							</label>
						{/each}
					</div>
				</div>

				<div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
					<button
						type="button"
						onclick={() => (showAddDisbursementModal = false)}
						class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow"
					>
						Record Disbursement
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Create Campaign Modal -->
{#if showCreateCampaignModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
		<div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
			<div class="flex items-center justify-between border-b border-slate-800 pb-4">
				<h3 class="text-lg font-bold text-white">Launch New Fundraising Initiative</h3>
				<button type="button" onclick={() => (showCreateCampaignModal = false)} class="text-slate-400 hover:text-white text-lg">✕</button>
			</div>

			<form method="POST" action="?/createCampaign" use:enhance={() => {
				showCreateCampaignModal = false;
			}} class="space-y-4 text-xs">
				<div>
					<label for="camp_title" class="block font-bold text-slate-300 mb-1">Initiative Title *</label>
					<input
						id="camp_title"
						name="title"
						type="text"
						required
						placeholder="e.g. Nepal Flood Emergency Relief & Rehabilitation Fund"
						class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-red-500"
					/>
				</div>

				<div>
					<label for="camp_id" class="block font-bold text-slate-300 mb-1">Unique Initiative ID (Slug) *</label>
					<input
						id="camp_id"
						name="id"
						type="text"
						required
						placeholder="e.g. nepal-flood-2024 or everest-day-scholarship"
						class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-red-500 font-mono"
					/>
				</div>

				<div>
					<label for="camp_goal" class="block font-bold text-slate-300 mb-1">Target Goal (CAD) *</label>
					<input
						id="camp_goal"
						name="target_goal"
						type="number"
						min="100"
						required
						placeholder="10000"
						class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-red-500"
					/>
				</div>

				<div>
					<label for="camp_subtitle" class="block font-bold text-slate-300 mb-1">Brief Description / Mission</label>
					<textarea
						id="camp_subtitle"
						name="subtitle"
						rows="2"
						placeholder="Supporting flood-affected communities across Nepal..."
						class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-red-500"
					></textarea>
				</div>

				<div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
					<button
						type="button"
						onclick={() => (showCreateCampaignModal = false)}
						class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow"
					>
						Create Initiative
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
