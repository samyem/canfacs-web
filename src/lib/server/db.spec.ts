import { describe, it, expect, beforeEach } from 'vitest';
import {
	getAllMembers,
	getMemberByEmail,
	getMemberById,
	updateMemberProfile,
	updateMemberRole,
	updateMemberStatus,
	getOrganizationalRoles,
	upsertOrganizationalRole,
	getAdminEmails,
	createMember,
	softDeleteMember,
	permanentlyDeleteMember,
	restoreMember,
	unapproveMember
} from './db';

describe('In-Memory & Local Database Operations Unit Tests', () => {
	it('initializes default admin account if table is empty', async () => {
		const admin = await getMemberByEmail(null, 'info@canfacs.org');
		expect(admin).not.toBeNull();
		expect(admin?.role).toBe('admin');
		expect(admin?.status).toBe('approved');
	});

	it('retrieves members by id and email', async () => {
		const byEmail = await getMemberByEmail(null, 'info@canfacs.org');
		expect(byEmail).toBeDefined();

		if (byEmail) {
			const byId = await getMemberById(null, byEmail.id);
			expect(byId).toBeDefined();
			expect(byId?.email).toBe(byEmail.email);
		}
	});

	it('updates member profile attributes and roles', async () => {
		const admin = await getMemberByEmail(null, 'info@canfacs.org');
		expect(admin).toBeDefined();
		if (!admin) return;

		await updateMemberProfile(null, admin.id, {
			profession: 'Lead Systems Architect',
			city: 'Vancouver',
			province: 'BC'
		});

		const updated = await getMemberById(null, admin.id);
		expect(updated?.profession).toBe('Lead Systems Architect');
		expect(updated?.city).toBe('Vancouver');
		expect(updated?.province).toBe('BC');
	});

	it('upserts and retrieves organizational roles', async () => {
		const newRole = await upsertOrganizationalRole(null, {
			id: 'org_test_lead',
			title: 'Community Ambassador',
			category: 'committee',
			rank_order: 85,
			description: 'Coordinates diaspora ambassadors'
		});

		expect(newRole).toBeDefined();
		expect(newRole.title).toBe('Community Ambassador');

		const allRoles = await getOrganizationalRoles(null);
		const found = allRoles.find((r) => r.id === 'org_test_lead');
		expect(found).toBeDefined();
		expect(found?.title).toBe('Community Ambassador');
	});

	it('supports role hierarchy where Admin is a child/subset of BOD', async () => {
		// Verify default org_admin exists with parent_role_id = 'org_director'
		const allRoles = await getOrganizationalRoles(null);
		const adminRole = allRoles.find((r) => r.id === 'org_admin');
		expect(adminRole).toBeDefined();
		expect(adminRole?.parent_role_id).toBe('org_director');
		expect(adminRole?.parent_title).toBe('Board Director');

		// Create a custom child role under BOD
		const childRole = await upsertOrganizationalRole(null, {
			id: 'org_finance_lead',
			title: 'Finance Sub-Committee Lead',
			category: 'committee',
			rank_order: 35,
			description: 'Under Board Treasurer',
			parent_role_id: 'org_treasurer'
		});

		expect(childRole.parent_role_id).toBe('org_treasurer');
		const refreshedRoles = await getOrganizationalRoles(null);
		const savedChild = refreshedRoles.find((r) => r.id === 'org_finance_lead');
		expect(savedChild?.parent_role_id).toBe('org_treasurer');
		expect(savedChild?.parent_title).toBe('Treasurer');
	});

	it('retrieves admin emails including info@canfacs.org and active admins', async () => {
		const adminEmails = await getAdminEmails(null);
		expect(adminEmails).toContain('info@canfacs.org');
		expect(adminEmails.length).toBeGreaterThanOrEqual(1);
	});

	it('supports unapproving an approved member back to pending', async () => {
		const testMember = await createMember(null, {
			full_name: 'Unapprove Test User',
			email: 'unapprove.test@canfacs.org',
			phone: null,
			profession: null,
			city: 'Vancouver',
			province: 'BC',
			bio: null
		});

		// Approve member
		await updateMemberStatus(null, testMember.id, 'approved');
		let member = await getMemberById(null, testMember.id);
		expect(member?.status).toBe('approved');

		// Unapprove member
		await unapproveMember(null, testMember.id);
		member = await getMemberById(null, testMember.id);
		expect(member?.status).toBe('pending');
		expect(member?.approved_at).toBeNull();
	});

	it('supports soft-deleting a member and restoring them', async () => {
		const testMember = await createMember(null, {
			full_name: 'Soft Delete User',
			email: 'softdelete.test@canfacs.org',
			phone: null,
			profession: null,
			city: 'Burnaby',
			province: 'BC',
			bio: null
		});

		// Soft delete
		await softDeleteMember(null, testMember.id);
		let member = await getMemberById(null, testMember.id);
		expect(member?.status).toBe('deleted');
		expect(member?.deleted_at).toBeDefined();

		// Default getAllMembers must exclude deleted member
		const activeMembers = await getAllMembers(null);
		expect(activeMembers.some((m) => m.id === testMember.id)).toBe(false);

		// getAllMembers with includeDeleted must include deleted member
		const allWithDeleted = await getAllMembers(null, undefined, true);
		expect(allWithDeleted.some((m) => m.id === testMember.id)).toBe(true);

		// Restore member
		await restoreMember(null, testMember.id, 'approved');
		member = await getMemberById(null, testMember.id);
		expect(member?.status).toBe('approved');
		expect(member?.deleted_at).toBeNull();
	});

	it('supports permanently deleting a spam member', async () => {
		const spamMember = await createMember(null, {
			full_name: 'Spam Bot Account',
			email: 'spambot@invalid-domain.com',
			phone: null,
			profession: null,
			city: 'Nowhere',
			province: 'BC',
			bio: 'Casino promo link'
		});

		// Verify created
		let member = await getMemberById(null, spamMember.id);
		expect(member).toBeDefined();

		// Soft-delete / deny first
		await softDeleteMember(null, spamMember.id);

		// Permanently delete
		await permanentlyDeleteMember(null, spamMember.id);

		// Verify completely gone
		member = await getMemberById(null, spamMember.id);
		expect(member).toBeNull();

		const allWithDeleted = await getAllMembers(null, undefined, true);
		expect(allWithDeleted.some((m) => m.id === spamMember.id)).toBe(false);
	});
});
