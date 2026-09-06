<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let editingId = $state<string | null>(null);
	let templateName = $state('');
	let templateDesc = $state('');
	let subjectDefault = $state('');
	let htmlContent = $state('');
	let previewDevice = $state<'desktop' | 'mobile'>('desktop');
	let isUploadingImage = $state(false);
	let uploadedImageUrl = $state('');
	let uploadError = $state('');
	let copiedPlaceholder = $state('');

	// Initialize editingId once or on change
	$effect(() => {
		if (editingId === null && data.templates.length > 0) {
			editingId = data.editId || data.templates[0].id;
		}
	});

	// Sync fields when selected template changes
	$effect(() => {
		if (editingId) {
			const found = data.templates.find((t: any) => t.id === editingId);
			if (found) {
				templateName = found.name;
				templateDesc = found.description || '';
				subjectDefault = found.subject_default || '';
				htmlContent = found.html_content || '';
			}
		} else {
			// New template
			templateName = '';
			templateDesc = '';
			subjectDefault = '';
			htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; background-color: #0f172a; color: #f8fafc; padding: 20px; }
    .card { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <h1 style="color: #ffffff;">CANFACS</h1>
    {{content}}
    <footer style="margin-top: 24px; font-size: 12px; color: #94a3b8;">
      Canada-Nepal Friendship & Cultural Society • info@canfacs.org
    </footer>
  </div>
</body>
</html>`;
		}
	});

	function startNewTemplate() {
		editingId = null;
		templateName = 'New CANFACS Custom Template';
		templateDesc = 'Custom HTML layout for society communications';
		subjectDefault = '';
	}

	async function handleImageUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		isUploadingImage = true;
		uploadError = '';
		uploadedImageUrl = '';

		try {
			const formData = new FormData();
			formData.append('file', file);
			const res = await fetch('/api/upload', {
				method: 'POST',
				body: formData
			});

			const json: any = await res.json();
			if (!res.ok || json.error) {
				uploadError = json.error || 'Failed to upload image to R2 storage.';
			} else {
				const url = String(json.url || '');
				uploadedImageUrl = url.startsWith('http') ? url : `https://canfacs.org${url}`;
			}
		} catch (err: any) {
			uploadError = err.message || 'Error uploading file.';
		} finally {
			isUploadingImage = false;
		}
	}

	function insertIntoHtml(text: string) {
		htmlContent = htmlContent + '\n' + text;
	}

	function copyTag(tag: string) {
		navigator.clipboard.writeText(tag);
		copiedPlaceholder = tag;
		setTimeout(() => (copiedPlaceholder = ''), 2000);
	}
</script>

<svelte:head>
	<title>Standard Email Templates & R2 Storage - CANFACS Admin</title>
</svelte:head>

<section class="py-10 bg-slate-950 min-h-screen text-slate-100">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
		<!-- Navigation Breadcrumb -->
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
			<div>
				<div class="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
					<a href="/admin/emails" class="hover:text-red-400 transition-colors">✉️ Email Dispatcher</a>
					<span>/</span>
					<span class="text-red-400">Standard Branded Templates</span>
				</div>
				<h1 class="text-3xl font-extrabold text-white">CANFACS Branded HTML Templates</h1>
				<p class="text-slate-400 text-sm mt-1">
					Design, manage, and store society master email templates with embedded images stored in Cloudflare R2.
				</p>
			</div>

			<div class="flex items-center gap-3">
				<a
					href="/admin/emails"
					class="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5"
				>
					<span>←</span>
					<span>Back to Dispatcher</span>
				</a>
				<button
					onclick={startNewTemplate}
					class="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-xs font-bold text-white shadow-lg shadow-red-600/30 transition-all flex items-center gap-1.5"
				>
					<span>✨</span>
					<span>Create New Template</span>
				</button>
			</div>
		</div>

		<!-- Status notification -->
		{#if form?.message}
			<div class="p-4 rounded-xl {form?.success ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' : 'bg-red-950/80 border-red-500/50 text-red-300'} border text-xs flex items-center justify-between shadow-lg">
				<span>{form?.success ? '✅' : '⚠️'} {form.message || form.error}</span>
			</div>
		{/if}

		<!-- Grid Layout -->
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
			<!-- Sidebar: Template list -->
			<div class="lg:col-span-4 space-y-4">
				<div class="flex items-center justify-between">
					<h2 class="text-sm font-bold uppercase tracking-wider text-slate-400">Available Templates</h2>
					<span class="text-xs text-slate-500">{data.templates.length} stored</span>
				</div>

				<div class="space-y-3">
					{#each data.templates as tmpl}
						<div
							class="p-4 rounded-2xl border transition-all cursor-pointer {editingId === tmpl.id
								? 'bg-slate-900 border-red-500/80 shadow-lg shadow-red-900/20'
								: 'bg-slate-900/60 border-slate-800 hover:border-slate-700'}"
							role="button"
							tabindex="0"
							onclick={() => (editingId = tmpl.id)}
							onkeydown={(e) => { if (e.key === 'Enter') editingId = tmpl.id; }}
						>
							<div class="flex items-start justify-between gap-2">
								<h3 class="font-bold text-sm text-white">{tmpl.name}</h3>
								{#if tmpl.r2_key}
									<span class="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800/60">
										R2 Synced
									</span>
								{/if}
							</div>
							<p class="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
								{tmpl.description || 'Standard CANFACS society communication layout.'}
							</p>
							{#if tmpl.subject_default}
								<div class="mt-2 text-[11px] text-slate-500 font-mono truncate">
									Default: "{tmpl.subject_default}"
								</div>
							{/if}
						</div>
					{/each}
				</div>

				<!-- Placeholders Guide Box -->
				<div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
					<h3 class="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
						<span>🏷️</span>
						<span>Template Placeholders</span>
					</h3>
					<p class="text-xs text-slate-400 leading-relaxed">
						Ensure your master template contains <code class="text-amber-300 bg-slate-950 px-1.5 py-0.5 rounded">{'{{content}}'}</code> where dynamic email text is placed. Click any tag to copy:
					</p>
					<div class="flex flex-wrap gap-1.5">
						{#each ['{{content}}', '{{name}}', '{{email}}', '{{city}}', '{{province}}', '{{role}}'] as tag}
							<button
								type="button"
								onclick={() => copyTag(tag)}
								class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-200 border border-slate-700 hover:border-red-500/50 transition-all flex items-center gap-1"
							>
								<span>{tag}</span>
								{#if copiedPlaceholder === tag}
									<span class="text-emerald-400 text-[9px]">✓</span>
								{/if}
							</button>
						{/each}
					</div>
				</div>

				<!-- Cloudflare R2 Image Uploader -->
				<div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
					<h3 class="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
						<span>☁️</span>
						<span>R2 Bucket Image Uploader</span>
					</h3>
					<p class="text-xs text-slate-400 leading-relaxed">
						Upload banners, logos, or event photos to Cloudflare R2 to embed in your templates.
					</p>

					<label class="block">
						<span class="sr-only">Choose File</span>
						<input
							type="file"
							accept="image/*"
							onchange={handleImageUpload}
							disabled={isUploadingImage}
							class="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
						/>
					</label>

					{#if isUploadingImage}
						<div class="text-xs text-blue-400 flex items-center gap-2">
							<span class="animate-spin">⏳</span>
							<span>Uploading to Cloudflare R2...</span>
						</div>
					{/if}

					{#if uploadError}
						<div class="text-xs text-red-400 bg-red-950/50 p-2 rounded border border-red-900">
							{uploadError}
						</div>
					{/if}

					{#if uploadedImageUrl}
						<div class="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
							<img src={uploadedImageUrl} alt="Uploaded preview" class="w-full max-h-32 object-cover rounded-lg border border-slate-800" />
							<div class="text-[11px] font-mono text-slate-300 break-all">{uploadedImageUrl}</div>
							<button
								type="button"
								onclick={() => insertIntoHtml(`<div style="text-align: center; margin: 20px 0;"><img src="${uploadedImageUrl}" alt="CANFACS Banner" style="max-width: 100%; border-radius: 12px; border: 1px solid #334155;" /></div>`)}
								class="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors"
							>
								➕ Insert Image &lt;img&gt; into HTML
							</button>
						</div>
					{/if}
				</div>
			</div>

			<!-- Editor & Live Preview Column -->
			<div class="lg:col-span-8 space-y-6">
				<form method="POST" action="?/saveTemplate" use:enhance class="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-2xl">
					<input type="hidden" name="id" value={editingId || ''} />

					<div class="flex items-center justify-between border-b border-slate-800 pb-4">
						<div>
							<h2 class="text-lg font-bold text-white">
								{editingId ? 'Edit Master Template' : 'Create New Branded Template'}
							</h2>
							<p class="text-xs text-slate-400">
								Stored in Cloudflare R2 bucket with automated D1 synchronization.
							</p>
						</div>

						<div class="flex items-center gap-3">
							{#if editingId}
								<button
									type="submit"
									form="deleteTemplateForm"
									onclick={(e) => { if (!confirm('Are you sure you want to remove this template?')) e.preventDefault(); }}
									class="px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 text-xs font-semibold border border-red-800/60 transition-all"
								>
									Delete
								</button>
							{/if}
							<button
								type="submit"
								class="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all flex items-center gap-1.5"
							>
								<span>💾</span>
								<span>Save to R2 & Database</span>
							</button>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="templateName" class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
								Template Name
							</label>
							<input
								id="templateName"
								type="text"
								name="name"
								bind:value={templateName}
								required
								placeholder="e.g. 🍁 Annual Gala Invitation"
								class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
							/>
						</div>

						<div>
							<label for="subjectDefault" class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
								Default Subject (Optional)
							</label>
							<input
								id="subjectDefault"
								type="text"
								name="subject_default"
								bind:value={subjectDefault}
								placeholder="e.g. Official Update from CANFACS"
								class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
							/>
						</div>
					</div>

					<div>
						<label for="templateDesc" class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
							Description & Purpose
						</label>
						<input
							id="templateDesc"
							type="text"
							name="description"
							bind:value={templateDesc}
							placeholder="Briefly describe when this template should be chosen..."
							class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-red-500 transition-colors"
						/>
					</div>

					<!-- HTML Source Code Editor -->
					<div>
						<div class="flex items-center justify-between mb-1.5">
							<label for="htmlContent" class="text-xs font-semibold uppercase tracking-wider text-slate-400">
								Master HTML Source Code
							</label>
							<span class="text-[11px] text-amber-400 font-mono">
								Requires <strong>{'{{content}}'}</strong> placeholder
							</span>
						</div>
						<textarea
							id="htmlContent"
							name="html_content"
							rows="14"
							bind:value={htmlContent}
							required
							class="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-red-500 transition-colors leading-relaxed"
						></textarea>
					</div>
				</form>

				{#if editingId}
					<form id="deleteTemplateForm" method="POST" action="?/deleteTemplate" use:enhance class="hidden">
						<input type="hidden" name="id" value={editingId} />
					</form>
				{/if}

				<!-- Live Preview Panel -->
				<div class="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
					<div class="flex items-center justify-between border-b border-slate-800 pb-3">
						<div class="flex items-center gap-2">
							<span class="text-xs font-bold uppercase tracking-wider text-slate-400">👀 Live Template Preview</span>
							<span class="text-[11px] text-slate-500">(Rendered with sample content)</span>
						</div>
						<div class="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
							<button
								type="button"
								onclick={() => (previewDevice = 'desktop')}
								class="px-2.5 py-1 text-xs rounded font-medium transition-colors {previewDevice === 'desktop' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}"
							>
								🖥️ Desktop
							</button>
							<button
								type="button"
								onclick={() => (previewDevice = 'mobile')}
								class="px-2.5 py-1 text-xs rounded font-medium transition-colors {previewDevice === 'mobile' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}"
							>
								📱 Mobile
							</button>
						</div>
					</div>

					<div class="flex justify-center bg-slate-950 p-4 rounded-2xl border border-slate-800 overflow-x-auto min-h-[350px]">
						<div class="{previewDevice === 'mobile' ? 'w-[375px]' : 'w-full max-w-2xl'} transition-all duration-300">
							<iframe
								title="Email Template Live Preview"
								srcdoc={htmlContent.replace(
									'{{content}}',
									`<div style="color: #cbd5e1; font-size: 15px; line-height: 1.6;">
										<h2 style="color: #ffffff; margin-top: 0;">Namaste <strong>Aarav Sharma</strong>,</h2>
										<p>This is an illustrative preview of the dynamic email body injected right into the <code>{{content}}</code> placeholder of this template.</p>
										<p>All styling, headers, custom images stored in R2, and social links render flawlessly across modern email clients.</p>
										<div style="text-align: center; margin: 20px 0;">
											<a href="https://canfacs.org" style="display: inline-block; background: #dc2626; color: #ffffff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">View Society Portal</a>
										</div>
									</div>`
								)}
								class="w-full h-[450px] rounded-xl border border-slate-800 bg-slate-950"
							></iframe>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
