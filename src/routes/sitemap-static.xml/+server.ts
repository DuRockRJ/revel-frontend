import type { RequestHandler } from './$types';

const STATIC = [
	{ path: '/', changefreq: 'hourly', priority: '1.0' },
	{ path: '/organizations', changefreq: 'daily', priority: '0.8' },
	{ path: '/login', changefreq: 'monthly', priority: '0.4' },
	{ path: '/register', changefreq: 'monthly', priority: '0.4' },
	{ path: '/legal/privacy', changefreq: 'monthly', priority: '0.3' },
	{ path: '/legal/terms', changefreq: 'monthly', priority: '0.3' }
];

// Hand-rolled marketing pages that only exist in English (no translated
// counterpart), so they get a self-referencing hreflang, not the site's
// pt alternates.
const LANDING_SLUGS = [
	'eventbrite-alternative',
	'queer-event-management',
	'kink-event-ticketing',
	'self-hosted-event-platform',
	'privacy-focused-events',
	'community-first-event-platform'
];

function escapeXml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function selfAlternate(loc: string, lang: string): string {
	return (
		`<xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXml(loc)}"/>` +
		`<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(loc)}"/>`
	);
}

export const GET: RequestHandler = async ({ url }) => {
	const baseUrl = url.origin;
	const lines: string[] = [];

	for (const s of STATIC) {
		const loc = `${baseUrl}${s.path}`;
		lines.push(`<url>
  <loc>${escapeXml(loc)}</loc>
  ${selfAlternate(loc, 'pt')}
  <changefreq>${s.changefreq}</changefreq>
  <priority>${s.priority}</priority>
</url>`);
	}

	for (const slug of LANDING_SLUGS) {
		const loc = `${baseUrl}/${slug}`;
		lines.push(`<url>
  <loc>${escapeXml(loc)}</loc>
  ${selfAlternate(loc, 'en')}
  <changefreq>weekly</changefreq>
  <priority>0.7</priority>
</url>`);
	}

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${lines.join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800'
		}
	});
};
