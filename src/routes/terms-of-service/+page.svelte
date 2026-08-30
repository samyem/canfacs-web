<script lang="ts">
	import { SITE_INFO } from '$lib/data/siteData';
</script>

<svelte:head>
	<title>Terms of Service - {SITE_INFO.name}</title>
	<meta
		name="description"
		content="Terms of Service for Canada-Nepal Friendship and Cultural Society (CANFACS). Guidelines for membership, donations, and platform use."
	/>
</svelte:head>

<section class="py-16 sm:py-20 bg-slate-950 min-h-screen text-slate-200">
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
		<!-- Header -->
		<div class="text-center space-y-4 border-b border-slate-800 pb-10">
			<span class="inline-block px-3 py-1 text-xs uppercase tracking-wider font-bold text-red-500 bg-red-500/10 rounded-full border border-red-500/20">
				Legal Terms & Guidelines
			</span>
			<h1 class="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">Terms of Service</h1>
			<p class="text-slate-400 text-sm max-w-xl mx-auto">
				Last Updated: August 30, 2026 • Canada-Nepal Friendship & Cultural Society (CANFACS)
			</p>
		</div>

		<!-- Content Blocks -->
		<div class="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 space-y-10 text-sm leading-relaxed text-slate-300 shadow-2xl">
			<!-- 1. Agreement to Terms -->
			<div class="space-y-3">
				<h2 class="text-xl font-bold text-white flex items-center gap-2">
					<span class="text-red-500">1.</span> Agreement to Terms
				</h2>
				<p>
					These Terms of Service ("Terms") constitute a legally binding agreement between you and the <strong>Canada-Nepal Friendship & Cultural Society</strong> ("CANFACS", "we", "us", or "our", Society Registration #S-0066228). By accessing <a href="https://canfacs.org" class="text-red-400 hover:underline">canfacs.org</a>, applying for membership, participating in our community feed, or donating to our relief campaigns, you agree to be bound by these Terms and our <a href="/privacy-policy" class="text-red-400 hover:underline">Privacy Policy</a>.
				</p>
			</div>

			<!-- 2. Society Membership & Code of Conduct -->
			<div class="space-y-3">
				<h2 class="text-xl font-bold text-white flex items-center gap-2">
					<span class="text-red-500">2.</span> Membership & Community Conduct
				</h2>
				<p>
					Membership in CANFACS is open to individuals committed to fostering goodwill and cultural exchange between Canada and Nepal. Members using the online portal and community feed agree to:
				</p>
				<ul class="list-disc list-inside space-y-1.5 pl-2 text-slate-300">
					<li>Provide accurate, truthful registration information during application.</li>
					<li>Maintain respectful, constructive, and lawful communication on the Member Feed and discussion boards.</li>
					<li>Refrain from posting defamatory, hateful, abusive, discriminatory, or unauthorized promotional material.</li>
					<li>Safeguard their account credentials and promptly notify CANFACS if unauthorized account access is suspected.</li>
				</ul>
				<p class="text-xs text-slate-400 pt-1">
					CANFACS reserves the right to suspend or terminate membership access for any individual violating community standards or society bylaws.
				</p>
			</div>

			<!-- 3. Donations & Humanitarian Relief Funds -->
			<div class="space-y-3">
				<h2 class="text-xl font-bold text-white flex items-center gap-2">
					<span class="text-red-500">3.</span> Donations & Humanitarian Contributions
				</h2>
				<p>
					CANFACS conducts charitable and disaster relief campaigns (including the <em>Nepal Flood Emergency Relief & Rehabilitation Fund</em>). When contributing funds:
				</p>
				<ul class="list-disc list-inside space-y-1.5 pl-2 text-slate-300">
					<li>All donations made online via credit card (Square) or Interac e-Transfer are voluntary contributions toward the stated relief objectives.</li>
					<li>Funds raised for emergency initiatives are disbursed directly to authorized recipient bodies (such as the Government of Nepal Prime Minister's Disaster Relief Fund) with transparent public tracking logs maintained on our platform.</li>
					<li>Unless required by applicable Canadian consumer protection law, charitable contributions and emergency relief donations are non-refundable once processed.</li>
				</ul>
			</div>

			<!-- 4. Intellectual Property & User Content -->
			<div class="space-y-3">
				<h2 class="text-xl font-bold text-white flex items-center gap-2">
					<span class="text-red-500">4.</span> Intellectual Property & User Content
				</h2>
				<p>
					The CANFACS name, logo, site design, and official society materials are the property of the Canada-Nepal Friendship & Cultural Society. By submitting posts, commentary, or photos to the Member Feed, you grant CANFACS a non-exclusive, royalty-free license to display your content to society members within the platform.
				</p>
			</div>

			<!-- 5. Disclaimer of Warranties & Limitation of Liability -->
			<div class="space-y-3">
				<h2 class="text-xl font-bold text-white flex items-center gap-2">
					<span class="text-red-500">5.</span> Disclaimer of Warranties & Limitation of Liability
				</h2>
				<p>
					Our digital services and website are provided on an "as is" and "as available" basis without warranties of any kind. CANFACS, its directors, and officers shall not be liable for any indirect, incidental, or consequential damages resulting from the use of, or inability to use, this website or community services.
				</p>
			</div>

			<!-- 6. Governing Law -->
			<div class="space-y-3">
				<h2 class="text-xl font-bold text-white flex items-center gap-2">
					<span class="text-red-500">6.</span> Governing Law
				</h2>
				<p>
					These Terms shall be governed by and construed in accordance with the laws of the Province of British Columbia and the federal laws of Canada applicable therein.
				</p>
			</div>

			<!-- 7. Changes to Terms -->
			<div class="space-y-3">
				<h2 class="text-xl font-bold text-white flex items-center gap-2">
					<span class="text-red-500">7.</span> Amendments
				</h2>
				<p>
					We may update these Terms from time to time. Continued use of our website or membership portal following any updates constitutes acceptance of the revised Terms.
				</p>
			</div>

			<!-- 8. Contact Us -->
			<div class="pt-6 border-t border-slate-800 space-y-3">
				<h2 class="text-xl font-bold text-white flex items-center gap-2">
					<span class="text-red-500">8.</span> Inquiries & Contact
				</h2>
				<p>If you have any questions regarding these Terms of Service, please contact:</p>
				<div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 text-slate-300">
					<div class="font-bold text-white">{SITE_INFO.fullName}</div>
					<div>Non-profit Society #S-0066228</div>
					<div>Email: <a href="mailto:info@canfacs.org" class="text-red-400 underline font-semibold">info@canfacs.org</a></div>
					<div>Website: <a href="https://canfacs.org" class="text-slate-400 hover:text-white">https://canfacs.org</a></div>
				</div>
			</div>
		</div>

		<div class="text-center">
			<a href="/" class="text-xs font-semibold text-slate-400 hover:text-white transition-colors">
				&larr; Return to CANFACS Homepage
			</a>
		</div>
	</div>
</section>
