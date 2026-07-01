// $env/dynamic/public is a SvelteKit virtual module not available in jsdom.
// Mock it so the $lib/utils barrel → $lib/config/api import chain doesn't fail.
vi.mock('$env/dynamic/public', () => ({ env: { PUBLIC_API_URL: '' } }));

import { render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { userEvent } from '@testing-library/user-event';
import { QueryClient } from '@tanstack/svelte-query';
import EventActionSidebar from './EventActionSidebar.svelte';
import QueryClientTestWrapper from '$lib/test-utils/QueryClientTestWrapper.svelte';
import type { EventDetailSchema } from '$lib/api/generated/types.gen';
import type {
	EventRsvpSchema,
	EventTicketSchema,
	EventUserEligibility
} from '$lib/api/generated/types.gen';
import type { TierSchemaWithId } from '$lib/types/tickets';

// Mock the auth store (plain object; component reads accessToken for tier queries)
vi.mock('$lib/stores/auth.svelte', () => ({
	authStore: { accessToken: null as string | null }
}));

// Mock SvelteKit navigation (invalidateAll runs on RSVP success)
vi.mock('$app/navigation', () => ({
	invalidateAll: vi.fn()
}));

// Mock event helper
function createMockEvent(overrides: Partial<EventDetailSchema> = {}): EventDetailSchema {
	return {
		id: 'test-event-id',
		name: 'Test Event',
		slug: 'test-event',
		description: 'Test event description',
		event_type: 'public',
		visibility: 'public',
		status: 'approved',
		start: '2025-12-01T18:00:00Z',
		end: '2025-12-01T22:00:00Z',
		attendee_count: 10,
		max_attendees: 50,
		requires_ticket: false,
		potluck_open: false,
		organization: {
			id: 'org-id',
			name: 'Test Organization',
			slug: 'test-org',
			description: 'Test org',
			visibility: 'public',
			member_count: 100
		},
		...overrides
	} as EventDetailSchema;
}

describe('EventActionSidebar', () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
		});
		// Fixture events are dated 2025-12-01; pin "now" to just before that so
		// `eventHasEnded` stays false and the "attending" secondary actions render.
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2025-11-25T10:00:00Z'));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('Rendering', () => {
		it('renders with event status badge', () => {
			const event = createMockEvent();
			render(QueryClientTestWrapper, {
				props: {
					client: queryClient,
					component: EventActionSidebar,
					props: {
						event,
						userStatus: null,
						isAuthenticated: false
					}
				}
			});

			// Badge should be visible
			expect(screen.getByRole('status')).toBeInTheDocument();
		});

		it('renders quick info section', () => {
			const event = createMockEvent();
			render(QueryClientTestWrapper, {
				props: {
					client: queryClient,
					component: EventActionSidebar,
					props: {
						event,
						userStatus: null,
						isAuthenticated: false
					}
				}
			});

			// Quick info uses role="list"
			expect(
				screen.getByRole('list', { name: /Informações rápidas do evento/i })
			).toBeInTheDocument();
		});

		it('applies sidebar variant classes', () => {
			const event = createMockEvent();
			const { container } = render(QueryClientTestWrapper, {
				props: {
					client: queryClient,
					component: EventActionSidebar,
					props: {
						event,
						userStatus: null,
						isAuthenticated: false,
						variant: 'sidebar'
					}
				}
			});

			const aside = container.querySelector('aside');
			expect(aside?.className).toContain('sticky');
		});

		it('applies card variant classes', () => {
			const event = createMockEvent();
			const { container } = render(QueryClientTestWrapper, {
				props: {
					client: queryClient,
					component: EventActionSidebar,
					props: {
						event,
						userStatus: null,
						isAuthenticated: false,
						variant: 'card'
					}
				}
			});

			const aside = container.querySelector('aside');
			expect(aside?.className).not.toContain('sticky');
		});

		it('applies custom class', () => {
			const event = createMockEvent();
			const { container } = render(QueryClientTestWrapper, {
				props: {
					client: queryClient,
					component: EventActionSidebar,
					props: {
						event,
						userStatus: null,
						isAuthenticated: false,
						class: 'custom-class'
					}
				}
			});

			const aside = container.querySelector('aside');
			expect(aside?.className).toContain('custom-class');
		});
	});

	describe('Unauthenticated User', () => {
		it('shows sign in button when not authenticated', () => {
			const event = createMockEvent();
			render(QueryClientTestWrapper, {
				props: {
					client: queryClient,
					component: EventActionSidebar,
					props: {
						event,
						userStatus: null,
						isAuthenticated: false
					}
				}
			});

			// Free events render EventRSVP's login prompt, which is a link
			expect(
				screen.getByRole('link', { name: 'Entre para confirmar presença' })
			).toBeInTheDocument();
		});

		it('does not show attendance status when not authenticated', () => {
			const event = createMockEvent();
			render(QueryClientTestWrapper, {
				props: {
					client: queryClient,
					component: EventActionSidebar,
					props: {
						event,
						userStatus: null,
						isAuthenticated: false
					}
				}
			});

			expect(screen.queryByText('Você vai participar')).not.toBeInTheDocument();
		});
	});

	describe('Authenticated User - No Status', () => {
		it('shows RSVP buttons for free event when user is eligible', () => {
			const event = createMockEvent({ requires_ticket: false });
			const userStatus: EventUserEligibility = {
				allowed: true,
				event_id: 'event-id',
				next_step: 'rsvp'
			};
			render(QueryClientTestWrapper, {
				props: {
					client: queryClient,
					component: EventActionSidebar,
					props: {
						event,
						userStatus,
						isAuthenticated: true
					}
				}
			});

			expect(screen.getByRole('group', { name: 'Opções de RSVP' })).toBeInTheDocument();
		});

		it('shows buy tickets button for ticketed event', () => {
			const event = createMockEvent({ requires_ticket: true });
			render(QueryClientTestWrapper, {
				props: {
					client: queryClient,
					component: EventActionSidebar,
					props: {
						event,
						userStatus: null,
						isAuthenticated: true
					}
				}
			});

			expect(screen.getByRole('button', { name: 'Obter ingressos' })).toBeInTheDocument();
		});
	});

	describe('User with Approved RSVP', () => {
		it('shows attendance confirmation', () => {
			const event = createMockEvent();
			const userStatus = {
				event_id: 'event-id',
				status: 'yes'
			} as unknown as EventRsvpSchema;

			render(QueryClientTestWrapper, {
				props: {
					client: queryClient,
					component: EventActionSidebar,
					props: {
						event,
						userStatus,
						isAuthenticated: true
					}
				}
			});

			expect(screen.getByText('Você vai participar')).toBeInTheDocument();
		});

		it('shows manage RSVP button', () => {
			const event = createMockEvent();
			const userStatus = {
				event_id: 'event-id',
				status: 'yes'
			} as unknown as EventRsvpSchema;

			render(QueryClientTestWrapper, {
				props: {
					client: queryClient,
					component: EventActionSidebar,
					props: {
						event,
						userStatus,
						isAuthenticated: true
					}
				}
			});

			expect(screen.getByRole('button', { name: 'Alterar RSVP' })).toBeInTheDocument();
		});

		it('does not show primary action button', () => {
			const event = createMockEvent();
			const userStatus = {
				event_id: 'event-id',
				status: 'yes'
			} as unknown as EventRsvpSchema;

			render(QueryClientTestWrapper, {
				props: {
					client: queryClient,
					component: EventActionSidebar,
					props: {
						event,
						userStatus,
						isAuthenticated: true
					}
				}
			});

			expect(screen.queryByRole('button', { name: /^rsvp$/i })).not.toBeInTheDocument();
		});
	});

	describe('User with Active Ticket', () => {
		it('shows ticket confirmation', () => {
			const event = createMockEvent();
			const userStatus: EventTicketSchema = {
				event_id: 'event-id',
				id: 'ticket-id',
				status: 'active',
				tier: {
					id: 'tier-id',
					name: 'VIP Ticket',
					price: '50.00',
					currency: 'USD',
					event_id: 'event-id',
					total_available: 100
				} as TierSchemaWithId
			};

			render(QueryClientTestWrapper, {
				props: {
					client: queryClient,
					component: EventActionSidebar,
					props: {
						event,
						userStatus,
						isAuthenticated: true
					}
				}
			});

			expect(screen.getByText('Você tem um ingresso')).toBeInTheDocument();
		});

		it('shows ticket tier name', () => {
			const event = createMockEvent();
			const userStatus: EventTicketSchema = {
				event_id: 'event-id',
				id: 'ticket-id',
				status: 'active',
				tier: {
					id: 'tier-id',
					name: 'VIP Ticket',
					price: '50.00',
					currency: 'USD',
					event_id: 'event-id',
					total_available: 100
				} as TierSchemaWithId
			};

			render(QueryClientTestWrapper, {
				props: {
					client: queryClient,
					component: EventActionSidebar,
					props: {
						event,
						userStatus,
						isAuthenticated: true
					}
				}
			});

			expect(screen.getByText('VIP Ticket')).toBeInTheDocument();
		});

		it('shows view ticket button', () => {
			const event = createMockEvent();
			const userStatus: EventTicketSchema = {
				event_id: 'event-id',
				id: 'ticket-id',
				status: 'active',
				tier: {
					id: 'tier-id',
					name: 'General Admission',
					price: '25.00',
					currency: 'USD'
				}
			};

			render(QueryClientTestWrapper, {
				props: {
					client: queryClient,
					component: EventActionSidebar,
					props: {
						event,
						userStatus,
						isAuthenticated: true
					}
				}
			});

			expect(screen.getByRole('button', { name: 'Mostrar ingresso' })).toBeInTheDocument();
		});

		it('shows checked in status', () => {
			const event = createMockEvent();
			const userStatus: EventTicketSchema = {
				event_id: 'event-id',
				id: 'ticket-id',
				status: 'checked_in',
				tier: {
					id: 'tier-id',
					name: 'General Admission',
					price: '25.00',
					currency: 'USD'
				}
			};

			render(QueryClientTestWrapper, {
				props: {
					client: queryClient,
					component: EventActionSidebar,
					props: {
						event,
						userStatus,
						isAuthenticated: true
					}
				}
			});

			expect(screen.getByText('Você fez check-in')).toBeInTheDocument();
		});
	});

	describe('User Not Eligible', () => {
		it('shows eligibility status when not allowed', () => {
			// The standalone eligibility panel only renders on the ticketed branch;
			// free events delegate ineligibility display to EventRSVP.
			const event = createMockEvent({ requires_ticket: true });
			const userStatus: EventUserEligibility = {
				allowed: false,
				event_id: 'event-id',
				reason: 'This is a members-only event',
				next_step: 'become_member'
			};

			render(QueryClientTestWrapper, {
				props: {
					client: queryClient,
					component: EventActionSidebar,
					props: {
						event,
						userStatus,
						isAuthenticated: true
					}
				}
			});

			expect(screen.getByText('Status de elegibilidade')).toBeInTheDocument();
		});

		it('does not show eligibility when allowed', () => {
			const event = createMockEvent({ requires_ticket: true });
			const userStatus: EventUserEligibility = {
				allowed: true,
				event_id: 'event-id',
				next_step: 'rsvp'
			};

			render(QueryClientTestWrapper, {
				props: {
					client: queryClient,
					component: EventActionSidebar,
					props: {
						event,
						userStatus,
						isAuthenticated: true
					}
				}
			});

			expect(screen.queryByText('Status de elegibilidade')).not.toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('has proper ARIA label on container', () => {
			const event = createMockEvent();
			render(QueryClientTestWrapper, {
				props: {
					client: queryClient,
					component: EventActionSidebar,
					props: {
						event,
						userStatus: null,
						isAuthenticated: false
					}
				}
			});

			expect(screen.getByRole('complementary', { name: 'Ações do evento' })).toBeInTheDocument();
		});

		it('has proper heading hierarchy', () => {
			const event = createMockEvent({ requires_ticket: true });
			const userStatus: EventUserEligibility = {
				allowed: false,
				event_id: 'event-id',
				reason: 'Not eligible',
				next_step: 'become_member'
			};

			render(QueryClientTestWrapper, {
				props: {
					client: queryClient,
					component: EventActionSidebar,
					props: {
						event,
						userStatus,
						isAuthenticated: true
					}
				}
			});

			// Check for heading
			expect(screen.getByText('Status de elegibilidade')).toBeInTheDocument();
		});

		it('attendance status has live region', () => {
			const event = createMockEvent();
			const userStatus = {
				event_id: 'event-id',
				status: 'yes'
			} as unknown as EventRsvpSchema;

			const { container } = render(QueryClientTestWrapper, {
				props: {
					client: queryClient,
					component: EventActionSidebar,
					props: {
						event,
						userStatus,
						isAuthenticated: true
					}
				}
			});

			const statusElement = container.querySelector('[aria-live="polite"]');
			expect(statusElement).toBeInTheDocument();
		});
	});

	describe('Keyboard Navigation', () => {
		it('buttons are keyboard accessible', async () => {
			// Fake timers are active (see beforeEach); let userEvent drive them
			const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
			const event = createMockEvent();

			render(QueryClientTestWrapper, {
				props: {
					client: queryClient,
					component: EventActionSidebar,
					props: {
						event,
						userStatus: null,
						isAuthenticated: false
					}
				}
			});

			const link = screen.getByRole('link', { name: 'Entre para confirmar presença' });

			// Tab to the first interactive element
			await user.tab();
			expect(link).toHaveFocus();
		});

		it('secondary action button is keyboard accessible', async () => {
			// Fake timers are active (see beforeEach); let userEvent drive them
			const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
			const event = createMockEvent();
			const userStatus = {
				event_id: 'event-id',
				status: 'yes'
			} as unknown as EventRsvpSchema;

			render(QueryClientTestWrapper, {
				props: {
					client: queryClient,
					component: EventActionSidebar,
					props: {
						event,
						userStatus,
						isAuthenticated: true
					}
				}
			});

			const button = screen.getByRole('button', { name: 'Alterar RSVP' });

			// Tab to button
			await user.tab();
			expect(button).toHaveFocus();
		});
	});
});
