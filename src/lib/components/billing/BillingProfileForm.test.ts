// $env/dynamic/public is a SvelteKit virtual module not available in jsdom.
// Mock it so the $lib/utils barrel → $lib/config/api import chain doesn't fail.
vi.mock('$env/dynamic/public', () => ({ env: { PUBLIC_API_URL: '' } }));

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient } from '@tanstack/svelte-query';
import QueryClientTestWrapper from '$lib/test-utils/QueryClientTestWrapper.svelte';
import BillingProfileForm from './BillingProfileForm.svelte';

// Mock API functions
vi.mock('$lib/api/generated/sdk.gen', () => ({
	userbillingGetBillingProfile: vi
		.fn()
		.mockResolvedValue({ data: null, response: { status: 404 } }),
	userbillingCreateBillingProfile: vi.fn().mockResolvedValue({ data: {} }),
	userbillingUpdateBillingProfile: vi.fn().mockResolvedValue({ data: {} })
}));

// Mock paraglide messages
vi.mock('$lib/paraglide/messages.js', () => ({
	'billing.form.title': () => 'Billing Information',
	'billing.form.description': () => 'Your billing details used for invoices.',
	'billing.form.billingName': () => 'Legal Name',
	'billing.form.billingNamePlaceholder': () => 'Full legal name or company name',
	'billing.form.billingAddress': () => 'Billing Address',
	'billing.form.billingAddressPlaceholder': () => 'Street, city, postal code',
	'billing.form.billingEmail': () => 'Billing Email (optional)',
	'billing.form.billingEmailPlaceholder': () => 'Falls back to your account email',
	'billing.form.save': () => 'Save billing information',
	'billing.form.update': () => 'Update billing information',
	'billing.form.saving': () => 'Saving...',
	'billing.form.saved': () => 'Billing information saved',
	'billing.form.error': () => 'Failed to save billing information',
	'billing.form.incomplete': () => 'Billing information is incomplete',
	'billing.form.incompleteDescription': () => 'Please complete all required fields.'
}));

function renderWithQueryClient(props: Record<string, unknown>) {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } }
	});
	return render(QueryClientTestWrapper, {
		props: {
			client: queryClient,
			component: BillingProfileForm,
			props
		}
	});
}

describe('BillingProfileForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('exposes the form title as the accessible name', async () => {
		// The visible page heading lives in the parent route; the component itself
		// only carries the title via aria-label on the <form>.
		renderWithQueryClient({ authToken: 'test-token' });
		expect(screen.getByRole('form', { name: 'Billing Information' })).toBeInTheDocument();
	});

	it('renders all required form fields', async () => {
		renderWithQueryClient({ authToken: 'test-token' });
		expect(screen.getByLabelText(/Legal Name/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/Billing Address/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/Billing Email/i)).toBeInTheDocument();
	});

	it('renders save button initially', async () => {
		renderWithQueryClient({ authToken: 'test-token' });
		expect(screen.getByRole('button', { name: /Save billing information/i })).toBeInTheDocument();
	});

	it('save button is disabled when billing name is empty', async () => {
		renderWithQueryClient({ authToken: 'test-token' });
		const saveButton = screen.getByRole('button', { name: /Save billing information/i });
		expect(saveButton).toBeDisabled();
	});

	it('renders the form with accessible aria-label', async () => {
		renderWithQueryClient({ authToken: 'test-token' });
		expect(screen.getByRole('form', { name: /Billing Information/i })).toBeInTheDocument();
	});
});
