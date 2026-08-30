<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount, tick } from 'svelte';
	import { SITE_INFO } from '$lib/data/siteData';

	let { data, form } = $props();

	// State
	let selectedAmount = $state<number | 'custom'>(100);
	let customAmount = $state('');
	let isAnonymous = $state(false);
	let donorName = $state('');
	let email = $state('');
	let supportMessage = $state('');
	let paymentMethod = $state<'card' | 'etransfer'>('card');
	let isSubmitting = $state(false);
	let cardTokenError = $state<string | null>(null);
	let copiedEmail = $state(false);

	// Square SDK state
	let squarePayments: any = null;
	let squareCard: any = null;
	let isSquareInitialized = $state(false);
	let squareInitError = $state<string | null>(null);
	let formElement: HTMLFormElement | null = null;
	let paymentTokenValue = $state('');

	const presetAmounts = [25, 50, 100, 250, 500];

	const currentAmountValue = $derived(
		selectedAmount === 'custom' ? parseFloat(customAmount) || 0 : selectedAmount
	);

	function selectAmount(amt: number) {
		selectedAmount = amt;
		customAmount = '';
	}

	function handleCustomAmountInput(e: Event) {
		const val = (e.target as HTMLInputElement).value;
		customAmount = val;
		selectedAmount = 'custom';
	}

	function copyEtransfer() {
		navigator.clipboard.writeText('info@canfacs.org');
		copiedEmail = true;
		setTimeout(() => {
			copiedEmail = false;
		}, 3000);
	}

	async function initSquare() {
		if (!data.square.applicationId || !(window as any).Square) {
			return;
		}

		try {
			squareInitError = null;
			const payments = data.square.locationId
				? (window as any).Square.payments(data.square.applicationId, data.square.locationId)
				: (window as any).Square.payments(data.square.applicationId);
			squarePayments = payments;

			await tick();
			const cardContainer = document.getElementById('card-container');
			if (cardContainer && !squareCard) {
				const card = await payments.card();
				await card.attach('#card-container');
				await card.configure({
					style: {
						input: {
							color: '#f8fafc',
							fontFamily: 'sans-serif',
							fontSize: '14px',
							backgroundColor: '#020617'
						},
						'input::placeholder': {
							color: '#64748b'
						},
						'.input-container': {
							borderColor: '#334155',
							borderWidth: '1px',
							borderRadius: '12px'
						},
						'.input-container.is-focus': {
							borderColor: '#ef4444'
						},
						'.input-container.is-error': {
							borderColor: '#f87171'
						}
					}
				});
				squareCard = card;
				isSquareInitialized = true;
			}
		} catch (err: any) {
			console.warn('Square card initialization error:', err);
			squareInitError = err.message || 'Could not initialize Square card form.';
		}
	}

	onMount(() => {
		if (data.square.isConfigured && paymentMethod === 'card') {
			const checkSquareScript = setInterval(() => {
				if ((window as any).Square) {
					clearInterval(checkSquareScript);
					initSquare();
				}
			}, 200);

			return () => clearInterval(checkSquareScript);
		}
	});

	async function handleFormSubmit(e: SubmitEvent) {
		if (paymentMethod === 'card') {
			if (!data.square.isConfigured || !squareCard) {
				e.preventDefault();
				cardTokenError =
					'Online card processing with Square requires SQUARE_APPLICATION_ID and SQUARE_ACCESS_TOKEN. To donate immediately, please choose Interac e-Transfer to info@canfacs.org.';
				return;
			}

			e.preventDefault();
			cardTokenError = null;

			if (!isAnonymous && !donorName.trim()) {
				cardTokenError = 'Please enter your full name.';
				return;
			}

			if (currentAmountValue <= 0) {
				cardTokenError = 'Please enter a valid donation amount.';
				return;
			}

			isSubmitting = true;
			try {
				const result = await squareCard.tokenize();
				if (result.status === 'OK') {
					paymentTokenValue = result.token;
					await tick();
					if (formElement) {
						formElement.submit();
					}
				} else {
					isSubmitting = false;
					const firstErr = result.errors?.[0];
					cardTokenError = firstErr?.message || 'Card verification failed. Please check your card details.';
				}
			} catch (err: any) {
				isSubmitting = false;
				cardTokenError = err.message || 'Unable to process payment card.';
			}
		}
	}
