import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	getDb,
	getCampaigns,
	createCampaign,
	updateCampaign,
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
	const rawCampaigns = await getCampaigns(db);
	const selectedCampaignId = url.searchParams.get('campaign') || null;

	// Compute stats for all campaigns
	const campaigns = await Promise.all(
		rawCampaigns.map(async (c) => {
			const cDonations = await getDonations(db, c.id);
			const cDisbursements = await getDisbursements(db, c.id);
			const cRaised = cDonations.reduce((sum, d) => sum + Number(d.amount), 0);
			const cReceived = cDonations.filter((d) => d.status === 'received').reduce((sum, d) => sum + Number(d.amount), 0);
			const cPledged = cDonations.filter((d) => d.status === 'pledged').reduce((sum, d) => sum + Number(d.amount), 0);
			const cDisbursed = cDisbursements.reduce((sum, d) => sum + Number(d.amount), 0);
			return {
				...c,
				stats: {
					totalRaised: cRaised,
					totalReceived: cReceived,
					totalPledged: cPledged,
					totalDisbursed: cDisbursed,
					donorCount: cDonations.length,
					receivedCount: cDonations.filter((d) => d.status === 'received').length,
					pledgedCount: cDonations.filter((d) => d.status === 'pledged').length,
					netBalance: cReceived - cDisbursed
				}
			};
		})
	);

	// Society-wide global statistics across all initiatives
	const globalStats = {
		totalTargetGoal: campaigns.reduce((sum, c) => sum + Number(c.target_goal), 0),
		totalRaised: campaigns.reduce((sum, c) => sum + c.stats.totalRaised, 0),
		totalReceived: campaigns.reduce((sum, c) => sum + c.stats.totalReceived, 0),
		totalPledged: campaigns.reduce((sum, c) => sum + c.stats.totalPledged, 0),
		totalDisbursed: campaigns.reduce((sum, c) => sum + c.stats.totalDisbursed, 0),
		totalNetTreasury: campaigns.reduce((sum, c) => sum + c.stats.netBalance, 0),
		totalDonors: campaigns.reduce((sum, c) => sum + c.stats.donorCount, 0),
		campaignCount: campaigns.length
	};

	let selectedCampaign: any = null;
	let donations: any[] = [];
	let disbursements: any[] = [];
	let campaignStats = null;

	if (selectedCampaignId) {
		selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0];
		donations = await getDonations(db, selectedCampaign.id);
		disbursements = await getDisbursements(db, selectedCampaign.id);

		const totalRaised = donations.reduce((sum, d) => sum + Number(d.amount), 0);
		const totalReceived = donations
			.filter((d) => d.status === 'received')
			.reduce((sum, d) => sum + Number(d.amount), 0);
		const totalPledged = donations
			.filter((d) => d.status === 'pledged')
			.reduce((sum, d) => sum + Number(d.amount), 0);
		const totalDisbursed = disbursements.reduce((sum, d) => sum + Number(d.amount), 0);
		const netAvailableBalance = totalReceived - totalDisbursed;

		campaignStats = {
			totalRaised,
			totalReceived,
			totalPledged,
			totalDisbursed,
			netAvailableBalance,
			totalDonors: donations.length,
			receivedCount: donations.filter((d) => d.status === 'received').length,
			pledgedCount: donations.filter((d) => d.status === 'pledged').length
		};
	}

	return {
		campaigns,
		selectedCampaignId,
		selectedCampaign,
		globalStats,
		donations,
		disbursements,
		stats: campaignStats || {
			totalRaised: globalStats.totalRaised,
			totalReceived: globalStats.totalReceived,
			totalPledged: globalStats.totalPledged,
			totalDisbursed: globalStats.totalDisbursed,
			netAvailableBalance: globalStats.totalNetTreasury,
			totalDonors: globalStats.totalDonors,
			receivedCount: 0,
			pledgedCount: 0
		}
	};
};

export const actions: Actions = {
	createCampaign: async ({ request, locals, platform }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString().trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
		const title = formData.get('title')?.toString().trim();
		const subtitle = formData.get('subtitle')?.toString().trim() || undefined;
		const target_goal = parseFloat(formData.get('target_goal')?.toString() || '10000');

		if (!id || !title || isNaN(target_goal) || target_goal <= 0) {
			return fail(400, { error: 'Please provide valid campaign ID, Title, and Target Goal.' });
		}

		const db = getDb(platform);
		const { createCampaign } = await import('$lib/server/db');
		await createCampaign(db, {
			id,
			title,
			subtitle,
			target_goal,
			is_active: true
		});

		return { success: true, message: `Created new initiative "${title}" successfully.` };
	},

	updateCampaign: async ({ request, locals, platform }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const title = formData.get('title')?.toString().trim();
		const subtitle = formData.get('subtitle')?.toString().trim() || null;
		const target_goal = parseFloat(formData.get('target_goal')?.toString() || '0');
		const is_active = formData.get('is_active') === 'on' || formData.get('is_active') === 'true' || formData.get('is_active') === '1';

		if (!id || !title || isNaN(target_goal) || target_goal <= 0) {
			return fail(400, { error: 'Please provide a valid initiative title and target goal.' });
		}

		const db = getDb(platform);
		await updateCampaign(db, id, {
			title,
			subtitle,
			target_goal,
			is_active
		});

		return { success: true, message: `Updated initiative "${title}" details successfully.` };
	},

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
