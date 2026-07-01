// $env/dynamic/public is a SvelteKit virtual module not available in jsdom.
// Mock it so the $lib/utils barrel → $lib/config/api import chain doesn't fail.
vi.mock('$env/dynamic/public', () => ({ env: { PUBLIC_API_URL: '' } }));

import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient } from '@tanstack/svelte-query';
import QueryClientTestWrapper from '$lib/test-utils/QueryClientTestWrapper.svelte';
import DetailsStep from './DetailsStep.svelte';

function renderStep(props: Record<string, unknown>) {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } }
	});
	return render(QueryClientTestWrapper, {
		props: { client: queryClient, component: DetailsStep, props }
	});
}

describe('DetailsStep', () => {
	const mockProps = {
		formData: {
			name: 'Test Event',
			start: '2025-12-01T18:00:00',
			city_id: 1,
			visibility: 'public' as const,
			event_type: 'public' as const,
			requires_ticket: false
		},
		eventSeries: [],
		questionnaires: [],
		onUpdate: vi.fn(),
		onUpdateImages: vi.fn()
	};

	it('renders all accordion sections', () => {
		renderStep(mockProps);

		expect(screen.getByText('Detalhes básicos')).toBeInTheDocument();
		expect(screen.getByText('Opções de RSVP')).toBeInTheDocument();
		expect(screen.getByText('Capacidade e lista de espera')).toBeInTheDocument();
		expect(screen.getByText('Avançado')).toBeInTheDocument();
		expect(screen.getByText('Mídia')).toBeInTheDocument();
	});

	it('opens Basic Details section by default', () => {
		renderStep(mockProps);

		expect(screen.getByLabelText('Descrição')).toBeInTheDocument();
	});

	it('toggles accordion sections', async () => {
		renderStep(mockProps);

		const capacityButton = screen.getByRole('button', { name: /Capacidade/i });

		// Section should be closed initially
		expect(screen.queryByLabelText('Número máximo de participantes')).not.toBeInTheDocument();

		// Open section
		await fireEvent.click(capacityButton);
		expect(screen.getByLabelText('Número máximo de participantes')).toBeInTheDocument();

		// Close section
		await fireEvent.click(capacityButton);
		expect(screen.queryByLabelText('Número máximo de participantes')).not.toBeInTheDocument();
	});

	it('hides the RSVP section when requires_ticket is true', async () => {
		// Ticketing options moved to the wizard's step 3; here a ticketed event
		// just drops the RSVP section and gains check-in fields under Advanced.
		renderStep({
			...mockProps,
			formData: {
				...mockProps.formData,
				requires_ticket: true
			}
		});

		expect(screen.queryByText('Opções de RSVP')).not.toBeInTheDocument();

		await fireEvent.click(screen.getByRole('button', { name: /Avançado/i }));
		expect(screen.getByText('Check-in abre em')).toBeInTheDocument();
	});

	it('shows RSVP section when requires_ticket is false', () => {
		renderStep(mockProps);

		expect(screen.getByText('Opções de RSVP')).toBeInTheDocument();
		expect(screen.queryByText('Check-in abre em')).not.toBeInTheDocument();
	});

	it('calls onUpdate when description changes', async () => {
		const onUpdate = vi.fn();
		renderStep({ ...mockProps, onUpdate });

		const descriptionTextarea = screen.getByLabelText('Descrição');
		await fireEvent.input(descriptionTextarea, { target: { value: 'Test description' } });

		expect(onUpdate).toHaveBeenCalledWith({ description: 'Test description' });
	});

	it('handles tag input', async () => {
		const onUpdate = vi.fn();
		renderStep({ ...mockProps, onUpdate });

		// Open Advanced section
		const advancedButton = screen.getByRole('button', { name: /Avançado/i });
		await fireEvent.click(advancedButton);

		const tagInput = screen.getByPlaceholderText('Adicionar tags...');
		const addButton = screen.getByRole('button', { name: 'Adicionar' });

		await fireEvent.input(tagInput, { target: { value: 'social' } });
		await fireEvent.click(addButton);

		expect(onUpdate).toHaveBeenCalledWith({ tags: ['social'] });
	});

	it('is keyboard accessible', async () => {
		renderStep(mockProps);

		const descriptionTextarea = screen.getByLabelText('Descrição');
		descriptionTextarea.focus();
		expect(document.activeElement).toBe(descriptionTextarea);
	});
});
