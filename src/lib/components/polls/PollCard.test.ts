// $env/dynamic/public is a SvelteKit virtual module not available in jsdom.
// Mock it so the $lib/utils barrel → $lib/config/api import chain doesn't fail.
vi.mock('$env/dynamic/public', () => ({ env: { PUBLIC_API_URL: '' } }));

import { render, screen } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient } from '@tanstack/svelte-query';
import PollCard from './PollCard.svelte';
import QueryClientTestWrapper from '$lib/test-utils/QueryClientTestWrapper.svelte';
import type { PollListItemSchema } from '$lib/api/generated/types.gen';

function makePoll(overrides: Partial<PollListItemSchema> = {}): PollListItemSchema {
	return {
		id: 'p1',
		organization_id: 'o1',
		event_id: null,
		questionnaire_name: 'Where to eat?',
		status: 'open',
		opened_at: '2026-05-22T10:00:00Z',
		closes_at: null,
		closed_at: null,
		vote_visibility: 'members-only',
		result_visibility: 'members-only',
		user_has_voted: false,
		user_can_vote: true,
		user_can_see_results: true,
		...overrides
	};
}

describe('PollCard', () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
		});
	});

	function renderCard(poll: PollListItemSchema) {
		return render(QueryClientTestWrapper, {
			props: {
				client: queryClient,
				component: PollCard,
				props: { poll, organizationSlug: 'acme' }
			}
		});
	}

	it('shows the URL strip when poll is OPEN', () => {
		renderCard(makePoll({ status: 'open' }));
		const input = screen.getByRole('textbox', { name: /URL de compartilhamento da enquete/i });
		expect((input as HTMLInputElement).value).toContain('/org/acme/polls/p1');
	});

	it('shows the Open poll CTA and hides the URL strip when DRAFT', () => {
		renderCard(makePoll({ status: 'draft' }));
		expect(screen.getByRole('button', { name: /abrir enquete/i })).toBeInTheDocument();
		expect(
			screen.queryByRole('textbox', { name: /URL de compartilhamento da enquete/i })
		).toBeNull();
	});

	it('shows the Closed badge when poll is CLOSED', () => {
		renderCard(makePoll({ status: 'closed' }));
		expect(screen.getByText(/encerrada/i)).toBeInTheDocument();
	});
});
