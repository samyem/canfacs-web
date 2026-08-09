<script lang="ts">
	let { data, form } = $props();

	let activeTab = $state<'pending' | 'approved' | 'all'>('pending');
	let searchQuery = $state('');
	let copiedPassword = $state(false);

	const pendingMembers = $derived(
		data.members.filter((m: any) => m.status === 'pending')
	);
	const approvedMembers = $derived(
		data.members.filter((m: any) => m.status === 'approved')
	);

	const filteredMembers = $derived(
		data.members.filter((m: any) => {
			const matchesTab =
				activeTab === 'all' || m.status === activeTab;
			const q = searchQuery.toLowerCase();
			const matchesQuery =
				!q ||
				m.full_name?.toLowerCase().includes(q) ||
				m.email?.toLowerCase().includes(q) ||
				m.city?.toLowerCase().includes(q) ||
				m.profession?.toLowerCase().includes(q);
			return matchesTab && matchesQuery;
		})
	);

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
		copiedPassword = true;
		setTimeout(() => (copiedPassword = false), 2500);
	}
</script>

<svelte:head>
	<title>Admin Dashboard - Member Approvals - CANFACS</title>
</svelte:head>

<section class="py-12 bg-slate-950 min-h-screen">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
			<div>
				<span class="px-3 py-1 text-xs uppercase tracking-wider font-bold text-amber-400 bg-amber-400/10 rounded-full border border-amber-400/20">
					Admin Control Center
				</span>
				<h1 class="text-3xl font-extrabold text-white mt-2">Member Applications & Governance</h1>
				<p class="text-slate-400 text-sm mt-1">
					Review pending registration requests, assign passwords, and manage active society members.
				</p>
			</div>

			<div class="flex items-center gap-3">
				<span class="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
					⏳ Pending: <span class="text-amber-400 font-bold ml-1">{pendingMembers.length}</span>
				</span>
				<span class="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
					✅ Approved: <span class="text-emerald-400 font-bold ml-1">{approvedMembers.length}</span>
				</span>
			</div>
		</div>

		<!-- Newly Approved Password Modal Banner -->
		{#if form?.success && form?.generatedPassword}
			<div class="mb-8 p-6 rounded-2xl bg-emerald-950/90 border-2 border-emerald-500/60 text-white shadow-2xl relative">
				<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
					<div>
						<div class="flex items-center gap-2">
							<span class="text-xl">🎉</span>
							<h3 class="text-lg font-bold text-emerald-300">Application Approved!</h3>
						</div>
						<p class="text-sm text-slate-200 mt-1">
							Generated login credentials for <strong class="text-white">{form.approvedEmail}</strong>:
						</p>
					</div>

					<div class="flex items-center gap-3 bg-slate-900/90 p-3 rounded-xl border border-emerald-500/40">
						<code class="text-base font-mono font-bold text-amber-300 select-all">{form.generatedPassword}</code>
						<button
							type="button"
							onclick={() => copyToClipboard(form.generatedPassword)}
							class="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
						>
							{copiedPassword ? 'Copied! ✓' : 'Copy Password'}
						</button>
					</div>
				</div>
				<p class="text-[11px] text-slate-400 mt-3 italic">
					ℹ️ Supply this temporary password to {form.approvedEmail} so they can log in at <a href="/login" class="underline text-emerald-400">/login</a>.
				</p>
			</div>
		{/if}

		<!-- Tabs & Search -->
		<div class="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
			<div class="flex items-center gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 w-full sm:w-auto">
				<button
					type="button"
					onclick={() => (activeTab = 'pending')}
					class="px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 {activeTab === 'pending' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}"
				>
					Pending Applications ({pendingMembers.length})
				</button>
				<button
					type="button"
					onclick={() => (activeTab = 'approved')}
					class="px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 {activeTab === 'approved' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}"
				>
					Approved Members ({approvedMembers.length})
				</button>
				<button
					type="button"
					onclick={() => (activeTab = 'all')}
					class="px-5 py-2 rounded-xl text-xs font-bold transition-all {activeTab === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}"
				>
					All ({data.members.length})
				</button>
			</div>

			<div class="w-full sm:w-72">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search by name, email, city..."
					class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
				/>
			</div>
		</div>

		<!-- Members List -->
		{#if filteredMembers.length === 0}
			<div class="glass-card p-12 rounded-3xl text-center border border-slate-800">
				<p class="text-slate-400 text-sm">No member applications match the current filter.</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each filteredMembers as member}
					<div class="glass-card p-6 rounded-2xl flex flex-col justify-between border border-slate-800/80 hover:border-slate-700 transition-all">
						<div>
							<div class="flex items-start justify-between gap-2 mb-3">
								<div>
									<h3 class="font-bold text-white text-base leading-snug">{member.full_name}</h3>
									<p class="text-xs text-slate-400 font-mono">{member.email}</p>
								</div>
								<span
									class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider uppercase
									{member.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : ''}
									{member.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : ''}
									{member.status === 'denied' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : ''}"
								>
									{member.status}
								</span>
							</div>

							<div class="space-y-1.5 text-xs text-slate-300 mb-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
								{#if member.profession}
									<p><strong class="text-slate-400 font-medium">Profession:</strong> {member.profession}</p>
								{/if}
								{#if member.city || member.province}
									<p><strong class="text-slate-400 font-medium">Location:</strong> {[member.city, member.province].filter(Boolean).join(', ')}</p>
								{/if}
								{#if member.phone}
									<p><strong class="text-slate-400 font-medium">Phone:</strong> {member.phone}</p>
								{/if}
								{#if member.bio}
									<p class="text-slate-400 italic text-[11px] mt-2 leading-relaxed">"{member.bio}"</p>
								{/if}
							</div>
						</div>

						<div class="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
							<span class="text-[10px] text-slate-500 font-mono">
								Applied: {new Date(member.created_at).toLocaleDateString()}
							</span>

							{#if member.status === 'pending'}
								<div class="flex items-center gap-2">
									<form method="POST" action="?/approve">
										<input type="hidden" name="memberId" value={member.id} />
										<input type="hidden" name="memberEmail" value={member.email} />
										<button
											type="submit"
											class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-md"
										>
											Approve ✓
										</button>
									</form>

									<form method="POST" action="?/deny">
										<input type="hidden" name="memberId" value={member.id} />
										<button
											type="submit"
											class="px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-500 text-white text-xs font-bold transition-colors"
										>
											Deny ✕
										</button>
									</form>
								</div>
							{:else if member.status === 'approved'}
								<span class="text-xs text-emerald-400 font-semibold flex items-center gap-1">
									✓ Active Member
								</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>
