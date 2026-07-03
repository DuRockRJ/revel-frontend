// src/lib/seo/build.ts
import type {
	EventDetailSchema,
	OrganizationRetrieveSchema,
	EventSeriesRetrieveSchema
} from '$lib/api/generated/types.gen';
import { getBackendUrl } from '$lib/config/api';
import { OG_LOCALE, SITE_NAME, TWITTER_SITE, type Lang } from './constants';
import type { SeoConfig } from './types';
import { sameUrlHreflang, selfHreflang } from './hreflang';
import {
	generateEventJsonLd,
	generateOrganizationJsonLd,
	generateSeriesJsonLd,
	generateWebSiteJsonLd,
	generateBreadcrumbJsonLd,
	generateItemListJsonLd,
	type ListItem
} from './jsonld';

export type SeoPageSlug =
	| 'eventbrite-alternative'
	| 'queer-event-management'
	| 'kink-event-ticketing'
	| 'self-hosted-event-platform'
	| 'privacy-focused-events'
	| 'community-first-event-platform';

export type BuildSeoInput =
	| { kind: 'home'; url: URL; lang: Lang }
	| { kind: 'events-listing'; url: URL; lang: Lang }
	| { kind: 'orgs-listing'; url: URL; lang: Lang; items?: ListItem[] }
	| {
			kind: 'event';
			url: URL;
			lang: Lang;
			event: EventDetailSchema;
			indexable: boolean;
	  }
	| { kind: 'org'; url: URL; lang: Lang; org: OrganizationRetrieveSchema }
	| { kind: 'series'; url: URL; lang: Lang; series: EventSeriesRetrieveSchema }
	| {
			kind: 'landing';
			url: URL;
			lang: Lang;
			slug: SeoPageSlug;
			title?: string;
			description?: string;
			extraJsonLd?: object[];
	  }
	| { kind: 'legal'; url: URL; lang: Lang; doc: 'privacy' | 'terms' }
	| {
			kind: 'auth';
			url: URL;
			lang: Lang;
			page: 'login' | 'register' | 'password-reset' | 'verify' | 'unsubscribe';
	  };

function truncate(s: string, max: number): string {
	if (!s) return '';
	if (s.length <= max) return s;
	return s.slice(0, max - 3) + '...';
}

