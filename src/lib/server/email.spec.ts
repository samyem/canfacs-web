import { describe, it, expect } from 'vitest';
import {
	sendNewMemberAdminNotificationEmail,
	sendPendingMemberConfirmationEmail
} from './email';

describe('New Member Email Notifications Unit Tests', () => {
	const mockApplicant = {
		id: 'mem_test_123',
		full_name: 'Milan Adhikari',
		email: 'milan.adhikari@example.com',
		phone: '604-555-9876',
		profession: 'Data Engineer',
		city: 'Surrey',
		province: 'BC',
		country: 'Canada',
		bio: 'Passionate about cultural preservation and community service.'
	};

	it('simulates dispatching new member notification to admins including info@canfacs.org', async () => {
		const result = await sendNewMemberAdminNotificationEmail(
			{
				applicant: mockApplicant,
				adminEmails: ['info@canfacs.org', 'admin@canfacs.org'],
				reviewUrl: 'https://canfacs.org/admin/members'
			},
			undefined // simulation mode without Cloudflare API key / binding
		);

		expect(result.success).toBe(true);
		expect(result.sentCount).toBe(2);
	});

	it('simulates dispatching confirmation receipt to the pending member applicant', async () => {
		const result = await sendPendingMemberConfirmationEmail(
			{
				applicant: mockApplicant
			},
			undefined // simulation mode
		);

		expect(result.success).toBe(true);
		expect(result.delivered).toBe(true);
	});
});
