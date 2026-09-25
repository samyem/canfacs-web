import { hashPassword } from './auth';
import { dev } from '$app/environment';

export interface MemberRow {
	id: string;
	email: string;
	password_hash: string | null;
	full_name: string;
	salutation?: string | null;
	phone: string | null;
	phone_secondary?: string | null;
	profession: string | null;
	organizational_role?: string | null;
	role_start_date?: string | null;
	role_end_date?: string | null;
	address_street?: string | null;
	city: string | null;
	province: string | null;
	country?: string | null;
	postal_code?: string | null;
	bio: string | null;
	facebook_id?: string | null;
	instagram_id?: string | null;
	associated_organizations?: string | null;
	google_login_enabled?: boolean | number;
	avatar_url?: string | null;
	display_order?: number;
	status: 'pending' | 'approved' | 'denied' | 'deleted';
	role: 'admin' | 'bod' | 'member' | 'partner' | string;
	created_at: string;
	approved_at: string | null;
	deleted_at?: string | null;
}

export interface PostRow {
	id: string;
	author_id: string;
	author_name: string;
	author_profession: string | null;
	author_avatar_url?: string | null;
	content: string;
	image_url: string | null;
	original_post_id: string | null;
	created_at: string;
	like_count: number;
	comment_count: number;
	user_liked?: boolean;
}

export interface CommentRow {
	id: string;
	post_id: string;
	author_id: string;
	author_name: string;
	content: string;
	image_url: string | null;
	created_at: string;
}

export interface CampaignRow {
	id: string;
	title: string;
	subtitle: string | null;
	target_goal: number;
	is_active: boolean;
	created_at: string;
}

export interface DonationRow {
	id: string;
	campaign_id: string;
	donor_name: string;
	email: string | null;
	amount: number;
	currency: string;
	message: string | null;
	status: 'pledged' | 'received';
	is_anonymous: boolean;
	created_at: string;
}

export interface EmailBatchRow {
	id: string;
	label: string;
	subject: string;
	template_id: string | null;
	content_html?: string | null;
	from_email: string;
	sender_admin_id: string;
	total_recipients: number;
	success_count: number;
	failure_count: number;
	status: 'processing' | 'completed' | 'failed';
	created_at: string;
}

export interface EmailLogRow {
	id: string;
	batch_id: string;
	recipient_email: string;
	recipient_name: string | null;
	status: 'sent' | 'failed';
	error_message: string | null;
	sent_at: string;
}

export interface EmailTemplateRow {
	id: string;
	name: string;
	description: string | null;
	subject_default: string | null;
	r2_key: string | null;
	html_content: string;
	created_at: string;
	updated_at: string;
}

export interface DisbursementRow {
	id: string;
	campaign_id: string;
	recipient: string;
	amount: number;
	disbursed_at: string;
	reference_number: string | null;
	notes: string | null;
	document_url: string | null;
	created_at: string;
	allocated_donations?: { donation_id: string; donor_name: string; amount: number }[];
}

export interface DisbursementAllocationRow {
	id: string;
	disbursement_id: string;
	donation_id: string;
	amount: number;
}

export interface OrganizationalRoleRow {
	id: string;
	title: string;
	category: 'executive' | 'board' | 'committee' | 'advisory' | string;
	rank_order: number;
	description: string | null;
	parent_role_id?: string | null;
	parent_title?: string | null;
}

export interface MemberOrganizationalRoleRow {
	id: string;
	member_id: string;
	role_id: string;
	title?: string;
	category?: string;
	rank_order?: number;
	parent_role_id?: string | null;
	parent_title?: string | null;
	start_date: string | null;
	end_date: string | null;
	is_active: boolean | number;
	notes: string | null;
	created_at: string;
}

export interface DocumentAttachment {
	id: string;
	key: string;
	fileName: string;
	fileSize: string;
	sizeBytes: number;
	url: string;
	contentType: string;
}

export type DocumentVisibility = 'public' | 'members' | 'bod' | 'admin';

export interface DocumentRow {
	id: string;
	title: string;
	slug: string;
	summary: string | null;
	category: string;
	content_html: string;
	banner_image_url: string | null;
	attachments: string | null; // JSON string of DocumentAttachment[]
	status: 'published' | 'draft';
	visibility: DocumentVisibility;
	author_id: string | null;
	author_name: string | null;
	published_at: string | null;
	created_at: string;
	updated_at: string;
}

// In-memory fallback store for local development when D1 binding is unattached
let localStoreInitialized = false;
let memoryMembers: MemberRow[] = [];
let memoryPosts: PostRow[] = [];
let memoryComments: CommentRow[] = [];
let memoryLikes: { post_id: string; member_id: string }[] = [];
let memoryCampaigns: CampaignRow[] = [];
let memoryDonations: DonationRow[] = [];
let memoryDisbursements: DisbursementRow[] = [];
let memoryAllocations: DisbursementAllocationRow[] = [];
let memoryEmailBatches: EmailBatchRow[] = [];
let memoryEmailLogs: EmailLogRow[] = [];
let memoryEmailTemplates: EmailTemplateRow[] = [];
let memoryOrgRoles: OrganizationalRoleRow[] = [];
let memoryMemberOrgRoles: MemberOrganizationalRoleRow[] = [];
let memoryDocuments: DocumentRow[] = [];

