// src/lib/seo/build.test.ts
// $env/dynamic/public is a SvelteKit virtual module not available in jsdom.
// Mock it so the $lib/utils barrel → $lib/config/api import chain doesn't fail.
vi.mock('$env/dynamic/public', () => ({ env: { PUBLIC_API_URL: '' } }));

import { describe, expect, it, vi } from 'vitest';
import { buildSeo } from '$lib/seo/build';
import type { EventDetailSchema } from '$lib/api/generated/types.gen';

const url = (path: string) => new URL(`https://letsrevel.io${path}`);

const fakeEvent = {
	id: 'e1',
	name: 'My Event',
	slug: 'my-event',
	description: 'desc',
	start: '2026-07-01T18:00:00Z',
	end: '2026-07-01T23:00:00Z',
	status: 'scheduled',
	requires_ticket: false,
	max_attendees: 0,
	attendee_count: 0,
	rsvp_before: null,
	address: null,
	city: null,
	logo: null,
	cover_art: null,
	event_series: null,
	organization: { id: 'o1', name: 'Acme', slug: 'acme', logo: null, cover_art: null }
} as unknown as EventDetailSchema;

describe('buildSeo', () => {
	it('home: emits WebSite + Org JSON-LD and same-URL hreflang', () => {
		const cfg = buildSeo({ kind: 'home', url: url('/'), lang: 'pt' });
		expect(cfg.canonical).toBe('https://letsrevel.io/');
		expect(cfg.og.locale).toBe('pt_BR');
		expect(cfg.og.localeAlternate).toEqual([]);
		expect(cfg.hreflang.map((h) => h.lang)).toEqual(['pt', 'x-default']);
		expect(cfg.hreflang.every((h) => h.href === 'https://letsrevel.io/')).toBe(true);
		expect(cfg.jsonLd.some((j: any) => j['@type'] === 'WebSite')).toBe(true);
		expect(cfg.robots).toBeUndefined();
	});

	it('event indexable: includes Event + Breadcrumb JSON-LD; no robots tag', () => {
		const cfg = buildSeo({
			kind: 'event',
			url: url('/eventos/acme/my-event'),
			lang: 'pt',
			event: fakeEvent,
			indexable: true
		});
		expect(cfg.title).toContain('My Event');
		expect(cfg.canonical).toBe('https://letsrevel.io/eventos/acme/my-event');
		expect(cfg.robots).toBeUndefined();
		const types = cfg.jsonLd.map((j: any) => j['@type']);
		expect(types).toContain('Event');
		expect(types).toContain('BreadcrumbList');
	});

	it('event non-indexable: emits noindex,follow', () => {
		const cfg = buildSeo({
			kind: 'event',
			url: url('/eventos/acme/my-event'),
			lang: 'pt',
			event: fakeEvent,
			indexable: false
		});
		expect(cfg.robots).toBe('noindex,follow');
	});

	it('auth pages emit noindex,follow', () => {
		const cfg = buildSeo({
			kind: 'auth',
			url: url('/login'),
			lang: 'pt',
			page: 'login'
		});
		expect(cfg.robots).toBe('noindex,follow');
	});
});
