<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	// Active tab
	let activeTab = $state<'compose' | 'audit' | 'recipients'>('compose');

	// Email Composition Form State
	let batchLabel = $state(`Announcement - ${new Date().toLocaleDateString('en-CA')}`);
	let selectedTemplateId = $state('');
	let fromEmail = $state(data.fromEmail || 'info@canfacs.org');
	let subject = $state('');
	// bodyText = what the user types (plain text)
	// bodyHtml = derived HTML for preview & sending
	let bodyText = $state('');
	let bodyHtml = $derived.by(() => {
		const t = bodyText.trim();
		if (!t) return '';
		// If already wrapped in block html tags, pass through
		if (/^<(p|div|h[1-6]|ul|ol|table|section)/i.test(t)) return t;
		// Convert plain paragraphs separated by double newlines
		return t
			.split(/\n{2,}/)
			.map(para => `<p style="margin:0 0 16px;line-height:1.7;">${para.replace(/\n/g, '<br />')}</p>`)
			.join('\n');
	});
	let aiDraftLoaded = $state(false); // true after AI fills the editor

	// Initialize props into state
	$effect(() => {
		if (!selectedTemplateId && data.templates?.[0]?.id) {
			selectedTemplateId = data.templates[0].id;
		}
		if (data.adminEmail) {
			testRecipientEmail = data.adminEmail;
		}
		if (data.inspectBatchId && !activeBatchId) {
			activeBatchId = data.inspectBatchId;
		}
	});

	// Gemini Prompt State
	let geminiPrompt = $state('');
	let geminiTone = $state<'formal' | 'warm' | 'urgent' | 'celebratory'>('warm');
	let geminiAudience = $state<'members' | 'donors' | 'public' | 'executive'>('members');
	let isGeneratingAi = $state(false);
	let aiSummary = $state('');
	let suggestedPlaceholders = $state<Array<{ token: string; label: string; example: string }>>([
		{ token: '{{salutation}}', label: 'Salutation', example: 'Dr.' },
		{ token: '{{name}}', label: 'Recipient Name', example: 'Aarav Sharma' },
		{ token: '{{organizational_role}}', label: 'Org Role', example: 'Vice President' },
		{ token: '{{role}}', label: 'Society Role', example: 'BOD Member' },
		{ token: '{{email}}', label: 'Email', example: 'member@example.com' },
		{ token: '{{phone}}', label: 'Phone', example: '604-555-0199' },
		{ token: '{{address_street}}', label: 'Street', example: '123 Robson St' },
		{ token: '{{city}}', label: 'City', example: 'Vancouver' },
		{ token: '{{province}}', label: 'Province', example: 'BC' },
		{ token: '{{country}}', label: 'Country', example: 'Canada' },
		{ token: '{{associated_organizations}}', label: 'Associated Org', example: 'NRN Canada' }
	]);

	// Recipients state
	let recipientsRaw = $state('');
	let recipientViewMode = $state<'table' | 'cards' | 'raw'>('table');
	let testRecipientEmail = $state('info@canfacs.org');
	let sendingTest = $state(false);
	let sendingBatch = $state(false);
	let previewDevice = $state<'desktop' | 'mobile'>('desktop');
	let showConfirmationModal = $state(false);
	let copiedTag = $state('');

	// Add Recipient manually dialog state
	let showAddRecipientDialog = $state(false);
	let manualName = $state('');
	let manualEmail = $state('');
	let manualSalutation = $state('');
	let manualOrg = $state('');

	function addRecipientManually() {
		if (!manualEmail || !manualEmail.includes('@')) return;
		const newEntry = {
			name: manualName.trim() || manualEmail.split('@')[0],
			salutation: manualSalutation.trim(),
			email: manualEmail.trim().toLowerCase(),
			associated_organizations: manualOrg.trim(),
			role: 'partner'
		};
		try {
			if (recipientsRaw.trim().startsWith('[')) {
				const existing = JSON.parse(recipientsRaw);
				existing.push(newEntry);
				recipientsRaw = JSON.stringify(existing, null, 2);
			} else {
				recipientsRaw = JSON.stringify([...parsedRecipientsList.map(r => ({ name: r.name, email: r.email, salutation: r.salutation, role: r.role })), newEntry], null, 2);
			}
		} catch {
			recipientsRaw = JSON.stringify([newEntry], null, 2);
		}
		manualName = '';
		manualEmail = '';
		manualSalutation = '';
		manualOrg = '';
		showAddRecipientDialog = false;
	}

	// Selected audit batch for log review
	let activeBatchId = $state<string | null>(null);

	// Pre-fill recipient text by role with full metadata
	function importAllMembers() {
		const expanded: any[] = [];
		for (const m of data.members) {
			expanded.push(m);
			if (m.phone_secondary && m.phone_secondary.includes('@')) {
				expanded.push({
					...m,
					id: `${m.id}_alt`,
					email: m.phone_secondary,
					is_secondary: true
				});
			}
		}
		recipientsRaw = JSON.stringify(expanded, null, 2);
	}

	function importByRole(targetRole: string) {
		const filtered = data.members.filter((m: any) => m.role === targetRole);
		const expanded: any[] = [];
		for (const m of filtered) {
			expanded.push(m);
			if (m.phone_secondary && m.phone_secondary.includes('@')) {
				expanded.push({
					...m,
					id: `${m.id}_alt`,
					email: m.phone_secondary,
					is_secondary: true
				});
			}
		}
		recipientsRaw = JSON.stringify(expanded, null, 2);
	}

	function importByOrgCategory(category: string) {
		const filtered = data.members.filter((m: any) => m.org_category === category);
		const expanded: any[] = [];
		for (const m of filtered) {
			expanded.push(m);
			if (m.phone_secondary && m.phone_secondary.includes('@')) {
				expanded.push({
					...m,
					id: `${m.id}_alt`,
					email: m.phone_secondary,
					is_secondary: true
				});
			}
		}
		recipientsRaw = JSON.stringify(expanded, null, 2);
	}

	function importByOrgRoleId(roleId: string) {
		const filtered = data.members.filter((m: any) => m.org_role_id === roleId);
		const expanded: any[] = [];
		for (const m of filtered) {
			expanded.push(m);
			if (m.phone_secondary && m.phone_secondary.includes('@')) {
				expanded.push({
					...m,
					id: `${m.id}_alt`,
					email: m.phone_secondary,
					is_secondary: true
				});
			}
		}
		recipientsRaw = JSON.stringify(expanded, null, 2);
	}

	// Filter strictly for formal MOU Partners
	function importMOUOrganizations() {
		const filtered = data.members.filter(
			(m: any) =>
				m.associated_organizations?.toLowerCase().includes('mou') ||
				m.organizational_role?.toLowerCase().includes('mou')
		);
		const expanded: any[] = [];
		for (const m of filtered) {
			expanded.push(m);
			if (m.phone_secondary && m.phone_secondary.includes('@')) {
				expanded.push({
					...m,
					id: `${m.id}_alt`,
					email: m.phone_secondary,
					is_secondary: true
				});
			}
		}
		recipientsRaw = JSON.stringify(expanded, null, 2);
	}

	// Filter for all external partner and affiliated organizations
	function importAllOrganizations() {
		const filtered = data.members.filter(
			(m: any) =>
				(m.associated_organizations && m.associated_organizations.trim().length > 0) ||
				m.role === 'partner'
		);
		const expanded: any[] = [];
		for (const m of filtered) {
			expanded.push(m);
			if (m.phone_secondary && m.phone_secondary.includes('@')) {
				expanded.push({
					...m,
					id: `${m.id}_alt`,
					email: m.phone_secondary,
					is_secondary: true
				});
			}
		}
		recipientsRaw = JSON.stringify(expanded, null, 2);
	}

	function importDonors() {
		const list = data.donors.map((d: any) => `${d.name}, ${d.email}`).join('\n');
		recipientsRaw = list;
	}

	function addSampleAdmin() {
		recipientsRaw = `${data.adminEmail}\n${recipientsRaw}`.trim();
	}

	// Remove single recipient from active list
	function removeRecipient(emailToRemove: string) {
		try {
			if (recipientsRaw.trim().startsWith('[')) {
				const list = JSON.parse(recipientsRaw);
				const updated = list.filter((r: any) => r.email?.toLowerCase() !== emailToRemove.toLowerCase());
				recipientsRaw = JSON.stringify(updated, null, 2);
				return;
			}
		} catch (e) {}

		const lines = recipientsRaw.split('\n').filter((l) => !l.toLowerCase().includes(emailToRemove.toLowerCase()));
		recipientsRaw = lines.join('\n');
	}

	// Quick formatting toolbar helpers
	function applyFormatting(prefix: string, suffix = '') {
		const textarea = document.getElementById('bodyContent') as HTMLTextAreaElement | null;
		if (!textarea) {
			bodyText = `${bodyText}${prefix}${suffix}`;
			return;
		}

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selected = bodyText.substring(start, end);
		const before = bodyText.substring(0, start);
		const after = bodyText.substring(end);

		bodyText = `${before}${prefix}${selected || 'text'}${suffix}${after}`;
		setTimeout(() => {
			textarea.focus();
			textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4));
		}, 0);
	}

	// Preset AI prompts
	const AI_PRESETS = [
		{
			label: '🍁 Nepal Cultural Evening Invitation',
			prompt: 'Write an invitation to CANFACS members for our upcoming Nepal Cultural Evening and Community Dinner in Vancouver. Highlight cultural performances, authentic cuisine, bilateral friendship, and tickets info.',
			tone: 'celebratory' as const,
			audience: 'members' as const
		},
		{
			label: '🌊 Nepal Flood Relief Gratitude & Progress',
			prompt: 'Write a heartfelt thank you update to our donors regarding the Nepal Flood and Landslide Relief fund. Mention that our society has collected critical emergency aid and disbursed it through verified PMO channels.',
			tone: 'warm' as const,
			audience: 'donors' as const
		},
		{
			label: '🗳️ Annual General Meeting Notice',
			prompt: 'Draft an official notice for the CANFACS Annual General Meeting (AGM) and executive committee review. Include agenda highlights, voting procedures for active members, and virtual link instructions.',
			tone: 'formal' as const,
			audience: 'members' as const
		},
		{
			label: '🤝 Community Volunteer & Youth Callout',
			prompt: 'Draft a youth and volunteer engagement callout inviting community members in Canada to join our cultural programs, language workshops, and diaspora mentorship initiatives.',
			tone: 'warm' as const,
			audience: 'public' as const
		}
	];

	function applyAiPreset(preset: typeof AI_PRESETS[0]) {
		geminiPrompt = preset.prompt;
		geminiTone = preset.tone;
		geminiAudience = preset.audience;
	}

	// Insert placeholder token into active cursor / text
	function insertPlaceholder(token: string) {
		bodyText = bodyText ? `${bodyText} ${token}` : token;
		copiedTag = token;
		setTimeout(() => (copiedTag = ''), 2000);
	}

	// Watch AI response — AI produces HTML, strip to readable plain text for composer
	$effect(() => {
		if (form?.aiResult) {
			if (form.aiResult.subject) subject = form.aiResult.subject;
			if (form.aiResult.bodyHtml) {
				// Strip HTML tags, convert to plain text for the composer textarea
				bodyText = form.aiResult.bodyHtml
					.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
					.replace(/<br\s*\/?>/gi, '\n')
					.replace(/<\/p>/gi, '\n\n')
					.replace(/<\/h[1-6]>/gi, '\n\n')
					.replace(/<li[^>]*>/gi, '• ')
					.replace(/<[^>]+>/g, '')
					.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
					.replace(/\n{3,}/g, '\n\n')
					.trim();
				aiDraftLoaded = true;
			}
			// Merge AI suggestions into existing placeholders (don't replace defaults)
			if (form.aiResult.suggestedPlaceholders?.length) {
				const existingTokens = new Set(suggestedPlaceholders.map((p: any) => p.token));
				const newOnes = form.aiResult.suggestedPlaceholders.filter(
					(p: any) => !existingTokens.has(p.token)
				);
				if (newOnes.length) suggestedPlaceholders = [...suggestedPlaceholders, ...newOnes];
			}
			if (form.aiResult.summary) aiSummary = form.aiResult.summary;
		}
	});

	// Final HTML for preview and submission (bodyHtml is derived from bodyText)
	const finalBodyHtml = $derived(bodyHtml);

	// Derive parsed recipients list for non-technical users (table & cards)
	const parsedRecipientsList = $derived.by(() => {
		if (!recipientsRaw.trim()) return [];
		try {
			if (recipientsRaw.trim().startsWith('[')) {
				const list = JSON.parse(recipientsRaw);
				if (Array.isArray(list)) {
					return list
						.filter((r) => r && r.email && r.email.includes('@'))
						.map((r) => ({
							name: r.name || r.full_name || 'Member',
							salutation: r.salutation || '',
							email: r.email,
							role: r.role || '',
							org_role: r.organizational_role || r.org_role_title || '',
							city: r.city || '',
							province: r.province || ''
						}));
				}
			}
		} catch (e) {}

		// CSV / Line delimited fallback
		const lines = recipientsRaw.split('\n');
		const results: any[] = [];
		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed) continue;
			const angleMatch = trimmed.match(/^([^<]+)<([^>]+)>$/);
			if (angleMatch) {
				results.push({
					name: angleMatch[1].trim(),
					email: angleMatch[2].trim().toLowerCase()
				});
			} else if (trimmed.includes(',')) {
				const parts = trimmed.split(',').map((p) => p.trim());
				const emailIdx = parts.findIndex((p) => p.includes('@'));
				if (emailIdx !== -1) {
					results.push({
						name: parts[0] !== parts[emailIdx] ? parts[0] : 'Member',
						email: parts[emailIdx].toLowerCase(),
						city: parts[2] || '',
						province: parts[3] || ''
					});
				}
			} else if (trimmed.includes('@')) {
				results.push({
					name: trimmed.split('@')[0],
					email: trimmed.toLowerCase()
				});
			}
		}
		return results;
	});

	const parsedRecipientsCount = $derived(parsedRecipientsList.length);

	// Find active template
	const currentTemplate = $derived(
		data.templates.find((t: any) => t.id === selectedTemplateId)
	);

	// Render preview HTML
	const renderedPreviewHtml = $derived.by(() => {
		const sampleData = {
			salutation: 'Dr.',
			name: 'Aarav Sharma',
			email: 'aarav.sharma@example.ca',
			organizational_role: 'Vice President',
			role: 'BOD Member',
			phone: '604-555-0199',
			address_street: '123 Robson St',
			city: 'Vancouver',
			province: 'BC',
			country: 'Canada',
			associated_organizations: 'NRN Canada'
		};

		let rawContent = finalBodyHtml || `<p style="color: #94a3b8; font-style: italic;">Enter email body or use AI Generator to create draft...</p>`;
		
		// Interpolate sample data
		for (const [k, v] of Object.entries(sampleData)) {
			rawContent = rawContent.replaceAll(`{{${k}}}`, v);
		}

		// Convert plain text line breaks to paragraphs for preview if needed
		let content = rawContent;
		const hasBlockTags = /<(p|div|table|h[1-6]|ul|ol|blockquote)[^>]*>/i.test(rawContent.trim());
		if (!hasBlockTags && rawContent.trim()) {
			content = rawContent.trim()
				.split(/\n{2,}/)
				.map((p) => `<p style="margin: 0 0 16px; line-height: 1.6;">${p.replace(/\n/g, '<br />')}</p>`)
				.join('\n');
		}

		if (currentTemplate && currentTemplate.html_content) {
			return currentTemplate.html_content.replace('{{content}}', content);
		}
		return `<div style="font-family: sans-serif; padding: 20px; background: #0f172a; color: #f8fafc;">${content}</div>`;
	});

	// Find active batch for logs
	const selectedBatch = $derived(
		data.batches.find((b: any) => b.id === activeBatchId) || data.batches[0] || null
	);
