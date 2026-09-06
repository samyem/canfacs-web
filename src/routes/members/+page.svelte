<script lang="ts">
	let { data } = $props();
	let searchQuery = $state('');
	let selectedProvince = $state('ALL');
	let viewMode = $state<'grid' | 'table'>('grid');

	const filteredMembers = $derived(
		(data.members || []).filter((m: any) => {
			const matchesProvince =
				selectedProvince === 'ALL' || m.province === selectedProvince;
			const q = searchQuery.toLowerCase();
			const matchesQuery =
				!q ||
				m.full_name?.toLowerCase().includes(q) ||
				m.profession?.toLowerCase().includes(q) ||
				m.city?.toLowerCase().includes(q) ||
				m.bio?.toLowerCase().includes(q);
			return matchesProvince && matchesQuery;
		})
	);
</script>

<svelte:head>
	<title>Member Directory - CANFACS</title>
</svelte:head>

<section class="py-12 bg-slate-950 min-h-screen">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
		<!-- Header -->
		<div class="text-center mb-8">
			<span class="px-3 py-1 text-xs uppercase tracking-wider font-bold text-blue-400 bg-blue-500/10 rounded-full border border-blue-500/20">
				Protected Member Portal
			</span>
			<h1 class="text-3xl sm:text-4xl font-extrabold text-white mt-3">CANFACS Member Directory</h1>
			<p class="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
				Connect with fellow society members across Canada, explore professional backgrounds, and foster bilateral friendships.
			</p>
		</div>

		{#if !data.hasAccess}
			<!-- Restricted Access View for Non-Admins -->
			<div class="max-w-2xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
				<div class="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-3xl flex items-center justify-center mx-auto shadow-inner">
					🔒
				</div>

				<div class="space-y-2">
					<h2 class="text-xl font-bold text-white">Restricted Access Directory</h2>
					<p class="text-sm text-slate-300 leading-relaxed">
						To protect member privacy and personal contact information, the complete society directory is strictly reserved for the <strong>Board of Directors (BOD)</strong> and <strong>Administrators</strong>.
					</p>
				</div>

				<div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 text-left space-y-2">
					<div class="font-bold text-slate-200">What you can do:</div>
					<div class="flex items-center gap-2">
						<span>🌐</span>
						<span>Participate in discussions and share updates on the <a href="/feed" class="text-red-400 hover:underline font-semibold">Community Feed</a>.</span>
					</div>
					<div class="flex items-center gap-2">
						<span>🏛️</span>
						<span>View society leadership on the public <a href="/team" class="text-blue-400 hover:underline font-semibold">Executive Team & Board</a> page.</span>
					</div>
				</div>

				<div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
					<a
						href="/feed"
						class="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/20 transition-all"
					>
						Go to Community Feed &rarr;
					</a>
				</div>
			</div>
		{:else}
			<!-- Search & Filter Controls -->
			<div class="glass-card p-6 rounded-3xl mb-10 border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
				<div class="w-full md:w-1/2">
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search by name, profession, city, or bio..."
						class="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
					/>
				</div>

				<div class="flex items-center gap-3 w-full md:w-auto">
					<label for="provinceFilter" class="text-xs text-slate-400 font-semibold uppercase whitespace-nowrap">Province:</label>
					<select
						id="provinceFilter"
						bind:value={selectedProvince}
						class="px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
					>
						<option value="ALL">All Provinces & Territories</option>
						<option value="BC">British Columbia (BC)</option>
						<option value="ON">Ontario (ON)</option>
						<option value="AB">Alberta (AB)</option>
						<option value="QC">Quebec (QC)</option>
						<option value="NS">Nova Scotia (NS)</option>
						<option value="NB">New Brunswick (NB)</option>
						<option value="MB">Manitoba (MB)</option>
						<option value="SK">Saskatchewan (SK)</option>
					</select>

					<!-- View Mode Toggle: Grid vs Table -->
					<div class="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 ml-auto md:ml-0">
						<button
							type="button"
							onclick={() => (viewMode = 'grid')}
							class="px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 {viewMode === 'grid' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}"
							title="Grid Card View"
						>
							<span>⊞</span>
							<span class="hidden sm:inline">Cards</span>
						</button>
						<button
							type="button"
							onclick={() => (viewMode = 'table')}
							class="px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 {viewMode === 'table' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}"
							title="Table List View"
						>
							<span>☰</span>
							<span class="hidden sm:inline">Table</span>
						</button>
					</div>
				</div>
			</div>

			<!-- Directory Grid -->
			{#if filteredMembers.length === 0}
				<div class="glass-card p-12 rounded-3xl text-center border border-slate-800">
					<p class="text-slate-400 text-sm">No active members found matching your search query.</p>
				</div>
			{:else if viewMode === 'grid'}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each filteredMembers as member}
						<div class="glass-card p-6 rounded-3xl border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between group">
							<div>
								<div class="flex items-center gap-4 mb-4">
									{#if member.avatar_url}
										<img
											src={member.avatar_url}
											alt={member.full_name}
											class="w-14 h-14 rounded-2xl object-cover border border-slate-700 shadow-lg shadow-blue-900/30 group-hover:scale-105 transition-transform flex-shrink-0"
										/>
									{:else}
										<div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-900/30 group-hover:scale-105 transition-transform">
											{member.full_name.charAt(0)}
										</div>
									{/if}
									<div>
										<h3 class="font-bold text-white text-base leading-snug">{member.full_name}</h3>
										{#if member.organizational_role}
											<span class="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
												🏛️ {member.organizational_role}
											</span>
										{/if}
										{#if member.profession}
											<p class="text-xs text-blue-400 font-semibold mt-0.5">{member.profession}</p>
										{/if}
										{#if member.city || member.province}
											<p class="text-[11px] text-slate-400 mt-0.5">📍 {[member.city, member.province].filter(Boolean).join(', ')}</p>
										{/if}
									</div>
								</div>

								{#if member.bio}
									<p class="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 mb-4">
										"{member.bio}"
									</p>
								{/if}
							</div>

							<div class="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
								<span class="text-slate-400 font-medium">Member</span>
								{#if member.email}
									<a href="mailto:{member.email}" class="text-blue-400 hover:underline font-semibold flex items-center gap-1">
										✉️ Contact
									</a>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<!-- High-density Table View -->
				<div class="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
					<div class="overflow-x-auto">
						<table class="w-full text-left text-xs text-slate-300">
							<thead class="bg-slate-900/90 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
								<tr>
									<th class="py-3.5 px-5">Member</th>
									<th class="py-3.5 px-5">Organizational Role</th>
									<th class="py-3.5 px-5">Profession</th>
									<th class="py-3.5 px-5">Location</th>
									<th class="py-3.5 px-5">Bio</th>
									<th class="py-3.5 px-5 text-right">Contact</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-800/70">
								{#each filteredMembers as member}
									<tr class="hover:bg-slate-800/40 transition-colors">
										<td class="py-3.5 px-5">
											<div class="flex items-center gap-3">
												{#if member.avatar_url}
													<img
														src={member.avatar_url}
														alt={member.full_name}
														class="w-9 h-9 rounded-xl object-cover border border-slate-700 flex-shrink-0"
													/>
												{:else}
													<div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
														{member.full_name.charAt(0)}
													</div>
												{/if}
												<div>
													<span class="font-bold text-white text-sm block">{member.full_name}</span>
													{#if member.role}
														<span class="text-[10px] text-slate-500 capitalize">{member.role}</span>
													{/if}
												</div>
											</div>
										</td>
										<td class="py-3.5 px-5 whitespace-nowrap">
											{#if member.organizational_role}
												<span class="inline-block px-2.5 py-1 text-[11px] font-bold rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm">
													🏛️ {member.organizational_role}
												</span>
											{:else}
												<span class="text-slate-600 italic text-[11px]">—</span>
											{/if}
										</td>
										<td class="py-3.5 px-5 whitespace-nowrap">
											{#if member.profession}
												<span class="text-blue-400 font-semibold">{member.profession}</span>
											{:else}
												<span class="text-slate-600 italic">—</span>
											{/if}
										</td>
										<td class="py-3.5 px-5 whitespace-nowrap text-slate-300">
											{#if member.city || member.province}
												<span>📍 {[member.city, member.province].filter(Boolean).join(', ')}</span>
											{:else}
												<span class="text-slate-600 italic">—</span>
											{/if}
										</td>
										<td class="py-3.5 px-5 max-w-xs truncate text-slate-400" title={member.bio || ''}>
											{#if member.bio}
												<span>{member.bio}</span>
											{:else}
												<span class="text-slate-600 italic">—</span>
											{/if}
										</td>
										<td class="py-3.5 px-5 text-right whitespace-nowrap">
											{#if member.email}
												<a
													href="mailto:{member.email}"
													class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 transition-all font-semibold"
												>
													✉️ Contact
												</a>
											{:else}
												<span class="text-slate-600 italic">—</span>
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</section>