function stripHtml(html: string | null | undefined): string {
	if (!html) return '';
	return html
		.replace(/<[^>]*>/g, '')
		.replace(/&nbsp;/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

// Single-language site: every page has exactly one URL and one locale, so
// there is never a genuine alternate-language version to advertise.
function alternateLocales(_lang: Lang): string[] {
	return [];
}

function getEventImage(event: EventDetailSchema): string | undefined {
	const e = event as unknown as {
		cover_art_social_url?: string;
		event_series?: { cover_art_social_url?: string };
		organization?: { cover_art_social_url?: string };
	};
	const candidates = [
		e.cover_art_social_url,
		event.cover_art,
		e.event_series?.cover_art_social_url,
		event.event_series?.cover_art,
		e.organization?.cover_art_social_url,
		event.organization.cover_art,
		event.logo,
		event.organization.logo
	];
	const first = candidates.find((c) => c != null);
	return first ? getBackendUrl(first) : undefined;
}

function getOrgImage(org: OrganizationRetrieveSchema): string | undefined {
	const o = org as unknown as { cover_art_social_url?: string };
	const first = o.cover_art_social_url || org.cover_art || org.logo;
	return first ? getBackendUrl(first) : undefined;
}

function getSeriesImage(series: EventSeriesRetrieveSchema): string | undefined {
	const s = series as unknown as {
		cover_art_social_url?: string;
		organization?: { cover_art_social_url?: string };
	};
	const first =
		s.cover_art_social_url ||
		series.cover_art ||
		s.organization?.cover_art_social_url ||
		series.organization.cover_art ||
		series.logo ||
		series.organization.logo;
	return first ? getBackendUrl(first) : undefined;
}

function defaultOgImage(origin: string): string {
	return `${origin}/og-image.png`;
}

export function buildSeo(input: BuildSeoInput): SeoConfig {
	const origin = input.url.origin;
	const canonical = input.url.toString();
	const alts = alternateLocales(input.lang);
	const ogLocale = OG_LOCALE[input.lang];

	switch (input.kind) {
		case 'home': {
			const title = `${SITE_NAME} — Shows e eventos de rock`;
			const description =
				'Descubra shows de rock, conecte-se com organizadores e viva experiências inesquecíveis.';
			return {
				title,
				description,
				canonical,
				og: {
					type: 'website',
					title,
					description,
					url: canonical,
					image: defaultOgImage(origin),
					siteName: SITE_NAME,
					locale: ogLocale,
					localeAlternate: alts
				},
				twitter: {
					card: 'summary_large_image',
					title: `${SITE_NAME} — Shows de rock`,
					description: 'Descubra shows de rock e viva experiências inesquecíveis',
					image: defaultOgImage(origin),
					site: TWITTER_SITE
				},
				hreflang: sameUrlHreflang(canonical),
				jsonLd: [generateWebSiteJsonLd(origin)]
			};
		}

		case 'events-listing': {
			const title = `Eventos | ${SITE_NAME}`;
			const description = 'Descubra shows e eventos de rock perto de você.';
			return {
				title,
				description,
				canonical,
				og: {
					type: 'website',
					title,
					description,
					url: canonical,
					image: defaultOgImage(origin),
					siteName: SITE_NAME,
					locale: ogLocale,
					localeAlternate: alts
				},
				twitter: {
					card: 'summary_large_image',
					title,
					description: 'Descubra eventos perto de você',
					image: defaultOgImage(origin),
					site: TWITTER_SITE
				},
				hreflang: sameUrlHreflang(canonical),
				jsonLd: [
					generateBreadcrumbJsonLd([
						{ name: 'Início', url: origin },
						{ name: 'Eventos', url: canonical }
					])
				]
			};
		}

		case 'orgs-listing': {
			const title = `Organizações | ${SITE_NAME}`;
			const description = `Veja as organizações da comunidade no ${SITE_NAME}. Encontre organizadores, comunidades e grupos criando experiências incríveis.`;
			const ld: object[] = [
				generateBreadcrumbJsonLd([
					{ name: 'Início', url: origin },
					{ name: 'Organizações', url: canonical }
				])
			];
			if (input.items?.length) {
				ld.push(generateItemListJsonLd(input.items, `Organizações no ${SITE_NAME}`));
			}
			return {
				title,
				description,
				canonical,
				og: {
					type: 'website',
					title,
					description,
					url: canonical,
					image: defaultOgImage(origin),
					siteName: SITE_NAME,
					locale: ogLocale,
					localeAlternate: alts
				},
				twitter: {
					card: 'summary_large_image',
					title,
					description: 'Veja organizações da comunidade perto de você',
					image: defaultOgImage(origin),
					site: TWITTER_SITE
				},
				hreflang: sameUrlHreflang(canonical),
				jsonLd: ld
			};
		}

		case 'event': {
			const event = input.event;
			const desc = stripHtml(event.description);
			const truncated = truncate(desc, 155);
			const image = getEventImage(event);
			const title = `${event.name} | ${SITE_NAME}`;
			const description =
				truncated || `Participe de ${event.name}, organizado por ${event.organization.name}`;
			return {
				title,
				description,
				canonical,
				robots: input.indexable ? undefined : 'noindex,follow',
				og: {
					type: 'event',
					title: event.name,
					description: desc || description,
					url: canonical,
					image,
					siteName: SITE_NAME,
					locale: ogLocale,
					localeAlternate: alts
				},
				twitter: {
					card: 'summary_large_image',
					title: event.name,
					description: truncate(desc, 200) || `Participe de ${event.name}`,
					image,
					site: TWITTER_SITE
				},
				hreflang: sameUrlHreflang(canonical),
				jsonLd: [
					generateEventJsonLd(event, canonical),
					generateBreadcrumbJsonLd([
						{ name: 'Início', url: origin },
						{ name: 'Eventos', url: `${origin}/events` },
						{ name: event.organization.name, url: `${origin}/org/${event.organization.slug}` },
						{ name: event.name, url: canonical }
					])
				]
			};
		}

		case 'org': {
			const org = input.org;
			const desc = stripHtml(org.description);
			const truncated = truncate(desc, 155);
			const image = getOrgImage(org);
			const title = `${org.name} | ${SITE_NAME}`;
			const description =
				truncated || `${org.name} no ${SITE_NAME} - Eventos e experiências da comunidade`;
			return {
				title,
				description,
				canonical,
				og: {
					type: 'profile',
					title: org.name,
					description: desc || description,
					url: canonical,
					image,
					siteName: SITE_NAME,
					locale: ogLocale,
					localeAlternate: alts
				},
				twitter: {
					card: 'summary_large_image',
					title: org.name,
					description: truncate(desc, 200) || `${org.name} no ${SITE_NAME}`,
					image,
					site: TWITTER_SITE
				},
				hreflang: sameUrlHreflang(canonical),
				jsonLd: [
					generateOrganizationJsonLd(org, canonical),
					generateBreadcrumbJsonLd([
						{ name: 'Início', url: origin },
						{ name: 'Organizações', url: `${origin}/organizations` },
						{ name: org.name, url: canonical }
					])
				]
			};
		}

		case 'series': {
			const series = input.series;
			const desc = stripHtml(series.description);
			const truncated = truncate(desc, 155);
			const image = getSeriesImage(series);
			const title = `${series.name} | ${series.organization.name} | ${SITE_NAME}`;
			const description =
				truncated || `${series.name} - Série de eventos por ${series.organization.name}`;
			return {
				title,
				description,
				canonical,
				og: {
					type: 'website',
					title: `${series.name} | ${series.organization.name}`,
					description: desc || description,
					url: canonical,
					image,
					siteName: SITE_NAME,
					locale: ogLocale,
					localeAlternate: alts
				},
				twitter: {
					card: 'summary_large_image',
					title: `${series.name} | ${series.organization.name}`,
					description: truncate(desc, 200) || description,
					image,
					site: TWITTER_SITE
				},
				hreflang: sameUrlHreflang(canonical),
				jsonLd: [
					generateSeriesJsonLd(series, canonical),
					generateBreadcrumbJsonLd([
						{ name: 'Início', url: origin },
						{ name: series.organization.name, url: `${origin}/org/${series.organization.slug}` },
						{ name: series.name, url: canonical }
					])
				]
			};
		}

		case 'landing': {
			const title = input.title ?? input.slug;
			const description = input.description ?? '';
			return {
				title,
				description,
				canonical,
				og: {
					type: 'website',
					title,
					description,
					url: canonical,
					image: defaultOgImage(origin),
					siteName: SITE_NAME,
					locale: ogLocale,
					localeAlternate: alts
				},
				twitter: {
					card: 'summary_large_image',
					title,
					description,
					image: defaultOgImage(origin),
					site: TWITTER_SITE
				},
				hreflang: selfHreflang(input.lang, canonical),
				jsonLd: [
					generateBreadcrumbJsonLd([
						{ name: 'Home', url: origin },
						{ name: title, url: canonical }
					]),
					...(input.extraJsonLd ?? [])
				]
			};
		}

		case 'legal': {
			const titles: Record<typeof input.doc, string> = {
				privacy: `Política de Privacidade | ${SITE_NAME}`,
				terms: `Termos de Serviço | ${SITE_NAME}`
			};
			return {
				title: titles[input.doc],
				description: titles[input.doc],
				canonical,
				og: {
					type: 'website',
					title: titles[input.doc],
					description: titles[input.doc],
					url: canonical,
					image: defaultOgImage(origin),
					siteName: SITE_NAME,
					locale: ogLocale,
					localeAlternate: alts
				},
				twitter: {
					card: 'summary',
					title: titles[input.doc],
					description: titles[input.doc],
					site: TWITTER_SITE
				},
				hreflang: sameUrlHreflang(canonical),
				jsonLd: []
			};
		}

		case 'auth': {
			const titles: Record<typeof input.page, string> = {
				login: `Entrar | ${SITE_NAME}`,
				register: `Criar sua conta | ${SITE_NAME}`,
				'password-reset': `Redefinir sua senha | ${SITE_NAME}`,
				verify: `Verificar sua conta | ${SITE_NAME}`,
				unsubscribe: `Cancelar inscrição | ${SITE_NAME}`
			};
			const t = titles[input.page];
			return {
				title: t,
				description: t,
				canonical,
				robots: 'noindex,follow',
				og: {
					type: 'website',
					title: t,
					description: t,
					url: canonical,
					image: defaultOgImage(origin),
					siteName: SITE_NAME,
					locale: ogLocale,
					localeAlternate: alts
				},
				twitter: {
					card: 'summary',
					title: t,
					description: t,
					site: TWITTER_SITE
				},
				hreflang: sameUrlHreflang(canonical),
				jsonLd: []
			};
		}
	}
}
