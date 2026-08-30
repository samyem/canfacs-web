<script lang="ts">
	let {
		title = 'CANFACS - Canada Nepal Friendship & Cultural Society',
		description = 'Building bridges of friendship, cultural appreciation, and mutual goodwill between Canada and Nepal.',
		url = '',
		variant = 'bar'
	}: {
		title?: string;
		description?: string;
		url?: string;
		variant?: 'bar' | 'compact' | 'card' | 'inline';
	} = $props();

	let copied = $state(false);
	let showShareModal = $state(false);

	function getShareUrl(): string {
		if (url) return url;
		if (typeof window !== 'undefined') return window.location.href;
		return 'https://canfacs.org';
	}

	async function handleNativeShare() {
		const shareUrl = getShareUrl();
		if (typeof navigator !== 'undefined' && (navigator as any).share) {
			try {
				await (navigator as any).share({
					title,
					text: description,
					url: shareUrl
				});
				return;
			} catch (err) {
				if ((err as Error).name !== 'AbortError') {
					showShareModal = true;
				}
			}
		} else {
			showShareModal = true;
		}
	}

	function copyToClipboard() {
		const shareUrl = getShareUrl();
		if (typeof navigator !== 'undefined') {
			navigator.clipboard.writeText(shareUrl);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2500);
		}
	}

	const shareLinks = $derived.by(() => {
		const shareUrl = encodeURIComponent(getShareUrl());
		const shareTitle = encodeURIComponent(title);
		const shareDesc = encodeURIComponent(description);
		const fullText = encodeURIComponent(`${title}\n\n${description}\n\n${getShareUrl()}`);

		return {
			whatsapp: `https://api.whatsapp.com/send?text=${fullText}`,
			facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareTitle}`,
			twitter: `https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}&hashtags=CANFACS,NepalRelief,CanadaNepal`,
			linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
			telegram: `https://t.me/share/url?url=${shareUrl}&text=${shareTitle}`,
			messenger: `https://www.facebook.com/dialog/send?link=${shareUrl}&app_id=291494419107518&redirect_uri=${shareUrl}`,
			email: `mailto:?subject=${shareTitle}&body=${shareDesc}%0D%0A%0D%0ALearn more and contribute at: ${shareUrl}`
		};
	});
</script>

