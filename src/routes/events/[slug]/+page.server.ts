import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDb, getEventBySlug } from '$lib/server/db';
import { EVENTS } from '$lib/data/siteData';

export const load: PageServerLoad = async ({ params, platform, locals, setHeaders }) => {
	const db = getDb(platform, locals);
	const slug = params.slug.toLowerCase().trim();

	setHeaders({
		'cache-control': 'public, max-age=300, stale-while-revalidate=86400',
		vary: 'Accept-Encoding'
	});

	try {
		const evt = await getEventBySlug(db, slug);
		if (evt) {
			let parsedHighlights: string[] = [];
			try {
				if (evt.highlights) {
					parsedHighlights = JSON.parse(evt.highlights);
				}
			} catch {
				parsedHighlights = [];
			}

			return {
				event: {
					id: evt.id,
					slug: evt.slug,
					title: evt.title,
					subtitle: evt.subtitle,
					tagline: evt.tagline,
					date: evt.date_display,
					event_date: evt.event_date,
					time: evt.event_time,
					venue: evt.venue,
					location: evt.location,
					summary: evt.summary,
					description: evt.description,
					highlights: parsedHighlights,
					image: evt.banner_image_url || '/events/canada-nepal-friendship-day-2027.jpg',
					isFeatured: evt.is_featured === 1,
					status: evt.status
				}
			};
		}
	} catch (e) {
		console.warn('Error fetching event by slug from D1:', e);
	}

	// Fallback to static EVENTS
	const staticEvt = EVENTS.find((e) => (e.slug || e.id).toLowerCase() === slug);
	if (staticEvt) {
		return {
			event: {
				...staticEvt,
				slug: staticEvt.slug || staticEvt.id,
				time: staticEvt.time || '',
				venue: staticEvt.venue || staticEvt.location,
				summary: staticEvt.description,
				highlights: staticEvt.highlights || [],
				image: staticEvt.image || '/events/canada-nepal-friendship-day-2027.jpg',
				isFeatured: staticEvt.isFeatured || false,
				status: staticEvt.status || 'upcoming'
			}
		};
	}

	throw error(404, `Event "${params.slug}" not found.`);
};
