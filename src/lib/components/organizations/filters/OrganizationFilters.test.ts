// $env/dynamic/public is a SvelteKit virtual module not available in jsdom.
// Mock it so the $lib/utils barrel → $lib/config/api import chain doesn't fail.
vi.mock('$env/dynamic/public', () => ({ env: { PUBLIC_API_URL: '' } }));

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import { userEvent } from '@testing-library/user-event';
import OrganizationFilters from './OrganizationFilters.svelte';
import type { OrganizationFilters as FilterState } from '$lib/utils/organizationFilters';

describe('OrganizationFilters', () => {
	const defaultFilters: FilterState = {
		orderBy: 'distance',
		page: 1,
		pageSize: 20
	};

	it('renders filter sections', () => {
		const onUpdateFilters = vi.fn();
		const onClearFilters = vi.fn();

		render(OrganizationFilters, {
			props: {
				filters: defaultFilters,
				onUpdateFilters,
				onClearFilters
			}
		});

		expect(
			screen.getByRole('complementary', { name: 'Filtros de organização' })
		).toBeInTheDocument();
		expect(screen.getByText('Filtros')).toBeInTheDocument();
		expect(screen.getByText('Ordenar por')).toBeInTheDocument();
		expect(screen.getByText('Buscar')).toBeInTheDocument();
		expect(screen.getByText('Tags')).toBeInTheDocument();
	});

	it('displays active filter count', () => {
		const onUpdateFilters = vi.fn();
		const onClearFilters = vi.fn();

		const filtersWithActive: FilterState = {
			...defaultFilters,
			search: 'test',
			tags: ['LGBTQ+', 'Community']
		};

		render(OrganizationFilters, {
			props: {
				filters: filtersWithActive,
				onUpdateFilters,
				onClearFilters
			}
		});

		// search (1) + 2 tags = 3 active filters
		expect(screen.getByText('3')).toBeInTheDocument();
	});

	it('shows clear all button when filters are active', () => {
		const onUpdateFilters = vi.fn();
		const onClearFilters = vi.fn();

		const filtersWithActive: FilterState = {
			...defaultFilters,
			search: 'test'
		};

		render(OrganizationFilters, {
			props: {
				filters: filtersWithActive,
				onUpdateFilters,
				onClearFilters
			}
		});

		expect(screen.getByRole('button', { name: /limpar tudo/i })).toBeInTheDocument();
	});

	it('hides clear all button when no filters are active', () => {
		const onUpdateFilters = vi.fn();
		const onClearFilters = vi.fn();

		render(OrganizationFilters, {
			props: {
				filters: defaultFilters,
				onUpdateFilters,
				onClearFilters
			}
		});

		expect(screen.queryByRole('button', { name: /limpar tudo/i })).not.toBeInTheDocument();
	});

	it('calls onClearFilters when clear all is clicked', async () => {
		const user = userEvent.setup();
		const onUpdateFilters = vi.fn();
		const onClearFilters = vi.fn();

		const filtersWithActive: FilterState = {
			...defaultFilters,
			search: 'test'
		};

		render(OrganizationFilters, {
			props: {
				filters: filtersWithActive,
				onUpdateFilters,
				onClearFilters
			}
		});

		const clearButton = screen.getByRole('button', { name: /limpar tudo/i });
		await user.click(clearButton);

		expect(onClearFilters).toHaveBeenCalledTimes(1);
	});

	it('is keyboard accessible', async () => {
		const user = userEvent.setup();
		const onUpdateFilters = vi.fn();
		const onClearFilters = vi.fn();

		render(OrganizationFilters, {
			props: {
				filters: defaultFilters,
				onUpdateFilters,
				onClearFilters
			}
		});

		// Tab order: city input → sort-order info tooltip button → select
		await user.tab();
		expect(screen.getByLabelText('Buscar uma cidade')).toHaveFocus();
		await user.tab();
		await user.tab();
		expect(screen.getByRole('combobox')).toHaveFocus(); // Order by select
	});

	it('displays footer hint with active filter count', () => {
		const onUpdateFilters = vi.fn();
		const onClearFilters = vi.fn();

		const filtersWithActive: FilterState = {
			...defaultFilters,
			search: 'test',
			cityId: 123
		};

		render(OrganizationFilters, {
			props: {
				filters: filtersWithActive,
				onUpdateFilters,
				onClearFilters
			}
		});

		expect(screen.getByText('2 filtros aplicado(s)')).toBeInTheDocument();
	});
});
