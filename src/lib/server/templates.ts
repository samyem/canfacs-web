import { getEmailTemplates, upsertEmailTemplate, type EmailTemplateRow } from './db';

/**
 * Standard CANFACS Branded Master Templates
 * Can be stored and loaded from R2 / D1
 */

export const DEFAULT_TEMPLATES = [
	{
		id: 'tmpl_formal_announcement',
		name: '🏛️ Official CANFACS Society Notice',
		description: 'Formal announcement layout with gold & crimson emblem header, verified NGO footer, and executive signature block.',
		subject_default: 'Official Notice from CANFACS Executive Committee',
		html_content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; color: #f1f5f9; margin: 0; padding: 24px; }
    .wrapper { max-width: 640px; margin: 0 auto; background-color: #0f172a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
    .top-bar { background: linear-gradient(90deg, #b91c1c, #e11d48, #1d4ed8); height: 6px; }
    .header { padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #1e293b; background-color: #111827; }
    .logo-img { width: 68px; height: 68px; border-radius: 50%; border: 2px solid #dc2626; padding: 2px; background: #ffffff; margin-bottom: 12px; }
    .org-title { font-size: 20px; font-weight: 800; color: #ffffff; margin: 0; letter-spacing: -0.02em; }
    .org-sub { font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.08em; font-weight: 600; margin-top: 4px; }
    .content { padding: 32px; font-size: 15px; line-height: 1.65; color: #e2e8f0; }
    .content h1, .content h2, .content h3 { color: #ffffff; margin-top: 0; }
    .content p { margin: 0 0 16px; }
    .content a { color: #38bdf8; text-decoration: underline; }
    .button-container { text-align: center; margin: 28px 0; }
    .cta-btn { display: inline-block; background: linear-gradient(135deg, #dc2626, #b91c1c); color: #ffffff !important; font-weight: 700; text-decoration: none !important; padding: 12px 28px; border-radius: 10px; font-size: 14px; box-shadow: 0 4px 14px rgba(220,38,38,0.4); }
    .footer { padding: 24px 32px; background-color: #090d16; border-top: 1px solid #1e293b; text-align: center; font-size: 12px; color: #64748b; line-height: 1.5; }
    .footer a { color: #94a3b8; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="top-bar"></div>
    <div class="header">
      <img src="https://canfacs.org/canfacs-logo.png" alt="CANFACS Logo" class="logo-img" />
      <h1 class="org-title">Canada-Nepal Friendship & Cultural Society</h1>
      <div class="org-sub">CANFACS • Federal Non-Profit Society #1000676-9 • Est. 2016</div>
    </div>
    <div class="content">
      {{content}}
    </div>
    <div class="footer">
      <p><strong>Canada-Nepal Friendship & Cultural Society (CANFACS)</strong></p>
      <p>Dedicated to fostering bilateral cultural heritage and solidarity between Canada and Nepal.</p>
      <p>Inquiries: <a href="mailto:info@canfacs.org">info@canfacs.org</a> • Web: <a href="https://canfacs.org">canfacs.org</a></p>
      <p style="font-size: 10px; color: #475569; margin-top: 12px;">You received this transmission as an active member, donor, or verified contact of CANFACS.</p>
    </div>
  </div>
</body>
</html>`
	},
	{
		id: 'tmpl_newsletter_community',
		name: '🎉 Community Events & Newsletter',
		description: 'Dynamic layout with crimson banner, social links, event cards, and friendly diaspora focus.',
		subject_default: 'CANFACS Community News & Upcoming Events',
		html_content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #030712; color: #f3f4f6; margin: 0; padding: 20px; }
    .wrapper { max-width: 620px; margin: 0 auto; background-color: #111827; border-radius: 18px; border: 1px solid #1f2937; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.5); }
    .hero-banner { background: linear-gradient(135deg, #7f1d1d, #991b1b, #1e3a8a); padding: 36px 24px; text-align: center; }
    .badge { display: inline-block; background: rgba(255,255,255,0.15); color: #fed7aa; padding: 4px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.05em; border: 1px solid rgba(255,255,255,0.2); }
    .hero-title { margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; }
    .body-box { padding: 30px; font-size: 15px; line-height: 1.7; color: #d1d5db; }
    .body-box p { margin: 0 0 16px; }
    .highlight-card { background-color: #1f2937; border-left: 4px solid #ef4444; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 14px; color: #f3f4f6; }
    .footer { background-color: #0b0f19; padding: 24px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #1f2937; }
    .footer a { color: #f87171; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="hero-banner">
      <span class="badge">🍁 CANFACS Diaspora Circle</span>
      <h1 class="hero-title">CANFACS Community Updates</h1>
    </div>
    <div class="body-box">
      {{content}}
    </div>
    <div class="footer">
      <p>Canada-Nepal Friendship & Cultural Society</p>
      <p>Connecting Nepali-Canadians across British Columbia, Ontario, and beyond.</p>
      <p><a href="https://canfacs.org/feed">Visit Community Feed</a> • <a href="https://canfacs.org/members">Member Directory</a></p>
    </div>
  </div>
</body>
</html>`
	},
	{
		id: 'tmpl_donor_impact',
		name: '🤝 Relief & Donor Gratitude Report',
		description: 'Emphasizes transparency, disaster relief disbursement tracking, and official donation gratitude.',
		subject_default: 'Update & Appreciation from CANFACS Relief Team',
		html_content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f17; color: #f8fafc; margin: 0; padding: 24px; }
    .container { max-width: 620px; margin: 0 auto; background: #131d2e; border-radius: 16px; border: 1px solid #1e2e4a; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0f2b48, #091c32); padding: 30px; text-align: center; border-bottom: 1px solid #1e2e4a; }
    .badge { background: #0284c7; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .content { padding: 32px; font-size: 15px; line-height: 1.65; color: #cbd5e1; }
    .transparency-callout { background: #0c1a2e; border: 1px solid #0284c7; border-radius: 12px; padding: 18px; margin: 20px 0; color: #e0f2fe; font-size: 13px; }
    .footer { padding: 24px; text-align: center; font-size: 12px; color: #64748b; background: #080c14; border-top: 1px solid #1e2e4a; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">Relief & Humanitarian Initiative</span>
      <h2 style="color: #ffffff; margin: 12px 0 0; font-size: 22px;">Canada-Nepal Friendship & Cultural Society</h2>
    </div>
    <div class="content">
      {{content}}
      <div class="transparency-callout">
        <strong>🛡️ 100% Fund Transparency:</strong><br>
        All relief collections are tracked and disbursed directly to authorized relief channels including the Government of Nepal PMO Disaster Relief Fund. Public records are accessible at <a href="https://canfacs.org/impact/nepal-flood-relief" style="color: #38bdf8;">canfacs.org/impact/nepal-flood-relief</a>.
      </div>
    </div>
    <div class="footer">
      <p>CANFACS Relief Committee • <a href="mailto:info@canfacs.org" style="color: #38bdf8;">info@canfacs.org</a></p>
    </div>
  </div>
</body>
</html>`
	}
];

export async function ensureDefaultTemplates(db: any, r2Bucket?: any): Promise<void> {
	const existing = await getEmailTemplates(db);
	if (existing.length === 0) {
		for (const tmpl of DEFAULT_TEMPLATES) {
			const r2Key = `templates/${tmpl.id}.html`;
			if (r2Bucket) {
				try {
					await r2Bucket.put(r2Key, tmpl.html_content, {
						httpMetadata: { contentType: 'text/html; charset=utf-8' }
					});
				} catch (e) {
					console.warn('[R2 Template Put Failed]', e);
				}
			}
			await upsertEmailTemplate(db, {
				id: tmpl.id,
				name: tmpl.name,
				description: tmpl.description,
				subject_default: tmpl.subject_default,
				r2_key: r2Key,
				html_content: tmpl.html_content
			});
		}
	}
}

/**
 * Interpolate placeholders into a string or HTML template
 */
export function interpolatePlaceholders(
	templateText: string,
	data: Record<string, string | number | null | undefined>
): string {
	return templateText.replace(/\{\{\s*([a-zA-Z0-9_]+)(\s*\|\s*([^}]+))?\s*\}\}/g, (_, key, __, fallback) => {
		const val = data[key];
		if (val !== undefined && val !== null && String(val).trim() !== '') {
			return String(val);
		}
		return fallback !== undefined ? fallback.trim() : '';
	});
}

/**
 * Formats plain text or mixed HTML into clean paragraphs and line breaks
 * If content does not contain HTML block tags (<p>, <div>, <h1>-<h6>, <ul>, <ol>, <br>),
 * convert newlines to clean <p> and <br> tags.
 */
export function formatBodyContent(rawContent: string): string {
	if (!rawContent) return '';
	const trimmed = rawContent.trim();
	// Check if already full HTML block structure
	const hasBlockTags = /<(p|div|table|h[1-6]|ul|ol|blockquote)[^>]*>/i.test(trimmed);
	if (hasBlockTags) {
		return trimmed;
	}

	// Split by double line breaks (paragraphs) and single line breaks
	return trimmed
		.split(/\n{2,}/)
		.map((paragraph) => {
			const withLineBreaks = paragraph.replace(/\n/g, '<br />');
			return `<p style="margin: 0 0 16px; line-height: 1.6;">${withLineBreaks}</p>`;
		})
		.join('\n');
}

/**
 * Wraps body content into master template
 */
export function wrapInTemplate(
	templateHtml: string,
	innerContent: string,
	data: Record<string, any> = {}
): string {
	const formattedInner = formatBodyContent(innerContent);
	let combined = templateHtml.includes('{{content}}')
		? templateHtml.replace('{{content}}', formattedInner)
		: `${formattedInner}\n<br>\n${templateHtml}`;
	
	return interpolatePlaceholders(combined, data);
}
