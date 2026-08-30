<script lang="ts">
	import { NEWSLETTERS, SITE_INFO } from '$lib/data/siteData';
	import ShareButtons from '$lib/components/ShareButtons.svelte';
</script>

<svelte:head>
	<title>Newsletters & Souvenir - {SITE_INFO.name}</title>
	<meta
		name="description"
		content="Explore CANFACS archives of community magazines, essays, greetings, and community achievements across Canada and Nepal."
	/>
</svelte:head>

<section class="py-20 bg-slate-950 min-h-screen">
	<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
		<div class="text-center">
			<span class="text-xs uppercase font-bold text-red-500 tracking-wider">Publications</span>
			<h1 class="text-4xl sm:text-5xl font-extrabold text-white mt-2 mb-4">Newsletters & Publications</h1>
			<p class="text-slate-400 max-w-2xl mx-auto text-sm">
				Explore our archives of community magazines, essays, greetings, and community achievements.
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			{#each NEWSLETTERS as news}
				<div class="glass-card p-8 rounded-3xl border border-slate-800 flex flex-col justify-between">
					<div>
						<div class="inline-block px-3 py-1 rounded-full bg-slate-800 text-xs font-bold text-red-400 mb-4">
							{news.year}
						</div>
						<h3 class="text-xl font-bold text-white mb-3">{news.title}</h3>
						<p class="text-slate-400 text-sm leading-relaxed mb-6">
							{news.highlight || news.status || news.editorial}
						</p>
					</div>
					<button class="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700 transition-colors">
						Read Archive
					</button>
				</div>
			{/each}
		</div>

		<!-- Share Publications -->
		<ShareButtons
			title="CANFACS Newsletters & Souvenir Archives"
			description="Read and explore Canada-Nepal Friendship & Cultural Society community magazines, souvenirs, and essays."
			variant="bar"
		/>
	</div>
</section>
