import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { getDb, getDonations, createDonation, getDisbursements } from '$lib/server/db';
import { NEPAL_FLOOD_RELIEF_CAMPAIGN } from '$lib/data/siteData';
import { getSquareConfig, getOrFetchLocationId, processSquarePayment } from '$lib/server/square';
import { sendDonationConfirmationEmail } from '$lib/server/email';

function cleanDonorMessage(msg: string | null | undefined): string | null {
	if (!msg) return null;
	const cleaned = msg
		.replace(/\s*\(Processed via Square(?: Webhook)? - Ref: [^)]+\)/gi, '')
		.replace(/\s*•\s*$/, '')
		.trim();
	return cleaned.length > 0 ? cleaned : null;
}

export const load: PageServerLoad = async ({ platform }) => {
	const db = getDb(platform);
	const rawDonations = await getDonations(db, NEPAL_FLOOD_RELIEF_CAMPAIGN.id);
	const square = getSquareConfig(platform);
	const disbursements = await getDisbursements(db, NEPAL_FLOOD_RELIEF_CAMPAIGN.id);

	let resolvedLocationId = square.locationId;
	if (square.isConfigured && !resolvedLocationId) {
		resolvedLocationId = await getOrFetchLocationId(square);
	}

	const donations = rawDonations
		.filter((d) => {
			if (d.id === 'don-bod-05') return false;
			const isSamyem = d.donor_name.toLowerCase().includes('samyem') || d.email?.toLowerCase().includes('samyem');
			const isSquare = d.id.startsWith('sq_') || (d.message && d.message.toLowerCase().includes('square'));
			if (isSamyem && !isSquare) return false;
			return true;
		})
		.map((d) => ({
			...d,
			message: cleanDonorMessage(d.message)
		}));

	const totalRaised = donations.reduce((sum, d) => sum + Number(d.amount), 0);
	const totalReceived = donations
		.filter((d) => d.status === 'received')
		.reduce((sum, d) => sum + Number(d.amount), 0);
	const totalPledged = donations
		.filter((d) => d.status === 'pledged')
		.reduce((sum, d) => sum + Number(d.amount), 0);
	const targetGoal = NEPAL_FLOOD_RELIEF_CAMPAIGN.targetGoalCAD;
	const percentRaised = Math.min(100, Math.round((totalRaised / targetGoal) * 100));

	return {
		campaign: NEPAL_FLOOD_RELIEF_CAMPAIGN,
		donations,
		disbursements,
		stats: {
			totalRaised,
			totalReceived,
			totalPledged,
			targetGoal,
			percentRaised,
			donorCount: donations.length
		},
		square: {
			applicationId: square.applicationId,
			locationId: resolvedLocationId,
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

		// Process online payment with Square when user chose Card
		if (payment_method === 'card') {
			if (!payment_token) {
				return fail(400, {
					error:
						'Square card payment could not be processed because the payment token was missing. Please ensure card details are entered in the Square form or select Interac e-Transfer to info@canfacs.org.',
					values: { donor_name, email, amountStr, message, is_anonymous, payment_method }
				});
			}

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
					error: `Payment failed: ${err.message || 'Unable to process card payment. Please verify your card details or try sending an Interac e-Transfer to info@canfacs.org.'}`,
					values: { donor_name, email, amountStr, message, is_anonymous, payment_method }
				});
			}
		}

		try {
			await createDonation(db, {
				id: paymentId ? `sq_${paymentId}` : undefined,
				donor_name: is_anonymous ? 'Anonymous Donor' : donor_name,
				email,
				amount,
				currency: 'CAD',
				message: message ? message.trim() : null,
				status: payment_method === 'card' ? 'received' : 'pledged',
				is_anonymous,
				campaign_id: NEPAL_FLOOD_RELIEF_CAMPAIGN.id
			});

			// Send automated confirmation / receipt email if email is provided
			if (email && email.includes('@')) {
				try {
					await sendDonationConfirmationEmail(
						{
							to: email,
							donorName: is_anonymous ? 'Anonymous Donor' : donor_name,
							amountCAD: amount,
							campaignName: NEPAL_FLOOD_RELIEF_CAMPAIGN.title,
							isOnlinePayment: Boolean(paymentId),
							paymentMethod: payment_method === 'card' ? 'card' : 'etransfer',
							transactionId: paymentId,
							receiptUrl: paymentReceiptUrl,
							message: message || undefined
						},
						platform?.env
					);
				} catch (emailErr) {
					console.warn('Could not send donation confirmation email:', emailErr);
				}
			}

			return {
				success: true,
				isOnlinePayment: Boolean(paymentId),
				receiptUrl: paymentReceiptUrl,
				paymentId,
				amount,
				message: paymentId
					? `Thank you! Your donation of $${amount.toFixed(2)} CAD has been successfully processed through Square.`
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
