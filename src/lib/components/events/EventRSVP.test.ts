// $env/dynamic/public is a SvelteKit virtual module not available in jsdom.
// Mock it so the $lib/utils barrel → $lib/config/api import chain doesn't fail.
vi.mock('$env/dynamic/public', () => ({ env: { PUBLIC_API_URL: '' } }));

import { render, screen, waitFor } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient } from '@tanstack/svelte-query';
import QueryClientTestWrapper from '$lib/test-utils/QueryClientTestWrapper.svelte';
import EventRSVP from './EventRSVP.svelte';
import type { EventUserEligibility, EventDetailSchema } from '$lib/api/generated/types.gen';
import type { UserEventStatus } from '$lib/utils/eligibility';

// Mock the API function
vi.mock('$lib/api/generated/sdk.gen', () => ({
	eventpublicattendanceRsvpEvent: vi.fn()
}));

import { eventpublicattendanceRsvpEvent } from '$lib/api/generated/sdk.gen';

const baseProps = {
	eventId: 'event-123',
	eventName: 'Test Event',
	isAuthenticated: true,
	requiresTicket: false as boolean | null
};

// Minimal event object for flows that need event context (ineligibility, login prompt)
const mockEvent = {
	id: 'event-123',
	slug: 'test-event',
	name: 'Test Event',
	organization: { slug: 'test-org', name: 'Test Org' },
	apply_before: null,
	can_attend_without_login: false
} as unknown as EventDetailSchema;