{#if variant === 'card'}
	<!-- Rich Card Variant (Great for Sidebars) -->
	<div class="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 rounded-3xl space-y-5 shadow-2xl">
		<div class="flex items-center gap-3 border-b border-slate-800/80 pb-4">
			<div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-red-600/30">
				<svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
					<path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
				</svg>
			</div>
			<div>
				<h3 class="text-sm font-extrabold text-white">Share This Initiative</h3>
				<p class="text-[11px] text-slate-400">Help spread awareness across your networks.</p>
			</div>
		</div>

		<!-- Circular 3D Gradient Social Buttons Grid -->
		<div class="grid grid-cols-4 sm:grid-cols-7 gap-3 justify-items-center">
			<!-- WhatsApp -->
			<a
				href={shareLinks.whatsapp}
				target="_blank"
				rel="noopener noreferrer"
				class="flex flex-col items-center gap-1.5 group"
				title="Share on WhatsApp"
			>
				<div class="w-11 h-11 rounded-full bg-gradient-to-tr from-[#128C7E] via-[#25D366] to-[#25D366] flex items-center justify-center shadow-lg shadow-emerald-600/30 group-hover:scale-110 group-hover:shadow-emerald-500/50 transition-all">
					<svg class="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
						<path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
					</svg>
				</div>
				<span class="text-[10px] font-semibold text-slate-300 group-hover:text-emerald-400 transition-colors">WhatsApp</span>
			</a>

			<!-- Facebook -->
			<a
				href={shareLinks.facebook}
				target="_blank"
				rel="noopener noreferrer"
				class="flex flex-col items-center gap-1.5 group"
				title="Share on Facebook"
			>
				<div class="w-11 h-11 rounded-full bg-gradient-to-tr from-[#0d5ecc] via-[#1877F2] to-[#3b82f6] flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-110 group-hover:shadow-blue-500/50 transition-all">
					<svg class="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
						<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
					</svg>
				</div>
				<span class="text-[10px] font-semibold text-slate-300 group-hover:text-blue-400 transition-colors">Facebook</span>
			</a>

			<!-- X (Twitter) -->
			<a
				href={shareLinks.twitter}
				target="_blank"
				rel="noopener noreferrer"
				class="flex flex-col items-center gap-1.5 group"
				title="Share on X"
			>
				<div class="w-11 h-11 rounded-full bg-gradient-to-tr from-[#09090b] via-[#18181b] to-[#27272a] border border-slate-700/60 flex items-center justify-center shadow-lg shadow-black/40 group-hover:scale-110 group-hover:border-slate-500 transition-all">
					<svg class="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
						<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
					</svg>
				</div>
				<span class="text-[10px] font-semibold text-slate-300 group-hover:text-white transition-colors">𝕏 Post</span>
			</a>

			<!-- LinkedIn -->
			<a
				href={shareLinks.linkedin}
				target="_blank"
				rel="noopener noreferrer"
				class="flex flex-col items-center gap-1.5 group"
				title="Share on LinkedIn"
			>
				<div class="w-11 h-11 rounded-full bg-gradient-to-tr from-[#004182] via-[#0A66C2] to-[#0A66C2] flex items-center justify-center shadow-lg shadow-sky-700/30 group-hover:scale-110 group-hover:shadow-sky-500/50 transition-all">
					<svg class="w-4.5 h-4.5 fill-current text-white" viewBox="0 0 24 24">
						<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
					</svg>
				</div>
				<span class="text-[10px] font-semibold text-slate-300 group-hover:text-sky-400 transition-colors">LinkedIn</span>
			</a>

			<!-- Telegram -->
			<a
				href={shareLinks.telegram}
				target="_blank"
				rel="noopener noreferrer"
				class="flex flex-col items-center gap-1.5 group"
				title="Share on Telegram"
			>
				<div class="w-11 h-11 rounded-full bg-gradient-to-tr from-[#0088cc] via-[#229ED9] to-[#229ED9] flex items-center justify-center shadow-lg shadow-sky-500/30 group-hover:scale-110 group-hover:shadow-sky-400/50 transition-all">
					<svg class="w-4.5 h-4.5 fill-current text-white translate-x-[-1px]" viewBox="0 0 24 24">
						<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
					</svg>
				</div>
				<span class="text-[10px] font-semibold text-slate-300 group-hover:text-sky-300 transition-colors">Telegram</span>
			</a>

			<!-- Email -->
			<a
				href={shareLinks.email}
				class="flex flex-col items-center gap-1.5 group"
				title="Share via Email"
			>
				<div class="w-11 h-11 rounded-full bg-gradient-to-tr from-[#d97706] via-[#f59e0b] to-[#fbbf24] flex items-center justify-center shadow-lg shadow-amber-600/30 group-hover:scale-110 group-hover:shadow-amber-500/50 transition-all">
					<svg class="w-4.5 h-4.5 fill-current text-white" viewBox="0 0 24 24">
						<path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 6.817h-18.779l5.513-6.812zm9.208-1.259l4.616-3.74v9.452l-4.616-5.712z"/>
					</svg>
				</div>
				<span class="text-[10px] font-semibold text-slate-300 group-hover:text-amber-400 transition-colors">Email</span>
			</a>

			<!-- Copy Link -->
			<button
				type="button"
				onclick={copyToClipboard}
				class="flex flex-col items-center gap-1.5 group"
				title="Copy Link to Clipboard"
			>
				<div class="w-11 h-11 rounded-full bg-gradient-to-tr from-[#334155] via-[#475569] to-[#64748b] border border-slate-600 flex items-center justify-center shadow-lg shadow-slate-700/30 group-hover:scale-110 group-hover:border-slate-400 transition-all">
					{#if copied}
						<svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
						</svg>
					{:else}
						<svg class="w-4.5 h-4.5 fill-current text-white" viewBox="0 0 24 24">
							<path d="M6.188 17.188a4.998 4.998 0 0 1 0-7.071l3.536-3.536a5 5 0 0 1 7.071 0 4.957 4.957 0 0 1 1.464 3.536 4.957 4.957 0 0 1-1.464 3.535l-1.06 1.061a1 1 0 1 1-1.415-1.414l1.061-1.061a2.982 2.982 0 0 0 .879-2.121 2.982 2.982 0 0 0-.879-2.121 3 3 0 0 0-4.242 0l-3.536 3.536a3 3 0 0 0 0 4.242 1 1 0 0 1-1.415 1.414zm11.624-10.376a1 1 0 0 1 0 1.414l-1.061 1.06a1 1 0 0 1-1.414-1.414l1.06-1.06a1 1 0 0 1 1.415 0zm-7.071 14.142a4.957 4.957 0 0 1-3.536-1.464l-1.06-1.061a1 1 0 1 1 1.414-1.414l1.061 1.061a2.982 2.982 0 0 0 2.121.879 2.982 2.982 0 0 0 2.121-.879 3 3 0 0 0 0-4.242l-3.536-3.536a3 3 0 0 0-4.242 0 1 1 0 1 1-1.414-1.414 5 5 0 0 1 7.071 0l3.536 3.536a4.957 4.957 0 0 1 1.464 3.535 4.957 4.957 0 0 1-1.464 3.536 4.957 4.957 0 0 1-3.536 1.464z"/>
						</svg>
					{/if}
				</div>
				<span class="text-[10px] font-semibold text-slate-300 group-hover:text-white transition-colors">{copied ? 'Copied!' : 'Copy'}</span>
			</button>
		</div>

		<!-- Native Mobile Share Action -->
		<button
			type="button"
			onclick={handleNativeShare}
			class="w-full py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2"
		>
			<svg class="w-4 h-4 fill-current text-red-400" viewBox="0 0 24 24">
				<path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
			</svg>
			<span>More Apps (Instagram, Messenger, Messages...)</span>
		</button>
	</div>

{:else if variant === 'compact'}
	<!-- Compact Horizontal Pill Group -->
	<div class="inline-flex items-center gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-full shadow-lg">
		<!-- WhatsApp -->
		<a
			href={shareLinks.whatsapp}
			target="_blank"
			rel="noopener noreferrer"
			class="w-8 h-8 rounded-full bg-gradient-to-tr from-[#128C7E] to-[#25D366] flex items-center justify-center hover:scale-110 transition-transform shadow-md shadow-emerald-600/30"
			title="Share on WhatsApp"
		>
			<svg class="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
				<path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
			</svg>
		</a>

		<!-- Facebook -->
		<a
			href={shareLinks.facebook}
			target="_blank"
			rel="noopener noreferrer"
			class="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0d5ecc] to-[#1877F2] flex items-center justify-center hover:scale-110 transition-transform shadow-md shadow-blue-600/30"
			title="Share on Facebook"
		>
			<svg class="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
				<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
			</svg>
		</a>

		<!-- X -->
		<a
			href={shareLinks.twitter}
			target="_blank"
			rel="noopener noreferrer"
			class="w-8 h-8 rounded-full bg-gradient-to-tr from-black to-slate-900 border border-slate-700 flex items-center justify-center hover:scale-110 transition-transform shadow-md"
			title="Share on X"
		>
			<svg class="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
				<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
			</svg>
		</a>

		<!-- Copy -->
		<button
			type="button"
			onclick={copyToClipboard}
			class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center transition-all"
			title="Copy Link"
		>
			{#if copied}
				<span class="text-xs text-emerald-400 font-bold">✓</span>
			{:else}
				<svg class="w-3.5 h-3.5 fill-current text-slate-300" viewBox="0 0 24 24">
					<path d="M6.188 17.188a4.998 4.998 0 0 1 0-7.071l3.536-3.536a5 5 0 0 1 7.071 0 4.957 4.957 0 0 1 1.464 3.536 4.957 4.957 0 0 1-1.464 3.535l-1.06 1.061a1 1 0 1 1-1.415-1.414l1.061-1.061a2.982 2.982 0 0 0 .879-2.121 2.982 2.982 0 0 0-.879-2.121 3 3 0 0 0-4.242 0l-3.536 3.536a3 3 0 0 0 0 4.242 1 1 0 0 1-1.415 1.414zm11.624-10.376a1 1 0 0 1 0 1.414l-1.061 1.06a1 1 0 0 1-1.414-1.414l1.06-1.06a1 1 0 0 1 1.415 0zm-7.071 14.142a4.957 4.957 0 0 1-3.536-1.464l-1.06-1.061a1 1 0 1 1 1.414-1.414l1.061 1.061a2.982 2.982 0 0 0 2.121.879 2.982 2.982 0 0 0 2.121-.879 3 3 0 0 0 0-4.242l-3.536-3.536a3 3 0 0 0-4.242 0 1 1 0 1 1-1.414-1.414 5 5 0 0 1 7.071 0l3.536 3.536a4.957 4.957 0 0 1 1.464 3.535 4.957 4.957 0 0 1-1.464 3.536 4.957 4.957 0 0 1-3.536 1.464z"/>
				</svg>
			{/if}
		</button>
	</div>

{:else}
	<!-- Standard Full-Width Banner Variant -->
	<div class="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
		<div class="flex items-center gap-3.5">
			<div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-red-600/30">
				<svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
					<path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
				</svg>
			</div>
			<div>
				<div class="text-sm font-bold text-white">Help Spread the Word</div>
				<div class="text-xs text-slate-400">Share this appeal with friends, family, and community groups.</div>
			</div>
		</div>

		<!-- Circular Gradient Social Icons Group -->
		<div class="flex flex-wrap items-center gap-3">
			<!-- WhatsApp -->
			<a
				href={shareLinks.whatsapp}
				target="_blank"
				rel="noopener noreferrer"
				class="w-10 h-10 rounded-full bg-gradient-to-tr from-[#128C7E] via-[#25D366] to-[#25D366] flex items-center justify-center shadow-lg shadow-emerald-600/30 hover:scale-110 hover:shadow-emerald-500/50 transition-all"
				title="Share on WhatsApp"
			>
				<svg class="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
					<path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
				</svg>
			</a>

			<!-- Facebook -->
			<a
				href={shareLinks.facebook}
				target="_blank"
				rel="noopener noreferrer"
				class="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0d5ecc] via-[#1877F2] to-[#3b82f6] flex items-center justify-center shadow-lg shadow-blue-600/30 hover:scale-110 hover:shadow-blue-500/50 transition-all"
				title="Share on Facebook"
			>
				<svg class="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
					<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
				</svg>
			</a>

			<!-- X (Twitter) -->
			<a
				href={shareLinks.twitter}
				target="_blank"
				rel="noopener noreferrer"
				class="w-10 h-10 rounded-full bg-gradient-to-tr from-[#09090b] via-[#18181b] to-[#27272a] border border-slate-700 flex items-center justify-center shadow-lg shadow-black/40 hover:scale-110 hover:border-slate-500 transition-all"
				title="Share on X"
			>
				<svg class="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
					<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
				</svg>
			</a>

			<!-- LinkedIn -->
			<a
				href={shareLinks.linkedin}
				target="_blank"
				rel="noopener noreferrer"
				class="w-10 h-10 rounded-full bg-gradient-to-tr from-[#004182] via-[#0A66C2] to-[#0A66C2] flex items-center justify-center shadow-lg shadow-sky-700/30 hover:scale-110 hover:shadow-sky-500/50 transition-all"
				title="Share on LinkedIn"
			>
				<svg class="w-4.5 h-4.5 fill-current text-white" viewBox="0 0 24 24">
					<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
				</svg>
			</a>

			<!-- Telegram -->
			<a
				href={shareLinks.telegram}
				target="_blank"
				rel="noopener noreferrer"
				class="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0088cc] via-[#229ED9] to-[#229ED9] flex items-center justify-center shadow-lg shadow-sky-500/30 hover:scale-110 hover:shadow-sky-400/50 transition-all"
				title="Share on Telegram"
			>
				<svg class="w-4.5 h-4.5 fill-current text-white translate-x-[-1px]" viewBox="0 0 24 24">
					<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
				</svg>
			</a>

			<!-- Email -->
			<a
				href={shareLinks.email}
				class="w-10 h-10 rounded-full bg-gradient-to-tr from-[#d97706] via-[#f59e0b] to-[#fbbf24] flex items-center justify-center shadow-lg shadow-amber-600/30 hover:scale-110 hover:shadow-amber-500/50 transition-all"
				title="Share via Email"
			>
				<svg class="w-4.5 h-4.5 fill-current text-white" viewBox="0 0 24 24">
					<path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 6.817h-18.779l5.513-6.812zm9.208-1.259l4.616-3.74v9.452l-4.616-5.712z"/>
				</svg>
			</a>

			<!-- Copy Link -->
			<button
				type="button"
				onclick={copyToClipboard}
				class="w-10 h-10 rounded-full bg-gradient-to-tr from-[#334155] via-[#475569] to-[#64748b] border border-slate-600 flex items-center justify-center shadow-lg shadow-slate-700/30 hover:scale-110 hover:border-slate-400 transition-all"
				title="Copy Page Link"
			>
				{#if copied}
					<svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
					</svg>
				{:else}
					<svg class="w-4.5 h-4.5 fill-current text-white" viewBox="0 0 24 24">
						<path d="M6.188 17.188a4.998 4.998 0 0 1 0-7.071l3.536-3.536a5 5 0 0 1 7.071 0 4.957 4.957 0 0 1 1.464 3.536 4.957 4.957 0 0 1-1.464 3.535l-1.06 1.061a1 1 0 1 1-1.415-1.414l1.061-1.061a2.982 2.982 0 0 0 .879-2.121 2.982 2.982 0 0 0-.879-2.121 3 3 0 0 0-4.242 0l-3.536 3.536a3 3 0 0 0 0 4.242 1 1 0 0 1-1.415 1.414zm11.624-10.376a1 1 0 0 1 0 1.414l-1.061 1.06a1 1 0 0 1-1.414-1.414l1.06-1.06a1 1 0 0 1 1.415 0zm-7.071 14.142a4.957 4.957 0 0 1-3.536-1.464l-1.06-1.061a1 1 0 1 1 1.414-1.414l1.061 1.061a2.982 2.982 0 0 0 2.121.879 2.982 2.982 0 0 0 2.121-.879 3 3 0 0 0 0-4.242l-3.536-3.536a3 3 0 0 0-4.242 0 1 1 0 1 1-1.414-1.414 5 5 0 0 1 7.071 0l3.536 3.536a4.957 4.957 0 0 1 1.464 3.535 4.957 4.957 0 0 1-1.464 3.536 4.957 4.957 0 0 1-3.536 1.464z"/>
					</svg>
				{/if}
			</button>

			<!-- Mobile Native Share -->
			<button
				type="button"
				onclick={handleNativeShare}
				class="px-4 py-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-red-600/30 flex items-center gap-1.5"
				title="All Sharing Options"
			>
				<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
					<path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
				</svg>
				<span>Share</span>
			</button>
		</div>
	</div>
{/if}

<!-- Social Sharing Modal Popup (Fallback / More Options) -->
{#if showShareModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
		<div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
			<div class="flex items-center justify-between border-b border-slate-800 pb-4">
				<div class="flex items-center gap-3">
					<div class="w-9 h-9 rounded-xl bg-red-600/10 border border-red-500/20 text-red-400 flex items-center justify-center">
						<svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
							<path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
						</svg>
					</div>
					<h3 class="text-base font-bold text-white">Share this Page</h3>
				</div>
				<button type="button" onclick={() => (showShareModal = false)} class="text-slate-400 hover:text-white text-lg">✕</button>
			</div>

			<p class="text-xs text-slate-300 leading-relaxed">
				Share <strong>"{title}"</strong> across your messaging apps and social channels:
			</p>

			<!-- Modal 3D Circular Icons Grid -->
			<div class="grid grid-cols-4 gap-4 justify-items-center py-2">
				<!-- WhatsApp -->
				<a
					href={shareLinks.whatsapp}
					target="_blank"
					rel="noopener noreferrer"
					class="flex flex-col items-center gap-1.5 group"
				>
					<div class="w-12 h-12 rounded-full bg-gradient-to-tr from-[#128C7E] to-[#25D366] flex items-center justify-center shadow-lg shadow-emerald-600/40 group-hover:scale-110 transition-transform">
						<svg class="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
							<path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
						</svg>
					</div>
					<span class="text-[11px] text-slate-300 font-semibold">WhatsApp</span>
				</a>

				<!-- Facebook -->
				<a
					href={shareLinks.facebook}
					target="_blank"
					rel="noopener noreferrer"
					class="flex flex-col items-center gap-1.5 group"
				>
					<div class="w-12 h-12 rounded-full bg-gradient-to-tr from-[#0d5ecc] to-[#1877F2] flex items-center justify-center shadow-lg shadow-blue-600/40 group-hover:scale-110 transition-transform">
						<svg class="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
							<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
						</svg>
					</div>
					<span class="text-[11px] text-slate-300 font-semibold">Facebook</span>
				</a>

				<!-- Messenger -->
				<a
					href={shareLinks.messenger}
					target="_blank"
					rel="noopener noreferrer"
					class="flex flex-col items-center gap-1.5 group"
				>
					<div class="w-12 h-12 rounded-full bg-gradient-to-tr from-[#00B2FF] via-[#006AFF] to-[#9B00E8] flex items-center justify-center shadow-lg shadow-indigo-600/40 group-hover:scale-110 transition-transform">
						<svg class="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
							<path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.082.3 2.235.464 3.443.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.191 14.963l-3.056-3.259-5.963 3.259 6.559-6.963 3.13 3.259 5.889-3.259-6.559 6.963z"/>
						</svg>
					</div>
					<span class="text-[11px] text-slate-300 font-semibold">Messenger</span>
				</a>

				<!-- X (Twitter) -->
				<a
					href={shareLinks.twitter}
					target="_blank"
					rel="noopener noreferrer"
					class="flex flex-col items-center gap-1.5 group"
				>
					<div class="w-12 h-12 rounded-full bg-gradient-to-tr from-black to-slate-900 border border-slate-700 flex items-center justify-center shadow-lg shadow-black/50 group-hover:scale-110 transition-transform">
						<svg class="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
							<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
						</svg>
					</div>
					<span class="text-[11px] text-slate-300 font-semibold">𝕏 Post</span>
				</a>

				<!-- LinkedIn -->
				<a
					href={shareLinks.linkedin}
					target="_blank"
					rel="noopener noreferrer"
					class="flex flex-col items-center gap-1.5 group"
				>
					<div class="w-12 h-12 rounded-full bg-gradient-to-tr from-[#004182] to-[#0A66C2] flex items-center justify-center shadow-lg shadow-blue-700/40 group-hover:scale-110 transition-transform">
						<svg class="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
							<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
						</svg>
					</div>
					<span class="text-[11px] text-slate-300 font-semibold">LinkedIn</span>
				</a>

				<!-- Telegram -->
				<a
					href={shareLinks.telegram}
					target="_blank"
					rel="noopener noreferrer"
					class="flex flex-col items-center gap-1.5 group"
				>
					<div class="w-12 h-12 rounded-full bg-gradient-to-tr from-[#0088cc] to-[#229ED9] flex items-center justify-center shadow-lg shadow-sky-500/40 group-hover:scale-110 transition-transform">
						<svg class="w-5 h-5 fill-current text-white translate-x-[-1px]" viewBox="0 0 24 24">
							<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
						</svg>
					</div>
					<span class="text-[11px] text-slate-300 font-semibold">Telegram</span>
				</a>

				<!-- Email -->
				<a
					href={shareLinks.email}
					class="flex flex-col items-center gap-1.5 group"
				>
					<div class="w-12 h-12 rounded-full bg-gradient-to-tr from-[#d97706] to-[#f59e0b] flex items-center justify-center shadow-lg shadow-amber-600/40 group-hover:scale-110 transition-transform">
						<svg class="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
							<path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 6.817h-18.779l5.513-6.812zm9.208-1.259l4.616-3.74v9.452l-4.616-5.712z"/>
						</svg>
					</div>
					<span class="text-[11px] text-slate-300 font-semibold">Email</span>
				</a>

				<!-- Copy Link -->
				<button
					type="button"
					onclick={copyToClipboard}
					class="flex flex-col items-center gap-1.5 group"
				>
					<div class="w-12 h-12 rounded-full bg-gradient-to-tr from-[#334155] to-[#64748b] border border-slate-600 flex items-center justify-center shadow-lg shadow-slate-700/40 group-hover:scale-110 transition-transform">
						{#if copied}
							<svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
							</svg>
						{:else}
							<svg class="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
								<path d="M6.188 17.188a4.998 4.998 0 0 1 0-7.071l3.536-3.536a5 5 0 0 1 7.071 0 4.957 4.957 0 0 1 1.464 3.536 4.957 4.957 0 0 1-1.464 3.535l-1.06 1.061a1 1 0 1 1-1.415-1.414l1.061-1.061a2.982 2.982 0 0 0 .879-2.121 2.982 2.982 0 0 0-.879-2.121 3 3 0 0 0-4.242 0l-3.536 3.536a3 3 0 0 0 0 4.242 1 1 0 0 1-1.415 1.414zm11.624-10.376a1 1 0 0 1 0 1.414l-1.061 1.06a1 1 0 0 1-1.414-1.414l1.06-1.06a1 1 0 0 1 1.415 0zm-7.071 14.142a4.957 4.957 0 0 1-3.536-1.464l-1.06-1.061a1 1 0 1 1 1.414-1.414l1.061 1.061a2.982 2.982 0 0 0 2.121.879 2.982 2.982 0 0 0 2.121-.879 3 3 0 0 0 0-4.242l-3.536-3.536a3 3 0 0 0-4.242 0 1 1 0 1 1-1.414-1.414 5 5 0 0 1 7.071 0l3.536 3.536a4.957 4.957 0 0 1 1.464 3.535 4.957 4.957 0 0 1-1.464 3.536 4.957 4.957 0 0 1-3.536 1.464z"/>
							</svg>
						{/if}
					</div>
					<span class="text-[11px] text-slate-300 font-semibold">{copied ? 'Copied!' : 'Copy Link'}</span>
				</button>
			</div>

			<!-- Page Link Input Box -->
			<div class="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
				<div class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Direct Page Link</div>
				<div class="flex items-center gap-2">
					<input
						type="text"
						readonly
						value={getShareUrl()}
						class="w-full bg-transparent text-xs text-slate-200 focus:outline-none truncate font-mono"
					/>
					<button
						type="button"
						onclick={copyToClipboard}
						class="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shrink-0 transition-colors shadow"
					>
						{copied ? 'Copied! ✓' : 'Copy'}
					</button>
				</div>
			</div>

			<div class="flex justify-end pt-2">
				<button
					type="button"
					onclick={() => (showShareModal = false)}
					class="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-colors"
				>
					Close
				</button>
			</div>
		</div>
	</div>
{/if}
