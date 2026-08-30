import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { getDb, getDonations, createDonation } from '$lib/server/db';
import { NEPAL_FLOOD_RELIEF_CAMPAIGN } from '$lib/data/siteData';
import { getSquareConfig, processSquarePayment } from '$lib/server/square';

export const load: PageServerLoad = async ({ platform }) => {
	const db = getDb(platform);
	const donations = await getDonations(db, NEPAL_FLOOD_RELIEF_CAMPAIGN.id);
	const square = getSquareConfig(platform);

	const totalRaised = donations.reduce((sum, d) => sum + Number(d.amount), 0);
	const targetGoal = NEPAL_FLOOD_RELIEF_CAMPAIGN.targetGoalCAD;
	const percentRaised = Math.min(100, Math.round((totalRaised / targetGoal) * 100));

	return {
		campaign: NEPAL_FLOOD_RELIEF_CAMPAIGN,
		donations,
		stats: {
			totalRaised,
			targetGoal,
			percentRaised,
			donorCount: donations.length
		},
		square: {
			applicationId: square.applicationId,
			locationId: square.locationId,
			isConfigured: square.isConfigured,
			isSandbox: square.isSandbox,
			sdkUrl: square.sdkUrl
		}
	};
};

export const actions: Actions = {
	donate: async ({ request, platform }) => {
		const db = getDb(platform);
		const formData = await request.formData();

		const donor_name = formData.get('donor_name')?.toString() || '';
		const email = formData.get('email')?.toString() || '';
		const amountStr = formData.get('amount')?.toString() || '';
		const message = formData.get('message')?.toString() || '';
		const is_anonymous = formData.get('is_anonymous') === 'on' || formData.get('is_anonymous') === 'true';
		const payment_token = formData.get('payment_token')?.toString() || '';
		const payment_method = formData.get('payment_method')?.toString() || (payment_token ? 'card' : 'etransfer');

		const amount = parseFloat(amountStr);
		if (isNaN(amount) || amount <= 0) {
			return fail(400, {
				error: 'Please enter a valid donation amount greater than $0.',
				values: { donor_name, email, amountStr, message, is_anonymous, payment_method }
			});
		}

		if (!is_anonymous && !donor_name.trim()) {
			return fail(400, {
				error: 'Please provide your name or check the "Donate anonymously" box.',
				values: { donor_name, email, amountStr, message, is_anonymous, payment_method }
			});
		}

		let paymentReceiptUrl: string | undefined;
		let paymentId: string | undefined;

		// Process online payment with Square if payment token was generated from Card form
		if (payment_method === 'card' && payment_token) {
			try {
				const paymentResult = await processSquarePayment({
					platform,
					sourceId: payment_token,
					amountCAD: amount,
					donorName: is_anonymous ? 'Anonymous Donor' : donor_name,
					email: email || undefined,
					message: message || undefined
				});

				paymentReceiptUrl = paymentResult.receiptUrl;
				paymentId = paymentResult.paymentId;
			} catch (err: any) {
				console.error('Square payment processing error:', err);
				return fail(400, {
					error: `Payment failed: ${err.message || 'Unable to process card payment. Please verify your card details or try sending an Interac e-Transfer.'}`,
					values: { donor_name, email, amountStr, message, is_anonymous, payment_method }
				});
			}
		}

		try {
			await createDonation(db, {
				donor_name: is_anonymous ? 'Anonymous Donor' : donor_name,
				email,
				amount,
				currency: 'CAD',
				message: paymentId ? `${message ? message + ' • ' : ''}(Processed via Square - Ref: ${paymentId})` : message,
				is_anonymous,
				campaign_id: NEPAL_FLOOD_RELIEF_CAMPAIGN.id
			});

			return {
				success: true,
				isOnlinePayment: Boolean(paymentId),
				receiptUrl: paymentReceiptUrl,
				paymentId,
				amount,
				message: paymentId
					? `Thank you! Your payment of $${amount.toFixed(2)} CAD has been successfully processed through Square.`
					: `Thank you for recording your pledge of $${amount.toFixed(2)} CAD towards the Nepal Flood Emergency Relief Fund!`
			};
		} catch (err: any) {
			console.error('Error saving donation:', err);
			return fail(500, {
				error: 'An unexpected error occurred while saving your contribution. Please contact info@canfacs.org.',
				values: { donor_name, email, amountStr, message, is_anonymous, payment_method }
			});
		}
	}
};
