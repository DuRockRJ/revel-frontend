// $env/dynamic/public is a SvelteKit virtual module not available in jsdom.
// Mock it so the $lib/utils barrel → $lib/config/api import chain doesn't fail.
vi.mock('$env/dynamic/public', () => ({ env: { PUBLIC_API_URL: '' } }));

import { render, screen, waitFor } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient } from '@tanstack/svelte-query';
import QueryClientTestWrapper from '$lib/test-utils/QueryClientTestWrapper.svelte';
import NotificationPreferencesForm from './NotificationPreferencesForm.svelte';
import type { NotificationPreferenceSchema } from '$lib/api/generated/types.gen.js';

// Mock the API (everything the component pulls from the barrel)
vi.mock('$lib/api', () => ({
	notificationpreferenceUpdatePreferences: vi.fn(),
	notificationpreferenceGetAvailableNotificationTypes: vi.fn().mockResolvedValue({ data: [] }),
	notificationpreferenceUnsubscribe: vi.fn(),
	telegramGetLinkStatus: vi.fn().mockResolvedValue({ data: { linked: false } })
}));

// Mock svelte-sonner
vi.mock('svelte-sonner', () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn()
	}
}));

describe('NotificationPreferencesForm', () => {
	let queryClient: QueryClient;
	const mockPreferences: NotificationPreferenceSchema = {
		silence_all_notifications: false,
		event_reminders_enabled: true,
		enabled_channels: ['in_app', 'email'],
		digest_frequency: 'daily',
		digest_send_time: '09:00',
		show_me_on_attendee_list: 'to_both'
	};

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
				mutations: { retry: false }
			}
		});
		vi.clearAllMocks();
	});

	function renderForm(props: Record<string, unknown> = {}) {
		return render(QueryClientTestWrapper, {
			props: {
				client: queryClient,
				component: NotificationPreferencesForm,
				props: {
					preferences: mockPreferences,
					authToken: 'test-token',
					...props
				}
			}
		});
	}

	it('renders all form sections', () => {
		renderForm();

		expect(screen.getByText('Controles principais')).toBeInTheDocument();
		expect(screen.getByText('Canais de notificação')).toBeInTheDocument();
		expect(screen.getByText('Configurações de resumo')).toBeInTheDocument();
	});

	it('displays current preferences correctly', () => {
		renderForm();

		// Check silence all is not checked
		const silenceAllCheckbox = screen.getByRole('checkbox', {
			name: 'Silenciar todas as notificações'
		});
		expect(silenceAllCheckbox).not.toBeChecked();

		// Check event reminders is checked
		const eventRemindersCheckbox = screen.getByRole('checkbox', {
			name: 'Lembretes de eventos'
		});
		expect(eventRemindersCheckbox).toBeChecked();

		// Check in-app channel is enabled
		const inAppCheckbox = screen.getByRole('checkbox', { name: 'No aplicativo' });
		expect(inAppCheckbox).toBeChecked();

		// Check email channel is enabled
		const emailCheckbox = screen.getByRole('checkbox', { name: 'E-mail' });
		expect(emailCheckbox).toBeChecked();
	});

	it('disables all controls when silence_all is enabled', async () => {
		const user = userEvent.setup();
		renderForm();

		const silenceAllCheckbox = screen.getByRole('checkbox', {
			name: 'Silenciar todas as notificações'
		});

		// Enable silence all
		await user.click(silenceAllCheckbox);

		// Check that other controls are disabled
		await waitFor(() => {
			expect(screen.getByRole('checkbox', { name: 'Lembretes de eventos' })).toBeDisabled();
			expect(screen.getByRole('checkbox', { name: 'No aplicativo' })).toBeDisabled();
		});
	});

	it('shows time picker only for daily and weekly digest frequencies', async () => {
		const user = userEvent.setup();
		renderForm({ preferences: { ...mockPreferences, digest_frequency: 'immediate' } });

		// Time picker should not be visible for immediate
		expect(screen.queryByLabelText('Horário de envio')).not.toBeInTheDocument();

		// Change to daily (frequency is a radio group)
		await user.click(screen.getByRole('radio', { name: 'Diário' }));

		// Time picker should now be visible
		await waitFor(() => {
			expect(screen.getByLabelText('Horário de envio')).toBeInTheDocument();
		});
	});

	it('validates that at least one channel is selected', async () => {
		const user = userEvent.setup();
		renderForm();

		// Uncheck all channels
		await user.click(screen.getByRole('checkbox', { name: 'No aplicativo' }));
		await user.click(screen.getByRole('checkbox', { name: 'E-mail' }));

		// Inline validation error appears and save is blocked
		await waitFor(() => {
			expect(screen.getByText('Selecione pelo menos um canal de notificação')).toBeInTheDocument();
		});
		expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();
	});

	it('enables save button when changes are made', async () => {
		const user = userEvent.setup();
		renderForm();

		const saveButton = screen.getByRole('button', { name: 'Salvar alterações' });

		// Initially disabled (no changes)
		expect(saveButton).toBeDisabled();

		// Make a change
		await user.click(screen.getByRole('checkbox', { name: 'Lembretes de eventos' }));

		// Save button should now be enabled
		await waitFor(() => {
			expect(saveButton).not.toBeDisabled();
		});
	});

	it('calls onSave callback on successful save', async () => {
		const mockOnSave = vi.fn();
		const user = userEvent.setup();

		const { notificationpreferenceUpdatePreferences } = await import('$lib/api');
		vi.mocked(notificationpreferenceUpdatePreferences).mockResolvedValue({
			data: { ...mockPreferences, event_reminders_enabled: false },
			error: undefined,
			response: {} as Response
		} as never);

		renderForm({ onSave: mockOnSave });

		// Make a change
		await user.click(screen.getByRole('checkbox', { name: 'Lembretes de eventos' }));

		// Save
		await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));

		// Wait for mutation to complete
		await waitFor(() => {
			expect(mockOnSave).toHaveBeenCalledWith(
				expect.objectContaining({
					event_reminders_enabled: false
				})
			);
		});
	});

	it('resets changes when the cancel button is clicked', async () => {
		const user = userEvent.setup();
		renderForm();

		// Make a change
		const eventRemindersCheckbox = screen.getByRole('checkbox', {
			name: 'Lembretes de eventos'
		});
		await user.click(eventRemindersCheckbox);

		// Checkbox should be unchecked
		expect(eventRemindersCheckbox).not.toBeChecked();

		// Click reset ("Cancelar" restores the last saved preferences)
		await user.click(screen.getByRole('button', { name: 'Cancelar' }));

		// Checkbox should be checked again (back to original state)
		await waitFor(() => {
			expect(eventRemindersCheckbox).toBeChecked();
		});
	});

	it('is keyboard accessible', async () => {
		const user = userEvent.setup();
		renderForm();

		// Tab through form elements
		await user.tab();
		expect(screen.getByRole('checkbox', { name: 'Silenciar todas as notificações' })).toHaveFocus();

		await user.tab();
		const eventRemindersCheckbox = screen.getByRole('checkbox', {
			name: 'Lembretes de eventos'
		});
		expect(eventRemindersCheckbox).toHaveFocus();

		// Test keyboard interaction with checkbox
		await user.keyboard(' '); // Space to toggle
		expect(eventRemindersCheckbox).not.toBeChecked();

		await user.keyboard(' '); // Space to toggle back
		expect(eventRemindersCheckbox).toBeChecked();
	});

	it('handles disabled prop correctly', () => {
		renderForm({ disabled: true });

		// All interactive elements should be disabled
		expect(
			screen.getByRole('checkbox', { name: 'Silenciar todas as notificações' })
		).toBeDisabled();
		expect(screen.getByRole('checkbox', { name: 'Lembretes de eventos' })).toBeDisabled();
		expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();
	});

	it('handles null preferences gracefully', () => {
		renderForm({ preferences: null });

		// Should render with default values
		expect(screen.getByText('Controles principais')).toBeInTheDocument();
		expect(
			screen.getByRole('checkbox', { name: 'Silenciar todas as notificações' })
		).not.toBeChecked();
	});
});
