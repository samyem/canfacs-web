<script lang="ts">
	import { SITE_INFO } from '$lib/data/siteData';
</script>

<svelte:head>
	<title>Our Story - {SITE_INFO.name}</title>
</svelte:head>

<section class="py-20 bg-slate-950">
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-16">
			<span class="text-xs uppercase font-bold text-red-500 tracking-wider">History & Background</span>
			<h1 class="text-4xl sm:text-5xl font-extrabold text-white mt-2 mb-6">Our Story</h1>
			<div class="h-1 w-20 bg-gradient-to-r from-red-600 to-blue-600 mx-auto rounded-full"></div>
		</div>

		<div class="space-y-8 text-slate-300 leading-relaxed text-base sm:text-lg">
			<div class="glass-panel p-8 rounded-2xl border border-slate-800">
				<h3 class="text-2xl font-bold text-white mb-4">Longstanding Friendship (Since 1965)</h3>
				<p class="mb-4">
					Canada and Nepal established diplomatic relations in <strong>1965</strong>. For six decades, both nations have enjoyed friendly bilateral relations built on mutual respect, shared democratic values, and development cooperation (which formally began in 1968).
				</p>
				<p>
					Over the decades, thousands of Nepalis have made Canada their home, enriching Canadian society in engineering, medicine, academia, business, arts, and public service.
				</p>
			</div>

			<div class="glass-panel p-8 rounded-2xl border border-slate-800">
				<h3 class="text-2xl font-bold text-white mb-4">Establishment of CANFACS (2016)</h3>
				<p class="mb-4">
					The <strong>Canada-Nepal Friendship and Cultural Society (CANFACS)</strong> was established on <strong>November 30, 2016</strong> as a non-profit organization serving communities across Canada.
				</p>
				<p>
					Initiated by founding President Er. Mankajee Shrestha 'Jena' P.Eng. alongside community leaders across Canada, CANFACS was formed to serve as a vital bridge between people, communities, and institutions in Canada and Nepal.
				</p>
			</div>

			<div class="glass-panel p-8 rounded-2xl border border-slate-800">
				<h3 class="text-2xl font-bold text-white mb-4">Connecting Communities Today</h3>
				<p>
					Today, CANFACS organizes annual cultural celebrations like Bhetghat and International Mount Everest Day, publishes community newsletters, facilitates youth and educational exchanges, and supports smooth integration for Nepali immigrants arriving in provinces and territories across Canada.
				</p>
			</div>
		</div>
	</div>
</section>
