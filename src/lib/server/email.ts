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
		env?.CLOUDFLARE_FROM_EMAIL || process.env.CLOUDFLARE_FROM_EMAIL || 'welcome@canfacs.org';

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
			console.error('[CANFACS Email Binding Error]', bindingErr);
			return {
				success: false,
				error: bindingErr.message || 'Error dispatching email through native Cloudflare binding'
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

