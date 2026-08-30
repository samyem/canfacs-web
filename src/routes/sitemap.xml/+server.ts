import type { RequestHandler } from './$types';

const SITE_URL = 'https://canfacs.org';

interface SitemapEntry {
	path: string;
	priority: string;
	changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
}

const PUBLIC_PAGES: SitemapEntry[] = [
	{ path: '', priority: '1.0', changefreq: 'weekly' },
	{ path: '/impact', priority: '0.9', changefreq: 'weekly' },
	{ path: '/impact/nepal-flood-relief', priority: '0.9', changefreq: 'daily' },
	{ path: '/our-story', priority: '0.8', changefreq: 'monthly' },
	{ path: '/mission-and-vision', priority: '0.8', changefreq: 'monthly' },
	{ path: '/team', priority: '0.8', changefreq: 'monthly' },
	{ path: '/events', priority: '0.8', changefreq: 'weekly' },
	{ path: '/bhetghat', priority: '0.8', changefreq: 'monthly' },
	{ path: '/newsletters', priority: '0.7', changefreq: 'monthly' },
	{ path: '/join-canfacs', priority: '0.8', changefreq: 'monthly' },
	{ path: '/privacy-policy', priority: '0.5', changefreq: 'monthly' },
	{ path: '/terms-of-service', priority: '0.5', changefreq: 'monthly' }
];

export const GET: RequestHandler = async () => {
	const lastMod = new Date().toISOString().split('T')[0];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PUBLIC_PAGES.map(
	(page) => `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
).join('\n')}
</urlset>`;

	return new Response(xml.trim(), {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600, s-maxage=86400'
		}
	});
};
