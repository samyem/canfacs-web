<script lang="ts">
	import { SITE_INFO, PURPOSES, EXECUTIVE_BOARD } from '$lib/data/siteData';

	let { data } = $props();
	const boardPreview = $derived((data.executiveBoard && data.executiveBoard.length > 0 ? data.executiveBoard : EXECUTIVE_BOARD).slice(0, 4));
</script>

<svelte:head>
	<title>{SITE_INFO.name} - Canada-Nepal Friendship & Cultural Society</title>
</svelte:head>

<!-- Hero Section with Re-imagined Canada-Nepal Flag Background -->
<section class="relative overflow-hidden pt-20 pb-28 md:pt-32 md:pb-44 bg-slate-950">
	<!-- Background Image Overlay with dark vignette fade -->
	<div class="absolute inset-0 z-0">
		<img
			src="/canada-nepal-flags-hero.png"
			alt="Canada and Nepal Flags over Himalayan Mountains"
			class="w-full h-full object-contain sm:object-cover object-top opacity-40 filter saturate-125 pointer-events-none"
		/>
		<div class="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/70 to-slate-950"></div>
	</div>

	<!-- Glowing ambient light -->
	<div class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-r from-red-600/25 via-purple-600/10 to-blue-600/25 rounded-full blur-3xl pointer-events-none z-0"></div>

	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
		<!-- Flag Badges -->
		<div class="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-panel border border-slate-700/80 text-xs font-semibold text-white mb-6 shadow-xl backdrop-blur-md">
			<span class="flex items-center gap-1.5 text-red-400">
				<svg class="w-4 h-4 rounded-sm overflow-hidden" viewBox="0 0 640 480">
					<path fill="#d80027" d="M0 0h640v480H0z"/>
					<path fill="#f0f0f0" d="M160 0h320v480H160z"/>
					<path fill="#d80027" d="M344.6 270.8l4.4 35.8-21.7-12.7-18.7 18.7 1.4-25.3-24.8-11.8 26-9.1-3.6-25 19.8 15.6 20.8-15.6-3.6 25 26 9.1-24.8 11.8 1.4 25.3-18.7-18.7z"/>
				</svg>
				Canada
			</span>
			<span class="text-slate-500">•</span>
			<span class="flex items-center gap-1.5 text-blue-400">
				<svg class="w-4 h-4 rounded-sm overflow-hidden" viewBox="0 0 100 120">
					<path fill="#003893" d="M0 0l75 45L25 45l65 75H0z"/>
					<path fill="#DC143C" d="M6 10l58 35H20l50 58H6z"/>
					<circle cx="24" cy="30" r="7" fill="#fff"/>
					<path fill="#fff" d="M24 68l4 8 8-4-4 8 8 4-8 4 4 8-8-4-4 8-4-8-8 4 4-8-8-4 8-4-4-8 8 4z"/>
				</svg>
				Nepal
			</span>
			<span class="text-slate-500">•</span>
			<span class="text-slate-300">ESTD 2016</span>
		</div>

		<!-- Upcoming Event Top Alert Headline -->
		<div class="mb-8">
			<a
				href="/events/canada-nepal-friendship-day-2027"
				class="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-red-950/90 hover:bg-red-900 border border-red-600/70 text-xs sm:text-sm font-bold text-red-200 hover:text-white shadow-lg shadow-red-900/40 transition-all transform hover:scale-105 group"
			>
				<span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
				<span>🍁 Upcoming Landmark Celebration: <strong>Canada–Nepal Friendship Day 2027 (Jan 23)</strong></span>
				<span class="text-red-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
			</a>
		</div>

		<h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight drop-shadow-md">
			Bridging Nations,<br />
			<span class="text-gradient-nepal">Celebrating Cultures.</span>
		</h1>

		<p class="max-w-3xl mx-auto text-lg sm:text-xl text-slate-200 font-medium leading-relaxed mb-10 drop-shadow">
			{SITE_INFO.missionSummary} Registered non-profit organization established in {SITE_INFO.registeredDate}.
		</p>

		<div class="flex flex-col sm:flex-row items-center justify-center gap-4">
			<a
				href="/events/canada-nepal-friendship-day-2027"
				class="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-xl shadow-red-600/30 transition-all duration-300 transform hover:-translate-y-1 text-center flex items-center justify-center gap-2"
			>
				<span>🍁 Canada–Nepal Friendship Day 2027</span>
			</a>
			<a
				href="/join-canfacs"
				class="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 shadow-md transition-all duration-300 text-center"
			>
				Become a Member
			</a>
			<a
				href="/our-story"
				class="w-full sm:w-auto px-8 py-4 rounded-xl font-bold glass-panel hover:bg-slate-800/80 text-slate-100 border border-slate-700 transition-all duration-300 text-center"
			>
				Our Story
			</a>
		</div>
	</div>
