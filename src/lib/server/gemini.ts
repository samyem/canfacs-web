/**
 * Google Gemini AI Integration for drafting email campaigns and announcements
 */

export interface GeminiEmailDraftResult {
	success: boolean;
	subject?: string;
	bodyHtml?: string;
	bodyText?: string;
	suggestedPlaceholders?: { token: string; label: string; example: string }[];
	summary?: string;
	error?: string;
}

export async function generateEmailWithGemini(
	promptText: string,
	options: {
		tone?: 'formal' | 'warm' | 'urgent' | 'celebratory';
		audience?: 'members' | 'donors' | 'public' | 'executive';
		includePlaceholders?: boolean;
	} = {},
	env?: Record<string, any>
): Promise<GeminiEmailDraftResult> {
	const apiKey =
		env?.GEMINI_API_KEY ||
		(typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined);

	if (!apiKey) {
		return {
			success: false,
			error: 'GEMINI_API_KEY secret is not configured in environment.'
		};
	}

	const systemInstruction = `
You are the Executive Communications Director for CANFACS (Canada-Nepal Friendship & Cultural Society, established 2016 in Canada).
CANFACS is a Canadian federal non-profit organization promoting cultural heritage, bilateral ties, community solidarity, disaster relief (such as the Nepal Flood Relief Appeal), and diaspora empowerment.

Your task is to generate an email draft in structured JSON based on the user's instructions.
Rules:
1. Support standard dynamic placeholders where relevant:
   - {{name}} : recipient's full name (or fallback)
   - {{email}} : recipient's email address
   - {{city}} : recipient's city (e.g. Toronto, Vancouver, Kathmandu)
   - {{province}} : recipient's province / state
   - {{role}} : member role or designation
2. Return ONLY valid, clean JSON with no markdown backticks, matching this exact schema:
{
  "subject": "Compelling subject line",
  "bodyHtml": "<p>Professional HTML paragraphs with inline CSS or clean tags. Use {{name}}, etc. Do not include full <html><body> wrapper, only the inner content to inject into our master template</p>",
  "bodyText": "Plain text fallback version of the email content",
  "suggestedPlaceholders": [
    {"token": "{{name}}", "label": "Full Name", "example": "Aarav Sharma"},
    {"token": "{{city}}", "label": "City", "example": "Toronto"}
  ],
  "summary": "Brief 1-sentence overview of the email purpose"
}
`;

	const userPrompt = `
Tone: ${options.tone || 'warm and professional'}
Audience: ${options.audience || 'members & community supporters'}
Instructions: ${promptText}
`;

	try {
		// Calling Gemini 3.8 Flash via REST API
		const response = await fetch(
			`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					contents: [
						{
							role: 'user',
							parts: [
								{ text: systemInstruction },
								{ text: userPrompt }
							]
						}
					],
					generationConfig: {
						responseMimeType: 'application/json',
						temperature: 0.7
					}
				})
			}
		);

		if (!response.ok) {
			const errText = await response.text();
			console.error('[Gemini API Error]', response.status, errText);
			return {
				success: false,
				error: `Gemini API returned HTTP ${response.status}: ${errText.slice(0, 150)}`
			};
		}

		const data: any = await response.json();
		const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

		if (!candidateText) {
			return {
				success: false,
				error: 'Gemini generated an empty response.'
			};
		}

		// Parse JSON response
		const cleanJson = candidateText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
		const parsed = JSON.parse(cleanJson);

		return {
			success: true,
			subject: parsed.subject || 'CANFACS Announcement',
			bodyHtml: parsed.bodyHtml || '',
			bodyText: parsed.bodyText || '',
			suggestedPlaceholders: parsed.suggestedPlaceholders || [],
			summary: parsed.summary || ''
		};
	} catch (err: any) {
		console.error('[Gemini Exception]', err);
		return {
			success: false,
			error: err.message || 'Error processing Gemini AI request'
		};
	}
}