describe('EventRSVP', () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
				mutations: { retry: false }
			}
		});
		vi.clearAllMocks();
	});

	function renderWithQueryClient(props: Record<string, unknown>) {
		return render(QueryClientTestWrapper, {
			props: {
				client: queryClient,
				component: EventRSVP,
				props: { ...baseProps, ...props }
			}
		});
	}

	it('renders nothing actionable when not authenticated and event has no guest RSVP', () => {
		renderWithQueryClient({ userStatus: null, isAuthenticated: false });

		expect(screen.queryByRole('button')).not.toBeInTheDocument();
		expect(screen.queryByText('Você vai participar?')).not.toBeInTheDocument();
	});

	it('shows login prompt when not authenticated and event requires login', () => {
		renderWithQueryClient({ userStatus: null, isAuthenticated: false, event: mockEvent });

		expect(screen.getByText('Você vai participar?')).toBeInTheDocument();
		const loginLink = screen.getByRole('link', { name: 'Entre para confirmar presença' });
		expect(loginLink).toBeInTheDocument();
		expect(loginLink).toHaveAttribute('href', expect.stringContaining('/login?redirect='));
	});

	it('does not render for ticket-required events', () => {
		const { container } = renderWithQueryClient({ userStatus: null, requiresTicket: true });

		expect(container.querySelector('button, a, h3')).toBeNull();
	});

	it('shows RSVP buttons when user is eligible', () => {
		const eligibilityStatus: EventUserEligibility = {
			allowed: true,
			next_step: 'rsvp'
		};

		renderWithQueryClient({ userStatus: eligibilityStatus });

		expect(screen.getByText('Você vai participar?')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /RSVP Sim/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /RSVP Talvez/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /RSVP Não/i })).toBeInTheDocument();
	});

	it("highlights the current answer when user has already RSVP'd", () => {
		const rsvpStatus = {
			event_id: 'event-123',
			status: 'yes'
		} as unknown as UserEventStatus;

		renderWithQueryClient({ userStatus: rsvpStatus });

		// An existing RSVP keeps the buttons visible so the user can change the
		// answer; the current one is marked via aria-pressed.
		expect(screen.getByRole('button', { name: /RSVP Sim/i })).toHaveAttribute(
			'aria-pressed',
			'true'
		);
		expect(screen.getByRole('button', { name: /RSVP Talvez/i })).toHaveAttribute(
			'aria-pressed',
			'false'
		);
	});

	it('shows ineligibility message when user is not allowed', () => {
		const eligibilityStatus: EventUserEligibility = {
			allowed: false,
			reason: 'You must complete the questionnaire first',
			next_step: 'complete_questionnaire'
		};

		renderWithQueryClient({ userStatus: eligibilityStatus, event: mockEvent });

		expect(
			screen.getByText(
				'Este evento exige que você preencha um questionário antes de confirmar presença.'
			)
		).toBeInTheDocument();
		// Ineligible users get the explanatory panel instead of RSVP buttons
		expect(screen.queryByRole('button', { name: /RSVP Sim/i })).not.toBeInTheDocument();
	});

	it('hides RSVP buttons when user is not eligible and no event context exists', () => {
		const eligibilityStatus: EventUserEligibility = {
			allowed: false,
			reason: 'Event is at capacity',
			next_step: 'join_waitlist'
		};

		renderWithQueryClient({ userStatus: eligibilityStatus });

		expect(screen.queryByRole('button', { name: /RSVP Sim/i })).not.toBeInTheDocument();
	});

	it('submits RSVP when user clicks Yes button', async () => {
		const user = userEvent.setup();
		const mockRsvpResponse = {
			data: {
				event_id: 'event-123',
				status: 'yes' as const
			}
		};

		vi.mocked(eventpublicattendanceRsvpEvent).mockResolvedValue(mockRsvpResponse as never);

		const eligibilityStatus: EventUserEligibility = {
			allowed: true,
			next_step: 'rsvp'
		};

		renderWithQueryClient({ userStatus: eligibilityStatus });

		const yesButton = screen.getByRole('button', { name: /RSVP Sim/i });
		await user.click(yesButton);

		await waitFor(() => {
			expect(eventpublicattendanceRsvpEvent).toHaveBeenCalledWith({
				path: { event_id: 'event-123', answer: 'yes' }
			});
		});

		await waitFor(() => {
			expect(screen.getByText('Você vai para Test Event!')).toBeInTheDocument();
			expect(screen.getByRole('button', { name: 'Alterar resposta' })).toBeInTheDocument();
		});
	});

	it('shows error message when RSVP fails', async () => {
		const user = userEvent.setup();
		const mockError = new Error('Network error');

		vi.mocked(eventpublicattendanceRsvpEvent).mockRejectedValue(mockError);

		const eligibilityStatus: EventUserEligibility = {
			allowed: true,
			next_step: 'rsvp'
		};

		renderWithQueryClient({ userStatus: eligibilityStatus });

		const yesButton = screen.getByRole('button', { name: /RSVP Sim/i });
		await user.click(yesButton);

		await waitFor(() => {
			expect(screen.getByText('Falha no RSVP')).toBeInTheDocument();
			expect(screen.getByText('Network error')).toBeInTheDocument();
			expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument();
		});
	});

	it('allows changing RSVP response after success', async () => {
		const user = userEvent.setup();
		vi.mocked(eventpublicattendanceRsvpEvent).mockResolvedValue({
			data: { event_id: 'event-123', status: 'yes' }
		} as never);

		const eligibilityStatus: EventUserEligibility = {
			allowed: true,
			next_step: 'rsvp'
		};

		renderWithQueryClient({ userStatus: eligibilityStatus });

		await user.click(screen.getByRole('button', { name: /RSVP Sim/i }));
		const changeButton = await screen.findByRole('button', { name: 'Alterar resposta' });
		await user.click(changeButton);

		// Back to the buttons state
		expect(screen.getByRole('button', { name: /RSVP Sim/i })).toBeInTheDocument();
		expect(screen.queryByText('Você vai para Test Event!')).not.toBeInTheDocument();
	});

	it('is keyboard accessible', async () => {
		const user = userEvent.setup();
		const eligibilityStatus: EventUserEligibility = {
			allowed: true,
			next_step: 'rsvp'
		};

		renderWithQueryClient({ userStatus: eligibilityStatus });

		// Tab to first button
		await user.tab();
		const yesButton = screen.getByRole('button', { name: /RSVP Sim/i });
		expect(yesButton).toHaveFocus();

		// Tab to next button
		await user.tab();
		const maybeButton = screen.getByRole('button', { name: /RSVP Talvez/i });
		expect(maybeButton).toHaveFocus();
	});

	it('exposes the RSVP options as a labelled group', () => {
		const eligibilityStatus: EventUserEligibility = {
			allowed: true,
			next_step: 'rsvp'
		};

		renderWithQueryClient({ userStatus: eligibilityStatus });

		expect(screen.getByRole('group', { name: 'Opções de RSVP' })).toBeInTheDocument();
		expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
	});
});
