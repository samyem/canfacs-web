import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getDb, createDonation, getDonations } from '$lib/server/db';
import { NEPAL_FLOOD_RELIEF_CAMPAIGN } from '$lib/data/siteData';
import { sendDonationConfirmationEmail } from '$lib/server/email';

/**
 * Square Webhook Endpoint
 * Receives payment.created and payment.updated events from Square
 * URL: https://canfacs.org/api/webhooks/square
 */
export const POST: RequestHandler = async ({ request, platform }) => {
	try {
		const rawBody = await request.text();
		let payload: any;
		try {
			payload = JSON.parse(rawBody);
		} catch {
			return json({ error: 'Invalid JSON payload' }, { status: 400 });
		}

		console.log('[Square Webhook Event]', payload.type, payload.event_id);

		// Handle payment creation / completion
		if (payload.type === 'payment.created' || payload.type === 'payment.updated') {
			const payment = payload.data?.object?.payment;
			if (!payment) {
				return json({ success: true, message: 'No payment object in event' });
			}

			const paymentId = payment.id;
			const status = payment.status; // 'COMPLETED', 'APPROVED', etc.
			const amountInCents = payment.amount_money?.amount || 0;
			const amountCAD = amountInCents / 100;
			const buyerEmail = payment.buyer_email_address || payment.billing_address?.email || '';
			const note = payment.note || '';
			const receiptUrl = payment.receipt_url || '';

			if (status === 'COMPLETED' && amountCAD > 0) {
				const db = getDb(platform);

				// Check if this payment is already recorded in the database
				const existing = await getDonations(db, NEPAL_FLOOD_RELIEF_CAMPAIGN.id);
				const isAlreadySaved = existing.some(
					(d) => d.id === `sq_${paymentId}` || d.id === paymentId || (d.message && d.message.includes(paymentId))
				);

				const donorName =
					payment.buyer_name ||
					(payment.billing_address
						? `${payment.billing_address.first_name || ''} ${payment.billing_address.last_name || ''}`.trim()
						: '') ||
					'Community Donor';

				if (!isAlreadySaved) {
					await createDonation(db, {
						id: `sq_${paymentId}`,
						donor_name: donorName,
						email: buyerEmail,
						amount: amountCAD,
						currency: 'CAD',
						message: note ? note.trim() : null,
						is_anonymous: false,
						campaign_id: NEPAL_FLOOD_RELIEF_CAMPAIGN.id
					});
				}

				// Send the Nepal Flood Relief confirmation receipt
				if (buyerEmail && buyerEmail.includes('@')) {
					await sendDonationConfirmationEmail(
						{
							to: buyerEmail,
							donorName,
							amountCAD,
							campaignName: NEPAL_FLOOD_RELIEF_CAMPAIGN.title,
							isOnlinePayment: true,
							paymentMethod: 'card',
							transactionId: paymentId,
							receiptUrl,
							message: note || undefined
						},
						platform?.env
					);
				}
			}
		}

		return json({ success: true, received: true });
	} catch (err: any) {
		console.error('[Square Webhook Error]', err);
		return json({ error: err.message || 'Webhook processing failed' }, { status: 500 });
	}
};
