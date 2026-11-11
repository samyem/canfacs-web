<script lang="ts">
	import { SITE_INFO } from '$lib/data/siteData';
	import ShareButtons from '$lib/components/ShareButtons.svelte';

	let { data } = $props();

	// Primary upcoming landmark event
	const upcomingEvent = $derived(
		(data.events || []).find((e: any) => e.id === 'canada-nepal-friendship-day-2027' || e.isFeatured) || data.events?.[0]
	);

	// Other events list
	const otherEvents = $derived(
		(data.events || []).filter((e: any) => e.id !== upcomingEvent?.id)
	);

	const GALLERY_PHOTOS = [
		{ src: '/pptx-gallery/image28.jpg', title: 'Multicultural & First Nations Exchange', desc: 'CANFACS celebrating cultural unity & partnership' },
		{ src: '/pptx-gallery/image30.jpg', title: 'Nepal Day Gala Celebration', desc: 'Annual cultural performances and community honors' },
		{ src: '/pptx-gallery/image41.jpg', title: 'Bilateral MoUs & Partnerships', desc: 'Strengthening community ties and institutional collaboration' },
		{ src: '/pptx-gallery/image32.jpg', title: 'Heritage & Traditional Displays', desc: 'Exhibiting Nepalese traditions, arts, and crafts' },
		{ src: '/pptx-gallery/image1.jpg', title: 'Community Reception & Honors', desc: 'Dignitaries and members at CANFACS annual reception' },
		{ src: '/pptx-gallery/image25.jpg', title: 'Everest Commemorative Assembly', desc: 'Honoring mountain conservation and expedition heritage' }
	];

	const gCalUrl = $derived(
		`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Canada-Nepal+Friendship+Day+2027&dates=20270124T000000Z/20270124T040000Z&details=${encodeURIComponent(
			'Canada-Nepal Friendship Day 2027 - Unity in Diversity. Celebrating 61 years of diplomatic relations between Canada and Nepal.'
		)}&location=${encodeURIComponent('Centre Stage, City Hall, Surrey BC')}`
	);
</script>

<svelte:head>
	<title>Events & Celebrations - {SITE_INFO.name}</title>
	<meta name="description" content="Discover upcoming landmark events, cultural festivals, and Mount Everest Day commemorations with the Canada-Nepal Friendship & Cultural Society." />
</svelte:head>

