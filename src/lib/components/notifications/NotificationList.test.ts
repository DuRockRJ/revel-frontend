// $env/dynamic/public is a SvelteKit virtual module not available in jsdom.
// Mock it so the $lib/utils barrel → $lib/config/api import chain doesn't fail.
vi.mock('$env/dynamic/public', () => ({ env: { PUBLIC_API_URL: '' } }));

import { render, screen, waitFor } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient } from '@tanstack/svelte-query';
import NotificationList from './NotificationList.svelte';
import QueryClientTestWrapper from '$lib/test-utils/QueryClientTestWrapper.svelte';
import type { NotificationSchema } from '$lib/api/generated/types.gen';
import { notificationListNotifications, notificationMarkAllRead } from '$lib/api/generated';

// Mock API functions
vi.mock('$lib/api/generated', () => ({
	notificationListNotifications: vi.fn(),
	notificationMarkAllRead: vi.fn()
}));

// Mock toast
vi.mock('svelte-sonner', () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn()
	}
}));

// Mock navigation
vi.mock('$app/navigation', () => ({
	goto: vi.fn()
}));

// Sample notification data
const mockNotifications: NotificationSchema[] = [
	{
		id: '1',
		notification_type: 'EVENT_INVITATION',
		title: 'Event Invitation',
		body: 'You have been invited to Summer BBQ',
		context: { event_id: 'event-1' },
		read_at: null,
		created_at: new Date().toISOString()
	},
	{
		id: '2',
		notification_type: 'RSVP_CONFIRMATION',
		title: 'RSVP Confirmed',
		body: 'Your RSVP has been confirmed',
		context: {},
		read_at: new Date().toISOString(),
		created_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
	},
	{
		id: '3',
		notification_type: 'EVENT_UPDATE',
		title: 'Event Updated',
		body: 'Summer BBQ has been updated',
		context: { event_id: 'event-1' },
		read_at: null,
		created_at: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
	}
];

