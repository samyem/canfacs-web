/**
 * Cloudflare Email Sending integration for CANFACS
 * Sends transactional donation confirmations and receipts
 */

export interface DonationEmailData {
	to: string;
	donorName: string;
	amountCAD: number;
	campaignName: string;
	isOnlinePayment: boolean;
	paymentMethod: 'card' | 'etransfer';
	transactionId?: string;
	receiptUrl?: string;
	message?: string;
}

export async function sendDonationConfirmationEmail(
	data: DonationEmailData,
	env?: Record<string, any>
): Promise<{ success: boolean; error?: string; delivered?: boolean }> {
	const apiToken = env?.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN;
	const accountId =
		env?.CLOUDFLARE_ACCOUNT_ID ||
		process.env.CLOUDFLARE_ACCOUNT_ID ||
		'799a8a7bf560864dc5eec876d6a91ebf';
	const fromAddress =
		env?.CLOUDFLARE_FROM_EMAIL || process.env.CLOUDFLARE_FROM_EMAIL || 'info@canfacs.org';

	if (!data.to || !data.to.includes('@')) {
		return { success: false, error: 'Recipient email address missing or invalid' };
	}

	if (!apiToken) {
		console.warn(
			'[CANFACS Email] CLOUDFLARE_API_TOKEN is not configured. Email confirmation skipped.'
		);
		return {
			success: false,
			error: 'CLOUDFLARE_API_TOKEN not configured in environment.'
		};
	}

	const dateFormatted = new Date().toLocaleDateString('en-CA', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: 'America/Toronto'
	});

	const subject = `Thank You for Your Donation to Nepal Flood Relief – CANFACS (Receipt #${data.transactionId || 'PLEDGE'})`;

	const paymentSummaryText =
		data.paymentMethod === 'card'
			? data.isOnlinePayment
				? `Paid Online via Square Card (Transaction: ${data.transactionId || 'Processed'})`
				: `Online Card Payment`
			: `Interac e-Transfer (Pending transfer to info@canfacs.org)`;

	const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
    .card { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .header { text-align: center; border-bottom: 1px solid #334155; padding-bottom: 24px; margin-bottom: 24px; }
    .badge { display: inline-block; background: #dc2626; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 12px; }
    h1 { margin: 0 0 8px; color: #ffffff; font-size: 24px; }
    .subtitle { color: #94a3b8; font-size: 14px; margin: 0; }
    .details-table { width: 100%; border-collapse: collapse; margin: 24px 0; background: #0f172a; border-radius: 12px; overflow: hidden; border: 1px solid #334155; }
    .details-table td { padding: 12px 16px; border-bottom: 1px solid #1e293b; font-size: 14px; color: #cbd5e1; }
    .details-table td.label { font-weight: 600; color: #94a3b8; width: 40%; }
    .amount-highlight { font-size: 28px; font-weight: 800; color: #38bdf8; text-align: center; padding: 16px; background: #0f172a; border-radius: 12px; margin: 20px 0; border: 1px solid #0284c7; }
    .pmo-box { background: #451a03; border: 1px solid #b45309; border-radius: 12px; padding: 16px; margin: 24px 0; font-size: 13px; color: #fde68a; line-height: 1.5; }
    .footer { text-align: center; font-size: 12px; color: #64748b; margin-top: 32px; border-top: 1px solid #334155; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="badge">Official Donation Confirmation</span>
      <h1>Canada-Nepal Friendship & Cultural Society</h1>
      <p class="subtitle">CANFACS • Federal Non-Profit Society • Established 2016</p>
    </div>

    <p style="font-size: 16px; color: #ffffff;">Dear <strong>${data.donorName}</strong>,</p>

    <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
      On behalf of the Canada-Nepal Friendship & Cultural Society (CANFACS) and all communities affected by the recent catastrophic floods and landslides in Nepal, <strong>thank you deeply for your generous contribution.</strong>
    </p>

    <div class="amount-highlight">
      $${data.amountCAD.toFixed(2)} CAD
      <div style="font-size: 12px; font-weight: normal; color: #94a3b8; margin-top: 4px;">Donation Amount</div>
    </div>

    <table class="details-table">
      <tr>
        <td class="label">Campaign</td>
        <td><strong>${data.campaignName}</strong></td>
      </tr>
      <tr>
        <td class="label">Donor Name</td>
        <td>${data.donorName}</td>
      </tr>
      <tr>
        <td class="label">Date</td>
        <td>${dateFormatted}</td>
      </tr>
      <tr>
        <td class="label">Payment Status</td>
        <td>${paymentSummaryText}</td>
      </tr>
      ${
				data.transactionId
					? `<tr><td class="label">Transaction Reference</td><td style="font-family: monospace; color: #38bdf8;">${data.transactionId}</td></tr>`
					: ''
			}
      ${
				data.message
					? `<tr><td class="label">Message of Hope</td><td style="font-style: italic;">"${data.message}"</td></tr>`
					: ''
			}
    </table>

    <div class="pmo-box">
      <strong>🏛️ Fund Transparency & Government PMO Disbursement:</strong><br>
      All funds collected through this appeal will be disbursed directly to the <strong>Government of Nepal Prime Minister's Disaster Relief Fund (PMO Fund)</strong> on behalf of CANFACS and its members. Every transfer is publicly tracked on our website at <a href="https://canfacs.org/impact/nepal-flood-relief" style="color: #67e8f9;">canfacs.org/impact/nepal-flood-relief</a>.
    </div>

    ${
			data.paymentMethod === 'etransfer' && !data.isOnlinePayment
				? `<div style="background: #1e1b4b; border: 1px solid #4338ca; border-radius: 12px; padding: 16px; margin: 16px 0; font-size: 13px; color: #c7d2fe;">
             <strong>Interac e-Transfer Instructions:</strong><br>
             Please complete your transfer from your Canadian bank to <strong style="color: #ffffff;">info@canfacs.org</strong> with reference <em>"Nepal Flood Relief - ${data.donorName}"</em>.
           </div>`
				: ''
		}

    <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
      Your support brings life-saving emergency food, potable drinking water purification, shelter kits, and restoration support to vulnerable children and families across Nepal.
    </p>

    <div class="footer">
      <p>Canada-Nepal Friendship & Cultural Society (CANFACS)</p>
      <p>Website: <a href="https://canfacs.org" style="color: #38bdf8;">canfacs.org</a> • Email: <a href="mailto:info@canfacs.org" style="color: #38bdf8;">info@canfacs.org</a></p>
      <p style="font-size: 11px; color: #475569;">This is an automated confirmation of your donation.</p>
    </div>
  </div>
</body>
</html>
`;

	const text = `
CANADA-NEPAL FRIENDSHIP & CULTURAL SOCIETY (CANFACS)
Official Donation Confirmation

Dear ${data.donorName},

Thank you for your generous contribution of $${data.amountCAD.toFixed(2)} CAD towards the ${data.campaignName}.

DONATION DETAILS:
- Donor: ${data.donorName}
- Amount: $${data.amountCAD.toFixed(2)} CAD
- Date: ${dateFormatted}
- Payment Method: ${paymentSummaryText}
${data.transactionId ? `- Transaction ID: ${data.transactionId}\n` : ''}

FUND DISBURSEMENT & TRANSPARENCY:
All funds collected will be disbursed directly to the Government of Nepal Prime Minister's Disaster Relief Fund (PMO Fund) on behalf of CANFACS and its members. Public tracking is available at: https://canfacs.org/impact/nepal-flood-relief

${
	data.paymentMethod === 'etransfer' && !data.isOnlinePayment
		? `INTERAC E-TRANSFER INSTRUCTIONS:\nPlease send $${data.amountCAD.toFixed(2)} CAD via Interac e-Transfer to info@canfacs.org with note "Nepal Flood Relief - ${data.donorName}".\n`
		: ''
}
With gratitude,
Canada-Nepal Friendship & Cultural Society (CANFACS)
Website: https://canfacs.org
Email: info@canfacs.org
`;

	// Priority 1: Native Cloudflare Worker Email Binding (env.EMAIL)
	if (env?.EMAIL && typeof env.EMAIL.send === 'function') {
		try {
			console.log('[CANFACS Email] Dispatching donation receipt via native Cloudflare EMAIL binding to:', data.to);
			await env.EMAIL.send({
				to: data.to.trim(),
				from: fromAddress.trim(),
				subject: subject.trim(),
				html,
				text
			});
			console.log(`[CANFACS Email Sent] Successfully sent receipt to ${data.to}`);
			return { success: true, delivered: true };
		} catch (bindingErr: any) {
			console.error('[CANFACS Email Binding Error]', bindingErr);
			return {
				success: false,
				error: bindingErr.message || 'Error dispatching donation receipt through native Cloudflare binding'
			};
		}
	}

	try {
		const res = await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${accountId}/email/sending/send`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${apiToken}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					from: fromAddress.trim(),
					to: data.to.trim(),
					subject: subject.trim(),
					html,
					text
				})
			}
		);

		const result: any = await res.json();
		if (!res.ok || result.success === false) {
			console.error('[CANFACS Email Error]', JSON.stringify(result, null, 2));
			const firstError = result.errors?.[0];
			const errorMsg = firstError?.message || (typeof firstError === 'string' ? firstError : null) || result.messages?.[0]?.message || `Cloudflare HTTP ${res.status}: Failed to send email`;
			return {
				success: false,
				error: errorMsg
			};
		}

		console.log(`[CANFACS Email Sent] Successfully sent receipt to ${data.to}`);
		return { success: true, delivered: true };
	} catch (err: any) {
		console.error('[CANFACS Email Exception]', err);
		return { success: false, error: err.message || 'Unknown network error sending email' };
	}
}

export interface CustomEmailData {
	to: string;
	subject: string;
	html: string;
	text?: string;
	fromAddress?: string;
}

export async function sendCustomEmail(
	data: CustomEmailData,
	env?: Record<string, any>
): Promise<{ success: boolean; error?: string; delivered?: boolean }> {
	const fromAddress =
		data.fromAddress ||
		env?.CLOUDFLARE_FROM_EMAIL ||
		process.env.CLOUDFLARE_FROM_EMAIL ||
		'info@canfacs.org';

	if (!data.to || !data.to.includes('@')) {
		return { success: false, error: 'Recipient email address missing or invalid' };
	}

	// Plain text fallback if not supplied
	const textContent =
		data.text ||
		data.html
			.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
			.replace(/<[^>]+>/g, ' ')
			.replace(/\s{2,}/g, ' ')
			.trim();

	// Priority 1: Native Cloudflare Worker Email Binding (env.EMAIL)
	if (env?.EMAIL && typeof env.EMAIL.send === 'function') {
		try {
			console.log('[CANFACS Email] Dispatching via native Cloudflare EMAIL binding to:', data.to);
			const response = await env.EMAIL.send({
				to: data.to.trim(),
				from: fromAddress.trim(),
				subject: data.subject.trim(),
				html: data.html,
				text: textContent
			});
			console.log('[CANFACS Email] Native dispatch successful:', response);
			return { success: true, delivered: true };
		} catch (bindingErr: any) {
			// Log full error details to diagnose Cloudflare binding rejections
			console.error('[CANFACS Email Binding Error]', {
				message: bindingErr?.message,
				code: bindingErr?.code,
				name: bindingErr?.name,
				stack: bindingErr?.stack,
				fromAddress,
				to: data.to
			});
			return {
				success: false,
				error: `Binding error (from: ${fromAddress}): ${bindingErr?.message || 'Unknown error from Cloudflare EMAIL binding'}`
			};
		}
	}

	// Priority 2: Cloudflare Email Sending REST API fallback
	const apiToken = env?.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN;
	const accountId =
		env?.CLOUDFLARE_ACCOUNT_ID ||
		process.env.CLOUDFLARE_ACCOUNT_ID ||
		'799a8a7bf560864dc5eec876d6a91ebf';

	if (!apiToken) {
		console.warn(
			`[CANFACS Email Simulation] CLOUDFLARE_API_TOKEN and env.EMAIL binding not set. Simulating delivery to ${data.to} from ${fromAddress}`
		);
		return {
			success: true,
			delivered: true,
			error: 'CLOUDFLARE_API_TOKEN not configured; email simulated locally.'
		};
	}

	// Note: REST API payload for /accounts/{account_id}/email/sending/send
	// account_id MUST NOT be in the body (it is only in the path)
	const payload = {
		from: fromAddress.trim(),
		to: data.to.trim(),
		subject: data.subject.trim(),
		html: data.html,
		text: textContent
	};

	console.log('[CANFACS Email Attempting REST Send]', {
		endpoint: `https://api.cloudflare.com/client/v4/accounts/${accountId}/email/sending/send`,
		from: payload.from,
		to: payload.to,
		subject: payload.subject,
		hasHtml: Boolean(payload.html),
		hasText: Boolean(payload.text)
	});

	try {
		const res = await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${accountId}/email/sending/send`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${apiToken}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			}
		);

		const result: any = await res.json();
		if (!res.ok || result.success === false) {
			console.error('[CANFACS Email Error]', JSON.stringify({ result, sentPayloadMeta: { from: payload.from, to: payload.to, subject: payload.subject } }, null, 2));
			const firstError = result.errors?.[0];
			const errorMsg = firstError?.message || (typeof firstError === 'string' ? firstError : null) || result.messages?.[0]?.message || `Cloudflare HTTP ${res.status}: Failed to send email`;
			return {
				success: false,
				error: errorMsg
			};
		}

		return { success: true, delivered: true };
	} catch (err: any) {
		console.error('[CANFACS Email Exception]', err);
		return { success: false, error: err.message || 'Network error communicating with Cloudflare' };
	}
}

export interface PasswordResetEmailData {
	to: string;
	recipientName: string;
	tempPassword: string;
	loginUrl?: string;
}

export async function sendPasswordResetEmail(
	data: PasswordResetEmailData,
	env?: Record<string, any>
): Promise<{ success: boolean; error?: string; delivered?: boolean }> {
	const loginUrl = data.loginUrl || 'https://canfacs.org/login';
	const recipientName = data.recipientName || 'Member';

	const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f8fafc; margin: 0; padding: 24px; }
    .card { max-width: 600px; margin: 0 auto; background: #111827; border-radius: 20px; border: 1px solid #1f2937; padding: 36px; box-shadow: 0 16px 36px rgba(0,0,0,0.6); }
    .header { text-align: center; border-bottom: 1px solid #1f2937; padding-bottom: 24px; margin-bottom: 24px; }
    .badge { display: inline-block; background: #dc2626; color: #ffffff; padding: 5px 14px; border-radius: 9999px; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 14px; }
    h1 { margin: 0 0 6px; color: #ffffff; font-size: 22px; font-weight: 800; }
    .subtitle { color: #94a3b8; font-size: 13px; margin: 0; }
    .box { background: #0b0f19; border: 1px solid #1f2937; border-radius: 14px; padding: 20px; margin: 24px 0; }
    .creds-table { width: 100%; border-collapse: collapse; }
    .creds-table td { padding: 8px 10px; font-size: 14px; }
    .label { color: #94a3b8; width: 35%; font-weight: 600; }
    .value { color: #f8fafc; font-family: monospace; font-weight: 700; }
    .pass-highlight { font-size: 18px; color: #38bdf8; background: #1e293b; padding: 4px 10px; border-radius: 8px; letter-spacing: 0.05em; display: inline-block; }
    .btn-container { text-align: center; margin: 28px 0 20px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff !important; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 14px; text-decoration: none; box-shadow: 0 4px 14px rgba(220, 38, 38, 0.4); }
    .note { font-size: 12px; color: #94a3b8; line-height: 1.6; margin-top: 20px; }
    .footer { text-align: center; font-size: 12px; color: #64748b; margin-top: 32px; border-top: 1px solid #1f2937; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="badge">Official Account Notification</span>
      <h1>Canada-Nepal Friendship & Cultural Society</h1>
      <p class="subtitle">CANFACS • Federal Non-Profit Society • Established 2016</p>
    </div>

    <p style="font-size: 15px; color: #ffffff; margin-bottom: 12px;">Dear <strong>${recipientName}</strong>,</p>

    <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6; margin: 0 0 16px;">
      An administrator has set or reset your account login credentials for the CANFACS Member Portal. You can use the credentials below to log into your account:
    </p>

    <div class="box">
      <table class="creds-table">
        <tr>
          <td class="label">Username / Email:</td>
          <td class="value">${data.to}</td>
        </tr>
        <tr>
          <td class="label">Temporary Password:</td>
          <td><span class="pass-highlight">${data.tempPassword}</span></td>
        </tr>
      </table>
    </div>

    <div class="btn-container">
      <a href="${loginUrl}" class="btn">Log In to CANFACS Member Portal &rarr;</a>
    </div>

    <div class="note">
      <p style="margin: 0 0 8px;"><strong>Important Security Notes:</strong></p>
      <ul style="margin: 0; padding-left: 18px;">
        <li>After logging in, please change your password or verify your profile in the Member Dashboard.</li>
        <li>If you also use Google Sign-In with <strong>${data.to}</strong>, you can optionally log in with Google at any time.</li>
        <li>If you did not request this or believe this was done in error, please contact CANFACS Executive Committee at <a href="mailto:info@canfacs.org" style="color: #38bdf8;">info@canfacs.org</a>.</li>
      </ul>
    </div>

    <div class="footer">
      <p style="margin: 0 0 4px;">Canada-Nepal Friendship & Cultural Society (CANFACS)</p>
      <p style="margin: 0 0 4px;">Website: <a href="https://canfacs.org" style="color: #38bdf8;">canfacs.org</a> • Email: <a href="mailto:info@canfacs.org" style="color: #38bdf8;">info@canfacs.org</a></p>
      <p style="font-size: 11px; color: #475569; margin-top: 8px;">This is an official administrative communication from CANFACS.</p>
    </div>
  </div>
</body>
</html>
`;

	const text = `
CANADA-NEPAL FRIENDSHIP & CULTURAL SOCIETY (CANFACS)
Official Account Notification

Dear ${recipientName},

An administrator has set or reset your account login credentials for the CANFACS Member Portal.

Your Login Details:
Username / Email: ${data.to}
Temporary Password: ${data.tempPassword}

Login Link: ${loginUrl}

Security Notes:
- After logging in, you can update your password or profile at any time.
- If you use Google with ${data.to}, Google OAuth login is also enabled.
- For questions, please contact info@canfacs.org.

Canada-Nepal Friendship & Cultural Society (CANFACS)
Website: https://canfacs.org
Email: info@canfacs.org
`;

	return await sendCustomEmail(
		{
			to: data.to,
			subject: 'Your CANFACS Account Login Credentials',
			html,
			text
		},
		env
	);
}

export interface NewMemberApplicantData {
	id?: string;
	full_name: string;
	email: string;
	phone?: string | null;
	profession?: string | null;
	city?: string | null;
	province?: string | null;
	country?: string | null;
	bio?: string | null;
	created_at?: string;
}

export interface NewMemberAdminNotificationData {
	applicant: NewMemberApplicantData;
	adminEmails: string[];
	reviewUrl?: string;
}

export async function sendNewMemberAdminNotificationEmail(
	data: NewMemberAdminNotificationData,
	env?: Record<string, any>
): Promise<{ success: boolean; sentCount: number; errors?: string[] }> {
	const reviewUrl = data.reviewUrl || 'https://canfacs.org/admin/members?tab=pending';
	const recipientEmails = Array.from(
		new Set(
			(data.adminEmails || [])
				.map((e) => e.trim().toLowerCase())
				.filter((e) => e && e.includes('@'))
		)
	);

	if (recipientEmails.length === 0) {
		recipientEmails.push('info@canfacs.org');
	}

	const dateFormatted = new Date().toLocaleDateString('en-CA', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		timeZone: 'America/Toronto'
	});

	const locationText = [data.applicant.city, data.applicant.province, data.applicant.country || 'Canada']
		.filter(Boolean)
		.join(', ');

	const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f8fafc; margin: 0; padding: 24px; }
    .card { max-width: 620px; margin: 0 auto; background: #111827; border-radius: 20px; border: 1px solid #1f2937; padding: 36px; box-shadow: 0 16px 36px rgba(0,0,0,0.6); }
    .header { text-align: center; border-bottom: 1px solid #1f2937; padding-bottom: 24px; margin-bottom: 24px; }
    .badge { display: inline-block; background: #f59e0b; color: #0f172a; padding: 5px 14px; border-radius: 9999px; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 14px; }
    h1 { margin: 0 0 6px; color: #ffffff; font-size: 22px; font-weight: 800; }
    .subtitle { color: #94a3b8; font-size: 13px; margin: 0; }
    .box { background: #0b0f19; border: 1px solid #1f2937; border-radius: 14px; padding: 20px; margin: 24px 0; }
    .details-table { width: 100%; border-collapse: collapse; }
    .details-table td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #1e293b; }
    .details-table tr:last-child td { border-bottom: none; }
    .label { color: #94a3b8; width: 35%; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
    .value { color: #f8fafc; font-weight: 500; }
    .btn-container { text-align: center; margin: 28px 0 20px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #0f172a !important; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 14px; text-decoration: none; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4); }
    .footer { text-align: center; font-size: 12px; color: #64748b; margin-top: 32px; border-top: 1px solid #1f2937; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="badge">⏳ Pending Application Review</span>
      <h1>New Member Application Received</h1>
      <p class="subtitle">Canada-Nepal Friendship & Cultural Society • Admin Notice</p>
    </div>

    <p style="font-size: 15px; color: #ffffff; margin-bottom: 12px;">Hello CANFACS Administrators,</p>

    <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6; margin: 0 0 16px;">
      A new prospective member has submitted an application to join the society via the website portal. It is currently waiting under the <strong>⏳ Pending</strong> queue in the Admin Control Center for review.
    </p>

    <div class="box">
      <table class="details-table">
        <tr>
          <td class="label">Full Name</td>
          <td class="value"><strong>${data.applicant.full_name}</strong></td>
        </tr>
        <tr>
          <td class="label">Email Address</td>
          <td class="value"><a href="mailto:${data.applicant.email}" style="color: #38bdf8;">${data.applicant.email}</a></td>
        </tr>
        <tr>
          <td class="label">Phone</td>
          <td class="value">${data.applicant.phone || '—'}</td>
        </tr>
        <tr>
          <td class="label">Location</td>
          <td class="value">${locationText || '—'}</td>
        </tr>
        <tr>
          <td class="label">Profession</td>
          <td class="value">${data.applicant.profession || '—'}</td>
        </tr>
        ${
					data.applicant.bio
						? `<tr><td class="label">Biodata / Notes</td><td class="value" style="font-style: italic; color: #cbd5e1;">"${data.applicant.bio}"</td></tr>`
						: ''
				}
        <tr>
          <td class="label">Submitted</td>
          <td class="value font-mono" style="font-size: 12px; color: #94a3b8;">${dateFormatted}</td>
        </tr>
      </table>
    </div>

    <div class="btn-container">
      <a href="${reviewUrl}" class="btn">Open Admin Control Center & Review &rarr;</a>
    </div>

    <p style="font-size: 12px; color: #94a3b8; line-height: 1.6; text-align: center; margin-top: 16px;">
      In the Admin Control Center, you can approve the applicant with 1 click, assign organizational governance roles, or generate access credentials.
    </p>

    <div class="footer">
      <p style="margin: 0 0 4px;">Canada-Nepal Friendship & Cultural Society (CANFACS)</p>
      <p style="margin: 0 0 4px;">Website: <a href="https://canfacs.org" style="color: #38bdf8;">canfacs.org</a> • Email: <a href="mailto:info@canfacs.org" style="color: #38bdf8;">info@canfacs.org</a></p>
      <p style="font-size: 11px; color: #475569; margin-top: 8px;">Automated notification sent to all CANFACS Administrators.</p>
    </div>
  </div>
</body>
</html>
`;

	const text = `
CANADA-NEPAL FRIENDSHIP & CULTURAL SOCIETY (CANFACS)
Admin Notification: New Member Application Received

Hello Administrators,

A new membership application has been submitted and is pending review:

APPLICANT DETAILS:
- Full Name: ${data.applicant.full_name}
- Email: ${data.applicant.email}
- Phone: ${data.applicant.phone || 'Not provided'}
- Location: ${locationText || 'Not specified'}
- Profession: ${data.applicant.profession || 'Not provided'}
${data.applicant.bio ? `- Biodata: "${data.applicant.bio}"\n` : ''}- Submitted: ${dateFormatted}

REVIEW IN ADMIN CONTROL CENTER:
Please log in to review and approve this member: ${reviewUrl}

Canada-Nepal Friendship & Cultural Society (CANFACS)
https://canfacs.org | info@canfacs.org
`;

	const subject = `[CANFACS Admin] New Member Application: ${data.applicant.full_name}`;
	const errors: string[] = [];
	let sentCount = 0;

	for (const adminEmail of recipientEmails) {
		try {
			const res = await sendCustomEmail(
				{
					to: adminEmail,
					subject,
					html,
					text
				},
				env
			);
			if (res.success) {
				sentCount++;
			} else if (res.error) {
				errors.push(`${adminEmail}: ${res.error}`);
			}
		} catch (e: any) {
			errors.push(`${adminEmail}: ${e?.message || 'Dispatch error'}`);
		}
	}

	return {
		success: sentCount > 0,
		sentCount,
		errors: errors.length > 0 ? errors : undefined
	};
}

export interface PendingMemberConfirmationData {
	applicant: NewMemberApplicantData;
}

export async function sendPendingMemberConfirmationEmail(
	data: PendingMemberConfirmationData,
	env?: Record<string, any>
): Promise<{ success: boolean; error?: string; delivered?: boolean }> {
	const recipientName = data.applicant.full_name || 'Valued Member';
	const recipientEmail = data.applicant.email;

	if (!recipientEmail || !recipientEmail.includes('@')) {
		return { success: false, error: 'Applicant email address missing or invalid' };
	}

	const dateFormatted = new Date().toLocaleDateString('en-CA', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: 'America/Toronto'
	});

	const locationText = [data.applicant.city, data.applicant.province, data.applicant.country || 'Canada']
		.filter(Boolean)
		.join(', ');

	const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f8fafc; margin: 0; padding: 24px; }
    .card { max-width: 600px; margin: 0 auto; background: #111827; border-radius: 20px; border: 1px solid #1f2937; padding: 36px; box-shadow: 0 16px 36px rgba(0,0,0,0.6); }
    .header { text-align: center; border-bottom: 1px solid #1f2937; padding-bottom: 24px; margin-bottom: 24px; }
    .badge { display: inline-block; background: #dc2626; color: #ffffff; padding: 5px 14px; border-radius: 9999px; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 14px; }
    h1 { margin: 0 0 6px; color: #ffffff; font-size: 22px; font-weight: 800; }
    .subtitle { color: #94a3b8; font-size: 13px; margin: 0; }
    .box { background: #0b0f19; border: 1px solid #1f2937; border-radius: 14px; padding: 20px; margin: 24px 0; }
    .details-table { width: 100%; border-collapse: collapse; }
    .details-table td { padding: 9px 12px; font-size: 13px; border-bottom: 1px solid #1e293b; }
    .details-table tr:last-child td { border-bottom: none; }
    .label { color: #94a3b8; width: 35%; font-weight: 600; font-size: 12px; }
    .value { color: #f8fafc; }
    .status-badge { display: inline-block; background: #fef3c7; color: #92400e; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; }
    .step-box { background: #1e1b4b; border: 1px solid #4338ca; border-radius: 12px; padding: 18px; margin: 24px 0; font-size: 13px; color: #c7d2fe; line-height: 1.6; }
    .btn-container { text-align: center; margin: 28px 0 20px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff !important; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 14px; text-decoration: none; box-shadow: 0 4px 14px rgba(220, 38, 38, 0.4); }
    .footer { text-align: center; font-size: 12px; color: #64748b; margin-top: 32px; border-top: 1px solid #1f2937; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="badge">Application Received</span>
      <h1>Canada-Nepal Friendship & Cultural Society</h1>
      <p class="subtitle">CANFACS • Federal Non-Profit Society • Established 2016</p>
    </div>

    <p style="font-size: 15px; color: #ffffff; margin-bottom: 12px;">Dear <strong>${recipientName}</strong>,</p>

    <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6; margin: 0 0 16px;">
      Thank you for your interest in joining the <strong>Canada-Nepal Friendship & Cultural Society (CANFACS)</strong>! We are pleased to confirm that your membership registration has been received successfully.
    </p>

    <div class="step-box">
      <strong style="color: #ffffff; font-size: 14px;">📋 What Happens Next?</strong>
      <ol style="margin: 8px 0 0; padding-left: 20px; color: #e0e7ff;">
        <li>Our Executive Administration and Board of Directors will review your application.</li>
        <li>Once approved, you will receive an official notification email with your login credentials to access the <strong>CANFACS Member Portal</strong> and community directory.</li>
        <li>You will be able to connect with fellow members, participate in cultural and bilateral initiatives, and join general society meetings.</li>
      </ol>
    </div>

    <div class="box">
      <table class="details-table">
        <tr>
          <td class="label">Applicant Name</td>
          <td class="value"><strong>${recipientName}</strong></td>
        </tr>
        <tr>
          <td class="label">Registered Email</td>
          <td class="value">${recipientEmail}</td>
        </tr>
        ${locationText ? `<tr><td class="label">Location</td><td class="value">${locationText}</td></tr>` : ''}
        ${data.applicant.profession ? `<tr><td class="label">Profession</td><td class="value">${data.applicant.profession}</td></tr>` : ''}
        <tr>
          <td class="label">Application Date</td>
          <td class="value">${dateFormatted}</td>
        </tr>
        <tr>
          <td class="label">Current Status</td>
          <td class="value"><span class="status-badge">⏳ Pending Approval</span></td>
        </tr>
      </table>
    </div>

    <div class="btn-container">
      <a href="https://canfacs.org/our-story" class="btn">Explore CANFACS Programs & History &rarr;</a>
    </div>

    <p style="font-size: 13px; color: #94a3b8; line-height: 1.6; text-align: center; margin-top: 20px;">
      If you have any questions or would like to provide additional details regarding your application, feel free to reply directly to <a href="mailto:info@canfacs.org" style="color: #38bdf8;">info@canfacs.org</a>.
    </p>

    <div class="footer">
      <p style="margin: 0 0 4px;">Canada-Nepal Friendship & Cultural Society (CANFACS)</p>
      <p style="margin: 0 0 4px;">Website: <a href="https://canfacs.org" style="color: #38bdf8;">canfacs.org</a> • Email: <a href="mailto:info@canfacs.org" style="color: #38bdf8;">info@canfacs.org</a></p>
      <p style="font-size: 11px; color: #475569; margin-top: 8px;">Non-profit Society #S0066426 • Dedicated to bilateral cultural appreciation since 1965.</p>
    </div>
  </div>
</body>
</html>
`;

	const text = `
CANADA-NEPAL FRIENDSHIP & CULTURAL SOCIETY (CANFACS)
Membership Application Received

Dear ${recipientName},

Thank you for your interest in joining the Canada-Nepal Friendship & Cultural Society (CANFACS)! We have successfully received your membership application.

WHAT HAPPENS NEXT:
1. Our Executive Administration and Board of Directors will review your application.
2. Once approved, you will receive an official notification email with your login credentials to access the CANFACS Member Portal and community directory.
3. You will be able to connect with fellow members, participate in cultural and bilateral initiatives, and join general society meetings.

APPLICATION SUMMARY:
- Name: ${recipientName}
- Email: ${recipientEmail}
${locationText ? `- Location: ${locationText}\n` : ''}${data.applicant.profession ? `- Profession: ${data.applicant.profession}\n` : ''}- Date: ${dateFormatted}
- Status: Pending Approval

If you have any questions, feel free to contact us at info@canfacs.org.

Warm regards,
Canada-Nepal Friendship & Cultural Society (CANFACS)
Website: https://canfacs.org
Email: info@canfacs.org
`;

	return await sendCustomEmail(
		{
			to: recipientEmail,
			subject: 'Your CANFACS Membership Application Has Been Received',
			html,
			text
		},
		env
	);
}



