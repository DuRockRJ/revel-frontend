// $env/dynamic/public is a SvelteKit virtual module not available in jsdom.
// Mock it so the $lib/utils barrel → $lib/config/api import chain doesn't fail.
vi.mock('$env/dynamic/public', () => ({ env: { PUBLIC_API_URL: '' } }));

import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient } from '@tanstack/svelte-query';
import QueryClientTestWrapper from '$lib/test-utils/QueryClientTestWrapper.svelte';
import EssentialsStep from './EssentialsStep.svelte';

// The slug editor uses createMutation + the auth store
vi.mock('$lib/api/generated/sdk.gen', () => ({
	eventadmincoreEditSlug: vi.fn()
}));
vi.mock('$lib/stores/auth.svelte', () => ({
	authStore: { accessToken: 'test-token' as string | null }
}));

function renderStep(props: Record<string, unknown>) {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
	});
	return render(QueryClientTestWrapper, {
		props: { client: queryClient, component: EssentialsStep, props }
	});
}

describe('EssentialsStep', () => {
	const mockProps = {
		formData: {
			name: '',
			start: '',
			city_id: null,
			visibility: 'public',
			event_type: 'public',
			requires_ticket: false
		},
		validationErrors: {},
		isEditMode: false,
		onUpdate: vi.fn(),
		onSubmit: vi.fn(),
		isSaving: false
	};

	it('renders all required fields', () => {
		renderStep(mockProps);

		expect(screen.getByLabelText(/Nome do evento/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/Data e horário de início/i)).toBeInTheDocument();
		// City selection moved to step 2 (venue/location), so it's not asserted here
	});

	it('calls onUpdate when name input changes', async () => {
		const onUpdate = vi.fn();
		renderStep({ ...mockProps, onUpdate });

		const nameInput = screen.getByLabelText(/Nome do evento/i);
		await fireEvent.input(nameInput, { target: { value: 'Test Event' } });

		expect(onUpdate).toHaveBeenCalledWith({ name: 'Test Event' });
	});

	it('displays validation errors', () => {
		renderStep({
			...mockProps,
			validationErrors: {
				name: 'Name is required',
				start: 'Start date is required'
			}
		});

		expect(screen.getByText('Name is required')).toBeInTheDocument();
		expect(screen.getByText('Start date is required')).toBeInTheDocument();
	});

	it('shows all visibility options', () => {
		renderStep(mockProps);

		// Renders for both visibility and event_type radios
		expect(screen.getAllByText('Público').length).toBeGreaterThan(0);
		expect(screen.getAllByText('Somente por convite').length).toBeGreaterThan(0);
		expect(screen.getAllByText(/Somente membros da organização/).length).toBeGreaterThan(0);
		expect(screen.getByText('Somente equipe')).toBeInTheDocument();
	});

	it('calls onSubmit when form is submitted', async () => {
		const onSubmit = vi.fn();
		renderStep({ ...mockProps, onSubmit });

		const form = screen.getByRole('button', { name: /Criar evento/i }).closest('form');
		await fireEvent.submit(form!);

		expect(onSubmit).toHaveBeenCalled();
	});

	it('is keyboard accessible', () => {
		renderStep(mockProps);

		const nameInput = screen.getByLabelText(/Nome do evento/i);
		nameInput.focus();
		expect(document.activeElement).toBe(nameInput);
	});
});
