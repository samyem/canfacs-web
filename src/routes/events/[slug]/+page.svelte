<script lang="ts">
	import { SITE_INFO } from '$lib/data/siteData';
	import ShareButtons from '$lib/components/ShareButtons.svelte';

	let { data } = $props();
	const event = $derived(data.event);

	// Generate Google Calendar Link
	const gCalUrl = $derived(
		`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=20270124T000000Z/20270124T040000Z&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.venue || event.location)}`
	);
</script>

<svelte:head>
	<title>{event.title} - {SITE_INFO.name}</title>
	<meta name="description" content={event.summary || event.description} />
	<meta property="og:title" content={`${event.title} | ${event.subtitle || SITE_INFO.name}`} />
	<meta property="og:description" content={event.summary || event.description} />
	<meta property="og:image" content={event.image || '/events/canada-nepal-friendship-day-2027.jpg'} />
</svelte:head>

<section class="py-16 md:py-24 bg-slate-950">
	<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Back link -->
		<div class="mb-8">
			<a href="/events" class="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
				<span>&larr; Back to All Events</span>
			</a>
		</div>

		<!-- Main Event Header Card -->
		<div class="glass-panel rounded-3xl border border-slate-800 p-6 sm:p-10 mb-12 shadow-2xl relative overflow-hidden">
			<!-- Subtle glow background -->
			<div class="absolute -top-32 -right-32 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none"></div>
			<div class="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

			<!-- Status & Tagline Badges -->
			<div class="flex flex-wrap items-center gap-2.5 mb-5 relative z-10">
				<span class="px-3.5 py-1 rounded-full bg-red-950/90 text-red-400 border border-red-800 text-xs font-bold uppercase tracking-wider">
					{event.status === 'upcoming' ? 'Upcoming Landmark Event' : 'Commemorative Event'}
				</span>
				{#if event.tagline}
					<span class="px-3 py-1 rounded-full bg-slate-900/90 text-slate-300 border border-slate-700 text-xs font-semibold">
						🍁 {event.tagline}
					</span>
				{/if}
			</div>

			<!-- Title and Subtitle -->
			<h1 class="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-3 relative z-10 leading-tight">
				{event.title}
			</h1>
			{#if event.subtitle}
				<p class="text-xl sm:text-2xl font-bold text-gradient-nepal mb-6 relative z-10">
					{event.subtitle}
				</p>
			{/if}

			<!-- Venue, Date & Time Badges -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 relative z-10">
				<div class="glass-card p-4 rounded-2xl flex items-center gap-3.5 border border-slate-800/80">
					<div class="w-12 h-12 rounded-xl bg-red-950/70 border border-red-800 flex items-center justify-center text-xl flex-shrink-0">
						📍
					</div>
					<div>
						<div class="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Venue & Location</div>
						<div class="text-sm sm:text-base font-bold text-white">{event.venue || event.location}</div>
					</div>
				</div>

				<div class="glass-card p-4 rounded-2xl flex items-center gap-3.5 border border-slate-800/80">
					<div class="w-12 h-12 rounded-xl bg-blue-950/70 border border-blue-800 flex items-center justify-center text-xl flex-shrink-0">
						📅
					</div>
					<div>
						<div class="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Date & Time</div>
						<div class="text-sm sm:text-base font-bold text-white">{event.date}</div>
						{#if event.time}
							<div class="text-xs text-slate-300 mt-0.5">{event.time}</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Official Poster Image Showcase -->
			{#if event.image}
				<div class="my-8 rounded-2xl overflow-hidden border border-slate-800/90 shadow-2xl relative group bg-slate-900">
					<img
						src={event.image}
						alt={event.title}
						class="w-full h-auto object-cover max-h-[550px] mx-auto group-hover:scale-[1.01] transition-transform duration-500"
					/>
					<div class="p-3 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
						<span>Official Poster — Canada–Nepal Friendship Day 2027</span>
						<a
							href={event.image}
							target="_blank"
							rel="noopener noreferrer"
							class="text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
						>
							View High-Resolution Image &nearr;
						</a>
					</div>
				</div>
			{/if}

			<!-- Action Buttons -->
			<div class="flex flex-wrap items-center gap-3.5 pt-2 relative z-10">
				<a
					href={gCalUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all flex items-center gap-2"
				>
					<span>📅 Add to Google Calendar</span>
				</a>
				<a
					href="mailto:info@canfacs.org?subject=Friendship%20Day%202027%20-%20Expression%20of%20Interest"
					class="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-colors flex items-center gap-2"
				>
					<span>🎭 Perform / Speak at Event</span>
				</a>
				<a
					href="/join-canfacs"
					class="px-6 py-3 rounded-xl glass-panel hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-700 transition-colors"
				>
					Join CANFACS
				</a>
			</div>
		</div>

		<!-- Event Highlights Grid -->
		{#if event.highlights && event.highlights.length > 0}
			<div class="mb-14">
				<div class="text-center sm:text-left mb-6">
					<h2 class="text-2xl font-bold text-white">Event Highlights & Program Features</h2>
					<p class="text-xs text-slate-400 mt-1">Key segments celebrating 61 years of bilateral friendship and cultural solidarity</p>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{#each event.highlights as highlight, idx}
						<div class="glass-card p-5 rounded-2xl border border-slate-800 flex items-start gap-4">
							<div class="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 text-red-400 font-extrabold flex items-center justify-center flex-shrink-0 text-sm">
								0{idx + 1}
							</div>
							<div>
								<h3 class="text-base font-bold text-white mb-1">{highlight}</h3>
								<p class="text-xs text-slate-400 leading-relaxed">
									{#if idx === 0}
										Honoring Indigenous partners, land acknowledgement, and Coast Salish cultural protocols.
									{:else if idx === 1}
										Folk dances, traditional melodies, and cross-cultural music connecting Nepalese and Canadian communities.
									{:else if idx === 2}
										Empowering youth perspectives on environmental sustainability, climate resilience, and ethical technology.
									{:else}
										Showcasing community achievements, civic collaborations, and bilateral friendship honors.
									{/if}
								</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Detailed Description & Society Mission -->
		<div class="glass-panel rounded-3xl border border-slate-800 p-8 sm:p-10 mb-12 space-y-6">
			<h2 class="text-2xl font-bold text-white">About the Celebration</h2>
			<div class="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed space-y-4">
				<p>
					{event.description}
				</p>
				<p>
					Diplomatic relations between Canada and Nepal were formally established in 1965. Over the last 61 years, our nations have cultivated deep mutual respect, cooperation in humanitarian development, educational partnerships, and rich people-to-people connections.
				</p>
				<div class="p-6 rounded-2xl bg-gradient-to-r from-red-950/60 via-slate-900 to-blue-950/60 border border-slate-800 text-center my-6">
					<blockquote class="text-base sm:text-lg font-bold text-white italic">
						&ldquo;Our diversity is our greatest collective strength. All are welcome!&rdquo;
					</blockquote>
					<div class="text-xs text-slate-400 mt-2 font-medium">
						— Canada-Nepal Friendship and Cultural Society (CANFACS)
					</div>
				</div>
				<h3 class="text-lg font-bold text-white pt-2">Dinner Reception & Cultural Evening</h3>
				<p>
					Following the stage presentations, attendees will be welcomed to a traditional celebratory dinner reception offering authentic Nepali flavors, community networking, and opportunities to meet community leaders and organizers.
				</p>
			</div>
		</div>

		<!-- Share Bar -->
		<div class="mt-8">
			<ShareButtons
				title={`${event.title} - ${event.subtitle || 'CANFACS'}`}
				description={event.summary || event.description}
				variant="bar"
			/>
		</div>
	</div>
</section>
