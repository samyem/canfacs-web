import { describe, it, expect } from 'vitest';
import { interpolatePlaceholders, wrapInTemplate } from './templates';

describe('Email Templates & Dynamic Placeholders Unit Tests', () => {
	it('interpolates standard dynamic recipient variables', () => {
		const rawText = 'Dear {{name}}, your position is {{organizational_role}} in {{city}}, {{province}}.';
		const data = {
			name: 'Bina Shrestha',
			organizational_role: 'Vice President',
			city: 'Vancouver',
			province: 'BC'
		};

		const result = interpolatePlaceholders(rawText, data);
		expect(result).toBe('Dear Bina Shrestha, your position is Vice President in Vancouver, BC.');
	});

	it('replaces missing placeholder with empty string or fallback value', () => {
		const withFallback = 'Hello {{name}}, your phone is {{phone | N/A}}.';
		const data = { name: 'Navin Dhakal' };

		const result = interpolatePlaceholders(withFallback, data);
		expect(result).toBe('Hello Navin Dhakal, your phone is N/A.');

		const withoutFallback = 'Hello {{name}}, phone: {{phone}}.';
		expect(interpolatePlaceholders(withoutFallback, data)).toBe('Hello Navin Dhakal, phone: .');
	});

	it('injects body content and interpolates variables into master HTML template', () => {
		const templateHtml = '<div class="header">CANFACS</div><div class="body">{{content}}</div>';
		const innerContent = '<p>Welcome {{name}} to the Board!</p>';
		const data = { name: 'Dr. Meghraj Gnawali' };

		const wrapped = wrapInTemplate(templateHtml, innerContent, data);
		expect(wrapped).toContain('Welcome Dr. Meghraj Gnawali to the Board!');
		expect(wrapped).toContain('CANFACS');
	});
});
