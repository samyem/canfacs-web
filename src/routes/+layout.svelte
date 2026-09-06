<script lang="ts">
	import './layout.css';
	import { afterNavigate } from '$app/navigation';
	import favicon from '$lib/assets/favicon.png';
	import { SITE_INFO } from '$lib/data/siteData';

	let { data, children } = $props();
	let isMobileMenuOpen = $state(false);

	afterNavigate(() => {
		if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
			(window as any).gtag('config', 'G-CJDN30DC0L', {
				page_path: window.location.pathname + window.location.search
			});
		}
	});

	const publicNavItems = [
		{ label: 'Home', href: '/' },
		{ label: 'Our Story', href: '/our-story' },
		{ label: 'Mission & Vision', href: '/mission-and-vision' },
		{ label: 'Impact', href: '/impact' },
		{ label: 'Team', href: '/team' },
		{ label: 'Events', href: '/events' },
		{ label: 'Newsletters', href: '/newsletters' }
	];
</script>

<svelte:head>
	<title>{SITE_INFO.name} - {SITE_INFO.fullName}</title>
	<meta name="description" content={SITE_INFO.missionSummary} />
	<link rel="icon" href={favicon} />
	<link rel="canonical" href={`https://canfacs.org${data.pathname === '/' ? '' : data.pathname}`} />

	<!-- Open Graph / Social Media Meta -->
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={SITE_INFO.fullName} />
	<meta property="og:title" content={`${SITE_INFO.name} - ${SITE_INFO.fullName}`} />
	<meta property="og:description" content={SITE_INFO.missionSummary} />
	<meta property="og:url" content={`https://canfacs.org${data.pathname === '/' ? '' : data.pathname}`} />
	<meta property="og:image" content="https://canfacs.org/canfacs-logo.png" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={`${SITE_INFO.name} - ${SITE_INFO.fullName}`} />
	<meta name="twitter:description" content={SITE_INFO.missionSummary} />
	<meta name="twitter:image" content="https://canfacs.org/canfacs-logo.png" />

	<!-- Schema.org Organization JSON-LD -->
	{@html `<script type="application/ld+json">
	{
		"@context": "https://schema.org",
		"@type": "NGO",
		"name": "${SITE_INFO.fullName}",
		"alternateName": "${SITE_INFO.name}",
		"url": "https://canfacs.org",
		"logo": "https://canfacs.org/canfacs-logo.png",
		"foundingDate": "2016-11-30",
		"description": "${SITE_INFO.missionSummary}"
	}
	</script>`}
</svelte:head>