</section>

<!-- Headline Spotlight Banner on Canada–Nepal Friendship Day 2027 -->
<section class="py-12 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-y border-red-950/80 relative z-20">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="rounded-3xl glass-panel border border-red-800/70 p-8 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
			<div class="absolute -right-20 -top-20 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none"></div>
			<div class="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

			<div class="relative z-10 space-y-4 max-w-2xl">
				<div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-950/90 border border-red-800 text-xs font-bold text-red-400 uppercase tracking-wider">
					<span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
					Upcoming Landmark Celebration • January 23, 2027
				</div>

				<h2 class="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
					Canada–Nepal Friendship Day 2027
				</h2>

				<p class="text-lg sm:text-xl font-bold text-gradient-nepal">
					Unity in Diversity — Celebrating 61 Years of Diplomatic Relations
				</p>

				<p class="text-slate-300 text-sm sm:text-base leading-relaxed">
					Commemorating 61 illustrious years of bilateral friendship between Canada and Nepal. Hosted at the prestigious Centre Stage at Surrey City Hall, this landmark community celebration unites Indigenous First Nations leaders, the Nepalese diaspora, youth changemakers, civic dignitaries, and diverse cultural communities.
				</p>

				<!-- Event Meta & Highlight Badges -->
				<div class="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-300 pt-1">
					<span class="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
						📍 <strong class="text-white">Centre Stage, City Hall, Surrey BC</strong>
					</span>
					<span class="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
						📅 <strong class="text-amber-400">Saturday, Jan 23, 2027</strong>
					</span>
					<span class="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
						🕒 <strong class="text-slate-200">4:00 PM – 8:00 PM</strong>
					</span>
					<span class="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-emerald-400">
						🍽️ Cultural Dinner Reception Included
					</span>
				</div>

				<!-- Event Highlights Quick Grid -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-2 font-medium">
					<div class="flex items-center gap-2">
						<span class="text-red-400 font-bold">•</span>
						<span>First Nations Welcome Dance & Land Acknowledgement</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="text-red-400 font-bold">•</span>
						<span>Vibrant Nepali Folk Performances & Music</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="text-red-400 font-bold">•</span>
						<span>Youth Keynotes: Climate Resilience & Ethical AI</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="text-red-400 font-bold">•</span>
						<span>Multicultural Showcase & Civic Partnerships</span>
					</div>
				</div>

				<div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 italic">
					&ldquo;Our diversity is our greatest collective strength. All are welcome!&rdquo;
				</div>
			</div>

			<!-- Poster Graphic Showcase & CTA Buttons -->
			<div class="flex-shrink-0 w-full lg:w-80 relative z-10 flex flex-col gap-4">
				<a
					href="/events/canada-nepal-friendship-day-2027"
					class="block rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative group bg-slate-900"
				>
					<img
						src="/events/canada-nepal-friendship-day-2027.jpg"
						alt="Canada-Nepal Friendship Day 2027 Poster"
						class="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
					/>
					<div class="p-2.5 bg-slate-900/95 text-[11px] text-slate-400 text-center border-t border-slate-800 font-medium">
						Surrey City Hall Centre Stage • Click for Full Details
					</div>
				</a>

				<div class="flex flex-col gap-2.5">
					<a
						href="/events/canada-nepal-friendship-day-2027"
						class="px-6 py-3.5 rounded-xl font-bold bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-center shadow-lg shadow-red-600/40 transition-all transform hover:-translate-y-0.5 text-sm"
					>
						View Event Program &rarr;
					</a>
					<a
						href="/events"
						class="px-6 py-3 rounded-xl font-semibold glass-panel hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors text-center text-xs"
					>
						View All Events & Photo Gallery
					</a>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Quick Stats / Core Highlights -->
