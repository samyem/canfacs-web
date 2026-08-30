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
		🍁 Celebrating Canada-Nepal Diplomatic & Cultural Ties since 1965 • Non-profit Society #S-0066228
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
					<a
						href="/feed"
						class="px-3 py-2 rounded-lg text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-slate-800/60 transition-all"
					>
						🌐 Community Feed
					</a>
					<a
						href="/members"
						class="px-3 py-2 rounded-lg text-sm font-semibold text-blue-400 hover:text-blue-300 hover:bg-slate-800/60 transition-all"
					>
						👥 Directory
					</a>
					{#if data.user.role === 'admin'}
						<a
							href="/admin/members"
							class="px-3 py-2 rounded-lg text-sm font-semibold text-amber-400 hover:text-amber-300 hover:bg-slate-800/60 transition-all"
						>
							⚡ Members
						</a>
						<a
							href="/admin/fundraising"
							class="px-3 py-2 rounded-lg text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-slate-800/60 transition-all"
						>
							💰 Fundraising
						</a>
					{/if}

					<div class="ml-3 pl-3 border-l border-slate-800 flex items-center gap-3">
						<span class="text-xs font-semibold text-slate-300 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
							👤 {data.user.fullName}
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
					<a
						href="/feed"
						onclick={() => (isMobileMenuOpen = false)}
						class="block px-4 py-2.5 rounded-lg text-base font-semibold text-red-400 hover:bg-slate-800"
					>
						🌐 Community Feed
					</a>
					<a
						href="/members"
						onclick={() => (isMobileMenuOpen = false)}
						class="block px-4 py-2.5 rounded-lg text-base font-semibold text-blue-400 hover:bg-slate-800"
					>
						👥 Member Directory
					</a>
					{#if data.user.role === 'admin'}
						<a
							href="/admin/members"
							onclick={() => (isMobileMenuOpen = false)}
							class="block px-4 py-2.5 rounded-lg text-base font-semibold text-amber-400 hover:bg-slate-800"
						>
							⚡ Member Governance
						</a>
						<a
							href="/admin/fundraising"
							onclick={() => (isMobileMenuOpen = false)}
							class="block px-4 py-2.5 rounded-lg text-base font-semibold text-rose-400 hover:bg-slate-800"
						>
							💰 Fundraising & Disbursements
						</a>
					{/if}
					<div class="pt-3 border-t border-slate-800 flex items-center justify-between">
						<span class="text-sm font-semibold text-slate-300">👤 {data.user.fullName}</span>
						<a
							href="/logout"
							onclick={() => (isMobileMenuOpen = false)}
							class="px-4 py-2 rounded-lg text-xs font-semibold bg-red-600/80 text-white"
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
			<p></p>
		</div>
	</footer>
</div>
