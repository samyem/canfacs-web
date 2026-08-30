<script lang="ts">
	import { SITE_INFO } from '$lib/data/siteData';
</script>

<svelte:head>
	<title>Privacy Policy - {SITE_INFO.name}</title>
	<meta
		name="description"
		content="Privacy Policy for Canada-Nepal Friendship and Cultural Society (CANFACS). Learn how we protect member data, donations, and information."
	/>
</svelte:head>

<section class="py-16 sm:py-20 bg-slate-950 min-h-screen text-slate-200">
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
		<!-- Header -->
		<div class="text-center space-y-4 border-b border-slate-800 pb-10">
			<span class="inline-block px-3 py-1 text-xs uppercase tracking-wider font-bold text-red-500 bg-red-500/10 rounded-full border border-red-500/20">
				Legal & Transparency
			</span>
			<h1 class="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
			<p class="text-slate-400 text-sm max-w-xl mx-auto">
				Last Updated: August 30, 2026 • Canada-Nepal Friendship & Cultural Society (CANFACS)
			</p>
		</div>

		<!-- Content Blocks -->
		<div class="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 space-y-10 text-sm leading-relaxed text-slate-300 shadow-2xl">
			<!-- 1. Introduction -->
			<div class="space-y-3">
				<h2 class="text-xl font-bold text-white flex items-center gap-2">
					<span class="text-red-500">1.</span> Introduction & Scope
				</h2>
				<p>
					The <strong>Canada-Nepal Friendship & Cultural Society</strong> ("CANFACS", "we", "us", or "our", Society Registration #S-0066228) is committed to protecting your privacy and ensuring the confidentiality of the personal information you share with us. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you visit <a href="https://canfacs.org" class="text-red-400 hover:underline">canfacs.org</a>, apply for society membership, contribute donations, or interact with our community platform.
				</p>
			</div>

			<!-- 2. Information We Collect -->
			<div class="space-y-3">
				<h2 class="text-xl font-bold text-white flex items-center gap-2">
					<span class="text-red-500">2.</span> Information We Collect
				</h2>
				<p>We may collect personal information that you voluntarily provide to us, including:</p>
				<ul class="list-disc list-inside space-y-2 pl-2 text-slate-300">
					<li>
						<strong>Membership Applications:</strong> Full name, email address, telephone number, city, province, profession, and brief bio.
					</li>
					<li>
						<strong>Donations & Relief Contributions:</strong> Donor name, email address, payment method (processed securely through Square or Interac e-Transfer), contribution amount, solidarity messages, and whether you choose to remain anonymous on public donor rolls.
					</li>
					<li>
						<strong>Third-Party Authentication (Google Sign-In):</strong> When you choose to sign in via Google OAuth, we receive your verified email address, full name, and avatar solely to create or authenticate your CANFACS member account. We do not access your contacts, files, or any other Google account data.
					</li>
					<li>
						<strong>Community Interaction:</strong> Posts, comments, likes, and images you publish on the CANFACS Member Feed.
					</li>
				</ul>
			</div>

			<!-- 3. How We Use Information -->
			<div class="space-y-3">
				<h2 class="text-xl font-bold text-white flex items-center gap-2">
					<span class="text-red-500">3.</span> How We Use Your Information
				</h2>
				<p>Your information is used strictly to fulfill our non-profit mission and community services:</p>
				<ul class="list-disc list-inside space-y-1.5 pl-2 text-slate-300">
					<li>To administer, approve, and verify society memberships.</li>
					<li>To process donations, issue automated confirmation receipts, and maintain financial accountability logs.</li>
					<li>To facilitate communication, community discussions, and event announcements across provinces.</li>
					<li>To protect the security of our platform and prevent unauthorized access or fraud.</li>
				</ul>
			</div>

			<!-- 4. Payment Processing & Financial Security -->
			<div class="space-y-3">
				<h2 class="text-xl font-bold text-white flex items-center gap-2">
					<span class="text-red-500">4.</span> Payment Processing Security
				</h2>
				<p>
					We do not store or process raw credit card numbers on our servers. All credit and debit card donations are tokenized and processed securely through <strong>Square Payments (Square, Inc.)</strong> in compliance with PCI-DSS Tier 1 standards. Direct Interac e-Transfers are handled directly through Canadian financial institutions.
				</p>
			</div>

			<!-- 5. Data Sharing & Third Parties -->
			<div class="space-y-3">
				<h2 class="text-xl font-bold text-white flex items-center gap-2">
					<span class="text-red-500">5.</span> Disclosure of Information
				</h2>
				<p>
					<strong>CANFACS does not sell, rent, trade, or monetize your personal information to third parties.</strong> We only share information with trusted service providers necessary to operate our website and services (e.g., Cloudflare for hosting, Square for payments, Google for authentication, and Resend for transactional receipts), each bound by strict data confidentiality agreements.
				</p>
			</div>

			<!-- 6. Cookies and Analytics -->
			<div class="space-y-3">
				<h2 class="text-xl font-bold text-white flex items-center gap-2">
					<span class="text-red-500">6.</span> Cookies & Analytics
				</h2>
				<p>
					We use essential HTTP-only cookies (`canfacs_session`, `oauth_state`) to maintain secure member sessions and prevent CSRF attacks. We may also use Google Analytics to collect aggregated, non-personally identifiable site traffic metrics to understand visitor engagement.
				</p>
			</div>

			<!-- 7. Data Retention and Your Rights -->
			<div class="space-y-3">
				<h2 class="text-xl font-bold text-white flex items-center gap-2">
					<span class="text-red-500">7.</span> Data Retention & Your Rights
				</h2>
				<p>
					In accordance with Canadian privacy laws (including PIPEDA), you have the right to access, update, or request the deletion of your personal membership profile. If you wish to update your details or remove your account, contact our administrative team at <a href="mailto:info@canfacs.org" class="text-red-400 underline">info@canfacs.org</a>.
				</p>
			</div>

			<!-- 8. Contact Us -->
			<div class="pt-6 border-t border-slate-800 space-y-3">
				<h2 class="text-xl font-bold text-white flex items-center gap-2">
					<span class="text-red-500">8.</span> Contact Our Privacy Officer
				</h2>
				<p>If you have any questions or concerns regarding this Privacy Policy, please reach out to:</p>
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
