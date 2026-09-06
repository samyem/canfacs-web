<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let activeTab = $state<'pending' | 'approved' | 'admins' | 'bod' | 'partners' | 'all'>('pending');
	let searchQuery = $state('');
	let copiedPassword = $state(false);
	let editingMember = $state<any | null>(null);
	let isUploadingAvatar = $state(false);
	let avatarUploadError = $state('');

	function openEditModal(m: any) {
		editingMember = { ...m };
		avatarUploadError = '';
	}

	function closeEditModal() {
		editingMember = null;
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
		data.members.filter((m: any) => m.role === 'admin')
	);
	const bodMembers = $derived(
		data.members.filter((m: any) => m.role === 'bod')
	);
	const partnerMembers = $derived(
		data.members.filter((m: any) => m.role === 'partner')
	);

	const filteredMembers = $derived(
		data.members.filter((m: any) => {
			let matchesTab = true;
			if (activeTab === 'pending') matchesTab = m.status === 'pending';
			else if (activeTab === 'approved') matchesTab = m.status === 'approved';
			else if (activeTab === 'admins') matchesTab = m.role === 'admin';
			else if (activeTab === 'bod') matchesTab = m.role === 'bod';
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
					<span>👑 Admins</span>
					<span>({adminMembers.length})</span>
				</button>
				<button
					type="button"
					onclick={() => (activeTab = 'bod')}
					class="px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 {activeTab === 'bod' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}"
				>
					<span>🏛️ BOD</span>
					<span>({bodMembers.length})</span>
				</button>
				<button
					type="button"
					onclick={() => (activeTab = 'partners')}
					class="px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 {activeTab === 'partners' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}"
				>
					<span>🤝 Partners</span>
					<span>({partnerMembers.length})</span>
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
										<p class="text-xs text-slate-400 font-mono">{member.email}</p>
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
									{#if member.role === 'admin'}
										<span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-amber-500 text-slate-950 shadow-sm flex items-center gap-1">
											<span>👑</span>
											<span>Admin</span>
										</span>
									{:else if member.role === 'bod'}
										<span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-purple-500 text-white shadow-sm flex items-center gap-1">
											<span>🏛️</span>
											<span>BOD Member</span>
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
									<p><strong class="text-amber-400 font-medium">Org Role:</strong> {member.organizational_role}
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
								{#if member.phone || member.phone_secondary}
									<p><strong class="text-slate-400 font-medium">Phone:</strong> {member.phone || ''} {member.phone_secondary ? `(Alt: ${member.phone_secondary})` : ''}</p>
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
					<span class="text-[10px] font-mono uppercase text-amber-400">ID: {editingMember.id}</span>
					<h3 class="text-lg font-bold text-white mt-0.5">Edit Member Attributes</h3>
					<p class="text-xs text-slate-400">{editingMember.email}</p>
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
				action="?/updateProfile"
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
								type="url"
								bind:value={editingMember.avatar_url}
								placeholder="Or paste external social photo URL..."
								class="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-amber-500"
							/>
						</div>
						{#if avatarUploadError}
							<p class="text-[10px] text-red-400">{avatarUploadError}</p>
						{/if}
					</div>
				</div>
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
						<label for="mFullName" class="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Full Name</label>
						<input
							id="mFullName"
							type="text"
							name="full_name"
							bind:value={editingMember.full_name}
							required
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
							<option value="partner">🤝 MOU Partner</option>
							<option value="admin">👑 Administrator</option>
						</select>
					</div>
				</div>

				<!-- Row 2: Organizational Role & Dates -->
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
					<div>
						<label for="mOrgRole" class="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Organizational Role</label>
						<input
							id="mOrgRole"
							type="text"
							name="organizational_role"
							bind:value={editingMember.organizational_role}
							placeholder="e.g. Vice President, Senior Advisor"
							class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
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
						class="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
					>
						Save Attributes ✓
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

