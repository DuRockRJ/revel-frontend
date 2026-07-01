// $env/dynamic/public is a SvelteKit virtual module not available in jsdom.
// Mock it so the $lib/utils barrel → $lib/config/api import chain doesn't fail.
vi.mock('$env/dynamic/public', () => ({ env: { PUBLIC_API_URL: '' } }));

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import { userEvent } from '@testing-library/user-event';
import MobileOrganizationFilterSheet from './MobileOrganizationFilterSheet.svelte';
import type { OrganizationFilters as FilterState } from '$lib/utils/organizationFilters';

describe('MobileOrganizationFilterSheet', () => {
	const defaultFilters: FilterState = {
		orderBy: 'distance',
		page: 1,
		pageSize: 20
	};

	const defaultProps = {
		filters: defaultFilters,
		totalCount: 42,
		isOpen: true,
		onUpdateFilters: vi.fn(),
		onClearFilters: vi.fn(),
		onClose: vi.fn()
	};

	it('renders when isOpen is true', () => {
		render(MobileOrganizationFilterSheet, {
			props: defaultProps
		});

		expect(screen.getByRole('dialog', { name: 'Filtros' })).toBeInTheDocument();
		expect(screen.getByText('Filtros')).toBeInTheDocument();
	});

	it('does not render when isOpen is false', () => {
		render(MobileOrganizationFilterSheet, {
			props: {
				...defaultProps,
				isOpen: false
			}
		});

		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	it('displays active filter count', () => {
		const filtersWithActive: FilterState = {
			...defaultFilters,
			search: 'test',
			tags: ['LGBTQ+']
		};

		render(MobileOrganizationFilterSheet, {
			props: {
				...defaultProps,
				filters: filtersWithActive
			}
		});

		// search (1) + 1 tag = 2 active filters
		expect(screen.getByText('2')).toBeInTheDocument();
	});

	it('shows clear all button when filters are active', () => {
		const filtersWithActive: FilterState = {
			...defaultFilters,
			search: 'test'
		};

		render(MobileOrganizationFilterSheet, {
			props: {
				...defaultProps,
				filters: filtersWithActive
			}
		});

		expect(screen.getByRole('button', { name: /limpar todos os filtros/i })).toBeInTheDocument();
	});

	it('calls onClose when backdrop is clicked', async () => {
		const user = userEvent.setup();
		const onClose = vi.fn();

		render(MobileOrganizationFilterSheet, {
			props: {
				...defaultProps,
				onClose
			}
		});

		// aria-hidden keeps the backdrop out of the default a11y tree
		const backdrop = screen.getByRole('presentation', { hidden: true });
		await user.click(backdrop);

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('calls onClose when close button is clicked', async () => {
		const user = userEvent.setup();
		const onClose = vi.fn();

		render(MobileOrganizationFilterSheet, {
			props: {
				...defaultProps,
				onClose
			}
		});

		const closeButton = screen.getByRole('button', { name: 'Fechar filtros' });
		await user.click(closeButton);

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('calls onClose when Escape key is pressed', async () => {
		const user = userEvent.setup();
		const onClose = vi.fn();

		render(MobileOrganizationFilterSheet, {
			props: {
				...defaultProps,
				onClose
			}
		});

		await user.keyboard('{Escape}');

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('displays organization count in apply button', () => {
		render(MobileOrganizationFilterSheet, {
			props: {
				...defaultProps,
				totalCount: 42
			}
		});

		expect(screen.getByText('Mostrar 42 organizações')).toBeInTheDocument();
	});

	it('uses singular form when count is 1', () => {
		render(MobileOrganizationFilterSheet, {
			props: {
				...defaultProps,
				totalCount: 1
			}
		});

		expect(screen.getByText('Mostrar 1 organização')).toBeInTheDocument();
	});

	it('calls onClose when apply button is clicked', async () => {
		const user = userEvent.setup();
		const onClose = vi.fn();

		render(MobileOrganizationFilterSheet, {
			props: {
				...defaultProps,
				onClose
			}
		});

		const applyButton = screen.getByRole('button', { name: /mostrar.*organizações/i });
		await user.click(applyButton);

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('calls onClearFilters when clear all button is clicked', async () => {
		const user = userEvent.setup();
		const onClearFilters = vi.fn();

		const filtersWithActive: FilterState = {
			...defaultFilters,
			search: 'test'
		};

		render(MobileOrganizationFilterSheet, {
			props: {
				...defaultProps,
				filters: filtersWithActive,
				onClearFilters
			}
		});

		const clearButton = screen.getByRole('button', { name: /limpar todos os filtros/i });
		await user.click(clearButton);

		expect(onClearFilters).toHaveBeenCalledTimes(1);
	});

	it('is accessible with proper ARIA attributes', () => {
		render(MobileOrganizationFilterSheet, {
			props: defaultProps
		});

		const dialog = screen.getByRole('dialog');
		expect(dialog).toHaveAttribute('aria-modal', 'true');
		expect(dialog).toHaveAttribute('aria-labelledby', 'mobile-organization-filter-title');
	});

	it('has swipe indicator for mobile UX', () => {
		const { container } = render(MobileOrganizationFilterSheet, {
			props: defaultProps
		});

		// Check for the swipe handle
		const handle = container.querySelector('.h-1\\.5.w-12.rounded-full.bg-muted');
		expect(handle).toBeInTheDocument();
	});
});