<section class="py-16 md:py-24 bg-slate-950">
	<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Page Header -->
		<div class="text-center mb-16">
			<span class="text-xs uppercase font-bold text-red-500 tracking-wider">Community Gatherings</span>
			<h1 class="text-4xl sm:text-5xl font-extrabold text-white mt-2 mb-6">Events & Highlights</h1>
			<p class="text-slate-400 max-w-2xl mx-auto text-base">
				Celebrating Himalayan heritage, bilateral friendship, cultural festivals, and community solidarity across Canada.
			</p>
		</div>

		<!-- PRIMARY FEATURED UPCOMING LANDMARK EVENT: Canada-Nepal Friendship Day 2027 -->
		{#if upcomingEvent}
			<div class="glass-panel p-6 sm:p-10 md:p-12 rounded-3xl border border-red-900/60 mb-20 overflow-hidden relative shadow-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
				<!-- Ambient Glows -->
				<div class="absolute -top-24 -right-24 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>
				<div class="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

				<div class="relative z-10">
					<!-- Top Badges -->
					<div class="flex flex-wrap items-center gap-3 mb-6">
						<span class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-950 text-red-400 text-xs font-bold border border-red-800/80 shadow-md">
							<span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
							Upcoming Landmark Event • January 23, 2027
						</span>
						<span class="inline-block px-3 py-1 rounded-full bg-slate-900 text-slate-300 text-xs font-semibold border border-slate-700">
							🍁 {upcomingEvent.tagline || 'Celebrating 61 Years of Diplomatic Relations'}
						</span>
					</div>

					<div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
						<!-- Content Column -->
						<div class="lg:col-span-7 space-y-5">
							<div>
								<h2 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
									{upcomingEvent.title}
								</h2>
								<p class="text-xl sm:text-2xl font-bold text-gradient-nepal mt-1">
									{upcomingEvent.subtitle || 'Unity in Diversity'}
								</p>
							</div>

							<p class="text-slate-300 leading-relaxed text-sm sm:text-base">
								{upcomingEvent.summary || upcomingEvent.description}
							</p>

							<!-- Key Meta Cards (Venue & Date) -->
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
								<div class="glass-card p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
									<div class="w-10 h-10 rounded-xl bg-red-950/80 border border-red-800 text-lg flex items-center justify-center flex-shrink-0">
										📍
									</div>
									<div class="min-w-0">
										<div class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Venue</div>
										<div class="text-xs sm:text-sm font-bold text-white truncate">{upcomingEvent.venue || upcomingEvent.location}</div>
									</div>
								</div>

								<div class="glass-card p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
									<div class="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-800 text-lg flex items-center justify-center flex-shrink-0">
										📅
									</div>
									<div class="min-w-0">
										<div class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Date & Time</div>
										<div class="text-xs sm:text-sm font-bold text-white truncate">{upcomingEvent.date}</div>
										{#if upcomingEvent.time}
											<div class="text-[11px] text-slate-300">{upcomingEvent.time}</div>
										{/if}
									</div>
								</div>
							</div>

							<!-- Event Highlights List from Poster -->
							{#if upcomingEvent.highlights && upcomingEvent.highlights.length > 0}
								<div class="pt-3">
									<h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
										⭐ Event Highlights
									</h3>
									<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
										{#each upcomingEvent.highlights as highlight}
											<div class="flex items-start gap-2 text-xs text-slate-300 font-medium">
												<span class="text-red-400 font-bold mt-0.5">•</span>
												<span>{highlight}</span>
											</div>
										{/each}
									</div>
								</div>
							{/if}

							<!-- Diversity Quote Callout -->
							<div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 italic">
								&ldquo;Our diversity is our greatest collective strength. All are welcome!&rdquo;
							</div>

							<!-- Action Buttons -->
							<div class="flex flex-wrap items-center gap-3 pt-2">
								<a
									href={upcomingEvent.slug ? `/events/${upcomingEvent.slug}` : '#'}
									class="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/30 transition-all flex items-center gap-1.5"
								>
									<span>View Full Event Program &rarr;</span>
								</a>
								<a
									href={gCalUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 transition-colors flex items-center gap-1.5"
								>
									<span>📅 Add to Google Calendar</span>
								</a>
								<a
									href="mailto:info@canfacs.org?subject=Friendship%20Day%202027%20-%20Expression%20of%20Interest"
									class="px-5 py-3 rounded-xl glass-panel hover:bg-slate-800 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 transition-colors"
								>
									Perform / Speak
								</a>
							</div>
						</div>

						<!-- Poster Graphic Showcase Column -->
						<div class="lg:col-span-5">
							<div class="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative group bg-slate-900">
								<a
									href={upcomingEvent.image || '/events/canada-nepal-friendship-day-2027.jpg'}
									target="_blank"
									rel="noopener noreferrer"
									class="block relative"
								>
									<img
										src={upcomingEvent.image || '/events/canada-nepal-friendship-day-2027.jpg'}
										alt={upcomingEvent.title}
										class="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
									/>
									<div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
										<span class="px-3 py-1.5 rounded-lg bg-black/80 text-white text-xs font-semibold backdrop-blur-sm">
											🔍 Click to open full-resolution poster
										</span>
									</div>
								</a>
								<div class="p-3 bg-slate-900/90 text-[11px] text-slate-400 text-center border-t border-slate-800">
									Official Event Poster • Surrey City Hall Centre Stage
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Featured Annual Celebration: International Mount Everest Day -->
		<div class="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 mb-16 overflow-hidden relative">
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
				<div class="space-y-4">
					<span class="inline-block px-3 py-1 rounded-full bg-red-950 text-red-400 text-xs font-bold border border-red-800/50">
						Featured Annual Celebration • May 29
					</span>
					<h2 class="text-3xl font-extrabold text-white">International Mount Everest Day</h2>
					<p class="text-slate-300 leading-relaxed text-sm">
						Commemorating the historic first summit of Mount Everest by Sir Edmund Hillary and Tenzing Norgay Sherpa on May 29, 1953. CANFACS hosts annual celebrations featuring mountaineering slideshows, documentary screenings, cultural exchanges, and environmental conservation discussions.
					</p>
					
					<!-- YouTube Embeds -->
					<div class="pt-4 space-y-3">
						<h3 class="text-xs font-semibold uppercase tracking-wider text-slate-400">Featured Video Highlights</h3>
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div class="aspect-video rounded-xl overflow-hidden border border-slate-800">
								<iframe
									class="w-full h-full"
									src="https://www.youtube.com/embed/6mcm16y5VAk"
									title="Everest Day Celebration Video 1"
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
									allowfullscreen
								></iframe>
							</div>
							<div class="aspect-video rounded-xl overflow-hidden border border-slate-800">
								<iframe
									class="w-full h-full"
									src="https://www.youtube.com/embed/sOq0Uj41Qbs"
									title="Everest Day Celebration Video 2"
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
									allowfullscreen
								></iframe>
							</div>
						</div>
					</div>
				</div>

				<div class="space-y-4">
					<div class="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative group">
						<img
							src="/pptx-gallery/image28.jpg"
							alt="International Mount Everest Day Celebration"
							class="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
						/>
						<div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
						<div class="absolute bottom-4 left-4 right-4 text-xs text-slate-200 font-medium">
							🏔️ Everest Day Commemorative Multicultural Exchange
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- High Resolution Original Photo Gallery (Slide 4 & 5 Extractions) -->
		<div class="mb-20">
			<div class="flex items-center justify-between mb-8">
				<div>
					<h2 class="text-2xl font-bold text-white">Official Photo Gallery</h2>
					<p class="text-xs text-slate-400 mt-1">High-resolution photography from CANFACS celebrations & partnership events</p>
				</div>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each GALLERY_PHOTOS as photo}
					<div class="glass-card rounded-2xl overflow-hidden border border-slate-800 group hover:border-red-500/40 transition-all">
						<div class="h-56 overflow-hidden relative">
							<img
								src={photo.src}
								alt={photo.title}
								class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
							/>
							<div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
						</div>
						<div class="p-5">
							<h3 class="font-bold text-white text-base mb-1">{photo.title}</h3>
							<p class="text-xs text-slate-400">{photo.desc}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Past Events & Commemorations Grid -->
		<div class="space-y-8">
			<h2 class="text-2xl font-bold text-white mb-6">Past Events & Commemorations</h2>
			{#each otherEvents as event}
				<div class="glass-panel p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
					<div class="space-y-3 max-w-2xl">
						<div class="flex items-center gap-3">
							<span class="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700">
								{event.date}
							</span>
							<span class="text-xs text-slate-400 font-medium">{event.location}</span>
						</div>
						<h3 class="text-2xl font-bold text-white">{event.title}</h3>
						<p class="text-slate-300 text-sm leading-relaxed">{event.description}</p>
					</div>
					{#if event.slug}
						<a
							href={`/events/${event.slug}`}
							class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-colors whitespace-nowrap"
						>
							View Details &rarr;
						</a>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Social Share Bar for Events -->
		<div class="mt-12">
			<ShareButtons
				title="CANFACS Events & Canada-Nepal Friendship Day 2027"
				description="Explore cultural festivals, Mount Everest Day commemorations, and Canada-Nepal Friendship Day 2027 with CANFACS."
				variant="bar"
			/>
		</div>
	</div>
</section>
