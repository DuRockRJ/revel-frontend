import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient } from '@tanstack/svelte-query';
import DuplicateEventModal from './DuplicateEventModal.svelte';
import QueryClientTestWrapper from '$lib/test-utils/QueryClientTestWrapper.svelte';
import { toDateTimeLocal } from '$lib/utils/datetime';

vi.mock('$lib/api/generated/sdk.gen', () => ({
	eventadmincoreDuplicateEvent: vi.fn()
}));

// The Dialog primitive pulls in $lib/config/api (via $lib/utils -> $lib/utils/url),
// which reads $env/dynamic/public — unavailable outside a SvelteKit request context.
vi.mock('$env/dynamic/public', () => ({ env: {} }));

vi.mock('$lib/stores/auth.svelte', () => ({
	authStore: { accessToken: 'test-token' as string | null }
}));

vi.mock('$app/navigation', () => ({
	goto: vi.fn()
}));

const NOW = new Date('2026-06-15T12:00:00Z');

function renderModal(props: {
	open: boolean;
	eventId: string;
	eventName: string;
	eventStart: string;
	organizationSlug: string;
}) {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
	});
	return render(QueryClientTestWrapper, {
		props: {
			client: queryClient,
			component: DuplicateEventModal,
			props: { ...props, onClose: vi.fn() }
		}
	});
}

describe('DuplicateEventModal', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(NOW);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('reuses a future source start verbatim', () => {
		const futureStart = '2026-09-01T18:00:00.000Z';
		renderModal({
			open: true,
			eventId: 'e1',
			eventName: 'Show Original',
			eventStart: futureStart,
			organizationSlug: 'org1'
		});

		const input = screen.getByLabelText(/Nova data e horário de início/) as HTMLInputElement;
		expect(input.value).toBe(toDateTimeLocal(futureStart));
	});

	it('rolls a past source start forward to the next occurrence of its time-of-day', () => {
		// A past start at 20:00 UTC; "now" is fixed at 2026-06-15T12:00:00Z.
		const pastStart = '2026-01-01T20:00:00.000Z';
		renderModal({
			open: true,
			eventId: 'e1',
			eventName: 'Show Original',
			eventStart: pastStart,
			organizationSlug: 'org1'
		});

		const input = screen.getByLabelText(/Nova data e horário de início/) as HTMLInputElement;
		const sourceLocal = toDateTimeLocal(pastStart);
		const [, sourceTime] = sourceLocal.split('T');

		// Same time-of-day as the source event...
		expect(input.value.endsWith(sourceTime)).toBe(true);
		// ...but not the source's (past) calendar date.
		expect(input.value.startsWith(sourceLocal.split('T')[0])).toBe(false);
		// And it must be in the future, satisfying the submit-time validation.
		expect(new Date(input.value).getTime()).toBeGreaterThan(NOW.getTime());
	});

	it('prefills the name with the "copy of" prefix', () => {
		renderModal({
			open: true,
			eventId: 'e1',
			eventName: 'Show Original',
			eventStart: '2026-09-01T18:00:00.000Z',
			organizationSlug: 'org1'
		});

		const nameInput = screen.getByLabelText(/Novo nome do evento/) as HTMLInputElement;
		expect(nameInput.value).toContain('Show Original');
	});
});
