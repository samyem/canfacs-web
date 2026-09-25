<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { SITE_INFO } from '$lib/data/siteData';
	import ShareButtons from '$lib/components/ShareButtons.svelte';

	let { data } = $props();

	let searchQuery = $state('');
	let selectedCategory = $state('all');

	$effect(() => {
		searchQuery = data.searchQuery || '';
		selectedCategory = data.selectedCategory || 'all';
	});

	function handleCategoryClick(cat: string) {
		selectedCategory = cat;
		updateUrl();
	}

	function handleSearchInput() {
		updateUrl();
	}

	function updateUrl() {
		const params = new URLSearchParams();
		if (selectedCategory && selectedCategory !== 'all') {
			params.set('category', selectedCategory);
		}
		if (searchQuery.trim()) {
			params.set('q', searchQuery.trim());
		}
		const queryStr = params.toString();
		goto(`/documents${queryStr ? `?${queryStr}` : ''}`, { keepFocus: true, noScroll: true });
	}

	function clearFilters() {
		searchQuery = '';
		selectedCategory = 'all';
		goto('/documents', { noScroll: true });
	}

	function formatDate(dateStr: string | null) {
		if (!dateStr) return 'Recent';
		try {
			const d = new Date(dateStr);
			return d.toLocaleDateString('en-CA', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
		} catch {
			return dateStr;
		}
	}

	function estimateReadTime(html: string) {
		const text = html.replace(/<[^>]*>/g, ' ');
		const words = text.trim().split(/\s+/).length;
		const minutes = Math.max(1, Math.ceil(words / 180));
		return `${minutes} min read`;
	}

	function getFileIcon(filename: string) {
		const ext = filename.split('.').pop()?.toLowerCase() || '';
		if (['pdf'].includes(ext)) return '📄';
		if (['doc', 'docx'].includes(ext)) return '📝';
		if (['xls', 'xlsx', 'csv'].includes(ext)) return '📊';
		if (['ppt', 'pptx'].includes(ext)) return '📑';
		if (['zip', 'rar'].includes(ext)) return '📦';
		return '📎';
	}
</script>

<svelte:head>
	<title>Official Documents & Publications - {SITE_INFO.name}</title>
	<meta
		name="description"
		content="Access official CANFACS society documents, constitution, bylaws, audited financial statements, AGM minutes, and bilateral cultural publications."
	/>
	<meta property="og:title" content="Official Documents & Publications - CANFACS" />
	<meta
		property="og:description"
		content="Explore public constitution, bylaws, financial audit reports, and meeting minutes of Canada-Nepal Friendship & Cultural Society."
	/>
	<meta property="og:url" content="https://canfacs.org/documents" />
</svelte:head>

<section class="py-16 md:py-24 bg-slate-950 min-h-screen text-slate-100">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
		<!-- Hero Section -->
		<div class="text-center max-w-3xl mx-auto space-y-4">
			<div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/60 border border-red-800/40 text-xs font-bold text-red-300 tracking-wide uppercase shadow-sm">
				<span>🍁</span>
				<span>Public Knowledge & Governance Center</span>
			</div>
			<h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
				Official Documents &amp; Publications
			</h1>
			<p class="text-slate-300 text-base sm:text-lg leading-relaxed">
				Explore verified society charters, bylaws, annual general meeting minutes, financial audits, and bilateral cultural publications published by the Canada-Nepal Friendship &amp; Cultural Society.
			</p>

			<!-- Admin quick banner if user is admin -->
			{#if page.data.user?.role === 'admin'}
				<div class="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-4 text-xs text-amber-300 max-w-xl mx-auto mt-4">
					<div class="flex items-center gap-2">
						<span class="text-base">🛡️</span>
						<span><strong>Admin Notice:</strong> You can create and publish new document pages in the CMS.</span>
					</div>
					<a
						href="/admin/documents"
						class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors whitespace-nowrap shadow"
					>
						Open CMS Studio &rarr;
					</a>
				</div>
			{:else if !page.data.user}
				<div class="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between gap-4 text-xs text-slate-300 max-w-xl mx-auto mt-4">
					<div class="flex items-center gap-2">
						<span class="text-base">🍁</span>
						<span><strong>CANFACS Members:</strong> Sign in to access member-only publications, AGM minutes, and society records.</span>
					</div>
					<a
						href="/login?redirectTo=/documents"
						class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors whitespace-nowrap border border-slate-700 shadow"
					>
						Log In &rarr;
					</a>
				</div>
			{/if}
		</div>

		<!-- Search & Category Filters Bar -->
		<div class="glass-card p-6 rounded-3xl border border-slate-800/90 shadow-2xl space-y-6">
			<div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
				<!-- Search Input -->
				<div class="relative flex-grow max-w-xl">
					<span class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 text-sm">
						🔍
					</span>
					<input
						type="text"
						bind:value={searchQuery}
						oninput={handleSearchInput}
						placeholder="Search by title, keywords, or topics..."
						class="w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all shadow-inner"
					/>
					{#if searchQuery}
						<button
							type="button"
							onclick={() => {
								searchQuery = '';
								updateUrl();
							}}
							class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white text-xs"
							title="Clear search"
						>
							✕
						</button>
					{/if}
				</div>

				<!-- Stats Badge -->
				<div class="flex items-center gap-3 shrink-0 self-end md:self-auto text-xs text-slate-400">
					<span class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-1.5">
						<span class="w-2 h-2 rounded-full bg-emerald-400"></span>
						<strong class="text-white font-bold">{data.documents.length}</strong>
						<span>{data.documents.length === 1 ? 'document' : 'documents'} found</span>
					</span>
				</div>
			</div>

			<!-- Category Pills -->
			<div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
				<button
					type="button"
					onclick={() => handleCategoryClick('all')}
					class="px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 {selectedCategory === 'all'
						? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
						: 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'}"
				>
					All Documents
				</button>
				{#each data.categories as cat}
					<button
						type="button"
						onclick={() => handleCategoryClick(cat)}
						class="px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 {selectedCategory.toLowerCase() === cat.toLowerCase()
							? 'bg-red-600 text-white shadow-lg shadow-red-600/30 font-bold'
							: 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'}"
					>
						{cat}
					</button>
				{/each}
			</div>
		</div>

		<!-- Document Cards Grid -->
		{#if data.documents.length > 0}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
				{#each data.documents as doc (doc.id)}
					<article
						class="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-red-600/40 rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-red-950/30 hover:-translate-y-1 relative overflow-hidden"
					>
						<!-- Decorative top border accent -->
						<div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-blue-600 opacity-60 group-hover:opacity-100 transition-opacity"></div>

						<div>
							<!-- Meta Row: Category, Visibility & Date -->
							<div class="flex items-center justify-between gap-2 mb-3 text-xs">
								<div class="flex items-center gap-1.5 flex-wrap">
									<span class="px-2.5 py-1 rounded-lg bg-red-950/70 border border-red-800/40 text-red-300 font-bold uppercase tracking-wider text-[10px]">
										{doc.category || 'Official'}
									</span>
									{#if doc.visibility === 'bod'}
										<span class="px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-bold uppercase flex items-center gap-1">
											<span>🛡️</span> BOD
										</span>
									{:else if doc.visibility === 'members'}
										<span class="px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold uppercase flex items-center gap-1">
											<span>🍁</span> Members
										</span>
									{:else if doc.visibility === 'admin'}
										<span class="px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold uppercase flex items-center gap-1">
											<span>🔒</span> Admin
										</span>
									{/if}
								</div>
								<span class="text-slate-400 flex items-center gap-1.5 text-[11px] shrink-0">
									<span>🗓️</span>
									<span>{formatDate(doc.published_at || doc.created_at)}</span>
								</span>
							</div>

							<!-- Title -->
							<h2 class="text-lg sm:text-xl font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2 mb-3 leading-snug">
								<a href={`/documents/${doc.slug}`}>
									{doc.title}
								</a>
							</h2>

							<!-- Summary -->
							{#if doc.summary}
								<p class="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed mb-5">
									{doc.summary}
								</p>
							{/if}

							<!-- Attachments pill list if present -->
							{#if doc.attachmentList && doc.attachmentList.length > 0}
								<div class="mb-5 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
									<div class="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
										<span>Official Files Attached</span>
										<span class="text-emerald-400 font-bold">{doc.attachmentList.length}</span>
									</div>
									<div class="flex flex-wrap gap-1.5">
										{#each doc.attachmentList.slice(0, 3) as att}
											<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 text-[11px] font-mono border border-slate-700/60 truncate max-w-[200px]" title={att.fileName}>
												<span>{getFileIcon(att.fileName)}</span>
												<span class="truncate">{att.fileName}</span>
											</span>
										{/each}
										{#if doc.attachmentList.length > 3}
											<span class="text-[10px] text-slate-400 self-center">+{doc.attachmentList.length - 3} more</span>
										{/if}
									</div>
								</div>
							{/if}
						</div>

						<!-- Card Footer Action -->
						<div class="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs mt-2">
							<span class="text-slate-400 flex items-center gap-1 text-[11px]">
								<span>⏱️</span>
								<span>{estimateReadTime(doc.content_html)}</span>
							</span>

							<a
								href={`/documents/${doc.slug}`}
								class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-bold transition-all shadow shadow-red-900/30 group-hover:scale-105"
							>
								<span>Read Page</span>
								<span>&rarr;</span>
							</a>
						</div>
					</article>
				{/each}
			</div>
		{:else}
			<!-- Empty State -->
			<div class="text-center py-16 px-4 bg-slate-900/40 border border-slate-800/80 rounded-3xl space-y-4 max-w-lg mx-auto">
				<div class="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl mx-auto">
					📂
				</div>
				<h3 class="text-xl font-bold text-white">No documents match your query</h3>
				<p class="text-slate-400 text-sm">
					Try clearing your search keyword or switching to another category.
				</p>
				<button
					type="button"
					onclick={clearFilters}
					class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
				>
					Clear All Filters
				</button>
			</div>
		{/if}

		<!-- Share Section -->
		<div class="pt-6">
			<ShareButtons
				title="CANFACS Official Documents & Society Publications"
				description="Access verified bylaws, constitution, AGM minutes, and financial audits of Canada-Nepal Friendship & Cultural Society."
				variant="bar"
			/>
		</div>
	</div>
</section>