describe('NotificationList', () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: {
				queries: {
					retry: false
				}
			}
		});
		vi.clearAllMocks();
	});

	function renderComponent(props: { authToken: string; compact?: boolean; maxItems?: number }) {
		return render(QueryClientTestWrapper, {
			props: {
				client: queryClient,
				component: NotificationList,
				props
			}
		});
	}

	it('renders with loading state initially', () => {
		vi.mocked(notificationListNotifications).mockResolvedValue({
			data: {
				count: 3,
				next: null,
				previous: null,
				results: mockNotifications
			}
		} as any);

		renderComponent({ authToken: 'test-token' });

		// Should show loading skeletons
		expect(screen.getByRole('status', { name: /carregando notificações/i })).toBeInTheDocument();
	});

	it('displays notifications after loading', async () => {
		vi.mocked(notificationListNotifications).mockResolvedValue({
			data: {
				count: 3,
				next: null,
				previous: null,
				results: mockNotifications
			}
		} as any);

		renderComponent({ authToken: 'test-token' });

		// Wait for notifications to load
		await waitFor(() => {
			expect(screen.getByText('Event Invitation')).toBeInTheDocument();
			expect(screen.getByText('RSVP Confirmed')).toBeInTheDocument();
			expect(screen.getByText('Event Updated')).toBeInTheDocument();
		});
	});

	it('shows empty state when no notifications', async () => {
		vi.mocked(notificationListNotifications).mockResolvedValue({
			data: {
				count: 0,
				next: null,
				previous: null,
				results: []
			}
		} as any);

		renderComponent({ authToken: 'test-token' });

		await waitFor(() => {
			expect(screen.getByText(/ainda não há notificações/i)).toBeInTheDocument();
		});
	});

	it('toggles unread filter', async () => {
		const user = userEvent.setup();
		vi.mocked(notificationListNotifications).mockResolvedValue({
			data: {
				count: 3,
				next: null,
				previous: null,
				results: mockNotifications
			}
		} as any);

		renderComponent({ authToken: 'test-token' });

		await waitFor(() => {
			expect(screen.getByText('Event Invitation')).toBeInTheDocument();
		});

		// Find and click the unread filter button
		const filterButton = screen.getByRole('button', { pressed: false });
		await user.click(filterButton);

		// Button should now be pressed
		expect(filterButton).toHaveAttribute('aria-pressed', 'true');
	});

	it('displays mark all as read button when there are unread notifications', async () => {
		vi.mocked(notificationListNotifications).mockResolvedValue({
			data: {
				count: 3,
				next: null,
				previous: null,
				results: mockNotifications
			}
		} as any);

		renderComponent({ authToken: 'test-token' });

		await waitFor(() => {
			expect(screen.getByText('Event Invitation')).toBeInTheDocument();
		});

		// Should show mark all as read button
		expect(screen.getByRole('button', { name: /marcar todas como lidas/i })).toBeInTheDocument();
	});

	it('calls mark all as read mutation when button clicked', async () => {
		const user = userEvent.setup();

		vi.mocked(notificationListNotifications).mockResolvedValue({
			data: {
				count: 3,
				next: null,
				previous: null,
				results: mockNotifications
			}
		} as any);

		vi.mocked(notificationMarkAllRead).mockResolvedValue({ data: {} } as any);

		renderComponent({ authToken: 'test-token' });

		await waitFor(() => {
			expect(screen.getByText('Event Invitation')).toBeInTheDocument();
		});

		const markAllButton = screen.getByRole('button', { name: /marcar todas como lidas/i });
		await user.click(markAllButton);

		// Should call the API
		await waitFor(() => {
			expect(notificationMarkAllRead).toHaveBeenCalledWith({
				headers: { Authorization: 'Bearer test-token' }
			});
		});
	});

	// Pre-existing bug, unrelated to i18n: the "view all" link is rendered by the
	// parent NotificationDropdown.svelte, not by NotificationList.svelte itself —
	// NotificationList's compact branch has no such link/text.
	it('renders in compact mode with limited items', async () => {
		vi.mocked(notificationListNotifications).mockResolvedValue({
			data: {
				count: 10,
				next: null,
				previous: null,
				results: mockNotifications.slice(0, 3)
			}
		} as any);

		renderComponent({ authToken: 'test-token', compact: true, maxItems: 3 });

		await waitFor(() => {
			expect(screen.getByText('Event Invitation')).toBeInTheDocument();
		});

		// The "view all" link lives in NotificationDropdown, not here; compact
		// mode just caps the items and drops filters/pagination.
		expect(screen.queryByRole('navigation', { name: /paginação/i })).not.toBeInTheDocument();
		expect(screen.queryByText('Todos os tipos')).not.toBeInTheDocument();
	});

	it('shows pagination when there are multiple pages', async () => {
		vi.mocked(notificationListNotifications).mockResolvedValue({
			data: {
				count: 50, // More than one page
				next: 'http://api.example.com/notifications?page=2',
				previous: null,
				results: mockNotifications
			}
		} as any);

		renderComponent({ authToken: 'test-token' });

		await waitFor(() => {
			expect(screen.getByText('Event Invitation')).toBeInTheDocument();
		});

		// Should show pagination
		expect(screen.getByRole('navigation', { name: /paginação/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /próxima página/i })).toBeInTheDocument();
	});

	it('is keyboard accessible', async () => {
		const user = userEvent.setup();
		vi.mocked(notificationListNotifications).mockResolvedValue({
			data: {
				count: 3,
				next: null,
				previous: null,
				results: mockNotifications
			}
		} as any);

		renderComponent({ authToken: 'test-token' });

		await waitFor(() => {
			expect(screen.getByText('Event Invitation')).toBeInTheDocument();
		});

		// Should be able to tab to filter button
		await user.tab();
		expect(screen.getByRole('button', { pressed: false })).toHaveFocus();

		// Should be able to tab to mark all as read
		await user.tab();
		await user.tab(); // May need multiple tabs depending on DOM structure
		// Focus should move through interactive elements
	});

	it('handles API errors gracefully', async () => {
		vi.mocked(notificationListNotifications).mockRejectedValue(new Error('Network error'));

		renderComponent({ authToken: 'test-token' });

		await waitFor(() => {
			expect(screen.getByText(/falha ao carregar as notificações/i)).toBeInTheDocument();
		});

		// Should show retry button
		expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument();
	});

	it('has proper ARIA labels', async () => {
		vi.mocked(notificationListNotifications).mockResolvedValue({
			data: {
				count: 3,
				next: null,
				previous: null,
				results: mockNotifications
			}
		} as any);

		renderComponent({ authToken: 'test-token' });

		await waitFor(() => {
			expect(screen.getByText('Event Invitation')).toBeInTheDocument();
		});

		// Should have region with aria-label
		expect(screen.getByRole('region', { name: /notificações/i })).toBeInTheDocument();

		// Should have aria-live for updates
		const region = screen.getByRole('region', { name: /notificações/i });
		expect(region).toHaveAttribute('aria-live', 'polite');
	});

	it('shows notification count badge', async () => {
		vi.mocked(notificationListNotifications).mockResolvedValue({
			data: {
				count: 3,
				next: null,
				previous: null,
				results: mockNotifications
			}
		} as any);

		renderComponent({ authToken: 'test-token' });

		await waitFor(() => {
			expect(screen.getByText('Event Invitation')).toBeInTheDocument();
		});

		// Should show count badge
		expect(screen.getByText(/3 notificações/i)).toBeInTheDocument();
	});

	it('filters by notification type', async () => {
		vi.mocked(notificationListNotifications).mockResolvedValue({
			data: {
				count: 3,
				next: null,
				previous: null,
				results: mockNotifications
			}
		} as any);

		renderComponent({ authToken: 'test-token' });

		await waitFor(() => {
			expect(screen.getByText('Event Invitation')).toBeInTheDocument();
		});

		// Should have type filter select. bits-ui v1.8's non-combo Select trigger
		// renders as a <button aria-haspopup="listbox"> (no role="combobox" — that
		// role is only set on the separate combo-input trigger variant), so query
		// by the actual rendered role rather than the ARIA combobox pattern.
		const selectTrigger = screen.getByRole('button', { name: /todos os tipos/i });
		expect(selectTrigger).toBeInTheDocument();
	});
});
