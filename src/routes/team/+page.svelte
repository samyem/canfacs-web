<script lang="ts">
	import { EXECUTIVE_BOARD, ADVISORY_BOARD, SITE_INFO } from '$lib/data/siteData';
</script>

<svelte:head>
	<title>Leadership Team & Advisory Board - {SITE_INFO.name}</title>
</svelte:head>

<section class="py-20 bg-slate-950">
	<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-16">
			<span class="text-xs uppercase font-bold text-red-500 tracking-wider">Leadership</span>
			<h1 class="text-4xl sm:text-5xl font-extrabold text-white mt-2 mb-6">Executive Board & Advisory Committee</h1>
			<p class="text-slate-400 max-w-2xl mx-auto">
				Guiding CANFACS with professional expertise, civic dedication, and deep community commitment across Canada.
			</p>
		</div>

		<!-- Executive Board -->
		<div class="mb-20">
			<h2 class="text-2xl font-bold text-white mb-8 border-b border-slate-800 pb-4">Executive Board of Directors</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{#each EXECUTIVE_BOARD as member}
					<div class="glass-card p-6 rounded-3xl flex flex-col justify-between group hover:border-red-600/40 transition-all duration-300">
						<div>
							<div class="flex items-center gap-4 mb-4">
								{#if member.photo}
									<img
										src={member.photo}
										alt={member.name}
										class="w-16 h-16 rounded-full object-cover border-2 border-red-500/50 shadow-xl flex-shrink-0 group-hover:scale-105 transition-transform"
									/>
								{:else}
									<div class="w-16 h-16 rounded-full bg-gradient-to-tr from-red-600 to-blue-600 flex items-center justify-center font-bold text-xl text-white flex-shrink-0 shadow-lg">
										{member.name.charAt(4) || member.name.charAt(0)}
									</div>
								{/if}
								<div>
									<h3 class="font-bold text-white text-lg leading-snug">{member.name}</h3>
									<p class="text-xs text-red-400 font-bold uppercase tracking-wider">{member.role}</p>
									{#if member.profession}
										<p class="text-xs text-slate-300 font-medium mt-0.5">{member.profession}</p>
									{/if}
								</div>
							</div>

							{#if member.bio}
								<p class="text-xs text-slate-400 leading-relaxed mt-2 mb-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
									{member.bio}
								</p>
							{/if}
						</div>

						<div class="pt-2 border-t border-slate-800/60 flex items-center justify-between">
							{#if member.region}
								<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-semibold text-slate-300">
									📍 {member.region}, Canada
								</span>
							{/if}
							<span class="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Board Member</span>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Advisory Board -->
		<div>
			<h2 class="text-2xl font-bold text-white mb-8 border-b border-slate-800 pb-4">Advisory Board Members</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each ADVISORY_BOARD as advisor}
					<div class="glass-card p-6 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 hover:border-red-500/40 transition-all duration-300">
						{#if advisor.photo}
							<img
								src={advisor.photo}
								alt={advisor.name}
								class="w-16 h-16 rounded-xl object-cover border-2 border-red-500/50 shadow-md flex-shrink-0"
							/>
						{:else}
							<div class="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-lg flex-shrink-0">
								{advisor.name.charAt(0)}
							</div>
						{/if}
						<div class="flex-1">
							<h3 class="font-bold text-white text-base leading-snug">{advisor.name}</h3>
							{#if advisor.subname}
								<p class="text-xs text-slate-400 font-medium italic">{advisor.subname}</p>
							{/if}
							{#if advisor.credentials}
								<p class="text-[11px] text-red-400 font-semibold mt-0.5">{advisor.credentials}</p>
							{/if}
							{#if advisor.profession}
								<p class="text-xs text-slate-300 font-medium mt-1">{advisor.profession}</p>
							{/if}
							<p class="text-xs text-slate-400 font-medium mt-1">{advisor.role}</p>
							{#if advisor.region}
								<p class="text-[10px] text-slate-500 font-semibold mt-1">📍 {advisor.region}</p>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
