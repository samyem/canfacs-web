<script lang="ts">
	import { PURPOSES, SITE_INFO } from '$lib/data/siteData';
</script>

<svelte:head>
	<title>Mission & Vision - {SITE_INFO.name}</title>
</svelte:head>

<section class="py-20 bg-slate-950">
	<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-16">
			<span class="text-xs uppercase font-bold text-blue-500 tracking-wider">Our Purpose</span>
			<h1 class="text-4xl sm:text-5xl font-extrabold text-white mt-2 mb-6">Mission & Constitution Purposes</h1>
			<p class="text-slate-400 max-w-2xl mx-auto">
				Established on November 30, 2016 as a nationwide non-profit organization across Canada.
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
			<div class="glass-panel p-8 rounded-2xl border border-red-900/30">
				<h2 class="text-2xl font-bold text-red-400 mb-4">Our Vision</h2>
				<p class="text-slate-300 leading-relaxed">
					To be the primary catalyst for vibrant cultural exchange, enduring bilateral friendship, and inclusive community harmony between the peoples of Canada and Nepal.
				</p>
			</div>
			<div class="glass-panel p-8 rounded-2xl border border-blue-900/30">
				<h2 class="text-2xl font-bold text-blue-400 mb-4">Our Mission</h2>
				<p class="text-slate-300 leading-relaxed">
					Empowering Nepali-Canadians, fostering institutional and government collaborations, celebrating multicultural diversity, and providing educational & humanitarian support.
				</p>
			</div>
		</div>

		<h2 class="text-2xl font-bold text-white mb-8 text-center">Constitutionally Stated Purposes</h2>
		<div class="space-y-6">
			{#each PURPOSES as item, idx}
				<div class="glass-card p-6 rounded-xl flex items-start gap-5">
					<div class="w-10 h-10 rounded-lg bg-red-950 border border-red-800 text-red-400 font-bold flex items-center justify-center flex-shrink-0">
						{String.fromCharCode(97 + idx)}
					</div>
					<div>
						<h3 class="text-lg font-bold text-white mb-1">{item.title}</h3>
						<p class="text-slate-300 text-sm leading-relaxed">{item.desc}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
