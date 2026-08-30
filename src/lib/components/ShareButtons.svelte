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

	function getShareText(): string {
		return `${title}\n\n${description}`;
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
				// User cancelled or share failed, fallback to modal
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

	// Share endpoints
	const shareLinks = $derived.by(() => {
		const shareUrl = encodeURIComponent(getShareUrl());
		const shareTitle = encodeURIComponent(title);
		const shareDesc = encodeURIComponent(description);
		const fullText = encodeURIComponent(`${title} - ${description}\n\n${getShareUrl()}`);

		return {
			whatsapp: `https://api.whatsapp.com/send?text=${fullText}`,
			facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareTitle}`,
			twitter: `https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}&hashtags=CANFACS,NepalRelief,CanadaNepal`,
			linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
			messenger: `https://www.facebook.com/dialog/send?link=${shareUrl}&app_id=291494419107518&redirect_uri=${shareUrl}`,
			email: `mailto:?subject=${shareTitle}&body=${shareDesc}%0D%0A%0D%0ALearn more and contribute at: ${shareUrl}`
		};
	});
</script>

{#if variant === 'card'}
	<!-- Rich Card Variant (Great for Sidebars or Campaign Highlights) -->
	<div class="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
		<div class="flex items-center gap-3">
			<div class="w-10 h-10 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-400 flex items-center justify-center text-lg">
				📢
			</div>
			<div>
				<h3 class="text-sm font-extrabold text-white">Share This Initiative</h3>
				<p class="text-xs text-slate-400">Amplify our impact by sharing with your community & friends.</p>
			</div>
		</div>

		<div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
			<!-- WhatsApp -->
			<a
				href={shareLinks.whatsapp}
				target="_blank"
				rel="noopener noreferrer"
				class="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/40 text-emerald-400 hover:text-emerald-300 transition-all text-xs font-semibold group shadow"
				title="Share on WhatsApp"
			>
				<span class="text-lg group-hover:scale-110 transition-transform">💬</span>
				<span class="text-[10px] mt-1">WhatsApp</span>
			</a>

			<!-- Facebook -->
			<a
				href={shareLinks.facebook}
				target="_blank"
				rel="noopener noreferrer"
				class="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-blue-950/50 hover:bg-blue-900/60 border border-blue-800/40 text-blue-400 hover:text-blue-300 transition-all text-xs font-semibold group shadow"
				title="Share on Facebook"
			>
				<span class="text-lg group-hover:scale-110 transition-transform">📘</span>
				<span class="text-[10px] mt-1">Facebook</span>
			</a>

			<!-- X / Twitter -->
			<a
				href={shareLinks.twitter}
				target="_blank"
				rel="noopener noreferrer"
				class="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white transition-all text-xs font-semibold group shadow"
				title="Share on X"
			>
				<span class="text-lg group-hover:scale-110 transition-transform">𝕏</span>
				<span class="text-[10px] mt-1">Post</span>
			</a>

			<!-- LinkedIn -->
			<a
				href={shareLinks.linkedin}
				target="_blank"
				rel="noopener noreferrer"
				class="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-sky-950/50 hover:bg-sky-900/60 border border-sky-800/40 text-sky-400 hover:text-sky-300 transition-all text-xs font-semibold group shadow"
				title="Share on LinkedIn"
			>
				<span class="text-lg group-hover:scale-110 transition-transform">💼</span>
				<span class="text-[10px] mt-1">LinkedIn</span>
			</a>

			<!-- Email -->
			<a
				href={shareLinks.email}
				class="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-amber-950/50 hover:bg-amber-900/60 border border-amber-800/40 text-amber-400 hover:text-amber-300 transition-all text-xs font-semibold group shadow"
				title="Share via Email"
			>
				<span class="text-lg group-hover:scale-110 transition-transform">✉️</span>
				<span class="text-[10px] mt-1">Email</span>
			</a>

			<!-- Copy Link -->
			<button
				type="button"
				onclick={copyToClipboard}
				class="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all text-xs font-semibold group shadow"
				title="Copy link to clipboard"
			>
				<span class="text-lg group-hover:scale-110 transition-transform">📋</span>
				<span class="text-[10px] mt-1">{copied ? 'Copied!' : 'Copy'}</span>
			</button>
		</div>

		<!-- Native Mobile Share Button -->
		<button
			type="button"
			onclick={handleNativeShare}
			class="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-all flex items-center justify-center gap-2"
		>
			<span>📱 More Sharing Options (Instagram, Messenger, Messages...)</span>
		</button>
	</div>

{:else if variant === 'compact'}
	<!-- Compact Horizontal Pill Group -->
	<div class="inline-flex items-center gap-1.5 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-md text-xs">
		<button
			type="button"
			onclick={handleNativeShare}
			class="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all flex items-center gap-1.5 shadow"
			title="Share this page"
		>
			<span>📢</span>
			<span>Share</span>
		</button>

		<a
			href={shareLinks.whatsapp}
			target="_blank"
			rel="noopener noreferrer"
			class="p-2 rounded-xl text-emerald-400 hover:bg-emerald-950/60 transition-colors"
			title="Share on WhatsApp"
		>
			💬
		</a>

		<a
			href={shareLinks.facebook}
			target="_blank"
			rel="noopener noreferrer"
			class="p-2 rounded-xl text-blue-400 hover:bg-blue-950/60 transition-colors"
			title="Share on Facebook"
		>
			📘
		</a>

		<a
			href={shareLinks.twitter}
			target="_blank"
			rel="noopener noreferrer"
			class="p-2 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors"
			title="Share on X"
		>
			𝕏
		</a>

		<button
			type="button"
			onclick={copyToClipboard}
			class="px-2.5 py-1.5 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors font-semibold flex items-center gap-1"
			title="Copy page link"
		>
			<span>📋</span>
			<span>{copied ? 'Copied! ✓' : 'Copy'}</span>
		</button>
	</div>

{:else}
	<!-- Standard Banner / Floating Bar Variant -->
	<div class="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
		<div class="flex items-center gap-3">
			<span class="text-2xl">📢</span>
			<div>
				<div class="text-sm font-bold text-white">Help Spread the Word</div>
				<div class="text-xs text-slate-400">Share this page with friends, family, and community networks.</div>
			</div>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			<!-- WhatsApp -->
			<a
				href={shareLinks.whatsapp}
				target="_blank"
				rel="noopener noreferrer"
				class="px-3 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-400 hover:text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5"
			>
				<span>💬</span>
				<span>WhatsApp</span>
			</a>

			<!-- Facebook -->
			<a
				href={shareLinks.facebook}
				target="_blank"
				rel="noopener noreferrer"
				class="px-3 py-2 rounded-xl bg-blue-950/60 hover:bg-blue-900 border border-blue-800/60 text-blue-400 hover:text-blue-300 text-xs font-bold transition-all flex items-center gap-1.5"
			>
				<span>📘</span>
				<span>Facebook</span>
			</a>

			<!-- X (Twitter) -->
			<a
				href={shareLinks.twitter}
				target="_blank"
				rel="noopener noreferrer"
				class="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
			>
				<span>𝕏</span>
				<span>Post</span>
			</a>

			<!-- LinkedIn -->
			<a
				href={shareLinks.linkedin}
				target="_blank"
				rel="noopener noreferrer"
				class="px-3 py-2 rounded-xl bg-sky-950/60 hover:bg-sky-900 border border-sky-800/60 text-sky-400 hover:text-sky-300 text-xs font-bold transition-all flex items-center gap-1.5"
			>
				<span>💼</span>
				<span>LinkedIn</span>
			</a>

			<!-- Email -->
			<a
				href={shareLinks.email}
				class="px-3 py-2 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-800/60 text-amber-400 hover:text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5"
			>
				<span>✉️</span>
				<span>Email</span>
			</a>

			<!-- Copy Link Button -->
			<button
				type="button"
				onclick={copyToClipboard}
				class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
			>
				<span>📋</span>
				<span>{copied ? 'Copied! ✓' : 'Copy Link'}</span>
			</button>

			<!-- Mobile Native Share Button -->
			<button
				type="button"
				onclick={handleNativeShare}
				class="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow flex items-center gap-1.5"
			>
				<span>📱</span>
				<span>All Options</span>
			</button>
		</div>
	</div>
{/if}

<!-- Social Sharing Modal Popup (Fallback / More Options) -->
{#if showShareModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
		<div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
			<div class="flex items-center justify-between border-b border-slate-800 pb-4">
				<div class="flex items-center gap-2">
					<span class="text-xl">📢</span>
					<h3 class="text-lg font-bold text-white">Share this Page</h3>
				</div>
				<button type="button" onclick={() => (showShareModal = false)} class="text-slate-400 hover:text-white text-lg">✕</button>
			</div>

			<p class="text-xs text-slate-300 leading-relaxed">
				Share <strong>"{title}"</strong> across your social networks and messaging apps:
			</p>

			<div class="grid grid-cols-2 gap-3 text-xs font-bold">
				<a
					href={shareLinks.whatsapp}
					target="_blank"
					rel="noopener noreferrer"
					class="p-3 rounded-2xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 flex items-center gap-2.5 transition-all shadow"
				>
					<span class="text-xl">💬</span>
					<span>WhatsApp</span>
				</a>

				<a
					href={shareLinks.facebook}
					target="_blank"
					rel="noopener noreferrer"
					class="p-3 rounded-2xl bg-blue-950/70 hover:bg-blue-900 border border-blue-800 text-blue-300 flex items-center gap-2.5 transition-all shadow"
				>
					<span class="text-xl">📘</span>
					<span>Facebook</span>
				</a>

				<a
					href={shareLinks.messenger}
					target="_blank"
					rel="noopener noreferrer"
					class="p-3 rounded-2xl bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-800 text-indigo-300 flex items-center gap-2.5 transition-all shadow"
				>
					<span class="text-xl">⚡</span>
					<span>Messenger</span>
				</a>

				<a
					href={shareLinks.twitter}
					target="_blank"
					rel="noopener noreferrer"
					class="p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-white flex items-center gap-2.5 transition-all shadow"
				>
					<span class="text-xl">𝕏</span>
					<span>X (Twitter)</span>
				</a>

				<a
					href={shareLinks.linkedin}
					target="_blank"
					rel="noopener noreferrer"
					class="p-3 rounded-2xl bg-sky-950/70 hover:bg-sky-900 border border-sky-800 text-sky-300 flex items-center gap-2.5 transition-all shadow"
				>
					<span class="text-xl">💼</span>
					<span>LinkedIn</span>
				</a>

				<a
					href={shareLinks.email}
					class="p-3 rounded-2xl bg-amber-950/70 hover:bg-amber-900 border border-amber-800 text-amber-300 flex items-center gap-2.5 transition-all shadow"
				>
					<span class="text-xl">✉️</span>
					<span>Email Link</span>
				</a>
			</div>

			<!-- Copy URL Box -->
			<div class="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
				<div class="text-[11px] text-slate-400 font-semibold">Page Link</div>
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
					class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
				>
					Close
				</button>
			</div>
		</div>
	</div>
{/if}
