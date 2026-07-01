import { render, screen, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient } from '@tanstack/svelte-query';
import NotificationBadge from './NotificationBadge.svelte';
import QueryClientTestWrapper from '$lib/test-utils/QueryClientTestWrapper.svelte';
import * as api from '$lib/api/generated';

// Mock the API
vi.mock('$lib/api/generated', () => ({
	notificationUnreadCount: vi.fn()
}));

describe('NotificationBadge', () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: {
				queries: {
					retry: false,
					gcTime: 0
				}
			}
		});

		// Reset mocks
		vi.clearAllMocks();

		// Mock successful API response by default
		vi.mocked(api.notificationUnreadCount).mockResolvedValue({
			data: { count: 5 }
		} as any);
	});

	afterEach(() => {
		queryClient.clear();
	});

	function renderBadge(props: Record<string, unknown>) {
		return render(QueryClientTestWrapper, {
			props: { client: queryClient, component: NotificationBadge, props }
		});
	}

	it('renders badge with unread count', async () => {
		renderBadge({ authToken: 'test-token' });

		await waitFor(() => {
			expect(screen.getByRole('status')).toBeInTheDocument();
		});

		expect(screen.getByText('5')).toBeInTheDocument();
		expect(screen.getByLabelText('5 unread notifications')).toBeInTheDocument();
	});

	it('does not render badge when count is 0 by default', async () => {
		vi.mocked(api.notificationUnreadCount).mockResolvedValue({
			data: { count: 0 }
		} as any);

		renderBadge({ authToken: 'test-token' });

		await waitFor(() => {
			expect(api.notificationUnreadCount).toHaveBeenCalled();
		});

		expect(screen.queryByRole('status')).not.toBeInTheDocument();
	});

	it('renders badge when count is 0 if showZero is true', async () => {
		vi.mocked(api.notificationUnreadCount).mockResolvedValue({
			data: { count: 0 }
		} as any);

		renderBadge({ authToken: 'test-token', showZero: true });

		await waitFor(() => {
			expect(screen.getByRole('status')).toBeInTheDocument();
		});

		expect(screen.getByText('0')).toBeInTheDocument();
	});

	it('displays "99+" when count exceeds maxCount', async () => {
		vi.mocked(api.notificationUnreadCount).mockResolvedValue({
			data: { count: 150 }
		} as any);

		renderBadge({ authToken: 'test-token', maxCount: 99 });

		await waitFor(() => {
			expect(screen.getByText('99+')).toBeInTheDocument();
		});

		expect(screen.getByLabelText('More than 99 unread notifications')).toBeInTheDocument();
	});

	it('uses custom maxCount', async () => {
		vi.mocked(api.notificationUnreadCount).mockResolvedValue({
			data: { count: 60 }
		} as any);

		renderBadge({ authToken: 'test-token', maxCount: 50 });

		await waitFor(() => {
			expect(screen.getByText('50+')).toBeInTheDocument();
		});
	});

	it('calls onCountChange callback when count changes', async () => {
		const onCountChange = vi.fn();

		renderBadge({ authToken: 'test-token', onCountChange });

		await waitFor(() => {
			expect(onCountChange).toHaveBeenCalledWith(5);
		});
	});

	it('includes authorization header in API call', async () => {
		renderBadge({ authToken: 'my-secret-token' });

		await waitFor(() => {
			expect(api.notificationUnreadCount).toHaveBeenCalledWith({
				headers: { Authorization: 'Bearer my-secret-token' }
			});
		});
	});

	it('handles API errors gracefully', async () => {
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

		vi.mocked(api.notificationUnreadCount).mockRejectedValue(new Error('Network error'));

		renderBadge({ authToken: 'test-token' });

		// The component's query retries once (retry: 1) before settling into an
		// error state, so this needs more than waitFor's default 1000ms timeout.
		await waitFor(
			() => {
				expect(consoleWarnSpy).toHaveBeenCalledWith(
					'[NotificationBadge] Failed to fetch unread count'
				);
			},
			{ timeout: 3000 }
		);

		// Badge should not be rendered on error
		expect(screen.queryByRole('status')).not.toBeInTheDocument();

		consoleWarnSpy.mockRestore();
	});

	it('has correct ARIA labels for accessibility', async () => {
		vi.mocked(api.notificationUnreadCount).mockResolvedValue({
			data: { count: 1 }
		} as any);

		renderBadge({ authToken: 'test-token' });

		await waitFor(() => {
			expect(screen.getByLabelText('1 unread notification')).toBeInTheDocument();
		});
	});

	it('applies custom className', async () => {
		renderBadge({ authToken: 'test-token', class: 'custom-badge-class' });

		await waitFor(() => {
			const badge = screen.getByRole('status');
			expect(badge).toHaveClass('custom-badge-class');
		});
	});

	it('has role="status" and aria-live="polite"', async () => {
		renderBadge({ authToken: 'test-token' });

		await waitFor(() => {
			const badge = screen.getByRole('status');
			expect(badge).toHaveAttribute('aria-live', 'polite');
		});
	});
});
