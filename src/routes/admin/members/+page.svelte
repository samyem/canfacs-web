<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	import { page } from '$app/state';

	let activeTab = $state<'pending' | 'approved' | 'admins' | 'bod' | 'advisory' | 'partners' | 'all' | 'org_roles'>('pending');
	let searchQuery = $state('');
	let copiedPassword = $state(false);
	let editingMember = $state<any | null>(null);
	let editingOrgRole = $state<{ id?: string; title: string; category: string; rank_order: number; description: string; parent_role_id?: string | null } | null>(null);
	let isUploadingAvatar = $state(false);
	let avatarUploadError = $state('');
	let isRoleDropdownOpen = $state(false);
	let isCreatingMember = $state(false);

	function openCreateModal() {
		editingMember = {
			id: '',
			email: '',
			full_name: '',
			salutation: 'Mr.',
			role: 'member',
			selected_org_role_id: '',
			profession: '',
			phone: '',
			phone_secondary: '',
			city: 'Vancouver',
			province: 'BC',
			country: 'Canada',
			bio: '',
			avatar_url: '',
			google_login_enabled: 1
		};
		isCreatingMember = true;
		avatarUploadError = '';
	}

	$effect(() => {
		const editId = page.url.searchParams.get('edit');
		if (editId && !editingMember && data.members) {
			const target = data.members.find((m: any) => m.id === editId);
			if (target) {
				openEditModal(target);
			}
		}
	});

	function openEditModal(m: any) {
		const existingAssigned = data.memberOrgRoles?.find((mor: any) => mor.member_id === m.id && (mor.is_active === 1 || mor.is_active === true));
		const matchingRole = data.orgRoles?.find((r: any) => r.title.toLowerCase() === (m.organizational_role || '').toLowerCase());
		editingMember = {
			...m,
			selected_org_role_id: existingAssigned?.role_id || matchingRole?.id || ''
		};
		isCreatingMember = false;
		avatarUploadError = '';
	}

	function closeEditModal() {
		editingMember = null;
		isCreatingMember = false;
		avatarUploadError = '';
	}

	async function handleAvatarUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file || !editingMember) return;

		isUploadingAvatar = true;
		avatarUploadError = '';

		try {
			const formData = new FormData();
			formData.append('file', file);
			const res = await fetch('/api/upload', {
				method: 'POST',
				body: formData
			});

			const json: any = await res.json();
			if (!res.ok || json.error) {
				avatarUploadError = json.error || 'Failed to upload avatar image.';
			} else {
				editingMember.avatar_url = json.url;
			}
		} catch (err: any) {
			avatarUploadError = err.message || 'Error uploading file.';
		} finally {
			isUploadingAvatar = false;
		}
	}

	const pendingMembers = $derived(
		data.members.filter((m: any) => m.status === 'pending')
	);
	const approvedMembers = $derived(
		data.members.filter((m: any) => m.status === 'approved')
	);
	const adminMembers = $derived(
		data.members.filter((m: any) => m.role === 'admin' || m.org_role_id === 'org_admin')
	);
	const bodMembers = $derived(
		data.members.filter((m: any) =>
			m.role === 'bod' ||
			m.role === 'admin' ||
			m.org_category === 'board' ||
			m.org_category === 'executive' ||
			m.parent_role_id === 'org_director' ||
			m.parent_title?.toLowerCase().includes('director') ||
			m.organizational_role?.toLowerCase().includes('director')
		)
	);
	const advisoryMembers = $derived(
		data.members.filter((m: any) => m.role === 'advisory' || m.org_category === 'advisory' || m.organizational_role?.toLowerCase().includes('advisor') || m.organizational_role?.toLowerCase().includes('founder') || m.organizational_role?.toLowerCase().includes('consul'))
	);
	const partnerMembers = $derived(
		data.members.filter((m: any) => m.role === 'partner')
	);

	const filteredMembers = $derived(
		data.members.filter((m: any) => {
			let matchesTab = true;
			if (activeTab === 'pending') matchesTab = m.status === 'pending';
			else if (activeTab === 'approved') matchesTab = m.status === 'approved';
			else if (activeTab === 'admins') matchesTab = m.role === 'admin' || m.org_role_id === 'org_admin';
			else if (activeTab === 'bod') matchesTab = m.role === 'bod' || m.role === 'admin' || m.org_category === 'board' || m.org_category === 'executive' || m.parent_role_id === 'org_director' || m.parent_title?.toLowerCase().includes('director') || m.organizational_role?.toLowerCase().includes('director');
			else if (activeTab === 'advisory') matchesTab = m.role === 'advisory' || m.org_category === 'advisory' || m.organizational_role?.toLowerCase().includes('advisor') || m.organizational_role?.toLowerCase().includes('founder') || m.organizational_role?.toLowerCase().includes('consul');
			else if (activeTab === 'partners') matchesTab = m.role === 'partner';

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

			<div class="flex items-center gap-3 flex-wrap">
				<button
					type="button"
					onclick={openCreateModal}
					class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
				>
					<span class="text-sm font-black">＋</span>
					<span>Add New Member</span>
				</button>

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
			<div class="flex items-center gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 w-full sm:w-auto flex-wrap">
				<!-- Status Tabs -->
				<button
					type="button"
					onclick={() => (activeTab = 'pending')}
					class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 {activeTab === 'pending' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}"
				>
					<span>⏳ Pending</span>
					<span class="px-1.5 py-0.2 rounded-md bg-slate-950/40 text-[10px]">{pendingMembers.length}</span>
				</button>

				<button
					type="button"
					onclick={() => (activeTab = 'approved')}
					class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 {activeTab === 'approved' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}"
				>
					<span>✅ Approved</span>
					<span class="px-1.5 py-0.2 rounded-md bg-slate-950/40 text-[10px]">{approvedMembers.length}</span>
				</button>

				<!-- Compact "By Role" Filter Dropdown -->
				<div class="relative">
					<button
						type="button"
						onclick={() => (isRoleDropdownOpen = !isRoleDropdownOpen)}
						class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border {['admins', 'bod', 'advisory', 'partners'].includes(activeTab) ? 'bg-blue-600 text-white border-blue-500 shadow-md' : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'}"
					>
						<span>🎭</span>
						<span>
							{#if activeTab === 'admins'}
								👑 Admins ({adminMembers.length})
							{:else if activeTab === 'bod'}
								🏛️ BOD ({bodMembers.length})
							{:else if activeTab === 'advisory'}
								🎓 Advisory ({advisoryMembers.length})
							{:else if activeTab === 'partners'}
								🤝 Partners ({partnerMembers.length})
							{:else}
								Filter by Role ▾
							{/if}
						</span>
					</button>

					{#if isRoleDropdownOpen}
						<!-- Click outside backdrop -->
						<button
							type="button"
							tabindex="-1"
							onclick={() => (isRoleDropdownOpen = false)}
							class="fixed inset-0 z-20 cursor-default"
							aria-label="Close role menu"
						></button>

						<div class="absolute left-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 p-2 shadow-2xl z-30 space-y-1 text-xs">
							<div class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Select Member Role</div>

							<button
								type="button"
								onclick={() => { activeTab = 'bod'; isRoleDropdownOpen = false; }}
								class="w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors {activeTab === 'bod' ? 'bg-purple-600 text-white font-bold' : 'text-purple-300 hover:bg-slate-800'}"
							>
								<span>🏛️ Board of Directors</span>
								<span class="text-[10px] opacity-80 font-mono">({bodMembers.length})</span>
							</button>

							<button
								type="button"
								onclick={() => { activeTab = 'advisory'; isRoleDropdownOpen = false; }}
								class="w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors {activeTab === 'advisory' ? 'bg-indigo-600 text-white font-bold' : 'text-indigo-300 hover:bg-slate-800'}"
							>
								<span>🎓 Advisory Board</span>
								<span class="text-[10px] opacity-80 font-mono">({advisoryMembers.length})</span>
							</button>

							<button
								type="button"
								onclick={() => { activeTab = 'admins'; isRoleDropdownOpen = false; }}
								class="w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors {activeTab === 'admins' ? 'bg-amber-600 text-white font-bold' : 'text-amber-300 hover:bg-slate-800'}"
							>
								<span>👑 Administrators</span>
								<span class="text-[10px] opacity-80 font-mono">({adminMembers.length})</span>
							</button>

							<button
								type="button"
								onclick={() => { activeTab = 'partners'; isRoleDropdownOpen = false; }}
								class="w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors {activeTab === 'partners' ? 'bg-blue-600 text-white font-bold' : 'text-blue-300 hover:bg-slate-800'}"
							>
								<span>🤝 MOU Partners</span>
								<span class="text-[10px] opacity-80 font-mono">({partnerMembers.length})</span>
							</button>
						</div>
					{/if}
				</div>

				<button
					type="button"
					onclick={() => (activeTab = 'all')}
					class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap {activeTab === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}"
				>
					All ({data.members.length})
				</button>

				<button
					type="button"
					onclick={() => (activeTab = 'org_roles')}
					class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 {activeTab === 'org_roles' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-amber-400 hover:text-white'}"
				>
					<span>🏷️ Org Roles ({data.orgRoles?.length || 0})</span>
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

		<!-- Organizational Roles Management View -->
		{#if activeTab === 'org_roles'}
			<div class="space-y-6">
				<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800">
					<div>
						<h2 class="text-lg font-bold text-white flex items-center gap-2">
							<span>🏷️ Society Organizational Roles & Governance Structure</span>
						</h2>
						<p class="text-xs text-slate-400 mt-1">
							Define master titles, committee ranks, and categories. Members assigned to these roles will appear in directories and targetable in broadcasts.
						</p>
					</div>
					<button
						type="button"
						onclick={() => (editingOrgRole = { title: '', category: 'board', rank_order: 50, description: '' })}
						class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
					>
						<span>➕</span>
						<span>Define New Role</span>
					</button>
				</div>

				<div class="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
					<div class="overflow-x-auto">
						<table class="w-full text-left text-xs text-slate-300">
							<thead class="bg-slate-900/90 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
								<tr>
									<th class="p-4">Rank</th>
									<th class="p-4">Title & ID</th>
									<th class="p-4">Category</th>
									<th class="p-4">Parent Role (Hierarchy)</th>
									<th class="p-4">Description</th>
									<th class="p-4">Assigned Members</th>
									<th class="p-4 text-right">Actions</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-800/60">
								{#each data.orgRoles || [] as roleItem}
									{@const assignedCount = (data.memberOrgRoles || []).filter((mor: any) => mor.role_id === roleItem.id && (mor.is_active === 1 || mor.is_active === true)).length}
									<tr class="hover:bg-slate-850/40 transition-colors">
										<td class="p-4 font-mono font-bold text-amber-400">{roleItem.rank_order}</td>
										<td class="p-4">
											<div class="font-bold text-white text-sm">{roleItem.title}</div>
											<div class="font-mono text-[10px] text-slate-500">{roleItem.id}</div>
										</td>
										<td class="p-4">
											<span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
												{roleItem.category === 'executive' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : ''}
												{roleItem.category === 'board' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : ''}
												{roleItem.category === 'committee' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : ''}
												{roleItem.category === 'advisory' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : ''}"
											>
												{roleItem.category}
											</span>
										</td>
										<td class="p-4">
											{#if roleItem.parent_title}
												<div class="flex items-center gap-1.5 text-xs text-purple-300">
													<span class="text-slate-500">↳ Child of:</span>
													<span class="font-semibold bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 rounded-lg">{roleItem.parent_title}</span>
												</div>
											{:else}
												<span class="text-slate-500 text-[11px]">— (Top Level)</span>
											{/if}
										</td>
										<td class="p-4 text-slate-400 max-w-xs truncate">{roleItem.description || '—'}</td>
										<td class="p-4">
											<span class="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 font-bold text-slate-200">
												{assignedCount} active
											</span>
										</td>
										<td class="p-4 text-right space-x-2">
											<button
												type="button"
												onclick={() => (editingOrgRole = { ...roleItem, description: roleItem.description || '', parent_role_id: roleItem.parent_role_id || '' })}
												class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-xs transition-colors"
											>
												Edit ✏️
											</button>
											<form method="POST" action="?/deleteOrgRole" use:enhance class="inline">
												<input type="hidden" name="roleId" value={roleItem.id} />
												<button
													type="submit"
													onclick={(e) => {
														if (!confirm(`Are you sure you want to delete the "${roleItem.title}" role?`)) {
															e.preventDefault();
														}
													}}
													class="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 font-semibold text-xs border border-red-800/40 transition-colors"
												>
													Delete ✕
												</button>
											</form>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		{:else if filteredMembers.length === 0}
			<div class="glass-card p-12 rounded-3xl text-center border border-slate-800">
				<p class="text-slate-400 text-sm">No member applications match the current filter.</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each filteredMembers as member}
					<div class="glass-card p-6 rounded-2xl flex flex-col justify-between border border-slate-800/80 hover:border-slate-700 transition-all {member.role === 'admin' ? 'ring-1 ring-amber-500/30' : ''}">
						<div>
							<div class="flex items-start justify-between gap-2 mb-3">
								<div class="flex items-center gap-3">
									{#if member.avatar_url}
										<img
											src={member.avatar_url}
											alt={member.full_name}
											class="w-11 h-11 rounded-2xl object-cover border border-slate-700 shadow-md flex-shrink-0"
										/>
									{:else}
										<div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700 text-white font-bold flex items-center justify-center text-sm shadow-md flex-shrink-0">
											{member.full_name?.charAt(0) || '👤'}
										</div>
									{/if}
									<div>
										<h3 class="font-bold text-white text-base leading-snug flex items-center gap-1.5">
											<span>{member.full_name}</span>
											{#if member.id === data.currentUserId}
												<span class="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">You</span>
											{/if}
										</h3>
										<div class="space-y-0.5">
											<p class="text-xs text-slate-400 font-mono">{member.email}</p>
											{#if member.phone_secondary && member.phone_secondary.includes('@')}
												<p class="text-[11px] text-purple-400 font-mono flex items-center gap-1">
													<span>✉️ Alt:</span>
													<span>{member.phone_secondary}</span>
												</p>
											{/if}
										</div>
									</div>
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
									{#if member.role === 'admin' || member.org_role_id === 'org_admin'}
										<div class="flex items-center gap-1 flex-wrap justify-end">
											<span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-amber-500 text-slate-950 shadow-sm flex items-center gap-1">
												<span>👑</span>
												<span>Admin</span>
											</span>
											<span class="px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider bg-purple-900/80 text-purple-200 border border-purple-700/60 flex items-center gap-0.5" title="Administrator is a governance subset of Board of Directors">
												<span>🏛️</span>
												<span>BOD</span>
											</span>
										</div>
									{:else if member.role === 'bod' || member.org_category === 'board' || member.parent_role_id === 'org_director'}
										<span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-purple-500 text-white shadow-sm flex items-center gap-1">
											<span>🏛️</span>
											<span>BOD Member</span>
										</span>
									{:else if member.role === 'advisory' || member.org_category === 'advisory'}
										<span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-indigo-500 text-white shadow-sm flex items-center gap-1">
											<span>🎓</span>
											<span>Advisory Board</span>
										</span>
									{:else if member.role === 'partner'}
										<span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-blue-500 text-white shadow-sm flex items-center gap-1">
											<span>🤝</span>
											<span>MOU Partner</span>
										</span>
									{:else}
										<span class="px-2 py-0.5 rounded-full text-[9px] font-semibold text-slate-400 bg-slate-900 border border-slate-800">
											{member.role || 'Member'}
										</span>
									{/if}
								</div>
							</div>

							<div class="space-y-1.5 text-xs text-slate-300 mb-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
								{#if member.salutation}
									<p><strong class="text-slate-400 font-medium">Salutation:</strong> {member.salutation}</p>
								{/if}
								{#if member.organizational_role}
									<p>
										<strong class="text-amber-400 font-medium">Org Role:</strong> {member.organizational_role}
										{#if member.parent_title}
											<span class="text-[10px] text-purple-300 font-semibold bg-purple-950/70 border border-purple-800/60 px-1.5 py-0.2 rounded ml-1.5">↳ child of {member.parent_title}</span>
										{/if}
										{#if member.role_start_date || member.role_end_date}
											<span class="text-[10px] text-slate-500 ml-1">({member.role_start_date || '—'} to {member.role_end_date || 'present'})</span>
										{/if}
									</p>
								{/if}
								{#if member.profession}
									<p><strong class="text-slate-400 font-medium">Profession:</strong> {member.profession}</p>
								{/if}
								{#if member.address_street || member.city || member.province || member.country}
									<p><strong class="text-slate-400 font-medium">Address:</strong> {[member.address_street, member.city, member.province, member.country].filter(Boolean).join(', ')}</p>
								{/if}
								{#if member.phone || (member.phone_secondary && !member.phone_secondary.includes('@'))}
									<p><strong class="text-slate-400 font-medium">Phone:</strong> {member.phone || ''} {member.phone_secondary && !member.phone_secondary.includes('@') ? `(Alt: ${member.phone_secondary})` : ''}</p>
								{/if}
								{#if member.phone_secondary && member.phone_secondary.includes('@')}
									<p><strong class="text-purple-400 font-medium">Alt Email:</strong> {member.phone_secondary}</p>
								{/if}
								{#if member.associated_organizations}
									<p><strong class="text-blue-400 font-medium">Org:</strong> {member.associated_organizations}</p>
								{/if}
								{#if member.facebook_id || member.instagram_id}
									<p class="text-[11px] text-slate-400">
										{#if member.facebook_id}<span class="mr-2">FB: {member.facebook_id}</span>{/if}
										{#if member.instagram_id}<span>IG: {member.instagram_id}</span>{/if}
									</p>
								{/if}
								<div class="pt-1 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/60 mt-1.5">
									<span>Google Login: {member.google_login_enabled !== 0 && member.google_login_enabled !== false ? '✅ Enabled' : '❌ Disabled'}</span>
									<button
										type="button"
										onclick={() => openEditModal(member)}
										class="text-amber-400 hover:text-amber-300 font-bold underline"
									>
										✏️ Edit Details
									</button>
								</div>
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

								<!-- Role Assignment Dropdown -->
								{#if member.id !== data.currentUserId}
									<form method="POST" action="?/toggleRole" use:enhance class="flex items-center gap-1.5">
										<input type="hidden" name="memberId" value={member.id} />
										<input type="hidden" name="memberEmail" value={member.email} />
										<select
											name="role"
											onchange={(e) => (e.currentTarget.form as HTMLFormElement)?.requestSubmit()}
											class="bg-slate-900 text-slate-200 border border-slate-700 hover:border-slate-600 rounded-lg px-2 py-1 text-[11px] font-medium focus:outline-none"
										>
											<option value="member" selected={member.role === 'member'}>Regular Member</option>
											<option value="bod" selected={member.role === 'bod'}>🏛️ BOD Member</option>
											<option value="partner" selected={member.role === 'partner'}>🤝 MOU Partner</option>
											<option value="admin" selected={member.role === 'admin'}>👑 Administrator</option>
										</select>
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

<!-- Edit Member Extended Attributes Modal -->
{#if editingMember}
	<div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
		<div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl text-slate-100 my-8">
			<div class="flex items-start justify-between border-b border-slate-800 pb-3">
				<div>
					<span class="text-[10px] font-mono uppercase text-amber-400">
						{isCreatingMember ? 'NEW MEMBER REGISTRATION' : `ID: ${editingMember.id}`}
					</span>
					<h3 class="text-lg font-bold text-white mt-0.5">
						{isCreatingMember ? 'Add New Member to Directory' : 'Edit Member Attributes'}
					</h3>
					<p class="text-xs text-slate-400">
						{isCreatingMember ? 'Creates an approved member profile with auto-generated credentials.' : editingMember.email}
					</p>
				</div>
				<button
					type="button"
					onclick={closeEditModal}
					class="text-slate-400 hover:text-white text-lg p-1"
				>
					✕
				</button>
			</div>

			<form
				method="POST"
				action={isCreatingMember ? '?/createMember' : '?/updateProfile'}
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						closeEditModal();
					};
				}}
				class="space-y-4"
			>
				<input type="hidden" name="memberId" value={editingMember.id} />
				<input type="hidden" name="avatar_url" value={editingMember.avatar_url || ''} />

				<!-- Avatar Upload & Social Image Preview -->
				<div class="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
					<div class="relative flex-shrink-0">
						{#if editingMember.avatar_url}
							<img
								src={editingMember.avatar_url}
								alt="Avatar"
								class="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/50 shadow-md"
							/>
							<button
								type="button"
								onclick={() => (editingMember.avatar_url = '')}
								class="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-500 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center font-bold"
								title="Remove picture"
							>
								✕
							</button>
						{:else}
							<div class="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl font-bold text-slate-300">
								{editingMember.full_name?.charAt(0) || '👤'}
							</div>
						{/if}
					</div>

					<div class="flex-1 space-y-2 w-full">
						<div class="flex items-center justify-between">
							<label for="avatarFileInput" class="text-xs font-bold text-white flex items-center gap-1.5">
								<span>📸</span>
								<span>Profile Picture (Upload or Social URL)</span>
							</label>
							{#if isUploadingAvatar}
								<span class="text-[11px] text-amber-400 font-medium animate-pulse">Uploading to R2...</span>
							{/if}
						</div>

						<div class="flex flex-col sm:flex-row items-center gap-2">
							<input
								type="file"
								id="avatarFileInput"
								accept="image/*"
								onchange={handleAvatarUpload}
								disabled={isUploadingAvatar}
								class="text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer w-full sm:w-auto"
							/>
							<input
								type="text"
								bind:value={editingMember.avatar_url}
								placeholder="Image path (/team/...) or photo URL (https://...)"
								class="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-amber-500"
							/>
						</div>
						{#if avatarUploadError}
							<p class="text-[10px] text-red-400">{avatarUploadError}</p>
						{/if}
					</div>
				</div>

				{#if isCreatingMember}
					<div>
						<label for="mEmail" class="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
							Email Address <span class="text-red-400">*</span>
						</label>
						<input
							id="mEmail"
							type="email"
							name="email"
							bind:value={editingMember.email}
							required
							placeholder="e.g. member@canfacs.org or member@gmail.com"
							class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
						/>
					</div>
				{/if}

				<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
					<div>
						<label for="mSalutation" class="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Salutation</label>
						<input
							id="mSalutation"
							type="text"
							name="salutation"
							bind:value={editingMember.salutation}
							placeholder="Dr., Mr., Ms., Prof."
							class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
						/>
					</div>
					<div>
						<label for="mFullName" class="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Full Name <span class="text-red-400">*</span></label>
						<input
							id="mFullName"
							type="text"
							name="full_name"
							bind:value={editingMember.full_name}
							required
							placeholder="e.g. Dr. Jane Doe"
							class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
						/>
					</div>
					<div>
						<label for="mRole" class="block text-[11px] font-semibold uppercase text-slate-400 mb-1">System Role</label>
						<select
							id="mRole"
							name="role"
							bind:value={editingMember.role}
							class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
						>
							<option value="member">Regular Member</option>
							<option value="bod">🏛️ BOD Member</option>
							<option value="advisory">🎓 Advisory Board</option>
							<option value="partner">🤝 MOU Partner</option>
							<option value="admin">👑 Administrator</option>
						</select>
					</div>
				</div>

				<!-- Row 2: Organizational Role & Dates -->
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
					<div>
						<label for="mOrgRoleId" class="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Organizational Title</label>
						<select
							id="mOrgRoleId"
							name="org_role_id"
							bind:value={editingMember.selected_org_role_id}
							class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
						>
							<option value="">-- No Official Org Role --</option>
							{#each data.orgRoles || [] as r}
								<option value={r.id}>
									{r.title} ({r.category}){r.parent_title ? ` [↳ child of ${r.parent_title}]` : ''}
								</option>
							{/each}
						</select>
						<input
							type="hidden"
							name="organizational_role"
							value={data.orgRoles?.find((r: any) => r.id === editingMember.selected_org_role_id)?.title || editingMember.organizational_role || ''}
						/>
					</div>
					<div>
						<label for="mRoleStart" class="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Role Start Date</label>
						<input
							id="mRoleStart"
							type="date"
							name="role_start_date"
							bind:value={editingMember.role_start_date}
							class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
						/>
					</div>
					<div>
						<label for="mRoleEnd" class="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Role End Date</label>
						<input
							id="mRoleEnd"
							type="date"
							name="role_end_date"
							bind:value={editingMember.role_end_date}
							class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
						/>
					</div>
				</div>

				<!-- Row 3: Address Fields -->
				<div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
					<div class="sm:col-span-2">
						<label for="mStreet" class="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Street Address</label>
						<input
							id="mStreet"
							type="text"
							name="address_street"
							bind:value={editingMember.address_street}
							placeholder="123 Main Street"
							class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
						/>
					</div>
					<div>
						<label for="mCity" class="block text-[11px] font-semibold uppercase text-slate-400 mb-1">City</label>
						<input
							id="mCity"
							type="text"
							name="city"
							bind:value={editingMember.city}
							placeholder="Vancouver"
							class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
						/>
					</div>
					<div>
						<label for="mCountry" class="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Country</label>
						<input
							id="mCountry"
							type="text"
							name="country"
							bind:value={editingMember.country}
							placeholder="Canada"
							class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
						/>
					</div>
				</div>

				<!-- Row 4: Phone Numbers -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div>
						<label for="mPhone" class="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Primary Phone</label>
						<input
							id="mPhone"
							type="text"
							name="phone"
							bind:value={editingMember.phone}
							placeholder="604-555-0199"
							class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
						/>
					</div>
					<div>
						<label for="mPhoneSec" class="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Secondary Phone</label>
						<input
							id="mPhoneSec"
							type="text"
							name="phone_secondary"
							bind:value={editingMember.phone_secondary}
							placeholder="Alternate phone / WhatsApp"
							class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
						/>
					</div>
				</div>

				<!-- Row 5: Social IDs & Associated Organizations -->
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
					<div>
						<label for="mFb" class="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Facebook Profile / ID</label>
						<input
							id="mFb"
							type="text"
							name="facebook_id"
							bind:value={editingMember.facebook_id}
							placeholder="e.g. canfacs.member"
							class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
						/>
					</div>
					<div>
						<label for="mIg" class="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Instagram Handle</label>
						<input
							id="mIg"
							type="text"
							name="instagram_id"
							bind:value={editingMember.instagram_id}
							placeholder="@handle"
							class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
						/>
					</div>
					<div>
						<label for="mAssoc" class="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Associated Organizations</label>
						<input
							id="mAssoc"
							type="text"
							name="associated_organizations"
							bind:value={editingMember.associated_organizations}
							placeholder="e.g. NRN Canada, Embassy of Nepal"
							class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
						/>
					</div>
				</div>

				<!-- Row 6: Google Login Enabled Switch -->
				<div class="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
					<div>
						<div class="text-xs font-bold text-white">Google Social Login Enabled</div>
						<div class="text-[11px] text-slate-400">Allow member to authenticate using Google OAuth</div>
					</div>
					<label class="relative inline-flex items-center cursor-pointer">
						<input
							type="checkbox"
							name="google_login_enabled"
							value="1"
							checked={editingMember.google_login_enabled !== 0 && editingMember.google_login_enabled !== false}
							class="sr-only peer"
						/>
						<div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
					</label>
				</div>

				<div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
					<button
						type="button"
						onclick={closeEditModal}
						class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-1.5"
					>
						<span>{isCreatingMember ? 'Create & Approve Member ✓' : 'Save Attributes ✓'}</span>
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Define / Edit Organizational Role Modal -->
{#if editingOrgRole}
	<div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
		<div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-slate-100 my-8">
			<div class="flex items-start justify-between border-b border-slate-800 pb-3">
				<div>
					<span class="text-[10px] font-mono uppercase text-amber-400">
						{editingOrgRole.id ? `ID: ${editingOrgRole.id}` : 'NEW ROLE'}
					</span>
					<h3 class="text-lg font-bold text-white mt-0.5">
						{editingOrgRole.id ? 'Edit Organizational Role' : 'Define New Organizational Role'}
					</h3>
					<p class="text-xs text-slate-400">Manage standard titles and ranking in the society governance structure</p>
				</div>
				<button
					type="button"
					onclick={() => (editingOrgRole = null)}
					class="text-slate-400 hover:text-white text-lg p-1"
				>
					✕
				</button>
			</div>

			<form
				method="POST"
				action="?/upsertOrgRole"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						editingOrgRole = null;
					};
				}}
				class="space-y-4"
			>
				{#if editingOrgRole.id}
					<input type="hidden" name="roleId" value={editingOrgRole.id} />
				{/if}

				<div>
					<label for="orgTitle" class="block text-xs font-semibold uppercase text-slate-400 mb-1">Role Title</label>
					<input
						id="orgTitle"
						type="text"
						name="title"
						bind:value={editingOrgRole.title}
						required
						placeholder="e.g. Vice President, Director of Culture"
						class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
					/>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="orgCategory" class="block text-xs font-semibold uppercase text-slate-400 mb-1">Category</label>
						<select
							id="orgCategory"
							name="category"
							bind:value={editingOrgRole.category}
							class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
						>
							<option value="executive">⚡ Executive Committee</option>
							<option value="board">🏛️ Board of Directors</option>
							<option value="committee">🤝 Working Committee</option>
							<option value="advisory">📜 Advisory Council</option>
						</select>
					</div>

					<div>
						<label for="orgRank" class="block text-xs font-semibold uppercase text-slate-400 mb-1">Display Rank Order</label>
						<input
							id="orgRank"
							type="number"
							name="rank_order"
							bind:value={editingOrgRole.rank_order}
							min="1"
							max="999"
							class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
						/>
					</div>
				</div>

				<div>
					<label for="orgParentRole" class="block text-xs font-semibold uppercase text-slate-400 mb-1">
						Parent Role (Hierarchy / Subset of)
					</label>
					<select
						id="orgParentRole"
						name="parent_role_id"
						bind:value={editingOrgRole.parent_role_id}
						class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
					>
						<option value="">-- No Parent Role (Top Level / Standalone) --</option>
						{#each (data.orgRoles || []).filter((r: any) => r.id !== editingOrgRole?.id) as r}
							<option value={r.id}>
								↳ Subset of {r.title} ({r.category})
							</option>
						{/each}
					</select>
					<p class="text-[11px] text-slate-500 mt-1">
						e.g. Set "Administrator" or "President" as a child / subset of "Board Director (BOD)" to inherit BOD governance.
					</p>
				</div>

				<div>
					<label for="orgDesc" class="block text-xs font-semibold uppercase text-slate-400 mb-1">Role Description / Mandate</label>
					<textarea
						id="orgDesc"
						name="description"
						rows="3"
						bind:value={editingOrgRole.description}
						placeholder="Describe the mandate, powers, and responsibilities associated with this society office..."
						class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
					></textarea>
				</div>

				<div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
					<button
						type="button"
						onclick={() => (editingOrgRole = null)}
						class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
					>
						Save Role ✓
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}