<section class="py-12 bg-slate-900/60 border-y border-slate-800/80 relative z-10">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
		<div class="space-y-1">
			<div class="text-3xl sm:text-4xl font-extrabold text-white">1965</div>
			<div class="text-xs uppercase tracking-wider text-slate-400">Diplomatic Relations</div>
		</div>
		<div class="space-y-1">
			<div class="text-3xl sm:text-4xl font-extrabold text-red-500">2016</div>
			<div class="text-xs uppercase tracking-wider text-slate-400">CANFACS Founded</div>
		</div>
		<div class="space-y-1">
			<div class="text-3xl sm:text-4xl font-extrabold text-blue-500">100%</div>
			<div class="text-xs uppercase tracking-wider text-slate-400">Non-Profit Society</div>
		</div>
		<div class="space-y-1">
			<div class="text-2xl sm:text-3xl font-extrabold text-white">Federal</div>
			<div class="text-xs uppercase tracking-wider text-slate-400">Nationwide Scope</div>
		</div>
	</div>
</section>

<!-- Purpose & Objectives Grid -->
<section class="py-24 bg-slate-950">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center max-w-2xl mx-auto mb-16">
			<h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">Our Core Purposes</h2>
			<p class="text-slate-400">
				Fostering bilateral collaboration, cultural exchange, and helping Nepali newcomers thrive in Canadian society.
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			{#each PURPOSES as purpose, i}
				<div class="glass-card p-8 rounded-2xl relative overflow-hidden group">
					<div class="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 text-red-400 font-bold flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all">
						0{i + 1}
					</div>
					<h3 class="text-xl font-bold text-white mb-3">{purpose.title}</h3>
					<p class="text-slate-400 text-sm leading-relaxed">{purpose.desc}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Featured Annual Commemoration -->
<section class="py-20 bg-slate-900/40 relative">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="glass-panel rounded-3xl p-8 sm:p-12 border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-10">
			<div class="space-y-4 max-w-2xl">
				<div class="inline-block px-3 py-1 rounded-full bg-red-950/80 border border-red-800/60 text-xs font-semibold text-red-400">
					Featured Annual Event • May 29
				</div>
				<h3 class="text-2xl sm:text-3xl font-bold text-white">International Mount Everest Day</h3>
				<p class="text-slate-300 text-sm sm:text-base leading-relaxed">
					Commemorating the historic first summit of Mount Everest by Sir Edmund Hillary and Tenzing Norgay Sherpa on May 29, 1953. CANFACS hosts annual celebrations featuring mountaineering slideshows, documentary screenings, cultural exchanges, and environmental conservation discussions.
				</p>
			</div>
			<div class="flex-shrink-0 flex flex-col sm:flex-row gap-3">
				<a
					href="/events"
					class="px-8 py-4 rounded-xl font-bold bg-white text-slate-950 hover:bg-slate-200 transition-colors shadow-lg shadow-white/10 text-center"
				>
					View All Events & Gallery
				</a>
			</div>
		</div>
	</div>
</section>

<!-- Executive Leadership Preview -->
<section class="py-24 bg-slate-950">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex flex-col md:flex-row items-start md:items-end justify-between mb-16">
			<div>
				<h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">Board of Directors</h2>
				<p class="text-slate-400 max-w-xl">
					Dedicated community leaders working together to strengthen Canada-Nepal relationships across all provinces and territories.
				</p>
			</div>
			<a href="/team" class="mt-4 md:mt-0 text-sm font-semibold text-red-400 hover:text-red-300 flex items-center gap-1">
				View Full Board & Advisors &rarr;
			</a>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
			{#each boardPreview as member}
				<div class="glass-card p-6 rounded-2xl text-center flex flex-col justify-between items-center group">
					<div>
						{#if member.photo}
							<img
								src={member.photo}
								alt={member.name}
								class="w-20 h-20 mx-auto rounded-full object-cover border-2 border-red-500/60 shadow-xl mb-4 group-hover:scale-105 transition-transform"
							/>
						{:else}
							<div class="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center font-bold text-xl text-white mb-4 border border-slate-600">
								{member.name.charAt(4) || member.name.charAt(0)}
							</div>
						{/if}
						<h3 class="font-bold text-white text-base">{member.name}</h3>
						<p class="text-xs text-red-400 font-bold mt-1 uppercase tracking-wider">{member.role}</p>
						{#if member.profession}
							<p class="text-xs text-slate-300 font-medium mt-1">{member.profession}</p>
						{/if}
					</div>
					{#if member.region}
						<span class="inline-block mt-4 px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-semibold text-slate-400">
							📍 {member.region}, Canada
						</span>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section>
