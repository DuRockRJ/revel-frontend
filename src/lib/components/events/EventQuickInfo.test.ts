// $env/dynamic/public is a SvelteKit virtual module not available in jsdom.
// Mock it so the $lib/utils barrel → $lib/config/api import chain doesn't fail.
vi.mock('$env/dynamic/public', () => ({ env: { PUBLIC_API_URL: '' } }));

import { render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import EventQuickInfo from './EventQuickInfo.svelte';
import type { EventDetailSchema } from '$lib/api/generated/types.gen';

// Mock event data
const mockEvent: EventDetailSchema = {
	id: 'test-event-1',
	name: 'Test Event',
	slug: 'test-event',
	event_type: 'public',
	visibility: 'public',
	status: 'approved',
	organization: {
		id: 'org-1',
		name: 'Test Organization',
		slug: 'test-org',
		city: { id: 1, name: 'San Francisco', country: 'USA', admin_name: 'Zona Sul' },
		description: 'Test organization',
		logo: null,
		cover_art: null,
		website: null,
		social_links: {},
		created_at: '2025-01-01T00:00:00Z'
	},
	city: {
		id: 1,
		name: 'San Francisco',
		country: 'USA',
		admin_name: 'Zona Sul'
	},
	start: '2025-10-25T19:00:00Z',
	end: '2025-10-25T22:00:00Z',
	description: 'Test event description',
	invitation_message: null,
	max_attendees: 100,
	attendee_count: 45,
	rsvp_before: '2025-10-24T19:00:00Z',
	address: '123 Test St',
	tags: ['networking', 'tech'],
	logo: null,
	cover_art: null,
	requires_ticket: false,
	potluck_open: false,
	waitlist_open: false,
	event_series: null
};

describe('EventQuickInfo', () => {
	it('renders with required props', () => {
		render(EventQuickInfo, { props: { event: mockEvent } });

		// Check that event date is rendered (pt-BR, dot-free, day-before-month)
		expect(screen.getByText(/25 out/i)).toBeInTheDocument();

		// Check that location is rendered
		expect(screen.getByText('San Francisco, Zona Sul')).toBeInTheDocument();
	});

	it('displays event type correctly', () => {
		render(EventQuickInfo, { props: { event: mockEvent } });
		expect(screen.getByText('Evento público')).toBeInTheDocument();
	});

	it('displays private event type', () => {
		const privateEvent = { ...mockEvent, event_type: 'private' as const };
		render(EventQuickInfo, { props: { event: privateEvent } });
		expect(screen.getByText('Somente por convite')).toBeInTheDocument();
	});

	it('displays members-only event type', () => {
		const membersEvent = { ...mockEvent, event_type: 'members-only' as const };
		render(EventQuickInfo, { props: { event: membersEvent } });
		expect(screen.getByText('Somente membros')).toBeInTheDocument();
	});

	it('displays capacity information when max_attendees is set', () => {
		render(EventQuickInfo, { props: { event: mockEvent } });
		expect(screen.getByText('45 / 100 vagas ocupadas')).toBeInTheDocument();
	});

	it('does not display capacity when max_attendees is not set', () => {
		const eventWithoutCapacity = { ...mockEvent, max_attendees: 0 };
		render(EventQuickInfo, { props: { event: eventWithoutCapacity } });
		expect(screen.queryByText(/vagas ocupadas/i)).not.toBeInTheDocument();
	});

	it('displays warning when capacity is near limit', () => {
		const nearCapacityEvent = { ...mockEvent, max_attendees: 100, attendee_count: 95 };
		render(EventQuickInfo, { props: { event: nearCapacityEvent } });

		expect(screen.getByText('95 / 100 vagas ocupadas')).toBeInTheDocument();
		expect(screen.getByText('Vagas limitadas restantes')).toBeInTheDocument();
	});

	it('displays RSVP deadline when rsvp_before is in the future', () => {
		const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
		render(EventQuickInfo, { props: { event: { ...mockEvent, rsvp_before: future } } });
		expect(screen.getByText(/Confirme até/i)).toBeInTheDocument();
	});

	it('shows RSVP closed when rsvp_before has passed', () => {
		render(EventQuickInfo, { props: { event: mockEvent } });
		expect(screen.getByText('RSVP encerrado')).toBeInTheDocument();
	});

	it('does not display RSVP deadline when rsvp_before is not set', () => {
		const eventWithoutDeadline = { ...mockEvent, rsvp_before: null };
		render(EventQuickInfo, { props: { event: eventWithoutDeadline } });
		expect(screen.queryByText(/RSVP/i)).not.toBeInTheDocument();
	});

	it('handles location without city', () => {
		// Address wins over the TBD fallback, so drop both to hit it
		const eventWithoutCity = { ...mockEvent, city: null, address: null };
		render(EventQuickInfo, { props: { event: eventWithoutCity } });
		expect(screen.getByText('Local a definir')).toBeInTheDocument();
	});

	it('handles city without region', () => {
		const eventWithCityOnly = {
			...mockEvent,
			city: { id: 1, name: 'San Francisco', country: 'USA', admin_name: null }
		};
		render(EventQuickInfo, { props: { event: eventWithCityOnly } });
		expect(screen.getByText('San Francisco')).toBeInTheDocument();
		expect(screen.queryByText(/Zona Sul/)).not.toBeInTheDocument();
	});

	it('applies custom className', () => {
		const { container } = render(EventQuickInfo, {
			props: { event: mockEvent, class: 'custom-class' }
		});
		const quickInfoDiv = container.querySelector('.custom-class');
		expect(quickInfoDiv).toBeInTheDocument();
	});

	it('renders in compact variant by default', () => {
		const { container } = render(EventQuickInfo, { props: { event: mockEvent } });
		const quickInfoDiv = container.querySelector('.space-y-2.text-sm');
		expect(quickInfoDiv).toBeInTheDocument();
	});

	it('renders in detailed variant when specified', () => {
		const { container } = render(EventQuickInfo, {
			props: { event: mockEvent, variant: 'detailed' }
		});
		const quickInfoDiv = container.querySelector('.space-y-3.text-base');
		expect(quickInfoDiv).toBeInTheDocument();
	});

	it('has proper ARIA structure', () => {
		render(EventQuickInfo, { props: { event: mockEvent } });

		// Check for list structure
		const list = screen.getByRole('list', { name: /Informações rápidas do evento/i });
		expect(list).toBeInTheDocument();

		// Check for list items
		const items = screen.getAllByRole('listitem');
		expect(items.length).toBeGreaterThan(0);
	});

	it('uses semantic time elements', () => {
		const { container } = render(EventQuickInfo, { props: { event: mockEvent } });

		// Check for time element with datetime attribute
		const timeElements = container.querySelectorAll('time[datetime]');
		expect(timeElements.length).toBeGreaterThan(0);
	});

	it('marks icons as decorative with aria-hidden', () => {
		const { container } = render(EventQuickInfo, { props: { event: mockEvent } });

		// All SVG icons should have aria-hidden="true"
		const icons = container.querySelectorAll('svg[aria-hidden="true"]');
		expect(icons.length).toBeGreaterThan(0);
	});
});
