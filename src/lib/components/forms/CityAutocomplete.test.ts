// $env/dynamic/public is a SvelteKit virtual module not available in jsdom.
vi.mock('$env/dynamic/public', () => ({ env: { PUBLIC_API_URL: '' } }));

import { render, screen, waitFor } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import CityAutocomplete from './CityAutocomplete.svelte';

vi.mock('$lib/api/generated', () => ({
	cityListCities: vi.fn()
}));

import { cityListCities } from '$lib/api/generated';

const mockCityListCities = cityListCities as ReturnType<typeof vi.fn>;

describe('CityAutocomplete', () => {
	it('shows a "no results" message when the search returns zero cities (#issue)', async () => {
		mockCityListCities.mockResolvedValue({ data: { results: [] } });
		const user = userEvent.setup();

		render(CityAutocomplete, { props: { value: null, onSelect: vi.fn() } });

		await user.type(screen.getByRole('textbox'), 'Nowheresville');

		await waitFor(() => expect(mockCityListCities).toHaveBeenCalled(), { timeout: 1000 });
		await waitFor(() => expect(screen.getByText(/Nenhuma cidade encontrada/)).toBeInTheDocument());
	});

	it('shows matching cities in a listbox when the search finds results', async () => {
		mockCityListCities.mockResolvedValue({
			data: { results: [{ id: 1, name: 'Rio de Janeiro', admin_name: 'RJ', country: 'Brasil' }] }
		});
		const user = userEvent.setup();

		render(CityAutocomplete, { props: { value: null, onSelect: vi.fn() } });

		await user.type(screen.getByRole('textbox'), 'Rio');

		await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument());
		expect(screen.getByText(/Rio de Janeiro/)).toBeInTheDocument();
		expect(screen.queryByText(/Nenhuma cidade encontrada/)).not.toBeInTheDocument();
	});

	it('recolors the pin icon on the keyboard-highlighted option to match its accent background', async () => {
		mockCityListCities.mockResolvedValue({
			data: { results: [{ id: 1, name: 'Bangu', admin_name: 'Zona Oeste', country: 'Brasil' }] }
		});
		const user = userEvent.setup();

		render(CityAutocomplete, { props: { value: null, onSelect: vi.fn() } });

		const input = screen.getByRole('textbox');
		await user.type(input, 'Bangu');
		await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument());

		await user.keyboard('{ArrowDown}');

		const option = screen.getByRole('option');
		expect(option.className).toContain('bg-accent');
		expect(option.querySelector('svg')?.getAttribute('class')).toContain('text-accent-foreground');
	});
});
