import { describe, it, expect } from 'vitest';
import type { EventInListSchema } from '$lib/api/generated/types.gen';
import { getEventLogo, getEventLogoThumbnail } from './event';

function ev(overrides: Partial<EventInListSchema>): EventInListSchema {
	return {
		id: 'id',
		name: 'Event',
		slug: 'event',
		start: '2026-09-01T18:00:00Z',
		end: '2026-09-01T22:00:00Z',
		status: 'open',
		requires_ticket: true,
		attendee_count: 0,
		organization: { id: 'org-id', name: 'Org', slug: 'org' },
		...overrides
	} as EventInListSchema;
}

describe('getEventLogo', () => {
	it('uses the event logo when present', () => {
		const event = ev({ logo: 'event.png', organization: { logo: 'org.png' } as never });
		expect(getEventLogo(event)).toBe('event.png');
	});

	it('falls back to the event series logo when the event has none', () => {
		const event = ev({
			logo: null,
			event_series: { logo: 'series.png' } as never,
			organization: { logo: 'org.png' } as never
		});
		expect(getEventLogo(event)).toBe('series.png');
	});

	it('falls back to the organization logo by default', () => {
		const event = ev({ logo: null, organization: { logo: 'org.png' } as never });
		expect(getEventLogo(event)).toBe('org.png');
	});

	it('does not fall back to the organization logo when includeOrgFallback is false', () => {
		const event = ev({ logo: null, organization: { logo: 'org.png' } as never });
		expect(getEventLogo(event, false)).toBeNull();
	});

	it('still falls back to the event series logo when includeOrgFallback is false', () => {
		const event = ev({
			logo: null,
			event_series: { logo: 'series.png' } as never,
			organization: { logo: 'org.png' } as never
		});
		expect(getEventLogo(event, false)).toBe('series.png');
	});
});

describe('getEventLogoThumbnail', () => {
	it('falls back to the organization logo thumbnail by default', () => {
		const event = ev({
			logo_thumbnail_url: null,
			organization: { logo_thumbnail_url: 'org.png' } as never
		});
		expect(getEventLogoThumbnail(event)).toBe('org.png');
	});

	it('does not fall back to the organization logo thumbnail when includeOrgFallback is false', () => {
		const event = ev({
			logo_thumbnail_url: null,
			organization: { logo_thumbnail_url: 'org.png' } as never
		});
		expect(getEventLogoThumbnail(event, false)).toBeNull();
	});
});
