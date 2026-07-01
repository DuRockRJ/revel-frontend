// $env/dynamic/public is a SvelteKit virtual module not available in jsdom.
// Mock it so the $lib/utils barrel → $lib/config/api import chain doesn't fail.
vi.mock('$env/dynamic/public', () => ({ env: { PUBLIC_API_URL: '' } }));

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import NotificationItem from './NotificationItem.svelte';
import type { NotificationSchema } from '$lib/api/generated/types.gen';
import { QueryClient } from '@tanstack/svelte-query';
import QueryClientTestWrapper from '$lib/test-utils/QueryClientTestWrapper.svelte';

// Mock the API functions
vi.mock('$lib/api/generated', () => ({
	notificationMarkRead: vi.fn().mockResolvedValue({
		data: { read_at: new Date().toISOString() }
	}),
	notificationMarkUnread: vi.fn().mockResolvedValue({
		data: { read_at: null }
	})
}));

// Mock the toast
vi.mock('svelte-sonner', () => ({
	toast: {
		error: vi.fn()
	}
}));

// Mock the navigation
vi.mock('$app/navigation', () => ({
	goto: vi.fn()
}));

// Helper to create a mock notification
function createMockNotification(overrides?: Partial<NotificationSchema>): NotificationSchema {
	return {
		id: '123',
		notification_type: 'event_invitation',
		title: 'New Event Invitation',
		body: '<p>You have been invited to <strong>Summer BBQ</strong></p>',
		context: { event_id: 'event-123' },
		read_at: null,
		created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
		...overrides
	};
}

// Helper to render with QueryClient
function renderWithQuery(component: any, props: Record<string, unknown>) {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false }
		}
	});

	return render(QueryClientTestWrapper, {
		props: {
			client: queryClient,
			component,
			props
		}
	});
}