async function ensureDbDefaultAdmin(db: any) {
	if (!dev) return;
	try {
		const adminEmail = 'info@canfacs.org';
		const existing = await db.prepare(`SELECT id FROM members WHERE LOWER(email) = ?`).bind(adminEmail).first();
		if (!existing) {
			const adminHash = await hashPassword('CANFACS2026!2437');
			await db.prepare(
				`INSERT INTO members (id, email, password_hash, full_name, phone, profession, city, province, bio, status, role, created_at, approved_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
			).bind(
				'admin-001',
				adminEmail,
				adminHash,
				'CANFACS Executive Admin',
				'604-555-0199',
				'System Administrator',
				'Vancouver',
				'BC',
				'Official Administrative Account for Canada-Nepal Friendship and Cultural Society.',
				'approved',
				'admin',
				new Date().toISOString(),
				new Date().toISOString()
			).run();
		}
	} catch (e) {
		console.warn('Failed to ensure default admin in D1:', e);
	}
}

async function ensureLocalDefaultAdmin() {
	if (localStoreInitialized) return;
	localStoreInitialized = true;
	const adminEmail = 'info@canfacs.org';
	const adminHash = await hashPassword('CANFACS2026!2437');
	
	memoryMembers.push({
		id: 'admin-001',
		email: adminEmail,
		password_hash: adminHash,
		full_name: 'CANFACS Executive Admin',
		phone: '604-555-0199',
		profession: 'System Administrator',
		city: 'Vancouver',
		province: 'BC',
		bio: 'Official Administrative Account for Canada-Nepal Friendship and Cultural Society.',
		status: 'approved',
		role: 'admin',
		created_at: new Date().toISOString(),
		approved_at: new Date().toISOString()
	});

	// Seed Board of Directors (BOD) Members grouped by name with collected emails
	const bodSeedList: MemberRow[] = [
		{
			id: 'bod_bina_shrestha',
			email: 'bina.shrestha@canfacs.org',
			password_hash: null,
			full_name: 'Bina Shrestha',
			role: 'bod',
			organizational_role: 'Board of Directors (BOD)',
			status: 'approved',
			phone_secondary: 'shresthabina5@gmail.com',
			phone: null,
			profession: 'Executive Member & Community Leader',
			city: 'Vancouver',
			province: 'BC',
			bio: 'Board member supporting community outreach and bilateral cultural programs.',
			google_login_enabled: 1,
			created_at: '2026-09-06T10:00:00Z',
			approved_at: '2026-09-06T10:00:00Z'
		},
		{
			id: 'bod_debraj_dhakal',
			email: 'debrajdhakal1975@gmail.com',
			password_hash: null,
			full_name: 'Debraj Dhakal',
			role: 'bod',
			organizational_role: 'Board of Directors (BOD)',
			status: 'approved',
			phone: null,
			profession: 'Board Member',
			city: 'Toronto',
			province: 'ON',
			bio: 'Active member of CANFACS Board of Directors.',
			google_login_enabled: 1,
			created_at: '2026-09-06T10:00:00Z',
			approved_at: '2026-09-06T10:00:00Z'
		},
		{
			id: 'bod_kiroj_shrestha',
			email: 'kirojks@hotmail.com',
			password_hash: null,
			full_name: 'Kiroj Shrestha',
			role: 'bod',
			organizational_role: 'Board of Directors (BOD)',
			status: 'approved',
			phone: null,
			profession: 'Board Member',
			city: 'Vancouver',
			province: 'BC',
			bio: 'CANFACS Board member championing emergency relief and diaspora engagement.',
			google_login_enabled: 1,
			created_at: '2026-09-06T10:00:00Z',
			approved_at: '2026-09-06T10:00:00Z'
		},
		{
			id: 'bod_mackenzie_gospodin',
			email: 'mankajee@gmail.com',
			password_hash: null,
			full_name: 'Mackenzie Ami Gospodin',
			role: 'bod',
			organizational_role: 'Board of Directors (BOD)',
			status: 'approved',
			phone: null,
			profession: 'Board Member',
			city: 'Vancouver',
			province: 'BC',
			bio: 'CANFACS Board of Directors member.',
			google_login_enabled: 1,
			created_at: '2026-09-06T10:00:00Z',
			approved_at: '2026-09-06T10:00:00Z'
		},
		{
			id: 'bod_meghraj_gnawali',
			email: 'gnawalim@gmail.com',
			password_hash: null,
			full_name: 'Meghraj Gnawali',
			role: 'bod',
			organizational_role: 'Board of Directors (BOD)',
			status: 'approved',
			phone: null,
			profession: 'Physician / Board Director',
			city: 'Vancouver',
			province: 'BC',
			bio: 'Medical doctor and CANFACS Board member actively contributing to health and disaster relief initiatives.',
			google_login_enabled: 1,
			created_at: '2026-09-06T10:00:00Z',
			approved_at: '2026-09-06T10:00:00Z'
		},
		{
			id: 'bod_navin_dhakal',
			email: 'navin.dhakal@canfacs.org',
			password_hash: null,
			full_name: 'Navin Dhakal',
			role: 'bod',
			organizational_role: 'Board of Directors (BOD)',
			status: 'approved',
			phone_secondary: 'navin.dhakal@gmail.com',
			phone: null,
			profession: 'Board Member',
			city: 'Calgary',
			province: 'AB',
			bio: 'CANFACS Board member supporting Alberta chapter coordination.',
			google_login_enabled: 1,
			created_at: '2026-09-06T10:00:00Z',
			approved_at: '2026-09-06T10:00:00Z'
		},
		{
			id: 'bod_prakash_joshi',
			email: 'prakash.joshi@canfacs.org',
			password_hash: null,
			full_name: 'Prakash Joshi',
			role: 'bod',
			organizational_role: 'Board of Directors (BOD)',
			status: 'approved',
			phone: null,
			profession: 'Board Director',
			city: 'Vancouver',
			province: 'BC',
			bio: 'Senior member of the Board of Directors at CANFACS.',
			google_login_enabled: 1,
			created_at: '2026-09-06T10:00:00Z',
			approved_at: '2026-09-06T10:00:00Z'
		},
		{
			id: 'bod_prem_devkota',
			email: 'devkotapremb@gmail.com',
			password_hash: null,
			full_name: 'Prem Devkota',
			role: 'bod',
			organizational_role: 'Board of Directors (BOD)',
			status: 'approved',
			phone_secondary: 'devkotapremb@yahoo.com',
			phone: null,
			profession: 'Board Member',
			city: 'Toronto',
			province: 'ON',
			bio: 'CANFACS Board member actively fostering community relations.',
			google_login_enabled: 1,
			created_at: '2026-09-06T10:00:00Z',
			approved_at: '2026-09-06T10:00:00Z'
		},
		{
			id: 'bod_purushottam_thapa',
			email: 'purushottam.thapa@canfacs.org',
			password_hash: null,
			full_name: 'Purushottam Thapa',
			role: 'bod',
			organizational_role: 'Board of Directors (BOD)',
			status: 'approved',
			phone_secondary: 'thapapu@gmail.com',
			phone: null,
			profession: 'Board Member',
			city: 'Vancouver',
			province: 'BC',
			bio: 'Dedicated CANFACS Board member driving cultural exchanges.',
			google_login_enabled: 1,
			created_at: '2026-09-06T10:00:00Z',
			approved_at: '2026-09-06T10:00:00Z'
		},
		{
			id: 'bod_rudra_adhikari',
			email: 'adhikari.rudra@gmail.com',
			password_hash: null,
			full_name: 'Rudra Adhikari',
			role: 'bod',
			organizational_role: 'Board of Directors (BOD)',
			status: 'approved',
			phone: null,
			profession: 'Board Director',
			city: 'Halifax',
			province: 'NS',
			bio: 'Board member representing Atlantic Canada and fostering diaspora bonds.',
			google_login_enabled: 1,
			created_at: '2026-09-06T10:00:00Z',
			approved_at: '2026-09-06T10:00:00Z'
		},
		{
			id: 'bod_samyem_tuladhar',
			email: 'samyem@gmail.com',
			password_hash: null,
			full_name: 'Samyem Tuladhar',
			role: 'admin',
			organizational_role: 'Board of Directors (BOD) & Administrator',
			status: 'approved',
			phone: null,
			profession: 'Technology & Executive Lead',
			city: 'Vancouver',
			province: 'BC',
			bio: 'Executive Administrator and Board Member of CANFACS.',
			google_login_enabled: 1,
			created_at: '2026-09-06T10:00:00Z',
			approved_at: '2026-09-06T10:00:00Z'
		}
	];

	for (const bod of bodSeedList) {
		if (!memoryMembers.some((m) => m.email.toLowerCase() === bod.email.toLowerCase())) {
			memoryMembers.push(bod);
		}
	}

	// Seed Standard Organizational Roles
	const defaultOrgRoles: OrganizationalRoleRow[] = [
		{ id: 'org_admin', title: 'Administrator', category: 'executive', rank_order: 5, description: 'System Administrator & Governance Lead with administrative privileges (subset of Board of Directors)', parent_role_id: 'org_director' },
		{ id: 'org_president', title: 'President', category: 'executive', rank_order: 10, description: 'Society President and Chief Executive Officer of the Board', parent_role_id: 'org_director' },
		{ id: 'org_vp', title: 'Vice President', category: 'executive', rank_order: 20, description: 'Executive Vice President assisting the President and leading key society programs', parent_role_id: 'org_director' },
		{ id: 'org_general_secretary', title: 'General Secretary', category: 'executive', rank_order: 30, description: 'Executive Secretary managing society correspondence, records, and minutes', parent_role_id: 'org_director' },
		{ id: 'org_treasurer', title: 'Treasurer', category: 'executive', rank_order: 40, description: 'Executive Treasurer overseeing financial governance, filings, and audit statements', parent_role_id: 'org_director' },
		{ id: 'org_director', title: 'Board Director', category: 'board', rank_order: 50, description: 'Sitting Member of the Board of Directors (BOD) participating in society governance' },
		{ id: 'org_cultural_director', title: 'Director of Cultural Affairs', category: 'committee', rank_order: 60, description: 'Leads community cultural events, arts, and diaspora heritage programs' },
		{ id: 'org_community_outreach', title: 'Director of Community Outreach', category: 'committee', rank_order: 70, description: 'Oversees inter-provincial outreach and member relations' },
		{ id: 'org_youth_coordinator', title: 'Youth & Sports Coordinator', category: 'committee', rank_order: 80, description: 'Coordinates youth activities, student mentorship, and sports events' },
		{ id: 'org_senior_advisor', title: 'Senior Advisor', category: 'advisory', rank_order: 90, description: 'Eminent community elder or advisor guiding society strategic vision' }
	];

	for (const r of defaultOrgRoles) {
		if (!memoryOrgRoles.some((existing) => existing.id === r.id)) {
			memoryOrgRoles.push(r);
		}
	}

	// Seed Member Organizational Role assignments
	for (const bod of bodSeedList) {
		if (!memoryMemberOrgRoles.some((mor) => mor.member_id === bod.id)) {
			memoryMemberOrgRoles.push({
				id: `mor_${bod.id}`,
				member_id: bod.id,
				role_id: 'org_director',
				title: 'Board Director',
				category: 'board',
				rank_order: 50,
				start_date: '2026-01-01',
				end_date: null,
				is_active: 1,
				notes: 'Elected Board of Directors Member',
				created_at: '2026-09-06T10:00:00Z'
			});
		}
	}

	// Seed sample post
	memoryPosts.push({
		id: 'post-seed-1',
		author_id: 'admin-001',
		author_name: 'CANFACS Executive Admin',
		author_profession: 'System Administrator',
		content: 'Welcome to the new CANFACS Member Portal & Community Feed! 🎉 Stay connected, collaborate across provinces, and share updates.',
		image_url: '/canada-nepal-flags-hero.png',
		original_post_id: null,
		created_at: new Date().toISOString(),
		like_count: 5,
		comment_count: 1,
		user_liked: false
	});

	memoryComments.push({
		id: 'comment-seed-1',
		post_id: 'post-seed-1',
		author_id: 'admin-001',
		author_name: 'CANFACS Executive Admin',
		content: 'Feel free to leave comments, attach images, and like posts from fellow members!',
		image_url: null,
		created_at: new Date().toISOString()
	});

	memoryCampaigns.push({
		id: 'nepal-flood-2026',
		title: '2026 Nepal Flood Emergency Relief & Rehabilitation Fund',
		subtitle: 'Supporting flood and landslide-affected families, children, and displaced communities across Rasuwa, Nuwakot, and downstream Trishuli River basin districts in Nepal.',
		target_goal: 10000,
		is_active: true,
		created_at: '2026-08-30T09:00:00Z'
	});

	// Seed Board of Directors (BOD) pledges
	memoryDonations.push(
		{
			id: 'don-bod-01',
			campaign_id: 'nepal-flood-2026',
			donor_name: 'Dr. Meghraj Gnawali',
			email: 'meghraj@canfacs.org',
			amount: 500,
			currency: 'CAD',
			message: 'CANFACS Board contribution for immediate flood & pediatric relief.',
			status: 'pledged',
			is_anonymous: false,
			created_at: '2026-08-30T10:00:00Z'
		},
		{
			id: 'don-bod-02',
			campaign_id: 'nepal-flood-2026',
			donor_name: 'Ms. Bina Shrestha',
			email: 'bina@canfacs.org',
			amount: 100,
			currency: 'CAD',
			message: 'Supporting affected school children and families in Nepal.',
			status: 'pledged',
			is_anonymous: false,
			created_at: '2026-08-30T10:30:00Z'
		},
		{
			id: 'don-bod-03',
			campaign_id: 'nepal-flood-2026',
			donor_name: 'Mr. Prem Devkota',
			email: 'prem@canfacs.org',
			amount: 100,
			currency: 'CAD',
			message: 'In solidarity with emergency restoration and community relief.',
			status: 'pledged',
			is_anonymous: false,
			created_at: '2026-08-30T11:00:00Z'
		},
		{
			id: 'don-bod-04',
			campaign_id: 'nepal-flood-2026',
			donor_name: 'Mr. Rudra Adhikari',
			email: 'rudra@canfacs.org',
			amount: 100,
			currency: 'CAD',
			message: 'Solidarity from Atlantic Canada for our communities in Nepal.',
			status: 'pledged',
			is_anonymous: false,
			created_at: '2026-08-30T11:30:00Z'
		},
		{
			id: 'don-bod-06',
			campaign_id: 'nepal-flood-2026',
			donor_name: 'Mr. Kiroj Shrestha',
			email: 'kiroj@canfacs.org',
			amount: 100,
			currency: 'CAD',
			message: 'Supporting essential emergency relief and community rebuilding.',
			status: 'pledged',
			is_anonymous: false,
			created_at: '2026-08-30T12:30:00Z'
		},
		{
			id: 'don-bod-07',
			campaign_id: 'nepal-flood-2026',
			donor_name: 'Mr. Debraj Dhakal',
			email: 'debraj@canfacs.org',
			amount: 100,
			currency: 'CAD',
			message: 'Every contribution counts towards urgent medical & food relief.',
			status: 'pledged',
			is_anonymous: false,
			created_at: '2026-08-30T13:00:00Z'
		},
		{
			id: 'don-bod-09',
			campaign_id: 'nepal-flood-2026',
			donor_name: 'Mr. Prakash V Joshi',
			email: 'prakash@canfacs.org',
			amount: 100,
			currency: 'CAD',
			message: 'CANFACS Board contribution towards disaster rehabilitation.',
			status: 'pledged',
			is_anonymous: false,
			created_at: '2026-08-30T14:00:00Z'
		},
		{
			id: 'don-bod-10',
			campaign_id: 'nepal-flood-2026',
			donor_name: 'Mr. Hemanta Joshi',
			email: 'hemanta@canfacs.org',
			amount: 100,
			currency: 'CAD',
			message: 'With love and solidarity from Alberta for flood-hit regions.',
			status: 'pledged',
			is_anonymous: false,
			created_at: '2026-08-30T14:30:00Z'
		},
		{
			id: 'don-bod-11',
			campaign_id: 'nepal-flood-2026',
			donor_name: 'Mr. Bal Sharma',
			email: 'bal@canfacs.org',
			amount: 100,
			currency: 'CAD',
			message: 'Standing united with our brothers and sisters in Nepal.',
			status: 'pledged',
			is_anonymous: false,
			created_at: '2026-08-30T15:00:00Z'
		},
		{
			id: 'don_navin_dhakal',
			campaign_id: 'nepal-flood-2026',
			donor_name: 'Mr. Navin Dhakal',
			email: 'navin@canfacs.org',
			amount: 100,
			currency: 'CAD',
			message: 'In solidarity with flood-affected communities in Nepal.',
			status: 'received',
			is_anonymous: false,
			created_at: '2026-08-30T18:38:00Z'
		},
		{
			id: 'don_095536d0',
			campaign_id: 'nepal-flood-2026',
			donor_name: 'Samyem Tuladhar',
			email: 'samyem@gmail.com',
			amount: 100,
			currency: 'CAD',
			message: 'Standing together to rebuild lives and support flood victims.',
			status: 'received',
			is_anonymous: false,
			created_at: '2026-08-30T12:57:35.148Z'
		},
		{
			id: 'don_f5fc799e',
			campaign_id: 'nepal-flood-2026',
			donor_name: 'Purushottam Thapa',
			email: 'thapapu@gmail.com',
			amount: 100,
			currency: 'CAD',
			message: 'My heartfelt condolences to all those who have lost their loved ones.',
			status: 'received',
			is_anonymous: false,
			created_at: '2026-08-30T14:17:37.588Z'
		},
		{
			id: 'sq_5u9OSClgHNUeqcO2SQbB8nqSNKFZY',
			campaign_id: 'nepal-flood-2026',
			donor_name: 'Vinay Phounsy',
			email: 'vinay@accustomwoods.com',
			amount: 200,
			currency: 'CAD',
			message: 'Supporting emergency relief.',
			status: 'received',
			is_anonymous: false,
			created_at: '2026-09-01T19:20:46.598Z'
		},
		{
			id: 'sq_N4FKMr50i6MNF5Kq1z4cqqn4mcaZY',
			campaign_id: 'nepal-flood-2026',
			donor_name: 'Grishma Bajracharya',
			email: 'grisbajra@gmail.com',
			amount: 50,
			currency: 'CAD',
			message: 'My small contribution to support those affected by the disaster.',
			status: 'received',
			is_anonymous: false,
			created_at: '2026-09-02T02:42:34.569Z'
		},
		{
			id: 'don_703e473d',
			campaign_id: 'nepal-flood-2026',
			donor_name: 'Mr. Mankajee Shrestha',
			email: null,
			amount: 100,
			currency: 'CAD',
			message: 'In solidarity with Nepal',
			status: 'received',
			is_anonymous: false,
			created_at: '2026-09-02T16:43:07.758Z'
		},
		{
			id: 'sq_xCFaheRnuhjdZQKgwNp8Rv8om3eZY',
			campaign_id: 'nepal-flood-2026',
			donor_name: 'Anonymous Donor',
			email: 'pkakho@gmail.com',
			amount: 100,
			currency: 'CAD',
			message: null,
			status: 'received',
			is_anonymous: true,
			created_at: '2026-09-03T02:31:40.442Z'
		},
		{
			id: 'sq_ZMk0B8AJiEEl7rxD7vJhQmYio1CZY',
			campaign_id: 'nepal-flood-2026',
			donor_name: 'Bogdan Pankovsky',
			email: 'pankovsky@gmail.com',
			amount: 15.4,
			currency: 'CAD',
			message: 'All the best wishes and prayers!',
			status: 'received',
			is_anonymous: false,
			created_at: '2026-09-03T17:47:46.969Z'
		},
		{
			id: 'sq_r7rKfkzM4l3c3CoqlkhZmXBw6hDZY',
			campaign_id: 'nepal-flood-2026',
			donor_name: 'Anonymous Donor',
			email: 'pankovsky@gmail.com',
			amount: 2.99,
			currency: 'CAD',
			message: 'All the best wishes!',
			status: 'received',
			is_anonymous: true,
			created_at: '2026-09-03T17:52:08.137Z'
		},
		{
			id: 'don_c2caf5ba',
			campaign_id: 'nepal-flood-2026',
			donor_name: 'Nepal Sahyatya Samaj',
			email: null,
			amount: 50,
			currency: 'CAD',
			message: 'In solidarity',
			status: 'received',
			is_anonymous: false,
			created_at: '2026-09-10T11:22:02.384Z'
		}
	);

	// Seed Sample Official Documents
	if (memoryDocuments.length === 0) {
		memoryDocuments.push(
			{
				id: 'doc_canfacs_constitution',
				title: 'CANFACS Constitution, Bylaws & Governance Charter',
				slug: 'constitution-and-bylaws',
				summary: 'The official constitution, society bylaws, and governance charter of the Canada-Nepal Friendship & Cultural Society, outlining non-profit mandates, board structure, election bylaws, and membership tiers.',
				category: 'Governance & Policies',
				banner_image_url: '/canada-nepal-flags-hero.png',
				attachments: JSON.stringify([
					{
						id: 'att_seed_const_pdf',
						key: 'att_seed_CANFACS_Constitution_Bylaws_2026.pdf',
						fileName: 'CANFACS_Constitution_and_Bylaws_Official_2026.pdf',
						fileSize: '1.4 MB',
						sizeBytes: 1468006,
						url: '/api/attachments/att_seed_CANFACS_Constitution_Bylaws_2026.pdf',
						contentType: 'application/pdf'
					},
					{
						id: 'att_seed_charter_docx',
						key: 'att_seed_CANFACS_Governance_Charter.docx',
						fileName: 'CANFACS_Governance_Charter_Summary.docx',
						fileSize: '340 KB',
						sizeBytes: 348160,
						url: '/api/attachments/att_seed_CANFACS_Governance_Charter.docx',
						contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
					}
				]),
				content_html: `<h2>1. Preamble & Foundational Purpose</h2>
<p>The <strong>Canada-Nepal Friendship &amp; Cultural Society (CANFACS)</strong> is a registered non-profit society in British Columbia, Canada, committed to fostering lasting bonds of friendship, mutual understanding, cultural appreciation, and humanitarian cooperation between the peoples of Canada and Nepal.</p>
<p>Since our inception, CANFACS has functioned as a nationwide community bridge, celebrating bilateral diplomatic milestones dating back to 1965, empowering the diaspora, and mobilizing emergency relief during times of natural adversity.</p>

<div style="margin: 24px 0; max-width: 580px;"><table cellpadding="0" cellspacing="0" border="0" style="width: 100%; background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"><tr><td style="padding: 16px 20px;"><table cellpadding="0" cellspacing="0" border="0" style="width: 100%;"><tr><td style="width: 44px; vertical-align: middle;"><div style="width: 40px; height: 40px; background-color: #0f172a; border: 1px solid #475569; border-radius: 10px; text-align: center; line-height: 40px; font-size: 20px;">📄</div></td><td style="padding-left: 14px; vertical-align: middle;"><div style="font-size: 14px; font-weight: bold; color: #ffffff; line-height: 1.3;">CANFACS_Constitution_and_Bylaws_Official_2026.pdf</div><div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">Official Document • 1.4 MB</div></td><td style="text-align: right; vertical-align: middle; width: 140px;"><a href="/api/attachments/att_seed_CANFACS_Constitution_Bylaws_2026.pdf" target="_blank" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: bold;">Download &darr;</a></td></tr></table></td></tr></table></div>

<h2>2. Society Objectives</h2>
<ul>
  <li><strong>Cultural Diplomacy:</strong> Promote Nepali arts, heritage, traditions, language, and indigenous knowledge across Canadian multicultural landscapes.</li>
  <li><strong>Bilateral Understanding:</strong> Facilitate educational exchanges, historical seminars, and civic dialogues strengthening Canada-Nepal bilateral relations.</li>
  <li><strong>Disaster Relief &amp; Humanitarian Solidarity:</strong> Provide transparent, timely mobilization of emergency relief and rehabilitation assistance for communities in Nepal and Canada facing catastrophic disasters.</li>
  <li><strong>Youth &amp; Mentorship:</strong> Encourage Canadian-Nepali youth leadership, community volunteering, and academic enrichment.</li>
</ul>

<h2>3. Membership Governance &amp; Categories</h2>
<p>Membership in CANFACS is open to all individuals residing in Canada who subscribe to the purposes of the Society regardless of ancestry, ethnicity, religion, or background:</p>
<ul>
  <li><strong>General Members:</strong> Registered participants in society programs, community activities, and cultural festivals.</li>
  <li><strong>Life Members:</strong> Honored patrons and committed long-term contributors designated by the Board of Directors.</li>
  <li><strong>Board of Directors (BOD):</strong> Elected governance trustees responsible for operational oversight, financial stewardship, and legal compliance.</li>
  <li><strong>Advisory Board:</strong> Eminent diplomatic, cultural, and community leaders offering strategic counsel.</li>
</ul>

<h2>4. Annual General Meeting (AGM) Guidelines</h2>
<p>An Annual General Meeting shall be convened once every calendar year at a designated time and place announced at least twenty-one (21) days prior. Members in good standing shall receive financial statements, committee progress reports, and participate in executive elections as prescribed by the Society Act.</p>`,
				status: 'published',
				visibility: 'public',
				author_id: 'admin-001',
				author_name: 'CANFACS Executive Admin',
				published_at: '2026-01-15T12:00:00Z',
				created_at: '2026-01-15T12:00:00Z',
				updated_at: '2026-09-20T10:00:00Z'
			},
			{
				id: 'doc_canfacs_flood_audit',
				title: 'Nepal Flood Relief 2026: Official Transparency & Disbursement Audit',
				slug: 'nepal-flood-emergency-relief-audit',
				summary: 'Official transparent financial accounting and audit documentation of diaspora contributions collected for the 2026 Trishuli River and Rasuwa Flood Emergency Relief Campaign, verified banking conduits, and Prime Minister Disaster Relief Fund disbursements.',
				category: 'Financials & Audits',
				banner_image_url: '/canada-nepal-flags-hero.png',
				attachments: JSON.stringify([
					{
						id: 'att_seed_flood_audit_pdf',
						key: 'att_seed_Nepal_Flood_Relief_2026_Audit_Report.pdf',
						fileName: 'CANFACS_Nepal_Flood_Relief_Audit_Report_2026.pdf',
						fileSize: '890 KB',
						sizeBytes: 911360,
						url: '/api/attachments/att_seed_Nepal_Flood_Relief_2026_Audit_Report.pdf',
						contentType: 'application/pdf'
					},
					{
						id: 'att_seed_banking_receipt',
						key: 'att_seed_PM_Disaster_Relief_Bank_Wire_Receipt.pdf',
						fileName: 'PM_Disaster_Relief_Bank_Wire_Receipt.pdf',
						fileSize: '512 KB',
						sizeBytes: 524288,
						url: '/api/attachments/att_seed_PM_Disaster_Relief_Bank_Wire_Receipt.pdf',
						contentType: 'application/pdf'
					}
				]),
				content_html: `<h2>1. Executive Summary &amp; Scope of Audit</h2>
<p>Following catastrophic seasonal flooding and landslides along the Trishuli River basin affecting communities in Nuwakot, Rasuwa, and downstream districts, CANFACS launched the <em>2026 Nepal Flood Emergency Relief &amp; Rehabilitation Fund</em>.</p>
<p>In accordance with our strict governance principles of 100% financial transparency, this audit report details all funds collected from Canadian community donors, board pledges, digital payment conduits, and official government-authorized disbursements.</p>

<div style="margin: 24px 0; max-width: 580px;"><table cellpadding="0" cellspacing="0" border="0" style="width: 100%; background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"><tr><td style="padding: 16px 20px;"><table cellpadding="0" cellspacing="0" border="0" style="width: 100%;"><tr><td style="width: 44px; vertical-align: middle;"><div style="width: 40px; height: 40px; background-color: #0f172a; border: 1px solid #475569; border-radius: 10px; text-align: center; line-height: 40px; font-size: 20px;">📊</div></td><td style="padding-left: 14px; vertical-align: middle;"><div style="font-size: 14px; font-weight: bold; color: #ffffff; line-height: 1.3;">CANFACS_Nepal_Flood_Relief_Audit_Report_2026.pdf</div><div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">Official Audit Document • 890 KB</div></td><td style="text-align: right; vertical-align: middle; width: 140px;"><a href="/api/attachments/att_seed_Nepal_Flood_Relief_2026_Audit_Report.pdf" target="_blank" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: bold;">Download &darr;</a></td></tr></table></td></tr></table></div>

<h2>2. Key Financial Indicators</h2>
<ul>
  <li><strong>Target Campaign Goal:</strong> $10,000.00 CAD</li>
  <li><strong>Total Diaspora Contributions (Online &amp; Pledged):</strong> $2,250.00 CAD</li>
  <li><strong>Total Disbursed to Date:</strong> $2,000.00 CAD</li>
  <li><strong>Primary Official Recipient:</strong> Government of Nepal — Prime Minister's Disaster Relief Fund (PMDRF)</li>
  <li><strong>Administrative Deductions:</strong> $0.00 (100% of donor proceeds allocated directly to verified relief)</li>
</ul>

<h2>3. Banking Wire Verification &amp; Official Receipts</h2>
<p>Official banking transfers were processed via authorized Canadian financial institutional wires directly into the official Central Bank of Nepal (Nepal Rastra Bank) disaster account. Scanned copies of wire transmission confirmation, currency exchange slips, and official diplomatic acknowledgment are attached to this document for public audit.</p>`,
				status: 'published',
				visibility: 'public',
				author_id: 'admin-001',
				author_name: 'CANFACS Board of Directors',
				published_at: '2026-09-08T15:30:00Z',
				created_at: '2026-09-08T15:30:00Z',
				updated_at: '2026-09-12T18:00:00Z'
			},
			{
				id: 'doc_canfacs_agm_minutes',
				title: 'CANFACS Annual General Meeting (AGM) Minutes & Committee Resolutions',
				slug: 'agm-report-and-resolutions-2025-2026',
				summary: 'Official record of assembly proceedings, board elections, constitutional amendments, and cultural program roadmaps approved during the Annual General Meeting. (Access restricted to registered CANFACS members)',
				category: 'Meeting Minutes',
				banner_image_url: null,
				attachments: JSON.stringify([
					{
						id: 'att_seed_agm_doc',
						key: 'att_seed_AGM_Minutes_2025_2026_Signed.docx',
						fileName: 'CANFACS_AGM_Minutes_2025_2026_Signed.docx',
						fileSize: '420 KB',
						sizeBytes: 430080,
						url: '/api/attachments/att_seed_AGM_Minutes_2025_2026_Signed.docx',
						contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
					}
				]),
				content_html: `<h2>1. Meeting Call to Order &amp; Quorum</h2>
<p>The Annual General Meeting of the Canada-Nepal Friendship &amp; Cultural Society was called to order with quorum established by active sitting members, executive committee trustees, and advisory participants present in person and via virtual teleconference.</p>

<h2>2. Agenda &amp; Proceedings</h2>
<ol>
  <li>Approval of Previous Assembly Minutes</li>
  <li>Presidential Address &amp; Society Year-in-Review</li>
  <li>Audited Financial Presentation by Society Treasurer</li>
  <li>Report on Mount Everest Day (May 29) &amp; Bilateral Cultural Evenings</li>
  <li>New Executive Committee Appointments &amp; Committee Mandates</li>
</ol>

<h2>3. Passed Resolutions</h2>
<p><strong>Resolution 2026-01:</strong> Be it resolved that CANFACS will expand digital access to official society publications, bylaws, and financial disclosures through an open-access public documents portal.</p>
<p><strong>Resolution 2026-02:</strong> Be it resolved that the executive board will institute an educational scholarship fund supporting underprivileged youth in Nepal pursuing environmental and STEM studies.</p>`,
				status: 'published',
				visibility: 'members',
				author_id: 'admin-001',
				author_name: 'General Secretary',
				published_at: '2026-02-10T10:00:00Z',
				created_at: '2026-02-10T10:00:00Z',
				updated_at: '2026-02-10T10:00:00Z'
			},
			{
				id: 'doc_canfacs_bod_minutes',
				title: 'CANFACS Board of Directors (BOD) Meeting Minutes & Executive Resolutions',
				slug: 'bod-executive-meeting-minutes-2026',
				summary: 'Confidential proceedings, financial appropriations, and strategic resolutions of the CANFACS Board of Directors. Restricted strictly to sitting Board Members and Executive Trustees.',
				category: 'Meeting Minutes',
				banner_image_url: null,
				attachments: JSON.stringify([
					{
						id: 'att_seed_bod_minutes_pdf',
						key: 'att_seed_BOD_Minutes_Executive_Q3_2026.pdf',
						fileName: 'CANFACS_BOD_Executive_Minutes_Q3_2026.pdf',
						fileSize: '540 KB',
						sizeBytes: 552960,
						url: '/api/attachments/att_seed_BOD_Minutes_Executive_Q3_2026.pdf',
						contentType: 'application/pdf'
					}
				]),
				content_html: `<h2>1. Executive Session Call to Order</h2>
<p>The executive meeting of the CANFACS Board of Directors was convened in closed session. Presiding officers reviewed executive society roadmaps, bilateral diplomatic invitations, and community relief disbursements.</p>

<h2>2. Board Committee Resolutions</h2>
<ul>
  <li><strong>Disaster Relief Governance:</strong> Formal ratification of 100% pass-through funding for verified Nepal flood relief.</li>
  <li><strong>Digital Platform Upgrades:</strong> Approval of the new public documents CMS, member governance portal, and Cloudflare R2 secure storage infrastructure.</li>
  <li><strong>Provincial Chapter Expansion:</strong> Coordination of Calgary, Toronto, and Halifax regional chapter liaison roles.</li>
</ul>

<h2>3. Confidential Adjournment &amp; Sign-off</h2>
<p>The Board of Directors concluded proceedings with next quarterly executive review scheduled for December 2026.</p>`,
				status: 'published',
				visibility: 'bod',
				author_id: 'admin-001',
				author_name: 'Board of Directors (BOD)',
				published_at: '2026-08-25T14:00:00Z',
				created_at: '2026-08-25T14:00:00Z',
				updated_at: '2026-08-25T14:00:00Z'
			}
		);
	}
}

export function getDb(platform?: App.Platform, locals?: App.Locals) {
	const db = locals?.db || platform?.env?.DB;
	return db;
}

// MEMBER QUERIES
export async function createMember(db: any, data: Omit<MemberRow, 'id' | 'created_at' | 'status' | 'role' | 'password_hash' | 'approved_at'>): Promise<MemberRow> {
	await ensureLocalDefaultAdmin();
	const id = 'mem_' + crypto.randomUUID().slice(0, 8);
	const created_at = new Date().toISOString();
	const newMember: MemberRow = {
		id,
		email: data.email.toLowerCase().trim(),
		password_hash: null,
		full_name: data.full_name,
		phone: data.phone || null,
		profession: data.profession || null,
		city: data.city || null,
		province: data.province || null,
		bio: data.bio || null,
		status: 'pending',
		role: 'member',
		created_at,
		approved_at: null
	};

	if (db) {
		await db.prepare(
			`INSERT INTO members (id, email, password_hash, full_name, phone, profession, city, province, bio, status, role, created_at, approved_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		).bind(
			newMember.id, newMember.email, newMember.password_hash, newMember.full_name,
			newMember.phone, newMember.profession, newMember.city, newMember.province,
			newMember.bio, newMember.status, newMember.role, newMember.created_at, newMember.approved_at
		).run();
	} else {
		memoryMembers.push(newMember);
	}
	return newMember;
}

export async function getMemberByEmail(db: any, email: string): Promise<MemberRow | null> {
	await ensureLocalDefaultAdmin();
	const cleanEmail = email.toLowerCase().trim();
	if (db) {
		let res = await db.prepare(`SELECT * FROM members WHERE LOWER(email) = ?`).bind(cleanEmail).first();
		if (!res && cleanEmail === 'info@canfacs.org' && dev) {
			await ensureDbDefaultAdmin(db);
			res = await db.prepare(`SELECT * FROM members WHERE LOWER(email) = ?`).bind(cleanEmail).first();
		}
		return res as MemberRow | null;
	}
	return memoryMembers.find((m) => m.email.toLowerCase() === cleanEmail) || null;
}

export async function getMemberById(db: any, id: string): Promise<MemberRow | null> {
	await ensureLocalDefaultAdmin();
	if (db) {
		const res = await db.prepare(`SELECT * FROM members WHERE id = ?`).bind(id).first();
		return res as MemberRow | null;
	}
	return memoryMembers.find((m) => m.id === id) || null;
}

export async function getAllMembers(
	db: any,
	statusFilter?: 'pending' | 'approved' | 'denied' | 'deleted',
	includeDeleted: boolean = false
): Promise<MemberRow[]> {
	await ensureLocalDefaultAdmin();
	if (db) {
		let query = `SELECT * FROM members`;
		const conditions: string[] = [];
		if (statusFilter) {
			conditions.push(`status = '${statusFilter}'`);
		} else if (!includeDeleted) {
			conditions.push(`status NOT IN ('deleted', 'denied')`);
		}
		if (conditions.length > 0) {
			query += ` WHERE ` + conditions.join(' AND ');
		}
		query += ` ORDER BY created_at DESC`;
		const res = await db.prepare(query).all();
		return (res.results || []) as MemberRow[];
	}
	if (statusFilter) {
		return memoryMembers.filter((m) => m.status === statusFilter);
	}
	if (!includeDeleted) {
		return memoryMembers
			.filter((m) => m.status !== 'deleted' && m.status !== 'denied')
			.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
	}
	return [...memoryMembers].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function softDeleteMember(db: any, id: string): Promise<void> {
	await ensureLocalDefaultAdmin();
	const deleted_at = new Date().toISOString();
	if (db) {
		await db.prepare(
			`UPDATE members SET status = 'deleted', deleted_at = ? WHERE id = ?`
		).bind(deleted_at, id).run();
	} else {
		const idx = memoryMembers.findIndex((m) => m.id === id);
		if (idx !== -1) {
			memoryMembers[idx].status = 'deleted';
			memoryMembers[idx].deleted_at = deleted_at;
		}
	}
	invalidateTeamLeadershipCache();
}

export async function permanentlyDeleteMember(db: any, id: string): Promise<void> {
	await ensureLocalDefaultAdmin();
	if (db) {
		await db.batch([
			db.prepare(`DELETE FROM member_organizational_roles WHERE member_id = ?`).bind(id),
			db.prepare(`DELETE FROM post_reactions WHERE member_id = ?`).bind(id),
			db.prepare(`DELETE FROM post_reshares WHERE reshared_by_id = ?`).bind(id),
			db.prepare(`DELETE FROM comments WHERE author_id = ?`).bind(id),
			db.prepare(`DELETE FROM posts WHERE author_id = ?`).bind(id),
			db.prepare(`DELETE FROM members WHERE id = ?`).bind(id)
		]);
	} else {
		const idx = memoryMembers.findIndex((m) => m.id === id);
		if (idx !== -1) {
			memoryMembers.splice(idx, 1);
		}
	}
	invalidateTeamLeadershipCache();
}

export async function restoreMember(
	db: any,
	id: string,
	targetStatus: 'approved' | 'pending' = 'approved'
): Promise<void> {
	await ensureLocalDefaultAdmin();
	if (db) {
		await db.prepare(
			`UPDATE members SET status = ?, deleted_at = NULL WHERE id = ?`
		).bind(targetStatus, id).run();
	} else {
		const idx = memoryMembers.findIndex((m) => m.id === id);
		if (idx !== -1) {
			memoryMembers[idx].status = targetStatus;
			memoryMembers[idx].deleted_at = null;
		}
	}
	invalidateTeamLeadershipCache();
}

export async function unapproveMember(db: any, id: string): Promise<void> {
	await ensureLocalDefaultAdmin();
	if (db) {
		await db.prepare(
			`UPDATE members SET status = 'pending', approved_at = NULL WHERE id = ?`
		).bind(id).run();
	} else {
		const idx = memoryMembers.findIndex((m) => m.id === id);
		if (idx !== -1) {
			memoryMembers[idx].status = 'pending';
			memoryMembers[idx].approved_at = null;
		}
	}
	invalidateTeamLeadershipCache();
}

export async function getAdminEmails(db: any): Promise<string[]> {
	await ensureLocalDefaultAdmin();
	const emails = new Set<string>();
	emails.add('info@canfacs.org');

	if (db) {
		try {
			const res = await db
				.prepare(`SELECT email FROM members WHERE role = 'admin' AND status = 'approved'`)
				.all();
			for (const r of (res.results || [])) {
				if (r.email && typeof r.email === 'string' && r.email.includes('@')) {
					emails.add(r.email.trim().toLowerCase());
				}
			}
		} catch (err) {
			console.warn('[CANFACS] Error querying admin emails from D1:', err);
		}
	} else {
		for (const m of memoryMembers) {
			if (m.role === 'admin' && m.status === 'approved') {
				if (m.email && m.email.includes('@')) {
					emails.add(m.email.trim().toLowerCase());
				}
			}
		}
	}

	return Array.from(emails);
}

export async function updateMemberStatus(
	db: any,
	id: string,
	status: 'approved' | 'denied',
	passwordHash?: string
): Promise<void> {
	await ensureLocalDefaultAdmin();
	const approved_at = status === 'approved' ? new Date().toISOString() : null;
	const deleted_at = status === 'denied' ? new Date().toISOString() : null;

	if (db) {
		if (passwordHash) {
			await db.prepare(
				`UPDATE members SET status = ?, password_hash = ?, approved_at = ?, deleted_at = ? WHERE id = ?`
			).bind(status, passwordHash, approved_at, deleted_at, id).run();
		} else {
			await db.prepare(
				`UPDATE members SET status = ?, approved_at = ?, deleted_at = ? WHERE id = ?`
			).bind(status, approved_at, deleted_at, id).run();
		}
	} else {
		const idx = memoryMembers.findIndex((m) => m.id === id);
		if (idx !== -1) {
			memoryMembers[idx].status = status;
			if (passwordHash) memoryMembers[idx].password_hash = passwordHash;
			if (approved_at) memoryMembers[idx].approved_at = approved_at;
			memoryMembers[idx].deleted_at = deleted_at;
		}
	}
	invalidateTeamLeadershipCache();
}

export async function updateMemberRole(
	db: any,
	id: string,
	role: string
): Promise<void> {
	await ensureLocalDefaultAdmin();
	if (db) {
		await db.prepare(`UPDATE members SET role = ? WHERE id = ?`).bind(role, id).run();
	} else {
		const idx = memoryMembers.findIndex((m) => m.id === id);
		if (idx !== -1) {
			memoryMembers[idx].role = role;
		}
	}
	invalidateTeamLeadershipCache();
}

export async function updateMemberProfile(
	db: any,
	id: string,
	data: Partial<MemberRow>
): Promise<void> {
	await ensureLocalDefaultAdmin();
	const fields: string[] = [];
	const values: any[] = [];

	const allowedFields: (keyof MemberRow)[] = [
		'full_name',
		'salutation',
		'phone',
		'phone_secondary',
		'profession',
		'organizational_role',
		'role_start_date',
		'role_end_date',
		'address_street',
		'city',
		'province',
		'country',
		'postal_code',
		'bio',
		'facebook_id',
		'instagram_id',
		'associated_organizations',
		'google_login_enabled',
		'avatar_url',
		'display_order',
		'role',
		'status'
	];

	for (const field of allowedFields) {
		if (data[field] !== undefined) {
			fields.push(`${field} = ?`);
			values.push(data[field]);
		}
	}

	if (fields.length === 0) return;

	if (db) {
		values.push(id);
		await db.prepare(`UPDATE members SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
	} else {
		const idx = memoryMembers.findIndex((m) => m.id === id);
		if (idx !== -1) {
			memoryMembers[idx] = { ...memoryMembers[idx], ...data };
		}
	}
	invalidateTeamLeadershipCache();
}

// POST QUERIES
export async function getPosts(db: any, currentUserId?: string): Promise<PostRow[]> {
	await ensureLocalDefaultAdmin();
	if (db) {
		const res = await db.prepare(`
			SELECT p.*, m.full_name as author_name, m.profession as author_profession, m.avatar_url as author_avatar_url,
			(SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as like_count,
			(SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
			(SELECT COUNT(*) FROM post_likes WHERE post_id = p.id AND member_id = ?) as user_liked
			FROM posts p
			JOIN members m ON p.author_id = m.id
			ORDER BY p.created_at DESC
		`).bind(currentUserId || '').all();
		return (res.results || []).map((r: any) => ({
			...r,
			user_liked: Boolean(r.user_liked)
		})) as PostRow[];
	}

	return memoryPosts.map((p) => {
		const author = memoryMembers.find((m) => m.id === p.author_id);
		const likesCount = memoryLikes.filter((l) => l.post_id === p.id).length;
		const commentsCount = memoryComments.filter((c) => c.post_id === p.id).length;
		const userLiked = currentUserId ? memoryLikes.some((l) => l.post_id === p.id && l.member_id === currentUserId) : false;
		return {
			...p,
			author_name: author ? author.full_name : p.author_name,
			author_profession: author ? author.profession : p.author_profession,
			author_avatar_url: author ? author.avatar_url : null,
			like_count: likesCount || p.like_count,
			comment_count: commentsCount || p.comment_count,
			user_liked: userLiked
		};
	});
}

export async function createPost(
	db: any,
	authorId: string,
	content: string,
	imageUrl?: string,
	originalPostId?: string
): Promise<PostRow> {
	await ensureLocalDefaultAdmin();
	const id = 'post_' + crypto.randomUUID().slice(0, 8);
	const created_at = new Date().toISOString();
	const author = await getMemberById(db, authorId);
	const author_name = author ? author.full_name : 'Member';
	const author_profession = author ? author.profession : '';

	const newPost: PostRow = {
		id,
		author_id: authorId,
		author_name,
		author_profession,
		content,
		image_url: imageUrl || null,
		original_post_id: originalPostId || null,
		created_at,
		like_count: 0,
		comment_count: 0,
		user_liked: false
	};

	if (db) {
		await db.prepare(`
			INSERT INTO posts (id, author_id, content, image_url, original_post_id, created_at)
			VALUES (?, ?, ?, ?, ?, ?)
		`).bind(id, authorId, content, imageUrl || null, originalPostId || null, created_at).run();
	} else {
		memoryPosts.unshift(newPost);
	}
	return newPost;
}

export async function toggleLike(db: any, postId: string, memberId: string): Promise<boolean> {
	await ensureLocalDefaultAdmin();
	if (db) {
		const existing = await db.prepare(`SELECT * FROM post_likes WHERE post_id = ? AND member_id = ?`).bind(postId, memberId).first();
		if (existing) {
			await db.prepare(`DELETE FROM post_likes WHERE post_id = ? AND member_id = ?`).bind(postId, memberId).run();
			return false;
		} else {
			await db.prepare(`INSERT INTO post_likes (post_id, member_id, created_at) VALUES (?, ?, ?)`).bind(postId, memberId, new Date().toISOString()).run();
			return true;
		}
	} else {
		const idx = memoryLikes.findIndex((l) => l.post_id === postId && l.member_id === memberId);
		if (idx !== -1) {
			memoryLikes.splice(idx, 1);
			return false;
		} else {
			memoryLikes.push({ post_id: postId, member_id: memberId });
			return true;
		}
	}
}

// COMMENT QUERIES
export async function getComments(db: any, postId: string): Promise<CommentRow[]> {
	await ensureLocalDefaultAdmin();
	if (db) {
		const res = await db.prepare(`
			SELECT c.*, m.full_name as author_name
			FROM comments c
			JOIN members m ON c.author_id = m.id
			WHERE c.post_id = ?
			ORDER BY c.created_at ASC
		`).bind(postId).all();
		return (res.results || []) as CommentRow[];
	}

	return memoryComments
		.filter((c) => c.post_id === postId)
		.map((c) => {
			const author = memoryMembers.find((m) => m.id === c.author_id);
			return {
				...c,
				author_name: author ? author.full_name : c.author_name
			};
		});
}

export async function createComment(
	db: any,
	postId: string,
	authorId: string,
	content: string,
	imageUrl?: string
): Promise<CommentRow> {
	await ensureLocalDefaultAdmin();
	const id = 'cmt_' + crypto.randomUUID().slice(0, 8);
	const created_at = new Date().toISOString();
	const author = await getMemberById(db, authorId);
	const author_name = author ? author.full_name : 'Member';

	const newComment: CommentRow = {
		id,
		post_id: postId,
		author_id: authorId,
		author_name,
		content,
		image_url: imageUrl || null,
		created_at
	};

	if (db) {
		await db.prepare(`
			INSERT INTO comments (id, post_id, author_id, content, image_url, created_at)
			VALUES (?, ?, ?, ?, ?, ?)
		`).bind(id, postId, authorId, content, imageUrl || null, created_at).run();
	} else {
		memoryComments.push(newComment);
	}
	return newComment;
}

// DONATION & FUNDRAISING QUERIES
async function ensureDonationsTable(db: any) {
	if (!db) return;
	try {
		// 1. Campaigns Table
		await db
			.prepare(`
				CREATE TABLE IF NOT EXISTS campaigns (
					id TEXT PRIMARY KEY,
					title TEXT NOT NULL,
					subtitle TEXT,
					target_goal REAL NOT NULL DEFAULT 10000,
					is_active INTEGER NOT NULL DEFAULT 1,
					created_at TEXT NOT NULL
				);
			`)
			.run();

		// 2. Donations Table
		await db
			.prepare(`
				CREATE TABLE IF NOT EXISTS donations (
					id TEXT PRIMARY KEY,
					campaign_id TEXT NOT NULL DEFAULT 'nepal-flood-2024',
					donor_name TEXT NOT NULL,
					email TEXT,
					amount REAL NOT NULL,
					currency TEXT NOT NULL DEFAULT 'CAD',
					message TEXT,
					status TEXT NOT NULL DEFAULT 'received',
					is_anonymous INTEGER NOT NULL DEFAULT 0,
					created_at TEXT NOT NULL
				);
			`)
			.run();

		// Migration: Add status column to donations if not exists
		try {
			await db.prepare(`ALTER TABLE donations ADD COLUMN status TEXT NOT NULL DEFAULT 'received'`).run();
		} catch {
			// Column already exists
		}

		// 3. Disbursements Table
		await db
			.prepare(`
				CREATE TABLE IF NOT EXISTS disbursements (
					id TEXT PRIMARY KEY,
					campaign_id TEXT NOT NULL DEFAULT 'nepal-flood-2024',
					recipient TEXT NOT NULL,
					amount REAL NOT NULL,
					disbursed_at TEXT NOT NULL,
					reference_number TEXT,
					notes TEXT,
					document_url TEXT,
					created_at TEXT NOT NULL
				);
			`)
			.run();

		// 4. Disbursement Allocations Table
		await db
			.prepare(`
				CREATE TABLE IF NOT EXISTS disbursement_allocations (
					id TEXT PRIMARY KEY,
					disbursement_id TEXT NOT NULL,
					donation_id TEXT NOT NULL,
					amount REAL NOT NULL
				);
			`)
			.run();

		// Check if campaigns table is empty, if so seed initial campaign
		const campCount = await db.prepare(`SELECT COUNT(*) as count FROM campaigns`).first();
		if (campCount && Number(campCount.count) === 0) {
			for (const camp of memoryCampaigns) {
				await db
					.prepare(`
						INSERT OR IGNORE INTO campaigns (id, title, subtitle, target_goal, is_active, created_at)
						VALUES (?, ?, ?, ?, ?, ?)
					`)
					.bind(camp.id, camp.title, camp.subtitle, camp.target_goal, camp.is_active ? 1 : 0, camp.created_at)
					.run();
			}
		}

		// Check if donations table is empty, if so seed initial donations
		const countRes = await db
			.prepare(`SELECT COUNT(*) as count FROM donations WHERE campaign_id = 'nepal-flood-2026' OR campaign_id = 'nepal-flood-2024'`)
			.first();
		if (countRes && Number(countRes.count) === 0) {
			for (const don of memoryDonations) {
				await db
					.prepare(`
						INSERT OR IGNORE INTO donations (id, campaign_id, donor_name, email, amount, currency, message, status, is_anonymous, created_at)
						VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
					`)
					.bind(
						don.id,
						don.campaign_id,
						don.donor_name,
						don.email,
						don.amount,
						don.currency,
						don.message,
						don.status || 'received',
						don.is_anonymous ? 1 : 0,
						don.created_at
					)
					.run();
			}
		}
	} catch (err) {
		console.warn('Error ensuring donations/fundraising tables:', err);
	}
}

// CAMPAIGN QUERIES
export async function getCampaigns(db: any): Promise<CampaignRow[]> {
	await ensureLocalDefaultAdmin();
	if (db) {
		await ensureDonationsTable(db);
		const res = await db.prepare(`SELECT * FROM campaigns ORDER BY created_at DESC`).all();
		return (res.results || []).map((r: any) => ({
			...r,
			is_active: Boolean(r.is_active)
		})) as CampaignRow[];
	}
	return [...memoryCampaigns];
}

export async function getCampaignById(db: any, id: string): Promise<CampaignRow | null> {
	await ensureLocalDefaultAdmin();
	if (db) {
		await ensureDonationsTable(db);
		const res = await db.prepare(`SELECT * FROM campaigns WHERE id = ?`).bind(id).first();
		if (!res) return null;
		return { ...res, is_active: Boolean(res.is_active) } as CampaignRow;
	}
	return memoryCampaigns.find((c) => c.id === id) || null;
}

export async function createCampaign(
	db: any,
	data: { id: string; title: string; subtitle?: string; target_goal: number; is_active?: boolean }
): Promise<CampaignRow> {
	await ensureLocalDefaultAdmin();
	const created_at = new Date().toISOString();
	const campaign: CampaignRow = {
		id: data.id,
		title: data.title,
		subtitle: data.subtitle || null,
		target_goal: Number(data.target_goal),
		is_active: data.is_active !== undefined ? data.is_active : true,
		created_at
	};

	if (db) {
		await ensureDonationsTable(db);
		await db
			.prepare(`
				INSERT INTO campaigns (id, title, subtitle, target_goal, is_active, created_at)
				VALUES (?, ?, ?, ?, ?, ?)
			`)
			.bind(campaign.id, campaign.title, campaign.subtitle, campaign.target_goal, campaign.is_active ? 1 : 0, created_at)
			.run();
	} else {
		memoryCampaigns.unshift(campaign);
	}
	return campaign;
}

export async function updateCampaign(
	db: any,
	id: string,
	data: { title?: string; subtitle?: string | null; target_goal?: number; is_active?: boolean }
): Promise<void> {
	await ensureLocalDefaultAdmin();
	if (db) {
		await ensureDonationsTable(db);
		const fields: string[] = [];
		const values: any[] = [];

		if (data.title !== undefined) {
			fields.push('title = ?');
			values.push(data.title.trim());
		}
		if (data.subtitle !== undefined) {
			fields.push('subtitle = ?');
			values.push(data.subtitle ? data.subtitle.trim() : null);
		}
		if (data.target_goal !== undefined) {
			fields.push('target_goal = ?');
			values.push(Number(data.target_goal));
		}
		if (data.is_active !== undefined) {
			fields.push('is_active = ?');
			values.push(data.is_active ? 1 : 0);
		}

		if (fields.length > 0) {
			values.push(id);
			await db.prepare(`UPDATE campaigns SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
		}
	} else {
		const idx = memoryCampaigns.findIndex((c) => c.id === id);
		if (idx !== -1) {
			memoryCampaigns[idx] = {
				...memoryCampaigns[idx],
				...data
			};
		}
	}
}

// DONATION QUERIES
export async function getAllDonations(db: any): Promise<DonationRow[]> {
	await ensureLocalDefaultAdmin();
	if (db) {
		await ensureDonationsTable(db);
		const res = await db.prepare(`SELECT * FROM donations ORDER BY created_at DESC`).all();
		return (res.results || []).map((r: any) => ({
			...r,
			status: (r.status as 'pledged' | 'received') || 'received',
			is_anonymous: Boolean(r.is_anonymous)
		})) as DonationRow[];
	}

	return [...memoryDonations].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getDonations(db: any, campaignId?: string): Promise<DonationRow[]> {
	await ensureLocalDefaultAdmin();
	if (!campaignId || campaignId === 'all') {
		return getAllDonations(db);
	}
	const isFloodCampaign = campaignId === 'nepal-flood-2026' || campaignId === 'nepal-flood-2024';

	if (db) {
		await ensureDonationsTable(db);
		let res;
		if (isFloodCampaign) {
			res = await db
				.prepare(`SELECT * FROM donations WHERE campaign_id = 'nepal-flood-2026' OR campaign_id = 'nepal-flood-2024' ORDER BY created_at DESC`)
				.all();
		} else {
			res = await db
				.prepare(`SELECT * FROM donations WHERE campaign_id = ? ORDER BY created_at DESC`)
				.bind(campaignId)
				.all();
		}
		return (res.results || []).map((r: any) => ({
			...r,
			status: (r.status as 'pledged' | 'received') || 'received',
			is_anonymous: Boolean(r.is_anonymous)
		})) as DonationRow[];
	}

	return memoryDonations
		.filter((d) => (isFloodCampaign ? d.campaign_id === 'nepal-flood-2026' || d.campaign_id === 'nepal-flood-2024' : d.campaign_id === campaignId))
		.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getDonationById(db: any, id: string): Promise<DonationRow | null> {
	await ensureLocalDefaultAdmin();
	if (db) {
		await ensureDonationsTable(db);
		const res = await db.prepare(`SELECT * FROM donations WHERE id = ?`).bind(id).first();
		if (!res) return null;
		return {
			...res,
			status: (res.status as 'pledged' | 'received') || 'received',
			is_anonymous: Boolean(res.is_anonymous)
		} as DonationRow;
	}
	return memoryDonations.find((d) => d.id === id) || null;
}

export async function createDonation(
	db: any,
	data: {
		id?: string;
		donor_name: string;
		email?: string;
		amount: number;
		currency?: string;
		message?: string;
		status?: 'pledged' | 'received';
		is_anonymous?: boolean;
		campaign_id?: string;
		created_at?: string;
	}
): Promise<DonationRow> {
	await ensureLocalDefaultAdmin();
	const id = data.id || ('don_' + crypto.randomUUID().slice(0, 8));
	const created_at = data.created_at || new Date().toISOString();
	const campaign_id = data.campaign_id || 'nepal-flood-2024';
	const currency = data.currency || 'CAD';
	const status = data.status || 'received';
	const is_anonymous = Boolean(data.is_anonymous);

	const newDonation: DonationRow = {
		id,
		campaign_id,
		donor_name: is_anonymous ? 'Anonymous Donor' : data.donor_name.trim(),
		email: data.email ? data.email.trim() : null,
		amount: Number(data.amount),
		currency,
		message: data.message ? data.message.trim() : null,
		status,
		is_anonymous,
		created_at
	};

	if (db) {
		await ensureDonationsTable(db);
		await db
			.prepare(`
				INSERT INTO donations (id, campaign_id, donor_name, email, amount, currency, message, status, is_anonymous, created_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			`)
			.bind(
				id,
				campaign_id,
				newDonation.donor_name,
				newDonation.email,
				newDonation.amount,
				currency,
				newDonation.message,
				status,
				is_anonymous ? 1 : 0,
				created_at
			)
			.run();
	} else {
		memoryDonations.unshift(newDonation);
	}

	return newDonation;
}

export async function updateDonation(
	db: any,
	id: string,
	data: {
		donor_name?: string;
		email?: string | null;
		amount?: number;
		message?: string | null;
		status?: 'pledged' | 'received';
		is_anonymous?: boolean;
	}
): Promise<void> {
	await ensureLocalDefaultAdmin();
	if (db) {
		await ensureDonationsTable(db);
		const fields: string[] = [];
		const values: any[] = [];

		if (data.donor_name !== undefined) {
			fields.push('donor_name = ?');
			values.push(data.donor_name);
		}
		if (data.email !== undefined) {
			fields.push('email = ?');
			values.push(data.email);
		}
		if (data.amount !== undefined) {
			fields.push('amount = ?');
			values.push(Number(data.amount));
		}
		if (data.message !== undefined) {
			fields.push('message = ?');
			values.push(data.message);
		}
		if (data.status !== undefined) {
			fields.push('status = ?');
			values.push(data.status);
		}
		if (data.is_anonymous !== undefined) {
			fields.push('is_anonymous = ?');
			values.push(data.is_anonymous ? 1 : 0);
		}

		if (fields.length > 0) {
			values.push(id);
			await db.prepare(`UPDATE donations SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
		}
	} else {
		const idx = memoryDonations.findIndex((d) => d.id === id);
		if (idx !== -1) {
			memoryDonations[idx] = {
				...memoryDonations[idx],
				...data
			};
		}
	}
}

export async function deleteDonation(db: any, id: string): Promise<void> {
	await ensureLocalDefaultAdmin();
	if (db) {
		await ensureDonationsTable(db);
		await db.prepare(`DELETE FROM donations WHERE id = ?`).bind(id).run();
		await db.prepare(`DELETE FROM disbursement_allocations WHERE donation_id = ?`).bind(id).run();
	} else {
		memoryDonations = memoryDonations.filter((d) => d.id !== id);
		memoryAllocations = memoryAllocations.filter((a) => a.donation_id !== id);
	}
}

// DISBURSEMENT QUERIES
export async function getDisbursements(db: any, campaignId = 'nepal-flood-2026'): Promise<DisbursementRow[]> {
	await ensureLocalDefaultAdmin();
	const isFloodCampaign = campaignId === 'nepal-flood-2026' || campaignId === 'nepal-flood-2024';

	if (db) {
		await ensureDonationsTable(db);
		let res;
		if (isFloodCampaign) {
			res = await db
				.prepare(`SELECT * FROM disbursements WHERE campaign_id = 'nepal-flood-2026' OR campaign_id = 'nepal-flood-2024' ORDER BY disbursed_at DESC, created_at DESC`)
				.all();
		} else {
			res = await db
				.prepare(`SELECT * FROM disbursements WHERE campaign_id = ? ORDER BY disbursed_at DESC, created_at DESC`)
				.bind(campaignId)
				.all();
		}
		const disbursements = (res.results || []) as DisbursementRow[];

		// Attach allocated donations
		for (const disb of disbursements) {
			const allocRes = await db
				.prepare(`
					SELECT da.donation_id, da.amount, d.donor_name 
					FROM disbursement_allocations da 
					JOIN donations d ON da.donation_id = d.id 
					WHERE da.disbursement_id = ?
				`)
				.bind(disb.id)
				.all();
			disb.allocated_donations = (allocRes.results || []).map((a: any) => ({
				donation_id: a.donation_id,
				donor_name: a.donor_name,
				amount: Number(a.amount)
			}));
		}

		return disbursements;
	}

	return memoryDisbursements
		.filter((d) => d.campaign_id === campaignId)
		.map((disb) => {
			const allocations = memoryAllocations.filter((a) => a.disbursement_id === disb.id);
			return {
				...disb,
				allocated_donations: allocations.map((a) => {
					const don = memoryDonations.find((d) => d.id === a.donation_id);
					return {
						donation_id: a.donation_id,
						donor_name: don ? don.donor_name : 'Unknown Donor',
						amount: a.amount
					};
				})
			};
		})
		.sort((a, b) => new Date(b.disbursed_at).getTime() - new Date(a.disbursed_at).getTime());
}

export async function createDisbursement(
	db: any,
	data: {
		campaign_id?: string;
		recipient: string;
		amount: number;
		disbursed_at: string;
		reference_number?: string;
		notes?: string;
		document_url?: string;
		donation_ids?: string[];
	}
): Promise<DisbursementRow> {
	await ensureLocalDefaultAdmin();
	const id = 'disb_' + crypto.randomUUID().slice(0, 8);
	const created_at = new Date().toISOString();
	const campaign_id = data.campaign_id || 'nepal-flood-2024';

	const newDisbursement: DisbursementRow = {
		id,
		campaign_id,
		recipient: data.recipient.trim(),
		amount: Number(data.amount),
		disbursed_at: data.disbursed_at,
		reference_number: data.reference_number ? data.reference_number.trim() : null,
		notes: data.notes ? data.notes.trim() : null,
		document_url: data.document_url ? data.document_url.trim() : null,
		created_at
	};

	if (db) {
		await ensureDonationsTable(db);
		await db
			.prepare(`
				INSERT INTO disbursements (id, campaign_id, recipient, amount, disbursed_at, reference_number, notes, document_url, created_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
			`)
			.bind(
				id,
				campaign_id,
				newDisbursement.recipient,
				newDisbursement.amount,
				newDisbursement.disbursed_at,
				newDisbursement.reference_number,
				newDisbursement.notes,
				newDisbursement.document_url,
				created_at
			)
			.run();

		// Record allocations if provided
		if (data.donation_ids && data.donation_ids.length > 0) {
			for (const donId of data.donation_ids) {
				const don = await getDonationById(db, donId);
				if (don) {
					const allocId = 'alloc_' + crypto.randomUUID().slice(0, 8);
					await db
						.prepare(`
							INSERT INTO disbursement_allocations (id, disbursement_id, donation_id, amount)
							VALUES (?, ?, ?, ?)
						`)
						.bind(allocId, id, don.id, don.amount)
						.run();
				}
			}
		}
	} else {
		memoryDisbursements.unshift(newDisbursement);
		if (data.donation_ids) {
			for (const donId of data.donation_ids) {
				const don = memoryDonations.find((d) => d.id === donId);
				if (don) {
					memoryAllocations.push({
						id: 'alloc_' + crypto.randomUUID().slice(0, 8),
						disbursement_id: id,
						donation_id: don.id,
						amount: don.amount
					});
				}
			}
		}
	}

	return newDisbursement;
}

export async function deleteDisbursement(db: any, id: string): Promise<void> {
	await ensureLocalDefaultAdmin();
	if (db) {
		await ensureDonationsTable(db);
		await db.prepare(`DELETE FROM disbursements WHERE id = ?`).bind(id).run();
		await db.prepare(`DELETE FROM disbursement_allocations WHERE disbursement_id = ?`).bind(id).run();
	} else {
		memoryDisbursements = memoryDisbursements.filter((d) => d.id !== id);
		memoryAllocations = memoryAllocations.filter((a) => a.disbursement_id !== id);
	}
};

// -------------------------------------------------------------
// Email Batches, Email Logs, and Email Templates
// -------------------------------------------------------------

async function ensureEmailTables(db: any) {
	if (!db) return;
	await db.prepare(`
		CREATE TABLE IF NOT EXISTS email_batches (
			id TEXT PRIMARY KEY,
			label TEXT NOT NULL,
			subject TEXT NOT NULL,
			template_id TEXT,
			content_html TEXT,
			from_email TEXT NOT NULL,
			sender_admin_id TEXT NOT NULL,
			total_recipients INTEGER NOT NULL DEFAULT 0,
			success_count INTEGER NOT NULL DEFAULT 0,
			failure_count INTEGER NOT NULL DEFAULT 0,
			status TEXT NOT NULL DEFAULT 'completed',
			created_at TEXT NOT NULL
		);
	`).run();

	// Graceful migration if table was created without content_html
	try {
		await db.prepare(`ALTER TABLE email_batches ADD COLUMN content_html TEXT`).run();
	} catch (e) {
		// column already exists
	}

	await db.prepare(`
		CREATE TABLE IF NOT EXISTS email_logs (
			id TEXT PRIMARY KEY,
			batch_id TEXT NOT NULL,
			recipient_email TEXT NOT NULL,
			recipient_name TEXT,
			status TEXT NOT NULL,
			error_message TEXT,
			sent_at TEXT NOT NULL,
			FOREIGN KEY (batch_id) REFERENCES email_batches(id) ON DELETE CASCADE
		);
	`).run();

	await db.prepare(`
		CREATE TABLE IF NOT EXISTS email_templates (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			description TEXT,
			subject_default TEXT,
			r2_key TEXT,
			html_content TEXT,
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL
		);
	`).run();
}

export async function createEmailBatch(
	db: any,
	data: {
		label: string;
		subject: string;
		template_id?: string | null;
		content_html?: string | null;
		from_email: string;
		sender_admin_id: string;
		total_recipients: number;
		success_count: number;
		failure_count: number;
		status?: 'processing' | 'completed' | 'failed';
	}
): Promise<EmailBatchRow> {
	await ensureLocalDefaultAdmin();
	const id = 'batch_' + crypto.randomUUID().slice(0, 10);
	const now = new Date().toISOString();
	const newBatch: EmailBatchRow = {
		id,
		label: data.label.trim(),
		subject: data.subject.trim(),
		template_id: data.template_id || null,
		content_html: data.content_html || null,
		from_email: data.from_email.trim(),
		sender_admin_id: data.sender_admin_id,
		total_recipients: data.total_recipients,
		success_count: data.success_count,
		failure_count: data.failure_count,
		status: data.status || 'completed',
		created_at: now
	};

	if (db) {
		await ensureEmailTables(db);
		await db.prepare(`
			INSERT INTO email_batches (id, label, subject, template_id, content_html, from_email, sender_admin_id, total_recipients, success_count, failure_count, status, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`).bind(
			newBatch.id,
			newBatch.label,
			newBatch.subject,
			newBatch.template_id,
			newBatch.content_html,
			newBatch.from_email,
			newBatch.sender_admin_id,
			newBatch.total_recipients,
			newBatch.success_count,
			newBatch.failure_count,
			newBatch.status,
			newBatch.created_at
		).run();
	} else {
		memoryEmailBatches.unshift(newBatch);
	}

	return newBatch;
}

export async function addEmailLog(
	db: any,
	log: {
		batch_id: string;
		recipient_email: string;
		recipient_name?: string | null;
		status: 'sent' | 'failed';
		error_message?: string | null;
	}
): Promise<EmailLogRow> {
	await ensureLocalDefaultAdmin();
	const id = 'elog_' + crypto.randomUUID().slice(0, 10);
	const now = new Date().toISOString();
	const newLog: EmailLogRow = {
		id,
		batch_id: log.batch_id,
		recipient_email: log.recipient_email.trim().toLowerCase(),
		recipient_name: log.recipient_name || null,
		status: log.status,
		error_message: log.error_message || null,
		sent_at: now
	};

	if (db) {
		await ensureEmailTables(db);
		await db.prepare(`
			INSERT INTO email_logs (id, batch_id, recipient_email, recipient_name, status, error_message, sent_at)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`).bind(
			newLog.id,
			newLog.batch_id,
			newLog.recipient_email,
			newLog.recipient_name,
			newLog.status,
			newLog.error_message,
			newLog.sent_at
		).run();
	} else {
		memoryEmailLogs.unshift(newLog);
	}

	return newLog;
}

export async function getEmailBatches(db: any): Promise<EmailBatchRow[]> {
	await ensureLocalDefaultAdmin();
	if (db) {
		await ensureEmailTables(db);
		const res = await db.prepare(`SELECT * FROM email_batches ORDER BY created_at DESC`).all();
		return (res.results || []) as EmailBatchRow[];
	}
	return [...memoryEmailBatches].sort(
		(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
	);
}

export async function getEmailLogsByBatch(db: any, batchId: string): Promise<EmailLogRow[]> {
	await ensureLocalDefaultAdmin();
	if (db) {
		await ensureEmailTables(db);
		const res = await db.prepare(`SELECT * FROM email_logs WHERE batch_id = ? ORDER BY sent_at DESC`).bind(batchId).all();
		return (res.results || []) as EmailLogRow[];
	}
	return memoryEmailLogs.filter((l) => l.batch_id === batchId);
}

export async function getEmailTemplates(db: any): Promise<EmailTemplateRow[]> {
	await ensureLocalDefaultAdmin();
	if (db) {
		await ensureEmailTables(db);
		const res = await db.prepare(`SELECT * FROM email_templates ORDER BY created_at ASC`).all();
		return (res.results || []) as EmailTemplateRow[];
	}
	return [...memoryEmailTemplates];
}

export async function getEmailTemplateById(db: any, id: string): Promise<EmailTemplateRow | null> {
	await ensureLocalDefaultAdmin();
	if (db) {
		await ensureEmailTables(db);
		const res = await db.prepare(`SELECT * FROM email_templates WHERE id = ?`).bind(id).first();
		return (res as EmailTemplateRow) || null;
	}
	return memoryEmailTemplates.find((t) => t.id === id) || null;
}

export async function upsertEmailTemplate(
	db: any,
	template: {
		id?: string;
		name: string;
		description?: string | null;
		subject_default?: string | null;
		r2_key?: string | null;
		html_content: string;
	}
): Promise<EmailTemplateRow> {
	await ensureLocalDefaultAdmin();
	const now = new Date().toISOString();
	const id = template.id || 'tmpl_' + crypto.randomUUID().slice(0, 8);

	if (db) {
		await ensureEmailTables(db);
		const existing = await getEmailTemplateById(db, id);
		if (existing) {
			await db.prepare(`
				UPDATE email_templates
				SET name = ?, description = ?, subject_default = ?, r2_key = ?, html_content = ?, updated_at = ?
				WHERE id = ?
			`).bind(
				template.name.trim(),
				template.description || null,
				template.subject_default || null,
				template.r2_key || null,
				template.html_content,
				now,
				id
			).run();
			return {
				...existing,
				name: template.name.trim(),
				description: template.description || null,
				subject_default: template.subject_default || null,
				r2_key: template.r2_key || null,
				html_content: template.html_content,
				updated_at: now
			};
		} else {
			const newRow: EmailTemplateRow = {
				id,
				name: template.name.trim(),
				description: template.description || null,
				subject_default: template.subject_default || null,
				r2_key: template.r2_key || null,
				html_content: template.html_content,
				created_at: now,
				updated_at: now
			};
			await db.prepare(`
				INSERT INTO email_templates (id, name, description, subject_default, r2_key, html_content, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?)
			`).bind(
				newRow.id,
				newRow.name,
				newRow.description,
				newRow.subject_default,
				newRow.r2_key,
				newRow.html_content,
				newRow.created_at,
				newRow.updated_at
			).run();
			return newRow;
		}
	} else {
		const idx = memoryEmailTemplates.findIndex((t) => t.id === id);
		if (idx !== -1) {
			memoryEmailTemplates[idx] = {
				...memoryEmailTemplates[idx],
				name: template.name.trim(),
				description: template.description || null,
				subject_default: template.subject_default || null,
				r2_key: template.r2_key || null,
				html_content: template.html_content,
				updated_at: now
			};
			return memoryEmailTemplates[idx];
		} else {
			const newRow: EmailTemplateRow = {
				id,
				name: template.name.trim(),
				description: template.description || null,
				subject_default: template.subject_default || null,
				r2_key: template.r2_key || null,
				html_content: template.html_content,
				created_at: now,
				updated_at: now
			};
			memoryEmailTemplates.push(newRow);
			return newRow;
		}
	}
}

export async function deleteEmailTemplate(db: any, id: string): Promise<void> {
	await ensureLocalDefaultAdmin();
	if (db) {
		await ensureEmailTables(db);
		await db.prepare(`DELETE FROM email_templates WHERE id = ?`).bind(id).run();
	} else {
		memoryEmailTemplates = memoryEmailTemplates.filter((t) => t.id !== id);
	}
}

// ORGANIZATIONAL ROLES QUERIES & MANAGEMENT
async function ensureOrgRolesTables(db: any) {
	if (!db) return;
	await db.prepare(`
		CREATE TABLE IF NOT EXISTS organizational_roles (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			category TEXT NOT NULL DEFAULT 'board',
			rank_order INTEGER NOT NULL DEFAULT 100,
			description TEXT,
			parent_role_id TEXT
		);
	`).run();
	try {
		await db.prepare(`ALTER TABLE organizational_roles ADD COLUMN parent_role_id TEXT`).run();
	} catch {
		// Column already exists
	}
	await db.prepare(`
		CREATE TABLE IF NOT EXISTS member_organizational_roles (
			id TEXT PRIMARY KEY,
			member_id TEXT NOT NULL,
			role_id TEXT NOT NULL,
			start_date TEXT,
			end_date TEXT,
			is_active INTEGER NOT NULL DEFAULT 1,
			notes TEXT,
			created_at TEXT NOT NULL,
			FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
			FOREIGN KEY (role_id) REFERENCES organizational_roles(id) ON DELETE RESTRICT
		);
	`).run();
}

export async function getOrganizationalRoles(db: any): Promise<OrganizationalRoleRow[]> {
	await ensureLocalDefaultAdmin();
	if (db) {
		await ensureOrgRolesTables(db);
		const res = await db.prepare(`
			SELECT r.*, p.title as parent_title
			FROM organizational_roles r
			LEFT JOIN organizational_roles p ON r.parent_role_id = p.id
			ORDER BY r.rank_order ASC, r.title ASC
		`).all();
		return (res.results || []) as OrganizationalRoleRow[];
	}
	return [...memoryOrgRoles].map((r) => {
		const p = memoryOrgRoles.find((pr) => pr.id === r.parent_role_id);
		return {
			...r,
			parent_title: p?.title || null
		};
	}).sort((a, b) => a.rank_order - b.rank_order);
}

export async function getMemberOrganizationalRoles(db: any, memberId: string): Promise<MemberOrganizationalRoleRow[]> {
	await ensureLocalDefaultAdmin();
	if (db) {
		await ensureOrgRolesTables(db);
		const res = await db.prepare(`
			SELECT mor.*, r.title, r.category, r.rank_order, r.parent_role_id, p.title as parent_title
			FROM member_organizational_roles mor
			JOIN organizational_roles r ON mor.role_id = r.id
			LEFT JOIN organizational_roles p ON r.parent_role_id = p.id
			WHERE mor.member_id = ?
			ORDER BY mor.is_active DESC, r.rank_order ASC, mor.created_at DESC
		`).bind(memberId).all();
		return (res.results || []) as MemberOrganizationalRoleRow[];
	}
	return memoryMemberOrgRoles
		.filter((mor) => mor.member_id === memberId)
		.map((mor) => {
			const r = memoryOrgRoles.find((role) => role.id === mor.role_id);
			const p = r?.parent_role_id ? memoryOrgRoles.find((role) => role.id === r.parent_role_id) : null;
			return {
				...mor,
				parent_role_id: r?.parent_role_id || null,
				parent_title: p?.title || null
			};
		})
		.sort((a, b) => ((b.is_active ? 1 : 0) - (a.is_active ? 1 : 0)));
}

export async function getAllMemberOrganizationalRoles(db: any, onlyActive = true): Promise<MemberOrganizationalRoleRow[]> {
	await ensureLocalDefaultAdmin();
	if (db) {
		await ensureOrgRolesTables(db);
		let query = `
			SELECT mor.*, r.title, r.category, r.rank_order, r.parent_role_id, p.title as parent_title
			FROM member_organizational_roles mor
			JOIN organizational_roles r ON mor.role_id = r.id
			LEFT JOIN organizational_roles p ON r.parent_role_id = p.id
		`;
		if (onlyActive) {
			query += ` WHERE mor.is_active = 1`;
		}
		query += ` ORDER BY r.rank_order ASC, mor.created_at DESC`;
		const res = await db.prepare(query).all();
		return (res.results || []) as MemberOrganizationalRoleRow[];
	}
	let list = [...memoryMemberOrgRoles].map((mor) => {
		const r = memoryOrgRoles.find((role) => role.id === mor.role_id);
		const p = r?.parent_role_id ? memoryOrgRoles.find((role) => role.id === r.parent_role_id) : null;
		return {
			...mor,
			parent_role_id: r?.parent_role_id || null,
			parent_title: p?.title || null
		};
	});
	if (onlyActive) {
		list = list.filter((mor) => mor.is_active === 1 || mor.is_active === true);
	}
	return list.sort((a, b) => (a.rank_order || 100) - (b.rank_order || 100));
}

export async function assignMemberOrganizationalRole(
	db: any,
	assignment: {
		member_id: string;
		role_id: string;
		start_date?: string | null;
		end_date?: string | null;
		is_active?: boolean | number;
		notes?: string | null;
	}
): Promise<MemberOrganizationalRoleRow> {
	await ensureLocalDefaultAdmin();
	const id = 'mor_' + crypto.randomUUID().slice(0, 10);
	const now = new Date().toISOString();
	const isActiveVal = assignment.is_active !== undefined ? (assignment.is_active ? 1 : 0) : 1;

	const roleMeta = memoryOrgRoles.find((r) => r.id === assignment.role_id);
	const parentMeta = roleMeta?.parent_role_id ? memoryOrgRoles.find((r) => r.id === roleMeta.parent_role_id) : null;
	const newRow: MemberOrganizationalRoleRow = {
		id,
		member_id: assignment.member_id,
		role_id: assignment.role_id,
		title: roleMeta?.title || 'Board Director',
		category: roleMeta?.category || 'board',
		rank_order: roleMeta?.rank_order || 50,
		parent_role_id: roleMeta?.parent_role_id || null,
		parent_title: parentMeta?.title || null,
		start_date: assignment.start_date || null,
		end_date: assignment.end_date || null,
		is_active: isActiveVal,
		notes: assignment.notes || null,
		created_at: now
	};

	if (db) {
		await ensureOrgRolesTables(db);
		await db.prepare(`
			INSERT INTO member_organizational_roles (id, member_id, role_id, start_date, end_date, is_active, notes, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		`).bind(
			newRow.id,
			newRow.member_id,
			newRow.role_id,
			newRow.start_date,
			newRow.end_date,
			newRow.is_active,
			newRow.notes,
			newRow.created_at
		).run();
	} else {
		memoryMemberOrgRoles.push(newRow);
	}
	invalidateTeamLeadershipCache();
	return newRow;
}

export async function syncMemberOrganizationalRole(
	db: any,
	memberId: string,
	roleId: string | null | undefined,
	startDate: string | null = null,
	endDate: string | null = null,
	isActive: boolean = true,
	notes: string | null = null
): Promise<void> {
	await ensureLocalDefaultAdmin();
	const cleanRoleId = roleId && roleId.trim() ? roleId.trim() : null;

	if (db) {
		await ensureOrgRolesTables(db);
		if (cleanRoleId) {
			// Deactivate any other active role assignments for this member
			await db.prepare(`
				UPDATE member_organizational_roles
				SET is_active = 0
				WHERE member_id = ? AND role_id != ?
			`).bind(memberId, cleanRoleId).run();

			// Upsert active role assignment with stable primary key mor_${memberId}
			await db.prepare(`
				INSERT INTO member_organizational_roles (id, member_id, role_id, start_date, end_date, is_active, notes, created_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?)
				ON CONFLICT(id) DO UPDATE SET
					role_id = excluded.role_id,
					start_date = excluded.start_date,
					end_date = excluded.end_date,
					is_active = excluded.is_active,
					notes = excluded.notes
			`).bind(
				`mor_${memberId}`,
				memberId,
				cleanRoleId,
				startDate || null,
				endDate || null,
				isActive ? 1 : 0,
				notes || null,
				new Date().toISOString()
			).run();
		} else {
			// Clear / deactivate all role assignments for this member
			await db.prepare(`
				UPDATE member_organizational_roles
				SET is_active = 0, end_date = COALESCE(end_date, DATE('now'))
				WHERE member_id = ? AND is_active = 1
			`).bind(memberId).run();
		}
	}

	// Always sync in-memory store (for local dev fallback when D1 is unattached)
	for (const mor of memoryMemberOrgRoles) {
		if (mor.member_id === memberId) {
			mor.is_active = 0;
		}
	}

	if (cleanRoleId) {
		const roleMeta = memoryOrgRoles.find((r) => r.id === cleanRoleId);
		const parentMeta = roleMeta?.parent_role_id ? memoryOrgRoles.find((r) => r.id === roleMeta.parent_role_id) : null;
		const existingIdx = memoryMemberOrgRoles.findIndex((mor) => mor.member_id === memberId && mor.role_id === cleanRoleId);
		const rowData: MemberOrganizationalRoleRow = {
			id: `mor_${memberId}`,
			member_id: memberId,
			role_id: cleanRoleId,
			title: roleMeta?.title || cleanRoleId,
			category: roleMeta?.category || 'board',
			rank_order: roleMeta?.rank_order || 100,
			parent_role_id: roleMeta?.parent_role_id || null,
			parent_title: parentMeta?.title || null,
			start_date: startDate || null,
			end_date: endDate || null,
			is_active: isActive ? 1 : 0,
			notes: notes || null,
			created_at: new Date().toISOString()
		};

		if (existingIdx !== -1) {
			memoryMemberOrgRoles[existingIdx] = rowData;
		} else {
			memoryMemberOrgRoles.push(rowData);
		}
	}

	invalidateTeamLeadershipCache();
}

export async function upsertOrganizationalRole(
	db: any,
	role: {
		id?: string;
		title: string;
		category: string;
		rank_order?: number;
		description?: string | null;
		parent_role_id?: string | null;
	}
): Promise<OrganizationalRoleRow> {
	await ensureLocalDefaultAdmin();
	const id = role.id || 'org_' + role.title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
	const rankOrder = Number(role.rank_order) || 100;
	const desc = role.description?.trim() || null;
	const parentRoleId = role.parent_role_id?.trim() || null;

	const newRow: OrganizationalRoleRow = {
		id,
		title: role.title.trim(),
		category: role.category.trim() || 'board',
		rank_order: rankOrder,
		description: desc,
		parent_role_id: parentRoleId
	};

	if (db) {
		await ensureOrgRolesTables(db);
		await db.prepare(`
			INSERT INTO organizational_roles (id, title, category, rank_order, description, parent_role_id)
			VALUES (?, ?, ?, ?, ?, ?)
			ON CONFLICT(id) DO UPDATE SET
				title = excluded.title,
				category = excluded.category,
				rank_order = excluded.rank_order,
				description = excluded.description,
				parent_role_id = excluded.parent_role_id
		`).bind(newRow.id, newRow.title, newRow.category, newRow.rank_order, newRow.description, newRow.parent_role_id).run();
	} else {
		const idx = memoryOrgRoles.findIndex((r) => r.id === id);
		if (idx !== -1) {
			memoryOrgRoles[idx] = newRow;
		} else {
			memoryOrgRoles.push(newRow);
		}
	}
	invalidateTeamLeadershipCache();
	return newRow;
}

export async function deleteOrganizationalRole(db: any, id: string): Promise<void> {
	await ensureLocalDefaultAdmin();
	if (db) {
		await ensureOrgRolesTables(db);
		await db.prepare(`DELETE FROM organizational_roles WHERE id = ?`).bind(id).run();
	} else {
		memoryOrgRoles = memoryOrgRoles.filter((r) => r.id !== id);
		memoryMemberOrgRoles = memoryMemberOrgRoles.filter((mor) => mor.role_id !== id);
	}
	invalidateTeamLeadershipCache();
}

export async function removeMemberOrganizationalRole(db: any, assignmentId: string): Promise<void> {
	await ensureLocalDefaultAdmin();
	if (db) {
		await ensureOrgRolesTables(db);
		await db.prepare(`DELETE FROM member_organizational_roles WHERE id = ?`).bind(assignmentId).run();
	} else {
		memoryMemberOrgRoles = memoryMemberOrgRoles.filter((mor) => mor.id !== assignmentId);
	}
	invalidateTeamLeadershipCache();
}

export interface TeamMemberView {
	id: string;
	name: string;
	full_name: string;
	salutation: string | null;
	role: string;
	org_role_id?: string | null;
	org_category?: string | null;
	role_rank_order: number;
	display_order: number;
	profession: string | null;
	subname?: string | null;
	credentials?: string | null;
	bio: string | null;
	region: string | null;
	photo: string | null;
}

let cachedLeadership: { executiveBoard: TeamMemberView[]; advisoryBoard: TeamMemberView[] } | null = null;
let leadershipVersion = Date.now();

export function invalidateTeamLeadershipCache() {
	cachedLeadership = null;
	leadershipVersion = Date.now();
}

export function getLeadershipVersion(): number {
	return leadershipVersion;
}

export async function getTeamLeadership(db: any): Promise<{
	executiveBoard: TeamMemberView[];
	advisoryBoard: TeamMemberView[];
}> {
	if (cachedLeadership) {
		return cachedLeadership;
	}
	await ensureLocalDefaultAdmin();
	const members = await getAllMembers(db, 'approved');
	const orgRoles = await getOrganizationalRoles(db);
	const memberOrgRoles = await getAllMemberOrganizationalRoles(db, true);

	// Filter members to only those who are BOD or Advisory:
	// Partners and regular members with no BOD or Advisory appointment must NOT be shown.
	const teamEligibleMembers = members.filter((m) => {
		if (m.role === 'partner') return false;

		const activeAssignment = memberOrgRoles.find(
			(mor) => mor.member_id === m.id && (mor.is_active === 1 || mor.is_active === true)
		);
		const matchedRole = orgRoles.find(
			(r) => r.id === activeAssignment?.role_id || (m.organizational_role && r.title.toLowerCase() === m.organizational_role.toLowerCase())
		);

		const category = activeAssignment?.category || matchedRole?.category;
		const orgTitle = (activeAssignment?.title || matchedRole?.title || m.organizational_role || '').toLowerCase();

		const isAdvisoryRole =
			m.role === 'advisory' ||
			category === 'advisory' ||
			orgTitle.includes('advisor') ||
			orgTitle.includes('advisory') ||
			orgTitle.includes('consul') ||
			orgTitle.includes('founder');

		const isBodRole =
			m.role === 'bod' ||
			m.role === 'admin' ||
			category === 'board' ||
			category === 'executive' ||
			matchedRole?.parent_role_id === 'org_director' ||
			orgTitle.includes('director') ||
			orgTitle.includes('president') ||
			orgTitle.includes('secretary') ||
			orgTitle.includes('treasurer') ||
			orgTitle.includes('admin');

		return isAdvisoryRole || isBodRole;
	});

	const enriched: TeamMemberView[] = teamEligibleMembers.map((m) => {
		const activeAssignment = memberOrgRoles.find(
			(mor) => mor.member_id === m.id && (mor.is_active === 1 || mor.is_active === true)
		);
		const matchedRole = orgRoles.find(
			(r) => r.id === activeAssignment?.role_id || (m.organizational_role && r.title.toLowerCase() === m.organizational_role.toLowerCase())
		);

		const isAdvisorMember =
			m.role === 'advisory' ||
			activeAssignment?.category === 'advisory' ||
			matchedRole?.category === 'advisory' ||
			(m.organizational_role || '').toLowerCase().includes('advisor') ||
			(m.organizational_role || '').toLowerCase().includes('consul') ||
			(m.organizational_role || '').toLowerCase().includes('founder');

		const defaultRoleTitle = isAdvisorMember ? 'Advisory Board Member' : 'Board Member';
		const defaultCategory = isAdvisorMember ? 'advisory' : 'board';

		const roleTitle = activeAssignment?.title || matchedRole?.title || m.organizational_role || defaultRoleTitle;
		const category = activeAssignment?.category || matchedRole?.category || defaultCategory;
		const roleRank = activeAssignment?.rank_order ?? matchedRole?.rank_order ?? 100;
		const displayOrder = m.display_order ?? 100;

		let displayName = (m.full_name || '').trim();
		if (m.salutation && m.salutation.trim()) {
			const sal = m.salutation.trim();
			const salRegex = new RegExp(`^${sal.replace('.', '\\.')}\\s*`, 'i');
			if (!salRegex.test(displayName) && !/^(Dr\.|Mr\.|Mrs\.|Ms\.|Hon\.|Prof\.)\s+/i.test(displayName)) {
				displayName = `${sal} ${displayName}`;
			}
		}
		const region = m.province ? (m.city ? `${m.city}, ${m.province}` : m.province) : (m.city || null);

		return {
			id: m.id,
			name: displayName,
			full_name: m.full_name,
			salutation: m.salutation || null,
			role: roleTitle,
			org_role_id: activeAssignment?.role_id || matchedRole?.id || null,
			org_category: category,
			role_rank_order: roleRank,
			display_order: displayOrder,
			profession: m.profession || null,
			bio: m.bio || null,
			region,
			photo: m.avatar_url || null
		};
	});

	// Criteria to determine Advisory vs Executive Board of Directors
	const isAdvisor = (t: TeamMemberView) => {
		const r = t.role.toLowerCase();
		return (
			t.org_category === 'advisory' ||
			r.includes('advisor') ||
			r.includes('advisory') ||
			r.includes('consul') ||
			r.includes('founder')
		);
	};

	const isBoard = (t: TeamMemberView) => {
		if (isAdvisor(t)) return false;
		const r = t.role.toLowerCase();
		return (
			t.org_category === 'board' ||
			t.org_category === 'executive' ||
			r.includes('director') ||
			r.includes('president') ||
			r.includes('secretary') ||
			r.includes('treasurer') ||
			r.includes('admin')
		);
	};

	// Custom presentation sort:
	// Respect custom display_order (if set !== 100), otherwise order by role_rank_order, then alphabetically
	const sortTeam = (a: TeamMemberView, b: TeamMemberView) => {
		const effA = a.display_order !== 100 ? a.display_order : a.role_rank_order;
		const effB = b.display_order !== 100 ? b.display_order : b.role_rank_order;
		if (effA !== effB) return effA - effB;
		if (a.role_rank_order !== b.role_rank_order) return a.role_rank_order - b.role_rank_order;
		return a.full_name.localeCompare(b.full_name);
	};

	const advisoryBoard = enriched.filter(isAdvisor).sort(sortTeam);
	const executiveBoard = enriched.filter(isBoard).sort(sortTeam);

	cachedLeadership = {
		executiveBoard,
		advisoryBoard
	};

	return cachedLeadership;
}

// ==========================================
// DOCUMENT CMS & ATTACHMENT QUERIES
// ==========================================

export function canUserViewDocument(doc: DocumentRow, user?: { role: string } | null): boolean {
	if (doc.status !== 'published') {
		return user?.role === 'admin';
	}
	const visibility = doc.visibility || 'public';
	if (visibility === 'public') return true;
	if (!user) return false;
	if (user.role === 'admin') return true;
	if (visibility === 'members') return ['member', 'bod', 'admin'].includes(user.role);
	if (visibility === 'bod') return ['bod', 'admin'].includes(user.role);
	if (visibility === 'admin') return user.role === 'admin';
	return false;
}

export async function ensureDocumentsTable(db: any) {
	if (!db) return;
	try {
		await db
			.prepare(
				`
			CREATE TABLE IF NOT EXISTS documents (
				id TEXT PRIMARY KEY,
				title TEXT NOT NULL,
				slug TEXT UNIQUE NOT NULL,
				summary TEXT,
				category TEXT NOT NULL DEFAULT 'General',
				content_html TEXT NOT NULL,
				banner_image_url TEXT,
				attachments TEXT,
				status TEXT NOT NULL DEFAULT 'published',
				visibility TEXT NOT NULL DEFAULT 'public',
				author_id TEXT,
				author_name TEXT,
				published_at TEXT,
				created_at TEXT NOT NULL,
				updated_at TEXT NOT NULL,
				FOREIGN KEY (author_id) REFERENCES members(id) ON DELETE SET NULL
			);
		`
			)
			.run();

		// Safe column addition if migrating from earlier schema
		try {
			await db.prepare(`ALTER TABLE documents ADD COLUMN visibility TEXT NOT NULL DEFAULT 'public'`).run();
		} catch (_) {}

		await db.prepare(`CREATE INDEX IF NOT EXISTS idx_documents_slug ON documents(slug);`).run();
		await db.prepare(`CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);`).run();
		await db.prepare(`CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);`).run();
		await db.prepare(`CREATE INDEX IF NOT EXISTS idx_documents_visibility ON documents(visibility);`).run();

		// Seed initial documents into D1 if table is empty
		const countRes = await db.prepare(`SELECT COUNT(*) as count FROM documents`).first();
		if (countRes && Number(countRes.count) === 0) {
			await ensureLocalDefaultAdmin();
			for (const doc of memoryDocuments) {
				await db
					.prepare(
						`
					INSERT INTO documents (
						id, title, slug, summary, category, content_html,
						banner_image_url, attachments, status, visibility, author_id,
						author_name, published_at, created_at, updated_at
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				`
					)
					.bind(
						doc.id,
						doc.title,
						doc.slug,
						doc.summary,
						doc.category,
						doc.content_html,
						doc.banner_image_url,
						doc.attachments,
						doc.status,
						doc.visibility || 'public',
						doc.author_id,
						doc.author_name,
						doc.published_at,
						doc.created_at,
						doc.updated_at
					)
					.run();
			}
		}
	} catch (e) {
		console.warn('Failed to ensure documents table in D1:', e);
	}
}

export async function getAllDocuments(
	db: any,
	statusFilter: 'all' | 'published' | 'draft' = 'all'
): Promise<DocumentRow[]> {
	await ensureLocalDefaultAdmin();
	if (db) {
		await ensureDocumentsTable(db);
		let query = `SELECT * FROM documents`;
		const params: any[] = [];
		if (statusFilter !== 'all') {
			query += ` WHERE status = ?`;
			params.push(statusFilter);
		}
		query += ` ORDER BY COALESCE(published_at, created_at) DESC`;
		const res = await db.prepare(query).bind(...params).all();
		return (res.results || []) as DocumentRow[];
	}

	return [...memoryDocuments]
		.filter((d) => statusFilter === 'all' || d.status === statusFilter)
		.sort((a, b) => {
			const dateA = new Date(a.published_at || a.created_at).getTime();
			const dateB = new Date(b.published_at || b.created_at).getTime();
			return dateB - dateA;
		});
}

// ==========================================
// Document In-Memory Cache (Workers isolate)
// ==========================================
const documentSlugCache = new Map<string, { doc: DocumentRow | null; timestamp: number }>();
let documentsVersion = Date.now();

export function invalidateDocumentsCache() {
	documentSlugCache.clear();
	documentsVersion = Date.now();
}

export function getDocumentsVersion(): number {
	return documentsVersion;
}

export async function getPublishedDocuments(
	db: any,
	category?: string | null,
	searchQuery?: string | null,
	userRole?: string | null
): Promise<DocumentRow[]> {
	await ensureLocalDefaultAdmin();

	// Determine allowed visibility tiers based on user's role
	let allowedVisibilities: string[] = ['public'];
	if (userRole === 'admin') {
		allowedVisibilities = ['public', 'members', 'bod', 'admin'];
	} else if (userRole === 'bod') {
		allowedVisibilities = ['public', 'members', 'bod'];
	} else if (userRole === 'member') {
		allowedVisibilities = ['public', 'members'];
	}

	if (db) {
		await ensureDocumentsTable(db);
		const placeholders = allowedVisibilities.map(() => '?').join(', ');
		let query = `SELECT * FROM documents WHERE status = 'published' AND visibility IN (${placeholders})`;
		const params: any[] = [...allowedVisibilities];

		if (category && category !== 'all' && category.trim()) {
			query += ` AND LOWER(category) = ?`;
			params.push(category.trim().toLowerCase());
		}

		if (searchQuery && searchQuery.trim()) {
			const q = `%${searchQuery.trim().toLowerCase()}%`;
			query += ` AND (LOWER(title) LIKE ? OR LOWER(summary) LIKE ? OR LOWER(category) LIKE ?)`;
			params.push(q, q, q);
		}

		query += ` ORDER BY COALESCE(published_at, created_at) DESC`;
		const res = await db.prepare(query).bind(...params).all();
		return (res.results || []) as DocumentRow[];
	}

	const q = searchQuery ? searchQuery.trim().toLowerCase() : '';
	const cat = category && category !== 'all' ? category.trim().toLowerCase() : null;

	return [...memoryDocuments]
		.filter((d) => d.status === 'published')
		.filter((d) => allowedVisibilities.includes(d.visibility || 'public'))
		.filter((d) => (cat ? d.category.toLowerCase() === cat : true))
		.filter((d) => {
			if (!q) return true;
			return (
				d.title.toLowerCase().includes(q) ||
				(d.summary && d.summary.toLowerCase().includes(q)) ||
				d.category.toLowerCase().includes(q)
			);
		})
		.sort((a, b) => {
			const dateA = new Date(a.published_at || a.created_at).getTime();
			const dateB = new Date(b.published_at || b.created_at).getTime();
			return dateB - dateA;
		});
}

export async function getDocumentBySlug(db: any, slug: string): Promise<DocumentRow | null> {
	await ensureLocalDefaultAdmin();
	const cleanSlug = slug.trim().toLowerCase();
	const cached = documentSlugCache.get(cleanSlug);
	if (cached && Date.now() - cached.timestamp < 120_000) {
		return cached.doc;
	}

	let doc: DocumentRow | null = null;
	if (db) {
		await ensureDocumentsTable(db);
		const res = await db.prepare(`SELECT * FROM documents WHERE LOWER(slug) = ?`).bind(cleanSlug).first();
		doc = (res as DocumentRow) || null;
	} else {
		doc = memoryDocuments.find((d) => d.slug.toLowerCase() === cleanSlug) || null;
	}

	documentSlugCache.set(cleanSlug, { doc, timestamp: Date.now() });
	return doc;
}

export async function getDocumentById(db: any, id: string): Promise<DocumentRow | null> {
	await ensureLocalDefaultAdmin();
	if (db) {
		await ensureDocumentsTable(db);
		const res = await db.prepare(`SELECT * FROM documents WHERE id = ?`).bind(id).first();
		return (res as DocumentRow) || null;
	}

	return memoryDocuments.find((d) => d.id === id) || null;
}

export async function createDocument(
	db: any,
	data: {
		title: string;
		slug?: string;
		summary?: string | null;
		category?: string;
		content_html: string;
		banner_image_url?: string | null;
		attachments?: string | null; // JSON string of DocumentAttachment[]
		status?: 'published' | 'draft';
		visibility?: DocumentVisibility;
		author_id?: string | null;
		author_name?: string | null;
		published_at?: string | null;
	}
): Promise<DocumentRow> {
	await ensureLocalDefaultAdmin();
	const id = 'doc_' + crypto.randomUUID().slice(0, 10);
	const now = new Date().toISOString();

	// Generate safe slug if not provided
	let slug = data.slug
		? data.slug
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/(^-|-$)/g, '')
		: data.title
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/(^-|-$)/g, '');

	if (!slug) {
		slug = `document-${id.slice(4)}`;
	}

	const status = data.status || 'published';
	const visibility = data.visibility || 'public';
	const published_at = status === 'published' ? (data.published_at || now) : null;

	const newDoc: DocumentRow = {
		id,
		title: data.title.trim(),
		slug,
		summary: data.summary ? data.summary.trim() : null,
		category: data.category ? data.category.trim() : 'General',
		content_html: data.content_html.trim(),
		banner_image_url: data.banner_image_url ? data.banner_image_url.trim() : null,
		attachments: data.attachments || '[]',
		status,
		visibility,
		author_id: data.author_id || null,
		author_name: data.author_name ? data.author_name.trim() : 'CANFACS Executive',
		published_at,
		created_at: now,
		updated_at: now
	};

	if (db) {
		await ensureDocumentsTable(db);
		await db
			.prepare(
				`
			INSERT INTO documents (
				id, title, slug, summary, category, content_html,
				banner_image_url, attachments, status, visibility, author_id,
				author_name, published_at, created_at, updated_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`
			)
			.bind(
				newDoc.id,
				newDoc.title,
				newDoc.slug,
				newDoc.summary,
				newDoc.category,
				newDoc.content_html,
				newDoc.banner_image_url,
				newDoc.attachments,
				newDoc.status,
				newDoc.visibility,
				newDoc.author_id,
				newDoc.author_name,
				newDoc.published_at,
				newDoc.created_at,
				newDoc.updated_at
			)
			.run();
	} else {
		memoryDocuments.unshift(newDoc);
	}

	invalidateDocumentsCache();
	return newDoc;
}

export async function updateDocument(
	db: any,
	id: string,
	data: {
		title?: string;
		slug?: string;
		summary?: string | null;
		category?: string;
		content_html?: string;
		banner_image_url?: string | null;
		attachments?: string | null;
		status?: 'published' | 'draft';
		visibility?: DocumentVisibility;
		author_name?: string | null;
		published_at?: string | null;
	}
): Promise<DocumentRow | null> {
	await ensureLocalDefaultAdmin();
	const now = new Date().toISOString();

	if (db) {
		await ensureDocumentsTable(db);
		const existing = await getDocumentById(db, id);
		if (!existing) return null;

		const fields: string[] = ['updated_at = ?'];
		const values: any[] = [now];

		if (data.title !== undefined) {
			fields.push('title = ?');
			values.push(data.title.trim());
		}
		if (data.slug !== undefined) {
			const cleanSlug = data.slug
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/(^-|-$)/g, '');
			fields.push('slug = ?');
			values.push(cleanSlug);
		}
		if (data.summary !== undefined) {
			fields.push('summary = ?');
			values.push(data.summary ? data.summary.trim() : null);
		}
		if (data.category !== undefined) {
			fields.push('category = ?');
			values.push(data.category.trim());
		}
		if (data.content_html !== undefined) {
			fields.push('content_html = ?');
			values.push(data.content_html.trim());
		}
		if (data.banner_image_url !== undefined) {
			fields.push('banner_image_url = ?');
			values.push(data.banner_image_url ? data.banner_image_url.trim() : null);
		}
		if (data.attachments !== undefined) {
			fields.push('attachments = ?');
			values.push(data.attachments);
		}
		if (data.status !== undefined) {
			fields.push('status = ?');
			values.push(data.status);
			if (data.status === 'published' && !existing.published_at) {
				fields.push('published_at = ?');
				values.push(now);
			}
		}
		if (data.visibility !== undefined) {
			fields.push('visibility = ?');
			values.push(data.visibility);
		}
		if (data.published_at !== undefined) {
			fields.push('published_at = ?');
			values.push(data.published_at);
		}
		if (data.author_name !== undefined) {
			fields.push('author_name = ?');
			values.push(data.author_name ? data.author_name.trim() : null);
		}

		values.push(id);
		await db.prepare(`UPDATE documents SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
		invalidateDocumentsCache();
		return getDocumentById(db, id);
	}

	const idx = memoryDocuments.findIndex((d) => d.id === id);
	if (idx === -1) return null;

	const existing = memoryDocuments[idx];
	const isNowPublished = data.status === 'published' && !existing.published_at;

	memoryDocuments[idx] = {
		...existing,
		...data,
		slug:
			data.slug !== undefined
				? data.slug
						.toLowerCase()
						.replace(/[^a-z0-9]+/g, '-')
						.replace(/(^-|-$)/g, '')
				: existing.slug,
		visibility: data.visibility !== undefined ? data.visibility : (existing.visibility || 'public'),
		published_at: isNowPublished ? now : (data.published_at !== undefined ? data.published_at : existing.published_at),
		updated_at: now
	};

	invalidateDocumentsCache();
	return memoryDocuments[idx];
}

export async function deleteDocument(db: any, id: string): Promise<void> {
	await ensureLocalDefaultAdmin();
	if (db) {
		await ensureDocumentsTable(db);
		await db.prepare(`DELETE FROM documents WHERE id = ?`).bind(id).run();
	} else {
		memoryDocuments = memoryDocuments.filter((d) => d.id !== id);
	}
	invalidateDocumentsCache();
}

export async function getDocumentCategories(db: any): Promise<string[]> {
	await ensureLocalDefaultAdmin();
	if (db) {
		await ensureDocumentsTable(db);
		const res = await db
			.prepare(`SELECT DISTINCT category FROM documents WHERE category IS NOT NULL AND status = 'published' ORDER BY category ASC`)
			.all();
		const cats = (res.results || []).map((r: any) => r.category).filter(Boolean);
		return cats.length > 0 ? cats : ['Governance & Policies', 'Financials & Audits', 'Meeting Minutes', 'Publications & Articles', 'General'];
	}

	const set = new Set(memoryDocuments.filter((d) => d.status === 'published').map((d) => d.category));
	if (set.size === 0) {
		return ['Governance & Policies', 'Financials & Audits', 'Meeting Minutes', 'Publications & Articles', 'General'];
	}
	return Array.from(set).sort();
}






