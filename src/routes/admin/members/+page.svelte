<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let activeTab = $state<'pending' | 'approved' | 'admins' | 'all'>('pending');
	let searchQuery = $state('');
	let copiedPassword = $state(false);

	const pendingMembers = $derived(
		data.members.filter((m: any) => m.status === 'pending')
	);
	const approvedMembers = $derived(
		data.members.filter((m: any) => m.status === 'approved')
	);
	const adminMembers = $derived(
		data.members.filter((m: any) => m.role === 'admin')
	);

	const filteredMembers = $derived(
		data.members.filter((m: any) => {
			let matchesTab = true;
			if (activeTab === 'pending') matchesTab = m.status === 'pending';
			else if (activeTab === 'approved') matchesTab = m.status === 'approved';
			else if (activeTab === 'admins') matchesTab = m.role === 'admin';

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
	<title>Admin Dashboard - Member Governance & Permissions - CANFACS</title>
</svelte:head>

<section class="py-12 bg-slate-950 min-h-screen">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
		<!-- Header -->
		<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
			<div>
				<span class="px-3 py-1 text-xs uppercase tracking-wider font-bold text-amber-400 bg-amber-400/10 rounded-full border border-amber-400/20">
					Admin Control Center
				</span>
				<h1 class="text-3xl font-extrabold text-white mt-2">Member Applications & Governance</h1>
				<p class="text-slate-400 text-sm mt-1">
					Review pending registration requests, assign passwords, and manage administrative privileges.
				</p>
			</div>

			<div class="flex items-center gap-3">
				<span class="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
					⏳ Pending: <span class="text-amber-400 font-bold ml-1">{pendingMembers.length}</span>
				</span>
				<span class="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
					✅ Approved: <span class="text-emerald-400 font-bold ml-1">{approvedMembers.length}</span>
				</span>
				<span class="px-4 py-2 rounded-xl bg-slate-900 border border-amber-500/30 text-xs font-semibold text-amber-300">
					👑 Admins: <span class="text-amber-400 font-bold ml-1">{adminMembers.length}</span>
				</span>
			</div>
		</div>

		<!-- Action / Status Notice -->
		{#if form?.message}
			<div class="p-4 rounded-xl {form?.success ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' : 'bg-red-950/80 border-red-500/50 text-red-300'} border text-xs leading-relaxed flex items-center justify-between shadow-lg">
				<span>{form?.success ? '✅' : '⚠️'} {form.message || form.error}</span>
			</div>
		{/if}

		<!-- Newly Approved Password Modal Banner -->
		{#if form?.success && form?.generatedPassword}
			<div class="p-6 rounded-2xl bg-emerald-950/90 border-2 border-emerald-500/60 text-white shadow-2xl relative">
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
		<div class="flex flex-col sm:flex-row justify-between items-center gap-4">
			<div class="flex items-center gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 w-full sm:w-auto overflow-x-auto">
				<button
					type="button"
					onclick={() => (activeTab = 'pending')}
					class="px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 {activeTab === 'pending' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}"
				>
					<span>⏳ Pending</span>
					<span>({pendingMembers.length})</span>
				</button>
				<button
					type="button"
					onclick={() => (activeTab = 'approved')}
					class="px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 {activeTab === 'approved' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}"
				>
					<span>✅ Approved</span>
					<span>({approvedMembers.length})</span>
				</button>
				<button
					type="button"
					onclick={() => (activeTab = 'admins')}
					class="px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 {activeTab === 'admins' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}"
				>
					<span>👑 Administrators</span>
					<span>({adminMembers.length})</span>
				</button>
				<button
					type="button"
					onclick={() => (activeTab = 'all')}
					class="px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap {activeTab === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}"
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
					<div class="glass-card p-6 rounded-2xl flex flex-col justify-between border border-slate-800/80 hover:border-slate-700 transition-all {member.role === 'admin' ? 'ring-1 ring-amber-500/30' : ''}">
						<div>
							<div class="flex items-start justify-between gap-2 mb-3">
								<div>
									<h3 class="font-bold text-white text-base leading-snug flex items-center gap-1.5">
										<span>{member.full_name}</span>
										{#if member.id === data.currentUserId}
											<span class="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">You</span>
										{/if}
									</h3>
									<p class="text-xs text-slate-400 font-mono">{member.email}</p>
								</div>

								<div class="flex flex-col items-end gap-1">
									<!-- Status Badge -->
									<span
										class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
										{member.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : ''}
										{member.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : ''}
										{member.status === 'denied' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : ''}"
									>
										{member.status}
									</span>

									<!-- Role Badge -->
									{#if member.role === 'admin'}
										<span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-amber-500 text-slate-950 shadow-sm flex items-center gap-1">
											<span>👑</span>
											<span>Admin</span>
										</span>
									{:else}
										<span class="px-2 py-0.5 rounded-full text-[9px] font-semibold text-slate-400 bg-slate-900 border border-slate-800">
											Member
										</span>
									{/if}
								</div>
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

						<div class="pt-3 border-t border-slate-800 space-y-2">
							<div class="flex items-center justify-between gap-2">
								<span class="text-[10px] text-slate-500 font-mono">
									Joined: {new Date(member.created_at).toLocaleDateString()}
								</span>

								<!-- Role Toggle Button -->
								{#if member.id !== data.currentUserId}
									<form method="POST" action="?/toggleRole" use:enhance onsubmit={(e) => {
										const actionName = member.role === 'admin' ? 'remove admin privileges from' : 'promote to administrator';
										if (!confirm(`Are you sure you want to ${actionName} ${member.full_name} (${member.email})?`)) {
											e.preventDefault();
										}
									}}>
										<input type="hidden" name="memberId" value={member.id} />
										<input type="hidden" name="memberEmail" value={member.email} />
										<input type="hidden" name="role" value={member.role === 'admin' ? 'member' : 'admin'} />
										<button
											type="submit"
											class="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all {member.role === 'admin'
												? 'bg-amber-950/70 hover:bg-amber-900 border border-amber-700 text-amber-300'
												: 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300'}"
										>
											{member.role === 'admin' ? 'Demote to Member' : '👑 Make Admin'}
										</button>
									</form>
								{/if}
							</div>

							<!-- Approval / Denial Controls -->
							{#if member.status === 'pending'}
								<div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
									<form method="POST" action="?/approve" use:enhance>
										<input type="hidden" name="memberId" value={member.id} />
										<input type="hidden" name="memberEmail" value={member.email} />
										<button
											type="submit"
											class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-md"
										>
											Approve ✓
										</button>
									</form>

									<form method="POST" action="?/deny" use:enhance>
										<input type="hidden" name="memberId" value={member.id} />
										<button
											type="submit"
											class="px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-500 text-white text-xs font-bold transition-colors"
										>
											Deny ✕
										</button>
									</form>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>
