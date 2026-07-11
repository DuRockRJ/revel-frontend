import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import type { EventInListSchema } from '$lib/api/generated/types.gen';
import CalendarDay from './CalendarDay.svelte';

function ev(overrides: Partial<EventInListSchema>): EventInListSchema {
	return {
		id: 'id',
		name: 'Event',
		slug: 'event',
		start: '2026-09-01T18:00:00Z',
		end: '2026-09-01T20:00:00Z',
		status: 'open',
		requires_ticket: true,
		attendee_count: 0,
		...overrides
	} as EventInListSchema;
}

const baseProps = {
	date: new Date('2026-09-01T00:00:00Z'),
	isCurrentMonth: true,
	isToday: false
};

describe('CalendarDay', () => {
	it('renders a whole-cell overlay button when there is exactly one event', () => {
		const event = ev({ id: 'A', name: 'Show Único' });
		render(CalendarDay, { props: { ...baseProps, dayEvents: [event], onEventClick: vi.fn() } });

		// The overlay button carries the accessible name; the badge underneath is static.
		expect(screen.getByRole('button', { name: /Show Único/ })).toBeInTheDocument();
		expect(screen.getAllByRole('button')).toHaveLength(1);
	});

	it('calls onEventClick with the single event when the cell is activated', async () => {
		const user = userEvent.setup();
		const event = ev({ id: 'A', name: 'Show Único' });
		const onEventClick = vi.fn();
		render(CalendarDay, { props: { ...baseProps, dayEvents: [event], onEventClick } });

		await user.click(screen.getByRole('button', { name: /Show Único/ }));

		expect(onEventClick).toHaveBeenCalledWith(event);
		expect(onEventClick).toHaveBeenCalledTimes(1);
	});

	it('falls back to the per-badge button (no cell overlay) when onEventClick is not provided', () => {
		const event = ev({ id: 'A', name: 'Show Único' });
		render(CalendarDay, { props: { ...baseProps, dayEvents: [event] } });

		// Still exactly one button (the badge itself), but it's a no-op without onEventClick —
		// there's no separate whole-cell overlay button layered on top of it.
		expect(screen.getAllByRole('button')).toHaveLength(1);
	});

	it('keeps per-event badges (not a cell overlay) when there are multiple events', async () => {
		const user = userEvent.setup();
		const eventA = ev({ id: 'A', name: 'Banda A' });
		const eventB = ev({ id: 'B', name: 'Banda B' });
		const onEventClick = vi.fn();
		render(CalendarDay, {
			props: { ...baseProps, dayEvents: [eventA, eventB], onEventClick }
		});

		const buttons = screen.getAllByRole('button');
		expect(buttons).toHaveLength(2);

		await user.click(screen.getByRole('button', { name: 'Banda B' }));
		expect(onEventClick).toHaveBeenCalledWith(eventB);
	});

	it('renders no buttons for an empty day', () => {
		render(CalendarDay, { props: { ...baseProps, dayEvents: [], onEventClick: vi.fn() } });

		expect(screen.queryByRole('button')).not.toBeInTheDocument();
	});
});
