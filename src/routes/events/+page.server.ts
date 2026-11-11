import type { PageServerLoad } from './$types';
import { getDb, getEvents } from '$lib/server/db';
import { EVENTS } from '$lib/data/siteData';

export const load: PageServerLoad = async ({ platform, locals, setHeaders }) => {
	const db = getDb(platform, locals);

	// Edge & Browser Caching for public event directory
	setHeaders({
		'cache-control': 'public, max-age=180, stale-while-revalidate=86400',
		vary: 'Accept-Encoding'
	});

	try {
		const rawEvents = await getEvents(db);
		if (rawEvents && rawEvents.length > 0) {
			const events = rawEvents.map((evt) => {
				let parsedHighlights: string[] = [];
				try {
					if (evt.highlights) {
						parsedHighlights = JSON.parse(evt.highlights);
					}
				} catch {
					parsedHighlights = [];
				}

				return {
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
				};
			});

			return {
				events
			};
		}
	} catch (e) {
		console.warn('Error loading dynamic events from D1, falling back to static data:', e);
	}

	return {
		events: EVENTS
	};
};