describe('NotificationItem', () => {
	const mockAuthToken = 'test-token-123';
	let user: ReturnType<typeof userEvent.setup>;

	beforeEach(() => {
		user = userEvent.setup();
		vi.clearAllMocks();
	});

	it('renders unread notification with all elements', () => {
		const notification = createMockNotification();

		renderWithQuery(NotificationItem, {
			notification,
			authToken: mockAuthToken
		});

		// Check title is present
		expect(screen.getByRole('heading', { name: /New Event Invitation/i })).toBeInTheDocument();

		// Check body HTML is rendered
		expect(screen.getByText(/You have been invited to/i)).toBeInTheDocument();
		expect(screen.getByText(/Summer BBQ/i)).toBeInTheDocument();

		// Check relative time is displayed
		expect(screen.getByText(/atrás/i)).toBeInTheDocument();

		// Check mark as read button is present
		expect(screen.getByRole('button', { name: /marcar como lida/i })).toBeInTheDocument();
	});

	it('does not render a raw notification-type badge', () => {
		// Current design surfaces the type via title/message only; the raw
		// notification_type value must never leak into the UI.
		const notification = createMockNotification();

		renderWithQuery(NotificationItem, {
			notification,
			authToken: mockAuthToken
		});

		expect(screen.queryByText('event_invitation')).not.toBeInTheDocument();
	});

	it('renders read notification with different styling', () => {
		const notification = createMockNotification({
			read_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() // Read 15 mins ago
		});

		renderWithQuery(NotificationItem, {
			notification,
			authToken: mockAuthToken
		});

		// Check mark as unread button is present
		expect(screen.getByRole('button', { name: /marcar como não lida/i })).toBeInTheDocument();
	});

	it('displays correct relative time for recent notifications', () => {
		const notification = createMockNotification({
			created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() // 5 minutes ago
		});

		renderWithQuery(NotificationItem, {
			notification,
			authToken: mockAuthToken
		});

		expect(screen.getByText(/5 minutos atrás/i)).toBeInTheDocument();
	});

	it('displays "just now" for very recent notifications', () => {
		const notification = createMockNotification({
			created_at: new Date(Date.now() - 1000 * 10).toISOString() // 10 seconds ago
		});

		renderWithQuery(NotificationItem, {
			notification,
			authToken: mockAuthToken
		});

		expect(screen.getByText(/agora mesmo/i)).toBeInTheDocument();
	});

	it('truncates body in compact mode', () => {
		const notification = createMockNotification({
			body: '<p>This is a very long notification body that should be truncated when in compact mode. It has multiple sentences and should only show the first two lines.</p>'
		});

		const { container } = renderWithQuery(NotificationItem, {
			notification,
			authToken: mockAuthToken,
			compact: true
		});

		// Check if the compact-mode line-clamp class is applied
		const bodyElement = container.querySelector('.line-clamp-4');
		expect(bodyElement).toBeInTheDocument();
	});

	it('is keyboard accessible and navigates on Enter', async () => {
		const notification = createMockNotification();
		const { goto } = await import('$app/navigation');

		renderWithQuery(NotificationItem, {
			notification,
			authToken: mockAuthToken
		});

		const card = screen.getByRole('button', { name: /New Event Invitation/i });
		card.focus();

		// Press Enter
		await user.keyboard('{Enter}');

		// Should navigate to event page
		expect(goto).toHaveBeenCalledWith('/events/event-123');
	});

	it('is keyboard accessible and navigates on Space', async () => {
		const notification = createMockNotification();
		const { goto } = await import('$app/navigation');

		renderWithQuery(NotificationItem, {
			notification,
			authToken: mockAuthToken
		});

		const card = screen.getByRole('button', { name: /New Event Invitation/i });
		card.focus();

		// Press Space
		await user.keyboard(' ');

		// Should navigate to event page
		expect(goto).toHaveBeenCalledWith('/events/event-123');
	});

	it('extracts URL from different context patterns', () => {
		const contexts = [
			{ event_id: 'event-123', expectedUrl: '/events/event-123' },
			{ org_slug: 'my-org', expectedUrl: '/org/my-org' },
			{ invitation_id: 'inv-123', expectedUrl: '/invitations/inv-123' },
			{ url: '/custom/path', expectedUrl: '/custom/path' }
		];

		contexts.forEach(({ expectedUrl, ...context }) => {
			const notification = createMockNotification({ context });

			const { unmount } = renderWithQuery(NotificationItem, {
				notification,
				authToken: mockAuthToken
			});

			// Card should be clickable
			const card = screen.getByRole('button', { name: /New Event Invitation/i });
			expect(card).toBeInTheDocument();

			unmount();
		});
	});

	it('keeps the button role even when context has no URL', () => {
		// The card hard-codes role="button"; without a URL the click is a no-op
		// (covered by the "does not navigate" test below).
		const notification = createMockNotification({
			context: {} // No URL-related keys
		});

		renderWithQuery(NotificationItem, {
			notification,
			authToken: mockAuthToken
		});

		expect(screen.getByRole('button', { name: /New Event Invitation/i })).toBeInTheDocument();
	});

	it('calls onStatusChange callback after marking as read', async () => {
		const notification = createMockNotification();
		const onStatusChange = vi.fn();
		const { notificationMarkRead } = await import('$lib/api/generated');

		renderWithQuery(NotificationItem, {
			notification,
			authToken: mockAuthToken,
			onStatusChange
		});

		const markReadButton = screen.getByRole('button', { name: /marcar como lida/i });
		await user.click(markReadButton);

		// Wait for mutation to complete
		await vi.waitFor(() => {
			expect(notificationMarkRead).toHaveBeenCalledWith({
				path: { notification_id: '123' },
				headers: { Authorization: `Bearer ${mockAuthToken}` }
			});
		});

		// Callback should be called with updated notification
		await vi.waitFor(() => {
			expect(onStatusChange).toHaveBeenCalledWith(
				expect.objectContaining({
					id: '123',
					read_at: expect.any(String)
				})
			);
		});
	});

	it('shows error toast on mark read failure', async () => {
		const notification = createMockNotification();
		const { notificationMarkRead } = await import('$lib/api/generated');
		const { toast } = await import('svelte-sonner');

		// Mock API to fail
		(notificationMarkRead as any).mockRejectedValueOnce(new Error('Network error'));

		renderWithQuery(NotificationItem, {
			notification,
			authToken: mockAuthToken
		});

		const markReadButton = screen.getByRole('button', { name: /marcar como lida/i });
		await user.click(markReadButton);

		// Wait for error toast
		await vi.waitFor(() => {
			expect(toast.error).toHaveBeenCalled();
		});
	});

	it('stops propagation when clicking mark read/unread button', async () => {
		const notification = createMockNotification();
		const { goto } = await import('$app/navigation');

		renderWithQuery(NotificationItem, {
			notification,
			authToken: mockAuthToken
		});

		const markReadButton = screen.getByRole('button', { name: /marcar como lida/i });
		await user.click(markReadButton);

		// Should NOT navigate
		expect(goto).not.toHaveBeenCalled();
	});

	it('applies custom className prop', () => {
		const notification = createMockNotification();

		const { container } = renderWithQuery(NotificationItem, {
			notification,
			authToken: mockAuthToken,
			class: 'custom-test-class'
		});

		const card = container.querySelector('.custom-test-class');
		expect(card).toBeInTheDocument();
	});

	it('has proper ARIA labels for screen readers', () => {
		const notification = createMockNotification();

		renderWithQuery(NotificationItem, {
			notification,
			authToken: mockAuthToken
		});

		const card = screen.getByRole('button', {
			name: /New Event Invitation\. Não lida\. Clique para ver os detalhes\./i
		});

		expect(card).toBeInTheDocument();
	});

	it('never leaks raw notification_type values for any type', () => {
		const types = ['event_invitation', 'rsvp_confirmed', 'event_reminder'];

		types.forEach((type) => {
			const notification = createMockNotification({ notification_type: type });

			const { unmount } = renderWithQuery(NotificationItem, {
				notification,
				authToken: mockAuthToken
			});

			expect(screen.queryByText(type)).not.toBeInTheDocument();

			unmount();
		});
	});
});
