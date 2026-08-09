<script lang="ts">
	let { data, form } = $props();

	let postContent = $state('');
	let postImageFile = $state<File | null>(null);
	let postImageUrl = $state('');
	let isUploadingImage = $state(false);
	let activeCommentPostId = $state<string | null>(null);
	let commentTexts = $state<{ [key: string]: string }>({});
	let reshareModalPostId = $state<string | null>(null);
	let reshareCommentary = $state('');

	async function handleImageUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			const file = target.files[0];
			isUploadingImage = true;
			const body = new FormData();
			body.append('file', file);
			try {
				const res = await fetch('/api/upload', {
					method: 'POST',
					body
				});
				const json = (await res.json()) as { url?: string };
				if (json.url) {
					postImageUrl = json.url;
				}
			} catch (err) {
				console.error('Image upload failed', err);
			} finally {
				isUploadingImage = false;
			}
		}
	}

	function resetPostForm() {
		postContent = '';
		postImageUrl = '';
		postImageFile = null;
	}
</script>

<svelte:head>
	<title>Community Feed - CANFACS</title>
</svelte:head>

<section class="py-10 bg-slate-950 min-h-screen">
	<div class="max-w-4xl mx-auto px-4 sm:px-6">
		<!-- Header -->
		<div class="flex items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
			<div>
				<span class="px-3 py-1 text-xs uppercase tracking-wider font-bold text-red-400 bg-red-500/10 rounded-full border border-red-500/20">
					Member Network
				</span>
				<h1 class="text-3xl font-extrabold text-white mt-2">CANFACS Community Feed</h1>
				<p class="text-slate-400 text-xs mt-1">
					Share updates, photos, ideas, and collaborate with members across Canada.
				</p>
			</div>

			<div class="hidden sm:flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-2xl border border-slate-800 text-xs">
				<span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
				<span class="text-slate-300 font-semibold">Logged in as {data.user.fullName}</span>
			</div>
		</div>

		<!-- Create Post Card -->
		<div class="glass-card p-6 rounded-3xl mb-8 border border-slate-800 shadow-xl relative">
			<div class="flex items-start gap-4">
				<div class="w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 to-blue-600 text-white font-bold text-lg flex items-center justify-center flex-shrink-0 shadow-lg">
					{data.user.fullName.charAt(0)}
				</div>

				<div class="flex-1">
					<form method="POST" action="?/createPost" onsubmit={() => setTimeout(resetPostForm, 300)}>
						<input type="hidden" name="imageUrl" value={postImageUrl} />

						<textarea
							name="content"
							bind:value={postContent}
							rows="3"
							required
							placeholder="What's on your mind? Share an update or story with the society..."
							class="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500 transition-colors resize-none"
						></textarea>

						<!-- Image Upload Preview -->
						{#if postImageUrl}
							<div class="relative mt-3 inline-block">
								<img
									src={postImageUrl}
									alt="Attachment preview"
									class="max-h-48 rounded-2xl object-cover border border-slate-700 shadow-md"
								/>
								<button
									type="button"
									onclick={() => (postImageUrl = '')}
									class="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shadow-lg"
								>
									✕
								</button>
							</div>
						{/if}

						<div class="flex items-center justify-between pt-4 mt-3 border-t border-slate-800/80">
							<label class="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all">
								<span>📷 Attach Photo</span>
								<input type="file" accept="image/*" class="hidden" onchange={handleImageUpload} />
							</label>

							{#if isUploadingImage}
								<span class="text-xs text-amber-400 font-semibold animate-pulse">Uploading image...</span>
							{/if}

							<button
								type="submit"
								disabled={!postContent.trim()}
								class="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-md shadow-red-600/30 transition-all disabled:opacity-40"
							>
								Publish Post 🚀
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>

		<!-- Feed Posts List -->
		{#if data.posts.length === 0}
			<div class="glass-card p-12 rounded-3xl text-center border border-slate-800">
				<p class="text-slate-400 text-sm">No community posts yet. Be the first to share an update!</p>
			</div>
		{:else}
			<div class="space-y-6">
				{#each data.posts as post}
					<div class="glass-card p-6 rounded-3xl border border-slate-800/90 shadow-lg hover:border-slate-700/80 transition-all">
						<!-- Post Header -->
						<div class="flex items-center justify-between mb-4">
							<div class="flex items-center gap-3">
								<div class="w-11 h-11 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700 text-white font-bold flex items-center justify-center text-sm shadow-md">
									{post.author_name.charAt(0)}
								</div>
								<div>
									<h4 class="font-bold text-white text-sm leading-snug">{post.author_name}</h4>
									{#if post.author_profession}
										<p class="text-[11px] text-slate-400">{post.author_profession}</p>
									{/if}
								</div>
							</div>
							<span class="text-[10px] font-mono text-slate-500">
								{new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
							</span>
						</div>

						<!-- Post Body -->
						<p class="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap mb-4">
							{post.content}
						</p>

						<!-- Attached Image -->
						{#if post.image_url}
							<div class="mb-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
								<img
									src={post.image_url}
									alt="Post attachment"
									class="w-full max-h-96 object-cover hover:scale-102 transition-transform duration-300"
								/>
							</div>
						{/if}

						<!-- Engagement Stats -->
						<div class="flex items-center justify-between text-xs text-slate-400 pt-3 pb-3 border-t border-slate-800/80 mb-2">
							<span>❤️ {post.like_count} Likes</span>
							<span>💬 {post.comments.length} Comments</span>
						</div>

						<!-- Actions Bar -->
						<div class="grid grid-cols-3 gap-2 border-t border-b border-slate-800/80 py-1.5 mb-4">
							<!-- Like Button -->
							<form method="POST" action="?/toggleLike" class="w-full">
								<input type="hidden" name="postId" value={post.id} />
								<button
									type="submit"
									class="w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors {post.user_liked ? 'text-red-400 bg-red-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-900'}"
								>
									<span>{post.user_liked ? '❤️ Liked' : '🤍 Like'}</span>
								</button>
							</form>

							<!-- Comment Toggle Button -->
							<button
								type="button"
								onclick={() => (activeCommentPostId = activeCommentPostId === post.id ? null : post.id)}
								class="w-full py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 flex items-center justify-center gap-1.5 transition-colors"
							>
								<span>💬 Comment</span>
							</button>

							<!-- Reshare Button -->
							<button
								type="button"
								onclick={() => (reshareModalPostId = post.id)}
								class="w-full py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 flex items-center justify-center gap-1.5 transition-colors"
							>
								<span>🔄 Reshare</span>
							</button>
						</div>

						<!-- Comments Section -->
						{#if activeCommentPostId === post.id || post.comments.length > 0}
							<div class="space-y-3 pt-2">
								{#each post.comments as comment}
									<div class="flex items-start gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/60">
										<div class="w-8 h-8 rounded-full bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
											{comment.author_name.charAt(0)}
										</div>
										<div class="flex-1">
											<div class="flex items-center justify-between">
												<span class="font-bold text-xs text-white">{comment.author_name}</span>
												<span class="text-[9px] text-slate-500">{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
											</div>
											<p class="text-xs text-slate-300 mt-1 leading-normal">{comment.content}</p>
											{#if comment.image_url}
												<img src={comment.image_url} alt="Comment attachment" class="mt-2 max-h-36 rounded-xl object-cover" />
											{/if}
										</div>
									</div>
								{/each}

								<!-- Write Comment Input -->
								<form method="POST" action="?/addComment" class="flex gap-2 mt-3">
									<input type="hidden" name="postId" value={post.id} />
									<input
										type="text"
										name="content"
										required
										placeholder="Write a comment..."
										class="flex-1 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-red-500"
									/>
									<button
										type="submit"
										class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors"
									>
										Reply
									</button>
								</form>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>

<!-- Reshare Post Modal -->
{#if reshareModalPostId}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
		<div class="glass-card p-6 rounded-3xl max-w-md w-full border border-slate-800 shadow-2xl space-y-4">
			<h3 class="text-lg font-bold text-white">🔄 Reshare Post to Feed</h3>
			<p class="text-xs text-slate-400">Add an optional commentary before resharing with the community:</p>

			<form method="POST" action="?/reshare" onsubmit={() => (reshareModalPostId = null)}>
				<input type="hidden" name="originalPostId" value={reshareModalPostId} />
				<textarea
					name="commentary"
					bind:value={reshareCommentary}
					rows="3"
					placeholder="What do you think about this post?"
					class="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-red-500 resize-none mb-4"
				></textarea>

				<div class="flex justify-end gap-3">
					<button
						type="button"
						onclick={() => (reshareModalPostId = null)}
						class="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md"
					>
						Reshare Now
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
