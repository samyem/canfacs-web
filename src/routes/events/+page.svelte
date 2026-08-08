<script lang="ts">
	import { EVENTS, SITE_INFO } from '$lib/data/siteData';

	const GALLERY_PHOTOS = [
		{ src: '/pptx-gallery/image28.jpg', title: 'Multicultural & First Nations Exchange', desc: 'CANFACS celebrating cultural unity & partnership' },
		{ src: '/pptx-gallery/image30.jpg', title: 'Nepal Day Gala Celebration', desc: 'Annual cultural performances and community honors' },
		{ src: '/pptx-gallery/image41.jpg', title: 'Bilateral MoUs & Partnerships', desc: 'Strengthening community ties and institutional collaboration' },
		{ src: '/pptx-gallery/image32.jpg', title: 'Heritage & Traditional Displays', desc: 'Exhibiting Nepalese traditions, arts, and crafts' },
		{ src: '/pptx-gallery/image1.jpg', title: 'Community Reception & Honors', desc: 'Dignitaries and members at CANFACS annual reception' },
		{ src: '/pptx-gallery/image25.jpg', title: 'Everest Commemorative Assembly', desc: 'Honoring mountain conservation and expedition heritage' }
	];
</script>

<svelte:head>
	<title>Events & Everest Day - {SITE_INFO.name}</title>
</svelte:head>

<section class="py-20 bg-slate-950">
	<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-16">
			<span class="text-xs uppercase font-bold text-red-500 tracking-wider">Community Gatherings</span>
			<h1 class="text-4xl sm:text-5xl font-extrabold text-white mt-2 mb-6">Events & Highlights</h1>
			<p class="text-slate-400 max-w-2xl mx-auto">
				Celebrating Himalayan heritage, cultural festivals, and community gatherings across Canada.
			</p>
		</div>

		<!-- Featured Highlight: International Mount Everest Day -->
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

		<!-- All Events Grid -->
		<div class="space-y-8">
			<h2 class="text-2xl font-bold text-white mb-6">Past Events & Commemorations</h2>
			{#each EVENTS as event}
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
					<div class="flex-shrink-0">
						<span class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-semibold text-xs">
							<span class="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
							Past Event
						</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
