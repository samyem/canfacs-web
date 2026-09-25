<script lang="ts">
	import { SITE_INFO } from '$lib/data/siteData';
	import ShareButtons from '$lib/components/ShareButtons.svelte';

	let { data } = $props();
	const doc = $derived(data.document);
	const attachments = $derived(data.attachments || []);

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

	function printDocument() {
		if (typeof window !== 'undefined') {
			window.print();
		}
	}

	function getFileIcon(filename: string) {
		const ext = filename.split('.').pop()?.toLowerCase() || '';
		if (['pdf'].includes(ext)) return '📄';
		if (['doc', 'docx'].includes(ext)) return '📝';
		if (['xls', 'xlsx', 'csv'].includes(ext)) return '📊';
		if (['ppt', 'pptx'].includes(ext)) return '📑';
		if (['zip', 'rar'].includes(ext)) return '📦';
		if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) return '🖼️';
		return '📎';
	}
</script>

<svelte:head>
	<title>{doc.title} - Official Documents - {SITE_INFO.name}</title>
	<meta name="description" content={doc.summary || `${doc.title} - Published by ${SITE_INFO.fullName}`} />
	
	<!-- Open Graph / Social Media Meta -->
	<meta property="og:type" content="article" />
	<meta property="og:site_name" content={SITE_INFO.fullName} />
	<meta property="og:title" content={`${doc.title} - ${SITE_INFO.name}`} />
	<meta property="og:description" content={doc.summary || `Read official document: ${doc.title}`} />
	<meta property="og:url" content={`https://canfacs.org/documents/${doc.slug}`} />
	{#if doc.banner_image_url}
		<meta property="og:image" content={doc.banner_image_url.startsWith('http') ? doc.banner_image_url : `https://canfacs.org${doc.banner_image_url}`} />
	{:else}
		<meta property="og:image" content="https://canfacs.org/canfacs-logo.png" />
	{/if}

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={`${doc.title} - ${SITE_INFO.name}`} />
	<meta name="twitter:description" content={doc.summary || `Read official document: ${doc.title}`} />

	<!-- Schema.org Article / GovernmentPermit / DigitalDocument JSON-LD -->
	{@html `<script type="application/ld+json">
	{
		"@context": "https://schema.org",
		"@type": "DigitalDocument",
		"name": "${doc.title.replace(/"/g, '\\"')}",
		"headline": "${doc.title.replace(/"/g, '\\"')}",
		"description": "${(doc.summary || doc.title).replace(/"/g, '\\"')}",
		"datePublished": "${doc.published_at || doc.created_at}",
		"dateModified": "${doc.updated_at || doc.created_at}",
		"publisher": {
			"@type": "Organization",
			"name": "${SITE_INFO.fullName}",
			"logo": {
				"@type": "ImageObject",
				"url": "https://canfacs.org/canfacs-logo.png"
			}
		},
		"author": {
			"@type": "Organization",
			"name": "${doc.author_name || SITE_INFO.name}"
		},
		"url": "https://canfacs.org/documents/${doc.slug}"
	}
	</script>`}
</svelte:head>

<section class="py-12 md:py-20 bg-slate-950 min-h-screen text-slate-100">
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
		<!-- Draft Mode Banner for Admins -->
		{#if doc.status === 'draft'}
			<div class="p-4 bg-amber-500/15 border border-amber-500/40 rounded-2xl flex items-center justify-between gap-4 text-xs text-amber-200">
				<div class="flex items-center gap-2">
					<span class="text-base">⚠️</span>
					<div>
						<strong class="font-bold uppercase tracking-wider">Unpublished Draft Preview:</strong>
						<span> This document is currently in draft state and is only visible to administrators.</span>
					</div>
				</div>
				<a
					href={`/admin/documents?edit=${doc.id}`}
					class="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors whitespace-nowrap shadow"
				>
					Edit in CMS &rarr;
				</a>
			</div>
		{/if}

		<!-- Breadcrumb Trail -->
		<nav aria-label="Breadcrumbs" class="flex items-center gap-2 text-xs text-slate-400">
			<a href="/" class="hover:text-white transition-colors">Home</a>
			<span>/</span>
			<a href="/documents" class="hover:text-white transition-colors">Documents</a>
			<span>/</span>
			{#if doc.category}
				<a href={`/documents?category=${encodeURIComponent(doc.category)}`} class="hover:text-white transition-colors">
					{doc.category}
				</a>
				<span>/</span>
			{/if}
			<span class="text-slate-200 truncate max-w-[240px] font-medium">{doc.title}</span>
		</nav>

		<!-- Document Header Card -->
		<header class="space-y-6 pb-8 border-b border-slate-800/80">
			<!-- Badges & Publication Meta -->
			<div class="flex flex-wrap items-center justify-between gap-3 text-xs">
				<div class="flex items-center gap-2.5">
					<span class="px-3 py-1 rounded-full bg-red-950/80 border border-red-800/50 text-red-300 font-bold uppercase tracking-wider text-[11px]">
						{doc.category || 'Official Document'}
					</span>
					{#if doc.visibility === 'bod'}
						<span class="px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-bold uppercase flex items-center gap-1">
							<span>🛡️</span> BOD Only
						</span>
					{:else if doc.visibility === 'members'}
						<span class="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold uppercase flex items-center gap-1">
							<span>🍁</span> Members Only
						</span>
					{:else if doc.visibility === 'admin'}
						<span class="px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold uppercase flex items-center gap-1">
							<span>🔒</span> Admin Only
						</span>
					{:else}
						<span class="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold uppercase flex items-center gap-1">
							<span>🌐</span> Public
						</span>
					{/if}
					{#if doc.status === 'draft'}
						<span class="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase">
							Draft
						</span>
					{/if}
				</div>

				<div class="flex items-center gap-4 text-slate-400 text-xs">
					<span class="flex items-center gap-1.5">
						<span>🗓️</span>
						<span>{formatDate(doc.published_at || doc.created_at)}</span>
					</span>
					<span>•</span>
					<span class="flex items-center gap-1.5">
						<span>⏱️</span>
						<span>{estimateReadTime(doc.content_html)}</span>
					</span>
				</div>
			</div>

			<!-- Main Title -->
			<h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
				{doc.title}
			</h1>

			<!-- Summary / Abstract -->
			{#if doc.summary}
				<p class="text-slate-300 text-base sm:text-lg leading-relaxed font-sans bg-slate-900/60 border-l-4 border-red-600 p-4 rounded-r-2xl">
					{doc.summary}
				</p>
			{/if}

			<!-- Author Attribution & Action Bar -->
			<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
				<!-- Author info -->
				<div class="flex items-center gap-3">
					<img
						src="/canfacs-logo.png"
						alt="CANFACS Logo"
						class="w-10 h-10 rounded-full object-cover bg-white p-0.5 border border-slate-700 shadow"
					/>
					<div>
						<div class="text-xs font-bold text-white">
							{doc.author_name || 'Canada-Nepal Friendship & Cultural Society'}
						</div>
						<div class="text-[11px] text-slate-400">
							Verified Society Publication • Registration #{SITE_INFO.registrationNumber}
						</div>
					</div>
				</div>

				<!-- Quick Actions Toolbar -->
				<div class="flex items-center gap-2">
					<button
						type="button"
						onclick={printDocument}
						class="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
						title="Print or Save as PDF"
					>
						<span>🖨️</span>
						<span>Print / PDF</span>
					</button>

					{#if data.isAdmin}
						<a
							href={`/admin/documents?edit=${doc.id}`}
							class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
						>
							<span>✏️</span>
							<span>Edit CMS</span>
						</a>
					{/if}
				</div>
			</div>
		</header>

		<!-- Optional Banner Image -->
		{#if doc.banner_image_url}
			<div class="rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
				<img
					src={doc.banner_image_url}
					alt={doc.title}
					class="w-full max-h-[380px] object-cover"
				/>
			</div>
		{/if}

		<!-- Formatted Document HTML Content Container -->
		<main class="prose-document bg-slate-900/40 p-6 sm:p-10 rounded-3xl border border-slate-800/80 shadow-2xl">
			{@html doc.content_html}
		</main>

		<!-- Official Downloadable Attachments Tray -->
		{#if attachments.length > 0}
			<section class="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
				<div class="flex items-center justify-between border-b border-slate-800 pb-4">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-xl text-emerald-400">
							📎
						</div>
						<div>
							<h2 class="text-base font-bold text-white">Official Downloadable Attachments</h2>
							<p class="text-xs text-slate-400">Authentic society records, petitions, and audited certificates.</p>
						</div>
					</div>
					<span class="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
						{attachments.length} {attachments.length === 1 ? 'file' : 'files'}
					</span>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
					{#each attachments as att}
						<div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition-colors">
							<div class="flex items-center gap-3 min-w-0">
								<div class="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl shrink-0">
									{getFileIcon(att.fileName)}
								</div>
								<div class="min-w-0">
									<div class="text-xs font-bold text-white truncate" title={att.fileName}>
										{att.fileName}
									</div>
									<div class="text-[11px] text-slate-400">
										{att.fileSize || 'Official File'}
									</div>
								</div>
							</div>

							<a
								href={att.url}
								target="_blank"
								download={att.fileName}
								class="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shrink-0 transition-all shadow shadow-red-900/30 flex items-center gap-1"
							>
								<span>Download</span>
								<span>&darr;</span>
							</a>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- CANFACS Official Seal & Registration Footer Card -->
		<div class="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
			<div class="flex items-center gap-3">
				<span class="text-2xl">🏛️</span>
				<div>
					<span class="text-white font-semibold">{SITE_INFO.fullName}</span>
					<div class="text-[11px] text-slate-400">
						Non-Profit Society #{SITE_INFO.registrationNumber} • Registered {SITE_INFO.registeredDate}
					</div>
				</div>
			</div>
			<div class="text-center sm:text-right">
				<a href="/documents" class="text-red-400 hover:text-red-300 font-semibold underline underline-offset-4">
					&larr; Back to all documents
				</a>
			</div>
		</div>

		<!-- Social Share Section -->
		<div>
			<ShareButtons
				title={`${doc.title} - CANFACS`}
				description={doc.summary || `Read official document: ${doc.title}`}
				variant="bar"
			/>
		</div>

		<!-- Related Documents Grid -->
		{#if data.relatedDocs && data.relatedDocs.length > 0}
			<section class="space-y-4 pt-6 border-t border-slate-800">
				<h3 class="text-base font-bold text-white">Other Publications &amp; Documents</h3>
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
					{#each data.relatedDocs as rel}
						<a
							href={`/documents/${rel.slug}`}
							class="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all block group"
						>
							<div class="text-[10px] text-red-400 font-bold uppercase tracking-wider mb-1">
								{rel.category}
							</div>
							<h4 class="text-xs font-bold text-white group-hover:text-red-300 line-clamp-2 transition-colors">
								{rel.title}
							</h4>
							<span class="text-[10px] text-slate-400 mt-2 block">
								{formatDate(rel.published_at || rel.created_at)}
							</span>
						</a>
					{/each}
				</div>
			</section>
		{/if}
	</div>
</section>
