import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	getDb,
	getCampaigns,
	getDonations,
	createDonation,
	updateDonation,
	deleteDonation,
	getDisbursements,
	createDisbursement,
	deleteDisbursement
} from '$lib/server/db';
import { NEPAL_FLOOD_RELIEF_CAMPAIGN } from '$lib/data/siteData';

export const load: PageServerLoad = async ({ locals, platform, url }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		throw redirect(303, '/login');
	}

	const db = getDb(platform);
	const campaigns = await getCampaigns(db);
	const selectedCampaignId = url.searchParams.get('campaign') || NEPAL_FLOOD_RELIEF_CAMPAIGN.id;

	const donations = await getDonations(db, selectedCampaignId);
	const disbursements = await getDisbursements(db, selectedCampaignId);

	const totalRaised = donations.reduce((sum, d) => sum + Number(d.amount), 0);
	const totalReceived = donations
		.filter((d) => d.status === 'received')
		.reduce((sum, d) => sum + Number(d.amount), 0);
	const totalPledged = donations
		.filter((d) => d.status === 'pledged')
		.reduce((sum, d) => sum + Number(d.amount), 0);
	const totalDisbursed = disbursements.reduce((sum, d) => sum + Number(d.amount), 0);
	const netAvailableBalance = totalReceived - totalDisbursed;

	return {
		campaigns,
		selectedCampaignId,
		donations,
		disbursements,
		stats: {
			totalRaised,
			totalReceived,
			totalPledged,
			totalDisbursed,
			netAvailableBalance,
			totalDonors: donations.length,
			receivedCount: donations.filter((d) => d.status === 'received').length,
			pledgedCount: donations.filter((d) => d.status === 'pledged').length
		}
	};
};

export const actions: Actions = {
	addDonation: async ({ request, locals, platform }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const donor_name = formData.get('donor_name')?.toString().trim();
		const email = formData.get('email')?.toString().trim() || null;
		const amount = parseFloat(formData.get('amount')?.toString() || '0');
		const message = formData.get('message')?.toString().trim() || null;
		const status = (formData.get('status')?.toString() as 'pledged' | 'received') || 'received';
		const campaign_id = formData.get('campaign_id')?.toString() || NEPAL_FLOOD_RELIEF_CAMPAIGN.id;
		const is_anonymous = formData.get('is_anonymous') === 'on' || formData.get('is_anonymous') === 'true';

		if (!donor_name || isNaN(amount) || amount <= 0) {
			return fail(400, { error: 'Please provide a valid donor name and amount greater than $0.' });
		}

		const db = getDb(platform);
		await createDonation(db, {
			donor_name,
			email,
			amount,
			currency: 'CAD',
			message,
			status,
			is_anonymous,
			campaign_id
		});

		return { success: true, message: `Added donation for ${donor_name} ($${amount} CAD) as ${status.toUpperCase()}.` };
	},

	updateDonation: async ({ request, locals, platform }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const donor_name = formData.get('donor_name')?.toString().trim();
		const email = formData.get('email')?.toString().trim() || null;
		const amount = parseFloat(formData.get('amount')?.toString() || '0');
		const message = formData.get('message')?.toString().trim() || null;
		const status = (formData.get('status')?.toString() as 'pledged' | 'received') || 'received';
		const is_anonymous = formData.get('is_anonymous') === 'on' || formData.get('is_anonymous') === 'true';

		if (!id || !donor_name || isNaN(amount) || amount <= 0) {
			return fail(400, { error: 'Invalid donation details.' });
		}

		const db = getDb(platform);
		await updateDonation(db, id, {
			donor_name,
			email,
			amount,
			message,
			status,
			is_anonymous
		});

		return { success: true, message: `Updated donation for ${donor_name}.` };
	},

	toggleStatus: async ({ request, locals, platform }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const newStatus = formData.get('status')?.toString() as 'pledged' | 'received';

		if (!id || !newStatus) {
			return fail(400, { error: 'Missing donation ID or status' });
		}

		const db = getDb(platform);
		await updateDonation(db, id, { status: newStatus });

		return { success: true, message: `Status updated to ${newStatus.toUpperCase()}` };
	},

	deleteDonation: async ({ request, locals, platform }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'Missing donation ID' });
		}

		const db = getDb(platform);
		await deleteDonation(db, id);

		return { success: true, message: 'Donation record deleted successfully.' };
	},

	recordDisbursement: async ({ request, locals, platform }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const campaign_id = formData.get('campaign_id')?.toString() || NEPAL_FLOOD_RELIEF_CAMPAIGN.id;
		const recipient = formData.get('recipient')?.toString().trim();
		const amount = parseFloat(formData.get('amount')?.toString() || '0');
		const disbursed_at = formData.get('disbursed_at')?.toString() || new Date().toISOString().split('T')[0];
		const reference_number = formData.get('reference_number')?.toString().trim() || undefined;
		const notes = formData.get('notes')?.toString().trim() || undefined;
		const document_url = formData.get('document_url')?.toString().trim() || undefined;
		const selectedDonationIds = formData.getAll('donation_ids') as string[];

		if (!recipient || isNaN(amount) || amount <= 0) {
			return fail(400, { error: 'Please provide recipient organization and disbursement amount.' });
		}

		const db = getDb(platform);
		await createDisbursement(db, {
			campaign_id,
			recipient,
			amount,
			disbursed_at,
			reference_number,
			notes,
			document_url,
			donation_ids: selectedDonationIds
		});

		return { success: true, message: `Disbursement of $${amount} CAD to ${recipient} recorded successfully.` };
	},

	deleteDisbursement: async ({ request, locals, platform }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'Missing disbursement ID' });
		}

		const db = getDb(platform);
		await deleteDisbursement(db, id);

		return { success: true, message: 'Disbursement record removed.' };
	}
};