</script>

<svelte:head>
	<title>Admin Email Dispatcher & AI Campaign Studio - CANFACS</title>
</svelte:head>

<section class="py-10 bg-slate-950 min-h-screen text-slate-100">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
		<!-- Top Bar Header -->
		<div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
			<div>
				<div class="flex items-center gap-2">
					<span class="px-3 py-1 text-xs uppercase tracking-wider font-bold text-red-400 bg-red-950/60 rounded-full border border-red-500/30 flex items-center gap-1.5">
						<span>✉️</span>
						<span>Admin Communications Dispatcher</span>
					</span>
					<span class="text-xs text-slate-500">•</span>
					<span class="text-xs text-slate-400 font-mono">Sender: {fromEmail}</span>
				</div>
				<h1 class="text-3xl font-extrabold text-white mt-2">CANFACS Email Broadcast & Dispatcher</h1>
				<p class="text-slate-400 text-sm mt-1">
					Send personalized communications from <code class="text-red-400 font-mono">info@canfacs.org</code> using standard branded templates, dynamic placeholders, and AI drafting.
				</p>
			</div>

			<!-- Quick Nav Actions -->
			<div class="flex items-center gap-3">
				<a
					href="/admin/emails/templates"
					class="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 hover:border-red-500/40 transition-all flex items-center gap-1.5 shadow-md"
				>
					<span>🎨</span>
					<span>Manage HTML Templates ({data.templates.length})</span>
				</a>
				<button
					onclick={() => (activeTab = activeTab === 'compose' ? 'audit' : 'compose')}
					class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all flex items-center gap-1.5"
				>
					<span>📋</span>
					<span>{activeTab === 'compose' ? 'View Delivery Audit Logs' : 'Back to Composer'}</span>
				</button>
			</div>
		</div>

		<!-- Notification Banner -->
		{#if form?.error}
			<div class="p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center justify-between shadow-xl">
				<div class="flex items-center gap-2">
					<span class="text-base">⚠️</span>
					<span>{form.error}</span>
				</div>
			</div>
		{/if}

		{#if form?.testSentTo}
			<div class="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between shadow-xl">
				<div class="flex items-center gap-2">
					<span class="text-base">🚀</span>
					<span>
						Test email successfully sent to <strong>{form.testSentTo}</strong>!
						{#if form.simulated}
							<span class="text-amber-300 ml-1">(Simulated locally in dev environment)</span>
						{/if}
					</span>
				</div>
			</div>
		{/if}

		{#if form?.batchCompleted}
			<div class="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/90 to-slate-900 border border-emerald-500/60 text-emerald-200 text-xs space-y-2 shadow-2xl">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2 font-bold text-sm text-emerald-300">
						<span>🎉</span>
						<span>Broadcast Batch Dispatched: "{form.batchLabel}"</span>
					</div>
					<span class="px-2.5 py-1 rounded-full bg-emerald-900/60 font-mono text-[11px] text-emerald-200 border border-emerald-700/50">
						ID: {form.batchId}
					</span>
				</div>
				<p class="text-slate-300">
					Successfully delivered to <strong>{form.successCount}</strong> / <strong>{form.totalRecipients}</strong> recipients
					{#if form.failureCount > 0}
						(<span class="text-red-400 font-bold">{form.failureCount} failed</span> - inspect audit logs for details).
					{:else}
						with 100% delivery success.
					{/if}
				</p>
			</div>
		{/if}

		<!-- Navigation Tabs -->
		<div class="flex items-center gap-2 border-b border-slate-800 pb-3">
			<button
				onclick={() => (activeTab = 'compose')}
				class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 {activeTab === 'compose'
					? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
					: 'text-slate-400 hover:text-white hover:bg-slate-900'}"
			>
				<span>✍️</span>
				<span>Compose & Dispatch Email</span>
			</button>
			<button
				onclick={() => (activeTab = 'audit')}
				class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 {activeTab === 'audit'
					? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
					: 'text-slate-400 hover:text-white hover:bg-slate-900'}"
			>
				<span>📊</span>
				<span>Batch Audit & Delivery Tracking</span>
				<span class="px-2 py-0.5 rounded-full text-[10px] bg-slate-950 text-slate-300">
					{data.batches.length}
				</span>
			</button>
		</div>

		<!-- TAB 1: COMPOSE & DISPATCH -->
		{#if activeTab === 'compose'}
			<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
				<!-- Left Column: AI Assistant & Controls -->
				<div class="lg:col-span-5 space-y-6">
					<!-- AI Generator Card -->
					<div class="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 space-y-4 shadow-xl">
						<div class="flex items-center justify-between border-b border-slate-800 pb-3">
							<div class="flex items-center gap-2">
								<span class="text-xl">✨</span>
								<h2 class="font-bold text-sm text-white">AI Generator</h2>
							</div>
							{#if data.hasGeminiKey}
								<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
									AI Connected
								</span>
							{:else}
								<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
									GEMINI_API_KEY Required
								</span>
							{/if}
						</div>

						<p class="text-xs text-slate-400 leading-relaxed">
							Provide instructions to generate high-impact subject lines, formatted body text, and suggested placeholders tailored for CANFACS.
						</p>

						<!-- Preset Prompts -->
						<div class="space-y-1.5">
							<span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Quick Suggestions:</span>
							<div class="flex flex-wrap gap-1.5">
								{#each AI_PRESETS as preset}
									<button
										type="button"
										onclick={() => applyAiPreset(preset)}
										class="px-2.5 py-1 rounded-lg text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-all truncate max-w-full text-left"
									>
										{preset.label}
									</button>
								{/each}
							</div>
						</div>

						<!-- AI Form -->
						<form
							method="POST"
							action="?/generateAi"
							use:enhance={() => {
								isGeneratingAi = true;
								return async ({ update }) => {
									await update();
									isGeneratingAi = false;
								};
							}}
							class="space-y-3"
						>
							<textarea
								name="prompt"
								rows="3"
								bind:value={geminiPrompt}
								placeholder="e.g. Write a warm invitation to all CANFACS members for the upcoming Nepal Day festival..."
								class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
								required
							></textarea>

							<div class="grid grid-cols-2 gap-3">
								<div>
									<label for="aiTone" class="block text-[10px] font-semibold uppercase text-slate-500 mb-1">Tone</label>
									<select
										id="aiTone"
										name="tone"
										bind:value={geminiTone}
										class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none"
									>
										<option value="warm">Warm & Welcoming</option>
										<option value="formal">Official & Formal</option>
										<option value="celebratory">Celebratory & Festive</option>
										<option value="urgent">Urgent Relief Appeal</option>
									</select>
								</div>
								<div>
									<label for="aiAudience" class="block text-[10px] font-semibold uppercase text-slate-500 mb-1">Target Audience</label>
									<select
										id="aiAudience"
										name="audience"
										bind:value={geminiAudience}
										class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none"
									>
										<option value="members">Active Society Members</option>
										<option value="donors">Relief Fund Donors</option>
										<option value="public">General Diaspora Community</option>
										<option value="executive">Board & Executive</option>
									</select>
								</div>
							</div>

							<button
								type="submit"
								disabled={isGeneratingAi}
								class="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-red-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
							>
								{#if isGeneratingAi}
									<span class="animate-spin">⏳</span>
									<span>Drafting with AI...</span>
								{:else}
									<span>✨</span>
									<span>Generate Draft with AI</span>
								{/if}
							</button>
						</form>

						{#if aiSummary}
							<div class="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300">
								<span class="font-bold text-amber-400">💡 AI Overview:</span> {aiSummary}
							</div>
						{/if}
					</div>

					<!-- Template & Dynamic Placeholders Bar -->
					<div class="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
						<div class="flex items-center justify-between">
							<h2 class="font-bold text-sm text-white flex items-center gap-1.5">
								<span>🏷️</span>
								<span>Personalization Tags (Click to Insert)</span>
							</h2>
							<span class="text-[11px] text-slate-400">Values fill automatically per recipient</span>
						</div>
						<p class="text-xs text-slate-400">
							Click any tag button below to insert that personalization field into your email text:
						</p>

						<div class="flex flex-wrap gap-2">
							{#each suggestedPlaceholders as ph}
								<button
									type="button"
									onclick={() => insertPlaceholder(ph.token)}
									class="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-400/80 text-xs font-medium text-slate-200 transition-all flex items-center gap-2 shadow-sm group cursor-pointer"
									title="Click to insert {ph.label} (e.g. {ph.example})"
								>
									<span class="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-semibold text-[10px] group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
										{ph.label}
									</span>
									<span class="text-[10px] text-slate-400 group-hover:text-slate-300 italic">
										e.g. {ph.example}
									</span>
									{#if copiedTag === ph.token}
										<span class="text-emerald-400 text-xs font-bold animate-bounce">✓ Added</span>
									{/if}
								</button>
							{/each}
						</div>
					</div>

					<!-- Recipients Manager -->
					<div class="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
						<div class="flex items-center justify-between border-b border-slate-800 pb-3">
							<div class="flex items-center gap-2">
								<span class="text-base">👥</span>
								<h2 class="font-bold text-sm text-white">Recipients ({parsedRecipientsCount})</h2>
							</div>
							<div class="flex items-center gap-1.5">
								<button
									type="button"
									onclick={importAllMembers}
									class="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
								>
									All ({data.members.length})
								</button>
								<button
									type="button"
									onclick={importDonors}
									class="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
								>
									Donors ({data.donors.length})
								</button>
								<button
									type="button"
									onclick={addSampleAdmin}
									class="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-red-950 text-red-300 border border-red-800/60 hover:bg-red-900 transition-colors"
								>
									+ Me
								</button>
								<button
									type="button"
									onclick={() => (showAddRecipientDialog = true)}
									class="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-900 transition-colors flex items-center gap-1"
									title="Add a person manually by name and email"
								>
									+ Person
								</button>
							</div>
						</div>

						<!-- Role Filter Pill Bar -->
						<div class="flex items-center gap-1.5 flex-wrap pt-1">
							<span class="text-[10px] uppercase font-bold text-slate-500 mr-1">System Role:</span>
							<button
								type="button"
								onclick={() => importByRole('admin')}
								class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
							>
								👑 Admins ({data.members.filter((m: any) => m.role === 'admin').length})
							</button>
							<button
								type="button"
								onclick={() => importByRole('bod')}
								class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 transition-all"
							>
								🏛️ BOD ({data.members.filter((m: any) => m.role === 'bod').length})
							</button>
							<button
								type="button"
								onclick={() => importByRole('member')}
								class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750 transition-all"
							>
								👤 Regular ({data.members.filter((m: any) => m.role === 'member' || !m.role).length})
							</button>
							<button
								type="button"
								onclick={() => importByRole('partner')}
								class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition-all"
							>
								🤝 Partners ({data.members.filter((m: any) => m.role === 'partner').length})
							</button>
							<button
								type="button"
								onclick={importMOUOrganizations}
								class="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-teal-500/15 text-teal-300 border border-teal-500/40 hover:bg-teal-500/25 transition-all flex items-center gap-1 shadow-sm"
								title="Filter strictly for contacts with official bilateral MOU agreements"
							>
								<span>📜</span>
								<span>MOU Partners ({data.members.filter((m: any) => m.associated_organizations?.toLowerCase().includes('mou') || m.organizational_role?.toLowerCase().includes('mou')).length})</span>
							</button>
							<button
								type="button"
								onclick={importAllOrganizations}
								class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all flex items-center gap-1"
								title="Filter for all external partner organizations, associations, and clubs"
							>
								<span>🏢</span>
								<span>All Orgs ({data.members.filter((m: any) => (m.associated_organizations && m.associated_organizations.trim().length > 0) || m.role === 'partner').length})</span>
							</button>
						</div>

						<!-- Organizational Titles Filter Pill Bar -->
						{#if data.orgRoles && data.orgRoles.length > 0}
							<div class="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-800/60 mt-1">
								<span class="text-[10px] uppercase font-bold text-amber-400 mr-1">By Org Role:</span>
								<button
									type="button"
									onclick={() => importByOrgCategory('executive')}
									class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-600/20 text-amber-300 border border-amber-500/40 hover:bg-amber-600/30 transition-all"
								>
									⚡ Executive Committee ({data.members.filter((m: any) => m.org_category === 'executive').length})
								</button>
								<button
									type="button"
									onclick={() => importByOrgCategory('board')}
									class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-600/20 text-purple-300 border border-purple-500/40 hover:bg-purple-600/30 transition-all"
								>
									🏛️ Sitting Board ({data.members.filter((m: any) => m.org_category === 'board').length})
								</button>
								{#each data.orgRoles.slice(0, 4) as or}
									<button
										type="button"
										onclick={() => importByOrgRoleId(or.id)}
										class="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all"
									>
										{or.title} ({data.members.filter((m: any) => m.org_role_id === or.id).length})
									</button>
								{/each}
							</div>
						{/if}

						<!-- View Mode Switcher -->
						<div class="flex items-center justify-between border-t border-slate-800/80 pt-3">
							<span class="text-xs font-semibold text-slate-300">
								Target Recipients List ({parsedRecipientsCount})
							</span>
							<div class="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
								<button
									type="button"
									onclick={() => (recipientViewMode = 'table')}
									class="px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 {recipientViewMode === 'table' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}"
								>
									<span>📋</span>
									<span>Table</span>
								</button>
								<button
									type="button"
									onclick={() => (recipientViewMode = 'cards')}
									class="px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 {recipientViewMode === 'cards' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}"
								>
									<span>🗂️</span>
									<span>Cards</span>
								</button>
								<button
									type="button"
									onclick={() => (recipientViewMode = 'raw')}
									class="px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 {recipientViewMode === 'raw' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}"
								>
									<span>✏️</span>
									<span>Manual</span>
								</button>
							</div>
						</div>

						<!-- Table View for Non-Technical Users -->
						{#if recipientViewMode === 'table'}
							{#if parsedRecipientsList.length === 0}
								<div class="p-8 bg-slate-950/60 rounded-2xl border border-slate-800 text-center space-y-2">
									<span class="text-2xl">👥</span>
									<p class="text-xs text-slate-400">No recipients selected yet.</p>
									<p class="text-[11px] text-slate-500">Click <strong>All</strong>, <strong>👑 Admins</strong>, <strong>🏛️ BOD</strong>, or <strong>Donors</strong> above to load contacts.</p>
								</div>
							{:else}
								<div class="max-h-64 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/80 shadow-inner">
									<table class="w-full text-left text-xs text-slate-300">
										<thead class="bg-slate-900 text-[10px] uppercase tracking-wider text-slate-400 sticky top-0 border-b border-slate-800">
											<tr>
												<th class="py-2.5 px-3">Name</th>
												<th class="py-2.5 px-3">Email</th>
												<th class="py-2.5 px-3">Role / Office</th>
												<th class="py-2.5 px-2 text-right">Remove</th>
											</tr>
										</thead>
										<tbody class="divide-y divide-slate-800/60">
											{#each parsedRecipientsList as r}
												<tr class="hover:bg-slate-900/60 transition-colors">
													<td class="py-2 px-3">
														<span class="font-medium text-white">{r.salutation ? `${r.salutation} ` : ''}{r.name}</span>
													</td>
													<td class="py-2 px-3 font-mono text-[11px] text-slate-300">
														{r.email}
													</td>
													<td class="py-2 px-3">
														<div class="flex items-center gap-1 flex-wrap">
															{#if r.associated_organizations}
																<span class="px-1.5 py-0.5 rounded text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/40" title="MOU Partner Organization">
																	🏛️ {r.associated_organizations}
																</span>
															{/if}
															{#if r.org_role}
																<span class="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
																	{r.org_role}
																</span>
															{:else if r.role}
																<span class="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
																	{r.role}
																</span>
															{/if}
															{#if !r.associated_organizations && !r.org_role && !r.role}
																<span class="text-slate-500 text-[10px]">—</span>
															{/if}
														</div>
													</td>
													<td class="py-2 px-2 text-right">
														<button
															type="button"
															onclick={() => removeRecipient(r.email)}
															class="text-red-400 hover:text-red-300 px-2 py-0.5 rounded hover:bg-red-950/50 text-xs font-bold"
															title="Remove from batch"
														>
															✕
														</button>
													</td>
												</tr>
											{/each}
										</tbody>
									</table>
								</div>
							{/if}
						{:else if recipientViewMode === 'cards'}
							{#if parsedRecipientsList.length === 0}
								<div class="p-8 bg-slate-950/60 rounded-2xl border border-slate-800 text-center space-y-2">
									<span class="text-2xl">🗂️</span>
									<p class="text-xs text-slate-400">No recipients selected yet.</p>
								</div>
							{:else}
								<div class="max-h-64 overflow-y-auto grid grid-cols-1 gap-2 pr-1">
									{#each parsedRecipientsList as r}
										<div class="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
											<div>
												<div class="font-bold text-xs text-white">
													{r.salutation ? `${r.salutation} ` : ''}{r.name}
												</div>
												<div class="text-[11px] font-mono text-slate-400">{r.email}</div>
												{#if r.org_role || r.city}
													<div class="text-[10px] text-amber-400 mt-0.5">
														{r.org_role || ''} {r.city ? `• ${r.city}` : ''}
													</div>
												{/if}
											</div>
											<button
												type="button"
												onclick={() => removeRecipient(r.email)}
												class="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-950/50 text-xs"
												title="Remove"
											>
												✕
											</button>
										</div>
									{/each}
								</div>
							{/if}
						{:else}
							<!-- Raw Textarea for Advanced Paste -->
							<textarea
								rows="5"
								bind:value={recipientsRaw}
								placeholder="Prakash Thapa, prakash@example.com, Vancouver, BC&#10;Bina Shrestha, bina@example.com, Toronto, ON"
								class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-red-500 transition-colors"
							></textarea>
							<p class="text-[10px] text-slate-500">
								Accepts <code>Name &lt;email&gt;</code>, CSV <code>Name, email, city</code>, or JSON array.
							</p>
						{/if}
					</div>
				</div>

				<!-- Right Column: Email Editor & Live Preview -->
				<div class="lg:col-span-7 space-y-6">
					<div class="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-2xl">
						<!-- Dispatch Form Setup -->
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-800 pb-4">
							<div>
								<label for="batchLabel" class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
									Batch Label (For Auditing & Grouping)
								</label>
								<input
									id="batchLabel"
									type="text"
									bind:value={batchLabel}
									placeholder="e.g. 2025 Gala Announcement"
									class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
								/>
							</div>

							<div>
								<label for="templateSelect" class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
									Master Branded Template
								</label>
								<select
									id="templateSelect"
									bind:value={selectedTemplateId}
									class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
								>
									{#each data.templates as tmpl}
										<option value={tmpl.id}>{tmpl.name}</option>
									{/each}
								</select>
							</div>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div class="md:col-span-1">
								<label for="senderEmail" class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
									Sender Address
								</label>
								<input
									id="senderEmail"
									type="email"
									bind:value={fromEmail}
									class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none"
								/>
							</div>

							<div class="md:col-span-2">
								<label for="emailSubject" class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
									Email Subject
								</label>
								<input
									id="emailSubject"
									type="text"
									bind:value={subject}
									placeholder="e.g. Invitation to CANFACS Nepal Day Celebration"
									class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white font-semibold focus:outline-none focus:border-red-500 transition-colors"
								/>
							</div>
						</div>

						<!-- Email Body Editor with Rich Formatting Toolbar -->
						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<label for="bodyContent" class="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
									<span>✍️</span>
									<span>Email Message (Type with Normal Line Breaks)</span>
								</label>
								<span class="text-[11px] text-slate-400">
									Line breaks & paragraphs format automatically
								</span>
							</div>

							<!-- Formatting Toolbar -->
							<div class="flex items-center gap-1 p-1.5 bg-slate-950 rounded-2xl border border-slate-800 flex-wrap text-xs">
								<button
									type="button"
									onclick={() => applyFormatting('<b>', '</b>')}
									class="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold border border-slate-800 transition-colors"
									title="Bold Text"
								>
									B
								</button>
								<button
									type="button"
									onclick={() => applyFormatting('<i>', '</i>')}
									class="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 italic font-serif border border-slate-800 transition-colors"
									title="Italic Text"
								>
									I
								</button>
								<button
									type="button"
									onclick={() => applyFormatting('<u>', '</u>')}
									class="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 underline border border-slate-800 transition-colors"
									title="Underline Text"
								>
									U
								</button>

								<div class="h-4 w-px bg-slate-800 mx-1"></div>

								<button
									type="button"
									onclick={() => applyFormatting('<h3 style="color: #ffffff; margin-top: 20px;">', '</h3>')}
									class="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold border border-slate-800 transition-colors"
									title="Section Heading"
								>
									H3 Heading
								</button>
								<button
									type="button"
									onclick={() => applyFormatting('<ul style="margin: 12px 0; padding-left: 20px;">\n  <li>', '</li>\n</ul>')}
									class="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors"
									title="Bullet List"
								>
									• Bullet List
								</button>
								<button
									type="button"
									onclick={() => applyFormatting('<a href="https://canfacs.org" style="color: #38bdf8; text-decoration: underline;">', '</a>')}
									class="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 transition-colors"
									title="Web Link"
								>
									🔗 Link
								</button>
								<button
									type="button"
									onclick={() => applyFormatting('<div style="text-align: center; margin: 24px 0;"><a href="https://canfacs.org" style="display: inline-block; background: #dc2626; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none;">', '</a></div>')}
									class="px-2.5 py-1 rounded-lg bg-red-950/70 hover:bg-red-900 text-red-300 font-semibold border border-red-800/50 transition-colors"
									title="Call-to-action Button"
								>
									🔴 Button
								</button>

								<div class="h-4 w-px bg-slate-800 mx-1"></div>

								<button
									type="button"
									onclick={() => applyFormatting('<br>\n')}
									class="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 text-[11px]"
									title="Insert Line Break"
								>
									↵ Break
								</button>
								<button
									type="button"
									onclick={() => { bodyText = ''; aiDraftLoaded = false; }}
									class="ml-auto px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-red-400 text-[11px]"
									title="Clear text"
								>
									Clear ✕
								</button>
							</div>

							<textarea
								id="bodyContent"
								rows="9"
								bind:value={bodyText}
								placeholder="Dear {'{'}{'{'}}salutation{'}'}{'}'} {'{'}{'{'}}name{'}'}{'}'},&#10;&#10;We are pleased to invite you to our upcoming CANFACS gathering.&#10;&#10;Please join us with your family!&#10;&#10;Warm regards,&#10;CANFACS Executive Committee"
								class="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-sans text-slate-100 focus:outline-none focus:border-red-500 transition-colors leading-relaxed tracking-normal"
							></textarea>
							<p class="text-[11px] text-slate-400 italic">
								💡 Type your email in plain English. Press Enter twice for a new paragraph. Use the toolbar buttons above for formatting.
								{#if aiDraftLoaded}
									<span class="ml-2 px-2 py-0.5 rounded-full bg-violet-950 text-violet-300 border border-violet-700/40 text-[10px] font-semibold">✨ AI draft loaded — edit above to customize</span>
								{/if}
							</p>
						</div>

						<!-- Live Preview of Merged Message -->
						<div class="space-y-3 pt-2 border-t border-slate-800">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2">
									<span class="text-xs font-bold uppercase tracking-wider text-slate-400">Preview with Merged Sample Data</span>
									<span class="text-[10px] text-slate-500">(Name: Aarav Sharma, City: Vancouver)</span>
								</div>
								<div class="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
									<button
										type="button"
										onclick={() => (previewDevice = 'desktop')}
										class="px-2 py-0.5 text-xs rounded font-medium transition-colors {previewDevice === 'desktop' ? 'bg-slate-800 text-white' : 'text-slate-400'}"
									>
										🖥️
									</button>
									<button
										type="button"
										onclick={() => (previewDevice = 'mobile')}
										class="px-2 py-0.5 text-xs rounded font-medium transition-colors {previewDevice === 'mobile' ? 'bg-slate-800 text-white' : 'text-slate-400'}"
									>
										📱
									</button>
								</div>
							</div>

							<div class="flex justify-center bg-slate-950 p-3 rounded-2xl border border-slate-800">
								<div class="{previewDevice === 'mobile' ? 'w-[360px]' : 'w-full'} transition-all duration-200">
									<iframe
										title="Email Live Preview"
										srcdoc={renderedPreviewHtml}
										class="w-full h-[320px] rounded-xl border border-slate-800 bg-slate-950"
									></iframe>
								</div>
							</div>
						</div>

						<!-- Action Buttons: Send Test & Dispatch Broadcast -->
						<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
							<!-- Send Test Email -->
							<form
								method="POST"
								action="?/sendTest"
								use:enhance={() => {
									sendingTest = true;
									return async ({ update }) => {
										await update();
										sendingTest = false;
									};
								}}
								class="flex items-center gap-2"
							>
								<input type="hidden" name="test_recipient" value={testRecipientEmail} />
								<input type="hidden" name="subject" value={subject} />
								<input type="hidden" name="content_html" value={finalBodyHtml} />
								<input type="hidden" name="template_id" value={selectedTemplateId} />
								<input type="hidden" name="from_email" value={fromEmail} />

								<button
									type="submit"
									disabled={sendingTest || !subject.trim()}
									class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
								>
									{#if sendingTest}
										<span class="animate-spin">⏳</span>
										<span>Sending Test...</span>
									{:else}
										<span>🧪</span>
										<span>Send Test to {testRecipientEmail}</span>
									{/if}
								</button>
							</form>

							<!-- Trigger Bulk Broadcast Confirmation -->
							<button
								type="button"
								onclick={() => (showConfirmationModal = true)}
								disabled={parsedRecipientsCount === 0 || !subject.trim() || !finalBodyHtml.trim()}
								class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
							>
								<span>🚀</span>
								<span>Dispatch Broadcast ({parsedRecipientsCount} Recipients)</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- TAB 2: AUDIT & DELIVERY TRACKING -->
		{#if activeTab === 'audit'}
			<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
				<!-- Batch History List -->
				<div class="lg:col-span-4 space-y-4">
					<div class="flex items-center justify-between">
						<h2 class="text-xs font-bold uppercase tracking-wider text-slate-400">Email Batches ({data.batches.length})</h2>
						<span class="text-[11px] text-slate-500">Stored in D1</span>
					</div>

					<div class="space-y-3">
						{#if data.batches.length === 0}
							<div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
								No broadcast batches recorded yet. Send your first broadcast from the composer tab.
							</div>
						{/if}

						{#each data.batches as batch}
							<a
								href="/admin/emails?batchId={batch.id}"
								class="block p-4 rounded-2xl border transition-all {activeBatchId === batch.id
									? 'bg-slate-900 border-red-500/70 shadow-lg shadow-red-900/20'
									: 'bg-slate-900/60 border-slate-800 hover:border-slate-700'}"
							>
								<div class="flex items-start justify-between gap-2">
									<h3 class="font-bold text-sm text-white truncate">{batch.label}</h3>
									<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase {batch.status === 'completed' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'}">
										{batch.status}
									</span>
								</div>
								<div class="text-xs text-slate-400 mt-1 truncate">
									"{batch.subject}"
								</div>
								<div class="flex items-center justify-between mt-3 text-[11px] text-slate-500">
									<span>{new Date(batch.created_at).toLocaleDateString()}</span>
									<span class="text-slate-300 font-semibold">
										✅ {batch.success_count} / {batch.total_recipients} delivered
									</span>
								</div>
							</a>
						{/each}
					</div>
				</div>

				<!-- Batch Logs Details Table -->
				<div class="lg:col-span-8 space-y-6">
					{#if selectedBatch}
						<div class="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-2xl">
							<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
								<div>
									<span class="text-xs uppercase font-mono text-red-400">Batch ID: {selectedBatch.id}</span>
									<h2 class="text-xl font-extrabold text-white mt-0.5">{selectedBatch.label}</h2>
									<p class="text-xs text-slate-400 mt-1">
										Subject: <span class="text-slate-200 font-semibold">"{selectedBatch.subject}"</span>
									</p>
								</div>

								<div class="flex items-center gap-2">
									<div class="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
										Success: <strong class="text-emerald-400 ml-1">{selectedBatch.success_count}</strong>
									</div>
									<div class="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
										Failed: <strong class="text-red-400 ml-1">{selectedBatch.failure_count}</strong>
									</div>
								</div>
							</div>

							<!-- Recipient Delivery Log Table -->
							<div class="overflow-x-auto">
								<table class="w-full text-left text-xs text-slate-300">
									<thead class="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950 border-b border-slate-800">
										<tr>
											<th class="py-3 px-4">Recipient</th>
											<th class="py-3 px-4">Delivery Status</th>
											<th class="py-3 px-4">Sent Time</th>
											<th class="py-3 px-4">Notes / Error</th>
										</tr>
									</thead>
									<tbody class="divide-y divide-slate-800/60">
										{#if data.batchLogs.length === 0}
											<tr>
												<td colspan="4" class="py-6 text-center text-slate-500">
													No individual logs recorded for this batch.
												</td>
											</tr>
										{/if}

										{#each data.batchLogs as log}
											<tr class="hover:bg-slate-800/40">
												<td class="py-3 px-4">
													<div class="font-semibold text-white">{log.recipient_name || 'Contact'}</div>
													<div class="text-[11px] font-mono text-slate-400">{log.recipient_email}</div>
												</td>
												<td class="py-3 px-4">
													{#if log.status === 'sent'}
														<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
															✅ Delivered
														</span>
													{:else}
														<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950 text-red-300 border border-red-800/60">
															❌ Failed
														</span>
													{/if}
												</td>
												<td class="py-3 px-4 text-slate-400 font-mono text-[11px]">
													{new Date(log.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
												</td>
												<td class="py-3 px-4 text-slate-400 text-[11px]">
													{log.error_message || '—'}
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</div>
					{:else}
						<div class="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center text-slate-400 space-y-2">
							<span class="text-3xl">📊</span>
							<p>Select a batch from the sidebar to inspect its delivery audit log.</p>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</section>

<!-- Confirmation Modal for Bulk Dispatch -->
{#if showConfirmationModal}
	<div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
		<div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl text-slate-100">
			<div class="flex items-start justify-between border-b border-slate-800 pb-4">
				<div class="flex items-center gap-2.5">
					<span class="text-2xl">⚠️</span>
					<div>
						<h3 class="text-lg font-bold text-white">Confirm Email Broadcast</h3>
						<p class="text-xs text-slate-400">Ready to dispatch batch from {fromEmail}</p>
					</div>
				</div>
				<button
					onclick={() => (showConfirmationModal = false)}
					class="text-slate-400 hover:text-white text-lg p-1"
				>
					✕
				</button>
			</div>

			<div class="space-y-3 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
				<div class="flex justify-between py-1 border-b border-slate-800/60">
					<span class="text-slate-400">Batch Label:</span>
					<strong class="text-white">{batchLabel}</strong>
				</div>
				<div class="flex justify-between py-1 border-b border-slate-800/60">
					<span class="text-slate-400">Template Used:</span>
					<span class="text-amber-400 font-semibold">{currentTemplate?.name || 'Custom'}</span>
				</div>
				<div class="flex justify-between py-1 border-b border-slate-800/60">
					<span class="text-slate-400">Total Recipients:</span>
					<strong class="text-red-400 text-sm">{parsedRecipientsCount} verified addresses</strong>
				</div>
				<div class="flex justify-between py-1">
					<span class="text-slate-400">Subject:</span>
					<span class="text-slate-200 font-medium truncate max-w-[220px]">"{subject}"</span>
				</div>
			</div>

			<p class="text-xs text-slate-400 leading-relaxed">
				Every recipient will receive a personalized message with their dynamic placeholders substituted. The action will be permanently recorded in the D1 audit table.
			</p>

			<form
				method="POST"
				action="?/sendBatch"
				use:enhance={() => {
					sendingBatch = true;
					showConfirmationModal = false;
					return async ({ update }) => {
						await update();
						sendingBatch = false;
					};
				}}
				class="flex items-center justify-end gap-3"
			>
				<input type="hidden" name="batch_label" value={batchLabel} />
				<input type="hidden" name="subject" value={subject} />
				<input type="hidden" name="content_html" value={finalBodyHtml} />
				<input type="hidden" name="template_id" value={selectedTemplateId} />
				<input type="hidden" name="from_email" value={fromEmail} />
				<input type="hidden" name="recipients_data" value={recipientsRaw} />

				<button
					type="button"
					onclick={() => (showConfirmationModal = false)}
					class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
				>
					Cancel
				</button>
				<button
					type="submit"
					class="px-6 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all flex items-center gap-1.5"
				>
					<span>🚀 Confirm & Send to {parsedRecipientsCount} Recipients</span>
				</button>
			</form>
		</div>
	</div>
{/if}

{#if showAddRecipientDialog}
	<!-- Add Recipient Manually Dialog -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
		aria-label="Add recipient manually"
	>
		<!-- Backdrop -->
		<button
			class="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-default"
			type="button"
			onclick={() => (showAddRecipientDialog = false)}
			aria-label="Close dialog"
		></button>

		<!-- Dialog Panel -->
		<div class="relative w-full max-w-sm bg-slate-900 border border-emerald-800/40 rounded-3xl shadow-2xl shadow-emerald-900/30 p-7 space-y-5">
			<div class="flex items-center justify-between">
				<h2 class="text-base font-extrabold text-white flex items-center gap-2">
					<span>👤</span>
					<span>Add Recipient</span>
				</h2>
				<button
					type="button"
					onclick={() => (showAddRecipientDialog = false)}
					class="text-slate-400 hover:text-white text-lg leading-none transition-colors"
				>✕</button>
			</div>

			<div class="space-y-3">
				<div class="grid grid-cols-3 gap-2">
					<div>
						<label for="manualSalutation" class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Title</label>
						<select
							id="manualSalutation"
							bind:value={manualSalutation}
							class="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
						>
							<option value="">—</option>
							<option value="Mr.">Mr.</option>
							<option value="Ms.">Ms.</option>
							<option value="Mrs.">Mrs.</option>
							<option value="Dr.">Dr.</option>
							<option value="Prof.">Prof.</option>
							<option value="H.E.">H.E.</option>
						</select>
					</div>
					<div class="col-span-2">
						<label for="manualName" class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Full Name</label>
						<input
							id="manualName"
							type="text"
							bind:value={manualName}
							placeholder="e.g. Ramesh Thapa"
							class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
						/>
					</div>
				</div>

				<div>
					<label for="manualEmail" class="block text-[10px] font-bold uppercase text-slate-400 mb-1">
						Email Address <span class="text-red-400">*</span>
					</label>
					<input
						id="manualEmail"
						type="email"
						bind:value={manualEmail}
						placeholder="e.g. ramesh@example.com"
						class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
						required
					/>
				</div>

				<div>
					<label for="manualOrg" class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Organization (optional)</label>
					<input
						id="manualOrg"
						type="text"
						bind:value={manualOrg}
						placeholder="e.g. NRN Canada"
						class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
					/>
				</div>
			</div>

			<div class="flex items-center gap-3 pt-1">
				<button
					type="button"
					onclick={() => (showAddRecipientDialog = false)}
					class="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
				>
					Cancel
				</button>
				<button
					type="button"
					onclick={addRecipientManually}
					disabled={!manualEmail || !manualEmail.includes('@')}
					class="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-40"
				>
					✓ Add to Recipients
				</button>
			</div>
		</div>
	</div>
{/if}