<div class="min-h-screen flex flex-col bg-slate-950 text-slate-100">
	<!-- Top Bar / Announcement -->
	<div class="bg-gradient-to-r from-red-700 via-rose-600 to-blue-700 py-2 px-4 text-xs sm:text-sm text-center font-medium tracking-wide text-white shadow-md">
		🍁 Celebrating Canada-Nepal Diplomatic & Cultural Ties since 1965 • Non-profit Society #{SITE_INFO.registrationNumber}
	</div>

	<!-- Navigation Header -->
	<header class="sticky top-0 z-50 glass-panel border-b border-slate-800/80">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
			<!-- Logo -->
			<a href="/" class="flex items-center gap-3 group">
				<img
					src="/canfacs-logo.png"
					alt="CANFACS Logo"
					class="w-12 h-12 rounded-full object-cover shadow-lg shadow-blue-900/30 group-hover:scale-105 transition-transform duration-300 bg-white p-0.5"
				/>
				<div>
					<span class="font-extrabold text-xl tracking-tight text-white group-hover:text-red-400 transition-colors">CANFACS</span>
					<span class="hidden md:block text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Canada-Nepal Friendship & Cultural Society</span>
				</div>
			</a>

			<!-- Desktop Nav -->
			<nav class="hidden lg:flex items-center space-x-1">
				{#each publicNavItems as item}
					<a
						href={item.href}
						class="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all duration-200"
					>
						{item.label}
					</a>
				{/each}

				{#if data.user}
					<div class="ml-3 pl-3 border-l border-slate-800 flex items-center gap-3">
						<span class="text-xs font-semibold text-slate-300 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 flex items-center gap-1.5">
							<span>👤</span>
							<span>{data.user.fullName}</span>
							{#if data.user.role === 'admin'}
								<span class="ml-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase">Admin</span>
							{/if}
						</span>
						<a
							href="/logout"
							class="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-red-600/80 hover:text-white transition-all"
						>
							Logout
						</a>
					</div>
				{:else}
					<a
						href="/login"
						class="ml-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
					>
						Log In
					</a>
					<a
						href="/join-canfacs"
						class="ml-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/30 transition-all transform hover:-translate-y-0.5"
					>
						Join CANFACS
					</a>
				{/if}
			</nav>

			<!-- Mobile Menu Button -->
			<button
				aria-label="Toggle Navigation Menu"
				onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
				class="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none"
			>
				<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					{#if isMobileMenuOpen}
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					{:else}
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					{/if}
				</svg>
			</button>
		</div>

		<!-- Mobile Navigation Drawer -->
		{#if isMobileMenuOpen}
			<div class="lg:hidden glass-panel border-b border-slate-800 px-4 pt-3 pb-6 space-y-2">
				{#each publicNavItems as item}
					<a
						href={item.href}
						onclick={() => (isMobileMenuOpen = false)}
						class="block px-4 py-2.5 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800 hover:text-white"
					>
						{item.label}
					</a>
				{/each}

				{#if data.user}
					<div class="pt-3 border-t border-slate-800 space-y-1">
						<div class="px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
							Member Portal
						</div>
						<a
							href="/feed"
							onclick={() => (isMobileMenuOpen = false)}
							class="block px-4 py-2 rounded-lg text-sm font-semibold text-red-400 hover:bg-slate-800"
						>
							🌐 Community Feed
						</a>
						{#if data.user.role === 'admin'}
							<a
								href="/members"
								onclick={() => (isMobileMenuOpen = false)}
								class="block px-4 py-2 rounded-lg text-sm font-semibold text-blue-400 hover:bg-slate-800"
							>
								👥 Member Directory
							</a>
							<a
								href="/admin/members"
								onclick={() => (isMobileMenuOpen = false)}
								class="block px-4 py-2 rounded-lg text-sm font-semibold text-amber-400 hover:bg-slate-800"
							>
								⚡ Member Governance
							</a>
							<a
								href="/admin/fundraising"
								onclick={() => (isMobileMenuOpen = false)}
								class="block px-4 py-2 rounded-lg text-sm font-semibold text-rose-400 hover:bg-slate-800"
							>
								💰 Fundraising & Disbursements
							</a>
							<a
								href="/admin/emails"
								onclick={() => (isMobileMenuOpen = false)}
								class="block px-4 py-2 rounded-lg text-sm font-semibold text-red-400 hover:bg-slate-800"
							>
								✉️ Email Dispatcher
							</a>
						{/if}
					</div>

					<div class="pt-3 border-t border-slate-800 flex items-center justify-between px-4">
						<span class="text-sm font-semibold text-slate-300">👤 {data.user.fullName}</span>
						<a
							href="/logout"
							onclick={() => (isMobileMenuOpen = false)}
							class="px-4 py-1.5 rounded-lg text-xs font-semibold bg-red-600/80 text-white"
						>
							Logout
						</a>
					</div>
				{:else}
					<a
						href="/login"
						onclick={() => (isMobileMenuOpen = false)}
						class="block w-full text-center mt-2 px-4 py-2.5 rounded-lg text-base font-medium text-slate-200 bg-slate-800"
					>
						Log In
					</a>
					<a
						href="/join-canfacs"
						onclick={() => (isMobileMenuOpen = false)}
						class="block w-full text-center mt-2 px-4 py-3 rounded-lg text-base font-semibold bg-red-600 text-white hover:bg-red-500"
					>
						Join CANFACS
					</a>
				{/if}
			</div>
		{/if}
	</header>

	<!-- Secondary Navigation Bar for Logged-In Users -->
	{#if data.user}
		<nav aria-label="Logged-in User Navigation" class="bg-slate-900/95 border-b border-slate-800 py-2 px-4 sm:px-6 lg:px-8 shadow-md backdrop-blur-sm sticky top-20 z-40">
			<div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
				<!-- Member Hub Links -->
				<div class="flex items-center gap-2">
					<span class="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold border border-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
						<span>🍁</span>
						<span>Portal</span>
					</span>
					<a
						href="/feed"
						class="px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 {data.pathname === '/feed'
							? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/20'
							: 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/80'}"
					>
						<span>🌐</span>
						<span>Community Feed</span>
					</a>
					{#if data.user.role === 'admin'}
						<a
							href="/members"
							class="px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 {data.pathname === '/members'
								? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
								: 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/80'}"
						>
							<span>👥</span>
							<span>Member Directory</span>
						</a>
					{/if}
				</div>

				<!-- Executive Admin Controls -->
				{#if data.user.role === 'admin'}
					<div class="flex items-center gap-2 pl-3 sm:border-l sm:border-slate-800">
						<span class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30 uppercase tracking-wider text-[10px] hidden sm:inline-flex items-center gap-1">
							<span>🛡️</span>
							<span>Admin Panel</span>
						</span>
						<a
							href="/admin/members"
							class="px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 {data.pathname === '/admin/members'
								? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
								: 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'}"
						>
							<span>👥</span>
							<span>Governance</span>
						</a>
						<a
							href="/admin/fundraising"
							class="px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 {data.pathname === '/admin/fundraising'
								? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-600/20'
								: 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'}"
						>
							<span>💰</span>
							<span>Fundraising</span>
						</a>
						<a
							href="/admin/emails"
							class="px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 {data.pathname.startsWith('/admin/emails')
								? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/20'
								: 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'}"
						>
							<span>✉️</span>
							<span>Email Dispatch</span>
						</a>
					</div>
				{/if}
			</div>
		</nav>
	{/if}

	<!-- Main Page Content -->
	<main class="flex-grow">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="bg-slate-950 border-t border-slate-800/80 pt-16 pb-12 text-slate-400">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
			<!-- Col 1: About -->
			<div class="space-y-4 md:col-span-2">
				<div class="flex items-center gap-3">
					<img
						src="/canfacs-logo.png"
						alt="CANFACS Logo"
						class="w-10 h-10 rounded-full object-cover shadow-md bg-white p-0.5"
					/>
					<span class="font-bold text-lg text-white">{SITE_INFO.name}</span>
				</div>
				<p class="text-sm text-slate-400 leading-relaxed max-w-md">
					{SITE_INFO.fullName} is a registered non-profit society ({SITE_INFO.registeredDate}) dedicated to building bridges of friendship, cultural appreciation, and mutual goodwill between Canada and Nepal across the nation.
				</p>

				<!-- Social Media Links matching brand design -->
				<div class="flex items-center gap-3 pt-2">
					<!-- Facebook -->
					<a
						href="https://facebook.com"
						target="_blank"
						rel="noopener noreferrer"
						class="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0d5ecc] to-[#1877F2] flex items-center justify-center text-white shadow-lg shadow-blue-600/30 hover:scale-110 transition-transform"
						title="Facebook"
					>
						<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
							<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
						</svg>
					</a>

					<!-- X / Twitter -->
					<a
						href="https://twitter.com"
						target="_blank"
						rel="noopener noreferrer"
						class="w-9 h-9 rounded-full bg-gradient-to-tr from-black to-slate-900 border border-slate-700 flex items-center justify-center text-white shadow-lg shadow-black/40 hover:scale-110 transition-transform"
						title="X (Twitter)"
					>
						<svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
							<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
						</svg>
					</a>

					<!-- Instagram -->
					<a
						href="https://instagram.com"
						target="_blank"
						rel="noopener noreferrer"
						class="w-9 h-9 rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shadow-lg shadow-pink-600/30 hover:scale-110 transition-transform"
						title="Instagram"
					>
						<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
							<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.13-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
						</svg>
					</a>

					<!-- YouTube -->
					<a
						href="https://youtube.com"
						target="_blank"
						rel="noopener noreferrer"
						class="w-9 h-9 rounded-full bg-gradient-to-tr from-[#CC0000] to-[#FF0000] flex items-center justify-center text-white shadow-lg shadow-red-600/30 hover:scale-110 transition-transform"
						title="YouTube"
					>
						<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
							<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
						</svg>
					</a>

					<!-- WhatsApp -->
					<a
						href="https://chat.whatsapp.com"
						target="_blank"
						rel="noopener noreferrer"
						class="w-9 h-9 rounded-full bg-gradient-to-tr from-[#128C7E] to-[#25D366] flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 hover:scale-110 transition-transform"
						title="WhatsApp Community"
					>
						<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
							<path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
						</svg>
					</a>

					<!-- LinkedIn -->
					<a
						href="https://linkedin.com"
						target="_blank"
						rel="noopener noreferrer"
						class="w-9 h-9 rounded-full bg-gradient-to-tr from-[#004182] to-[#0A66C2] flex items-center justify-center text-white shadow-lg shadow-sky-700/30 hover:scale-110 transition-transform"
						title="LinkedIn"
					>
						<svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
							<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
						</svg>
					</a>
				</div>
			</div>

			<!-- Col 2: Quick Links -->
			<div>
				<h4 class="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h4>
				<ul class="space-y-2.5 text-sm">
					<li><a href="/our-story" class="hover:text-red-400 transition-colors">Our Story</a></li>
					<li><a href="/mission-and-vision" class="hover:text-red-400 transition-colors">Mission & Vision</a></li>
					<li><a href="/impact" class="hover:text-red-400 transition-colors">Impact & Initiatives</a></li>
					<li><a href="/team" class="hover:text-red-400 transition-colors">Executive Team</a></li>
					<li><a href="/events" class="hover:text-red-400 transition-colors">Events & Everest Day</a></li>
					<li><a href="/join-canfacs" class="hover:text-red-400 transition-colors">Membership Form</a></li>
					<li><a href="/login" class="hover:text-red-400 font-semibold transition-colors">🔑 Member Login</a></li>
					<li><a href="/privacy-policy" class="hover:text-red-400 text-xs text-slate-400 transition-colors">Privacy Policy</a></li>
					<li><a href="/terms-of-service" class="hover:text-red-400 text-xs text-slate-400 transition-colors">Terms of Service</a></li>
				</ul>
			</div>

			<!-- Col 3: Contact & Location -->
			<div>
				<h4 class="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact & Location</h4>
				<p class="text-sm text-slate-400 mb-2">Nationwide across Canada</p>
				<p class="text-sm text-slate-400 mb-4">Email: <a href="mailto:info@canfacs.org" class="hover:text-red-400 transition-colors underline">info@canfacs.org</a></p>
				<div class="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
					<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
					Active Community 2026
				</div>
			</div>
		</div>

		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800/60 text-xs text-center text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
			<p>© 2016 - 2026 {SITE_INFO.fullName}. All rights reserved.</p>
			<div class="flex items-center gap-4">
				<a href="/privacy-policy" class="hover:text-slate-300 underline transition-colors">Privacy Policy</a>
				<span>•</span>
				<a href="/terms-of-service" class="hover:text-slate-300 underline transition-colors">Terms of Service</a>
				<span>•</span>
				<a href="/impact/nepal-flood-relief" class="hover:text-slate-300 underline transition-colors">Relief Initiative</a>
			</div>
		</div>
	</footer>
</div>
