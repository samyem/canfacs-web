<script lang="ts">
	import { SITE_INFO } from '$lib/data/siteData';
</script>

<svelte:head>
	<title>Annual Bhetghat Cultural Festival - {SITE_INFO.name}</title>
</svelte:head>

<section class="py-20 bg-slate-950">
	<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-16">
			<span class="text-xs uppercase font-bold text-red-500 tracking-wider">Annual Cultural Gathering</span>
			<h1 class="text-4xl sm:text-5xl font-extrabold text-white mt-2 mb-6">CANFACS Bhetghat</h1>
			<p class="text-slate-400 max-w-xl mx-auto">
				Bhetghat ('भेटघाट') is the signature annual socio-cultural reunion hosted by CANFACS across Canada.
			</p>
		</div>

		<div class="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 space-y-8 text-slate-300 leading-relaxed">
			<!-- Hero Event Image -->
			<div class="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
				<img
					src="/bhetghat-festival.png"
					alt="CANFACS Bhetghat Festival Celebration"
					class="w-full h-80 object-cover object-center"
				/>
				<div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
				<div class="absolute bottom-6 left-6 right-6 flex items-end justify-between flex-wrap gap-2">
					<div>
						<div class="text-xs font-semibold uppercase tracking-wider text-red-400">Annual Gathering</div>
						<div class="text-xl font-bold text-white">Nepali Cultural Reunion & Welcoming Program</div>
					</div>
					<span class="px-3 py-1 rounded-full bg-slate-900/90 text-xs text-slate-200 border border-slate-700">
						Community Celebration
					</span>
				</div>
			</div>

			<h2 class="text-2xl font-bold text-white">Celebrating Culture, Cuisine & Community</h2>
			<p>
				Bhetghat brings together Nepali families, friends, Canadian dignitaries, multicultural partners, and community organizations for a day filled with traditional Nepali dances, musical performances, authentic cuisine, and lively social interaction.
			</p>
			<p>
				It serves as a nationwide platform to welcome new immigrants to Canada, honor community contributors, and share Nepali heritage with the broader Canadian public.
			</p>

			<div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between flex-wrap gap-4 mt-8">
				<div>
					<div class="text-white font-bold text-lg">Interested in participating or performing?</div>
					<div class="text-slate-400 text-xs mt-1">Submit your performance proposal or volunteer for the upcoming Bhetghat festival.</div>
				</div>
				<a href="/join-canfacs" class="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors">
					Get Involved
				</a>
			</div>
		</div>
	</div>
</section>