</script>

<svelte:head>
	<title>Nepal Flood Emergency Relief Fund ($10k Goal) - {SITE_INFO.name}</title>
	<meta
		name="description"
		content="Donate online via Square or e-Transfer to the CANFACS Nepal Flood Emergency Relief & Rehabilitation Fund. Target goal: $10,000 CAD."
	/>
	{#if data.square.sdkUrl}
		<script src={data.square.sdkUrl}></script>
	{/if}
</svelte:head>

<section class="py-12 md:py-20 bg-slate-950 min-h-screen">
	<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
		<!-- Top Breadcrumb -->
		<div class="flex items-center gap-2 text-xs font-semibold text-slate-400">
			<a href="/impact" class="hover:text-red-400 transition-colors">← Back to All Impact Initiatives</a>
			<span>/</span>
			<span class="text-slate-200">Nepal Flood Emergency Relief</span>
		</div>

		<!-- Hero / Emergency Header -->
		<div class="relative rounded-3xl overflow-hidden glass-panel border border-red-900/50 p-8 sm:p-12 shadow-2xl">
			<!-- Background Ambient Glow -->
			<div
				class="absolute top-0 right-0 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none"
			></div>
			<div
				class="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"
			></div>

			<div class="relative z-10 max-w-3xl space-y-4">
				<div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/90 border border-red-800 text-xs font-bold text-red-400 uppercase tracking-wider">
					<span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
					Active Emergency Relief Campaign
				</div>

				<h1 class="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
					Nepal Flood & Landslide <br />
					<span class="text-gradient-nepal">Emergency Relief Fund</span>
				</h1>

				<p class="text-slate-300 text-base sm:text-lg leading-relaxed">
					Mobilizing direct humanitarian assistance for families displaced by catastrophic monsoon flooding across Nepal. <strong>All collected funds will be disbursed directly to the Government of Nepal Prime Minister's Disaster Relief Fund (PMO Fund)</strong> on behalf of CANFACS and its members, with transparent public tracking on this page.
				</p>
			</div>

			<!-- Live Fundraising Progress Banner -->
			<div class="mt-10 p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
				<div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
					<div>
						<div class="text-xs uppercase font-bold tracking-wider text-slate-400">Total Raised So Far</div>
						<div class="text-4xl sm:text-5xl font-black text-white mt-1">
							${data.stats.totalRaised.toLocaleString('en-CA', { minimumFractionDigits: 0 })}
							<span class="text-lg font-bold text-slate-400">CAD</span>
						</div>
					</div>

					<div class="sm:text-right">
						<div class="text-xs uppercase font-bold tracking-wider text-slate-400">Target Campaign Goal</div>
						<div class="text-2xl sm:text-3xl font-extrabold text-red-400 mt-1">
							${data.stats.targetGoal.toLocaleString('en-CA')} CAD
						</div>
					</div>
				</div>

				<!-- Progress Bar -->
				<div class="space-y-2">
					<div class="w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
						<div
							class="h-full rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 transition-all duration-1000 shadow-lg shadow-red-600/40"
							style="width: {data.stats.percentRaised}%"
						></div>
					</div>
					<div class="flex items-center justify-between text-xs font-semibold text-slate-400">
						<span>{data.stats.percentRaised}% of goal reached</span>
						<span>{data.stats.donorCount} Community Donors</span>
					</div>
				</div>

				<!-- Quick Payment Options Notice -->
				<div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
					<div class="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
						<span class="text-xl">💳</span>
						<span>
							Payment Options: <strong>Credit/Debit Card (Square)</strong> or Interac e-Transfer to <strong class="text-white font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">info@canfacs.org</strong>
						</span>
					</div>

					<button
						type="button"
						onclick={copyEtransfer}
						class="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5"
					>
						{#if copiedEmail}
							<span class="text-emerald-400">✓ Email Copied!</span>
						{:else}
							<span>📋 Copy E-Transfer Email</span>
						{/if}
					</button>
				</div>
			</div>
		</div>

		<!-- Disaster Overview & Donation Form -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<!-- Disaster Context & Public Disbursement Log -->
			<div class="lg:col-span-2 space-y-6">
				<!-- Official Government PMO Fund Disbursement Commitment -->
				<div class="glass-panel p-8 rounded-2xl border border-amber-900/40 bg-gradient-to-br from-slate-900/90 to-slate-950/90 space-y-4 shadow-xl">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 text-amber-400 flex items-center justify-center text-xl font-bold">
							🏛️
						</div>
						<div>
							<span class="text-xs uppercase font-bold text-amber-400 tracking-wider">Fund Destination & Transparency</span>
							<h3 class="text-lg sm:text-xl font-bold text-white">Disbursement to Nepal Government PMO Fund</h3>
						</div>
					</div>

					<p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
						All funds raised through this campaign will be disbursed directly to the <strong>Government of Nepal Prime Minister's Disaster Relief Fund (PMO Fund)</strong> on behalf of <strong>CANFACS and its members</strong>.
					</p>

					<div class="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
						<div class="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-800/80 pb-2">
							<span>PUBLIC DISBURSEMENT TRACKING</span>
							<span class="text-emerald-400">Live Status</span>
						</div>

						<div class="space-y-3 text-xs">
							<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
								<div>
									<div class="font-bold text-white flex items-center gap-2">
										<span>Tranche 1 (Active Campaign)</span>
										<span class="px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-[10px] text-amber-300 font-semibold">
											Accumulating for Transfer
										</span>
									</div>
									<div class="text-[11px] text-slate-400 mt-0.5">
										Recipient: <strong>Prime Minister's Disaster Relief Fund, Nepal (PMO)</strong>
									</div>
								</div>

								<div class="sm:text-right">
									<div class="text-base font-black text-amber-400">
										${data.stats.totalRaised.toLocaleString('en-CA')} CAD
									</div>
									<div class="text-[10px] text-slate-400">of $10,000 CAD Target</div>
								</div>
							</div>
						</div>

						<p class="text-[11px] text-slate-400 italic pt-1">
							📌 Wire transfer confirmation receipts, official acknowledgment documents, and disbursement notices will be posted directly to this log once processed.
						</p>
					</div>
				</div>

				<div class="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
					<div class="space-y-2">
						<span class="text-xs uppercase font-bold text-red-400 tracking-wider">The Crisis on the Ground</span>
						<h2 class="text-2xl font-bold text-white">Record-Breaking Monsoon Disaster</h2>
					</div>

					<p class="text-slate-300 text-sm leading-relaxed">
						In late September, Nepal experienced the heaviest rainfall recorded in over 50 years. A stationary low-pressure system dumped unprecedented torrential rains over 48 hours, causing rivers across the Kathmandu Valley—including the Bagmati, Bishnumati, and Hanumante—to burst their banks and triggering massive landslides in Kavrepalanchok, Sindhuli, Lalitpur, and Koshi Province.
					</p>

					<!-- Key Stats Grid -->
					<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
						{#each data.campaign.disasterContext.impactStats as stat}
							<div class="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 text-center">
								<div class="text-xl sm:text-2xl font-black text-red-400">{stat.value}</div>
								<div class="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-1">{stat.label}</div>
							</div>
						{/each}
					</div>

					<div class="space-y-3 pt-4 border-t border-slate-800">
						<h3 class="text-base font-bold text-white">Where Your Donations Go:</h3>
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
							{#each data.campaign.disasterContext.reliefFocus as focus, idx}
								<div class="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-300">
									<span class="text-red-400 font-bold mt-0.5">0{idx + 1}.</span>
									<span>{focus}</span>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- Interac e-Transfer Instructions -->
				<div class="glass-panel p-8 rounded-2xl border border-blue-900/40 space-y-4">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 text-blue-400 flex items-center justify-center text-xl">
							🏦
						</div>
						<div>
							<h3 class="text-lg font-bold text-white">Direct Interac e-Transfer Option</h3>
							<p class="text-xs text-slate-400">Prefer e-Transfer? Send directly with 0% processing fees</p>
						</div>
					</div>

					<div class="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
						<ol class="list-decimal list-inside space-y-2">
							<li>Log into your Canadian bank or credit union mobile app / online banking.</li>
							<li>
								Select <strong>Interac e-Transfer</strong> and add recipient: <code class="text-red-400 font-bold">info@canfacs.org</code>
							</li>
							<li>Recipient name: <strong>CANFACS</strong> (Canada-Nepal Friendship & Cultural Society).</li>
							<li>Auto-deposit is enabled (no security question required for Canadian banks).</li>
							<li>In the message / note field, include: <em>"Nepal Flood Relief - [Your Name]"</em>.</li>
						</ol>
					</div>
				</div>
			</div>

			<!-- Donation Checkout Form -->
			<div class="lg:col-span-1">
				<div class="sticky top-24 glass-panel p-6 sm:p-8 rounded-2xl border border-red-800/40 shadow-xl space-y-6">
					<div class="space-y-1">
						<span class="text-xs uppercase font-bold text-red-400 tracking-wider">Make a Contribution</span>
						<h3 class="text-xl font-bold text-white">Donate to Nepal Relief</h3>
						<p class="text-xs text-slate-400">
							Support verified on-the-ground relief teams in Nepal.
						</p>
					</div>

					<!-- Payment Method Tabs -->
					<div class="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
						<button
							type="button"
							onclick={() => {
								paymentMethod = 'card';
								if (data.square.isConfigured && !squareCard) {
									initSquare();
								}
							}}
							class="py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 {paymentMethod === 'card'
								? 'bg-red-600 text-white shadow'
								: 'text-slate-400 hover:text-white'}"
						>
							<span>💳 Card (Square)</span>
						</button>
						<button
							type="button"
							onclick={() => (paymentMethod = 'etransfer')}
							class="py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 {paymentMethod === 'etransfer'
								? 'bg-red-600 text-white shadow'
								: 'text-slate-400 hover:text-white'}"
						>
							<span>🏦 e-Transfer</span>
						</button>
					</div>

					{#if form?.success}
						<div class="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs sm:text-sm space-y-2">
							<div class="font-bold flex items-center gap-1.5">
								<span>✅</span> {form.isOnlinePayment ? 'Payment Processed via Square!' : 'Donation Recorded!'}
							</div>
							<p>{form.message}</p>
							{#if form.receiptUrl}
								<a
									href={form.receiptUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="inline-block mt-2 px-3 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-white text-xs rounded-lg font-semibold underline"
								>
									📄 View Official Square Receipt &rarr;
								</a>
							{/if}
						</div>
					{/if}

					{#if form?.error || cardTokenError}
						<div class="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs sm:text-sm space-y-1">
							<div class="font-bold">⚠️ Submission Notice</div>
							<p>{form?.error || cardTokenError}</p>
						</div>
					{/if}

					<form
						bind:this={formElement}
						method="POST"
						action="?/donate"
						onsubmit={handleFormSubmit}
						class="space-y-4"
					>
						<!-- Payment Method & Token Hidden Inputs -->
						<input type="hidden" name="payment_method" value={paymentMethod} />
						<input type="hidden" name="payment_token" value={paymentTokenValue} />

						<!-- Amount Selector -->
						<div class="space-y-2">
							<span class="text-xs font-bold uppercase tracking-wider text-slate-300 block">
								Select Amount (CAD)
							</span>

							<div class="grid grid-cols-3 gap-2">
								{#each presetAmounts as amt}
									<button
										type="button"
										onclick={() => selectAmount(amt)}
										class="py-2.5 rounded-xl text-xs font-bold transition-all {selectedAmount === amt
											? 'bg-red-600 text-white shadow-md shadow-red-600/30'
											: 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'}"
									>
										${amt}
									</button>
								{/each}

								<button
									type="button"
									onclick={() => (selectedAmount = 'custom')}
									class="py-2.5 rounded-xl text-xs font-bold transition-all {selectedAmount === 'custom'
										? 'bg-red-600 text-white shadow-md shadow-red-600/30'
										: 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'}"
								>
									Custom
								</button>
							</div>

							<!-- Custom Input -->
							{#if selectedAmount === 'custom'}
								<div class="relative mt-2">
									<span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm font-bold">
										$
									</span>
									<input
										type="number"
										min="1"
										step="any"
										value={customAmount}
										oninput={handleCustomAmountInput}
										placeholder="Enter amount in CAD"
										class="w-full pl-8 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-red-500"
										required
									/>
								</div>
							{/if}

							<input
								type="hidden"
								name="amount"
								value={selectedAmount === 'custom' ? customAmount : selectedAmount}
							/>
						</div>

						<!-- Donor Name -->
						<div class="space-y-1">
							<label for="donor_name" class="text-xs font-semibold text-slate-300 block">
								Your Full Name
							</label>
							<input
								id="donor_name"
								type="text"
								name="donor_name"
								bind:value={donorName}
								disabled={isAnonymous}
								placeholder={isAnonymous ? 'Anonymous Donor' : 'e.g. Ram Shrestha'}
								class="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 disabled:opacity-50"
							/>
						</div>

						<!-- Anonymous Checkbox -->
						<div class="flex items-center gap-2">
							<input
								id="is_anonymous"
								type="checkbox"
								name="is_anonymous"
								bind:checked={isAnonymous}
								class="rounded bg-slate-950 border-slate-700 text-red-600 focus:ring-red-500"
							/>
							<label for="is_anonymous" class="text-xs text-slate-400 cursor-pointer">
								Display name as "Anonymous Donor" on public roll
							</label>
						</div>

						<!-- Email Address -->
						<div class="space-y-1">
							<label for="email" class="text-xs font-semibold text-slate-300 block">
								Email Address <span class="text-slate-500 text-[11px]">(For receipt / confirmation)</span>
							</label>
							<input
								id="email"
								type="email"
								name="email"
								bind:value={email}
								placeholder="your.email@example.com"
								class="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
							/>
						</div>

						<!-- Card Payment Inputs -->
						{#if paymentMethod === 'card'}
							<div class="space-y-2.5 pt-2 border-t border-slate-800">
								<div class="flex items-center justify-between">
									<span class="text-xs font-bold uppercase tracking-wider text-slate-300">
										Credit or Debit Card
									</span>
									<span class="text-[10px] text-slate-400 flex items-center gap-1.5 font-medium">
										<span>💳 Visa • MC • Amex</span>
										<span class="text-slate-600">|</span>
										<span class="text-emerald-400">🔒 256-bit SSL</span>
									</span>
								</div>

								{#if data.square.isConfigured}
									<!-- Square Web Payments SDK Card container -->
									<div
										id="card-container"
										class="min-h-[90px] rounded-xl bg-slate-950 border border-slate-800 p-2"
									></div>

									{#if squareInitError || cardTokenError}
										<div class="p-3 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-300 space-y-1">
											<div class="font-bold flex items-center gap-1.5 text-red-200">
												<span>⚠️</span> Payment Notice
											</div>
											<p>{squareInitError || cardTokenError}</p>
										</div>
									{/if}
								{:else}
									<!-- Interactive Card Form Fields (Active when Square SDK is pending/local) -->
									<div class="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
										<div>
											<label for="card_number" class="text-[11px] text-slate-400 block mb-1">Card Number</label>
											<div class="relative">
												<input
													id="card_number"
													type="text"
													maxlength="19"
													placeholder="4500 •••• •••• ••••"
													class="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
												/>
												<span class="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400">
													💳
												</span>
											</div>
										</div>

										<div class="grid grid-cols-3 gap-2">
											<div>
												<label for="card_expiry" class="text-[11px] text-slate-400 block mb-1">Expiry</label>
												<input
													id="card_expiry"
													type="text"
													maxlength="5"
													placeholder="MM/YY"
													class="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-red-500 text-center"
												/>
											</div>
											<div>
												<label for="card_cvc" class="text-[11px] text-slate-400 block mb-1">CVV/CVC</label>
												<input
													id="card_cvc"
													type="password"
													maxlength="4"
													placeholder="•••"
													class="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-red-500 text-center"
												/>
											</div>
											<div>
												<label for="card_postal" class="text-[11px] text-slate-400 block mb-1">Postal Code</label>
												<input
													id="card_postal"
													type="text"
													maxlength="7"
													placeholder="V6B 1A1"
													class="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs uppercase font-mono text-white placeholder-slate-600 focus:outline-none focus:border-red-500 text-center"
												/>
											</div>
										</div>
									</div>
								{/if}
							</div>
						{/if}

						<!-- Message of Support -->
						<div class="space-y-1">
							<label for="message" class="text-xs font-semibold text-slate-300 block">
								Message of Solidarity <span class="text-slate-500 text-[11px]">(Optional)</span>
							</label>
							<textarea
								id="message"
								name="message"
								rows="2"
								bind:value={supportMessage}
								placeholder="Write a message of encouragement for families in Nepal..."
								class="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
							></textarea>
						</div>

						<!-- Submit Button -->
						<button
							type="submit"
							disabled={isSubmitting}
							class="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
						>
							{#if isSubmitting}
								<span>Processing Donation...</span>
							{:else if paymentMethod === 'card'}
								<span>Donate ${currentAmountValue} CAD 🔒</span>
							{:else}
								<span>Record e-Transfer (${currentAmountValue} CAD)</span>
							{/if}
						</button>

						{#if paymentMethod === 'etransfer'}
							<p class="text-[11px] text-center text-slate-500 leading-normal">
								After recording, please send Interac e-Transfer to <span class="text-slate-300 font-semibold">info@canfacs.org</span>.
							</p>
						{/if}
					</form>
				</div>
			</div>
		</div>

		<!-- Public Donors & Messages of Solidarity -->
		<div class="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 space-y-8">
			<div class="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-800 pb-6 gap-4">
				<div>
					<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
						❤️ Community Honor Roll
					</div>
					<h2 class="text-2xl sm:text-3xl font-extrabold text-white">
						Supporters & Messages of Hope
					</h2>
					<p class="text-xs sm:text-sm text-slate-400 mt-1">
						Thank you to all community members across Canada and worldwide standing with Nepal.
					</p>
				</div>

				<div class="text-xs font-semibold text-slate-300 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 self-start sm:self-auto">
					Total Contributors: <strong class="text-white">{data.donations.length}</strong>
				</div>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				{#each data.donations as donation}
					<div class="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors">
						<div class="flex items-start justify-between gap-3">
							<div class="flex items-center gap-3">
								<div class="w-10 h-10 rounded-full bg-gradient-to-tr from-red-900 to-slate-800 border border-red-700/50 flex items-center justify-center font-bold text-white text-sm shadow">
									{donation.is_anonymous ? '?' : donation.donor_name.charAt(0)}
								</div>
								<div>
									<h4 class="font-bold text-white text-sm">{donation.donor_name}</h4>
									<span class="text-[11px] text-slate-400">
										{new Date(donation.created_at).toLocaleDateString('en-CA', {
											month: 'short',
											day: 'numeric',
											year: 'numeric'
										})}
									</span>
								</div>
							</div>

							<div class="text-right">
								<span class="inline-block px-3 py-1 rounded-full bg-red-950/80 border border-red-800/60 font-black text-red-400 text-sm">
									${Number(donation.amount).toLocaleString('en-CA')} CAD
								</span>
							</div>
						</div>

						{#if donation.message}
							<div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300 italic leading-relaxed">
								"{donation.message}"
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
