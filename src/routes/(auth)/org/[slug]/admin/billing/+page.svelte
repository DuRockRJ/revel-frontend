<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { AlertCircle, FileText, Loader2, Receipt, Users } from 'lucide-svelte';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { browser } from '$app/environment';
	import { invalidateAll } from '$app/navigation';
	import { authStore } from '$lib/stores/auth.svelte';
	import { toast } from 'svelte-sonner';
	import { extractErrorMessage } from '$lib/utils/errors';
	import {
		organizationadminvatGetBillingInfo,
		organizationadminvatUpdateBillingInfo,
		organizationadminvatSetInvoicingMode
	} from '$lib/api/generated/sdk.gen';
	import type { LayoutData } from '../$types';

	interface Props {
		data: LayoutData;
	}

	const { data }: Props = $props();

	const slug = $derived(data.organization.slug);
	const accessToken = $derived(authStore.accessToken);
	const queryClient = useQueryClient();

	// ─── Billing Info Query ─────────────────────────────────────────
	const billingQuery = browser
		? createQuery(() => ({
				queryKey: ['billing-info', slug],
				queryFn: async () => {
					const response = await organizationadminvatGetBillingInfo({
						path: { slug },
						headers: { Authorization: `Bearer ${accessToken}` }
					});
					if (response.error) throw new Error('Failed to load billing info');
					return response.data!;
				},
				enabled: !!accessToken
			}))
		: null;

	// ─── Billing Info Form State ────────────────────────────────────
	let billingName = $state('');
	let billingAddress = $state('');
	let billingEmail = $state('');
	let billingFormDirty = $state(false);

	// Sync form with query data
	$effect(() => {
		if (billingQuery?.data && !billingFormDirty) {
			billingName = billingQuery.data.billing_name || '';
			billingAddress = billingQuery.data.billing_address || '';
			billingEmail = billingQuery.data.billing_email || '';
		}
	});

	function markBillingDirty() {
		billingFormDirty = true;
	}

	// ─── Update Billing Info Mutation ───────────────────────────────
	const updateBillingMutation = browser
		? createMutation(() => ({
				mutationFn: async () => {
					const body: Record<string, string | number | null> = {};
					body.billing_name = billingName || null;
					body.billing_address = billingAddress || null;
					body.billing_email = billingEmail || null;

					const response = await organizationadminvatUpdateBillingInfo({
						path: { slug },
						headers: { Authorization: `Bearer ${accessToken}` },
						body: body as any
					});
					if (response.error) {
						const msg = extractErrorMessage(
							response.error,
							m['orgAdmin.billing.billingInfo.error']()
						);
						throw new Error(msg);
					}
					return response.data!;
				},
				onSuccess: () => {
					billingFormDirty = false;
					queryClient.invalidateQueries({ queryKey: ['billing-info', slug] });
					invalidateAll();
					toast.success(m['orgAdmin.billing.billingInfo.saved']());
				},
				onError: (error: Error) => {
					toast.error(error.message);
				}
			}))
		: null;

	function handleSaveBillingInfo(e: Event) {
		e.preventDefault();
		updateBillingMutation?.mutate();
	}

	// ─── Invoicing Mode ────────────────────────────────────────────
	let invoicingMode = $state('none');

	$effect(() => {
		if (billingQuery?.data?.invoicing_mode) {
			invoicingMode = billingQuery.data.invoicing_mode;
		}
	});

	const setInvoicingModeMutation = browser
		? createMutation(() => ({
				mutationFn: async () => {
					const response = await organizationadminvatSetInvoicingMode({
						path: { slug },
						headers: { Authorization: `Bearer ${accessToken}` },
						body: { mode: invoicingMode as 'none' | 'hybrid' | 'auto' }
					});
					if (response.error) {
						const msg = extractErrorMessage(
							response.error,
							m['orgAdmin.billing.invoicingMode.error']()
						);
						throw new Error(msg);
					}
					return response.data!;
				},
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ['billing-info', slug] });
					toast.success(m['orgAdmin.billing.invoicingMode.saved']());
				},
				onError: (error: Error) => {
					toast.error(error.message);
				}
			}))
		: null;
</script>

<svelte:head>
	<title>{m['orgAdmin.billing.pageTitle']()} - {data.organization.name}</title>
</svelte:head>

<div class="space-y-8 px-4">
	<!-- Page Header -->
	<div>
		<h1 class="text-2xl font-bold tracking-tight">{m['orgAdmin.billing.pageTitle']()}</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			{m['orgAdmin.billing.pageDescription']()}
		</p>
	</div>

	<!-- Quick Links -->
	<div class="flex flex-wrap gap-3">
		<a
			href="/org/{slug}/admin/billing/invoices"
			class="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
		>
			<FileText class="h-4 w-4" aria-hidden="true" />
			{m['orgAdmin.billing.invoices.title']()}
		</a>
		<a
			href="/org/{slug}/admin/billing/credit-notes"
			class="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
		>
			<Receipt class="h-4 w-4" aria-hidden="true" />
			{m['orgAdmin.billing.creditNotes.title']()}
		</a>
		<a
			href="/org/{slug}/admin/billing/attendee-invoices"
			class="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
		>
			<Users class="h-4 w-4" aria-hidden="true" />
			{m['orgAdmin.billing.attendeeInvoices.title']()}
		</a>
		<a
			href="/org/{slug}/admin/billing/attendee-credit-notes"
			class="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
		>
			<Receipt class="h-4 w-4" aria-hidden="true" />
			{m['orgAdmin.billing.attendeeCreditNotes.title']()}
		</a>
	</div>

	{#if billingQuery?.isLoading}
		<div class="flex items-center justify-center py-12">
			<Loader2
				class="h-6 w-6 animate-spin text-muted-foreground"
				aria-label={m['common.loading']()}
			/>
		</div>
	{:else if billingQuery?.error}
		<div
			class="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive"
			role="alert"
		>
			<AlertCircle class="h-5 w-5 shrink-0" aria-hidden="true" />
			<p class="text-sm">{extractErrorMessage(billingQuery.error)}</p>
		</div>
	{:else}
		<!-- ────────────────────────────────────────────────────────────
		     Section 0: Attendee Invoicing Mode
		     ──────────────────────────────────────────────────────────── -->
		<section class="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
			<div class="flex items-center gap-2">
				<Users class="h-5 w-5 text-muted-foreground" aria-hidden="true" />
				<div>
					<h2 class="text-lg font-semibold">
						{m['orgAdmin.billing.invoicingMode.title']()}
					</h2>
					<p class="text-sm text-muted-foreground">
						{m['orgAdmin.billing.invoicingMode.description']()}
					</p>
				</div>
			</div>

			<RadioGroup.Root
				value={invoicingMode}
				onValueChange={(value) => {
					if (value) invoicingMode = value;
				}}
			>
				<div class="space-y-3">
					<div class="flex items-start space-x-3">
						<RadioGroup.Item value="none" id="invoicing-none" class="mt-0.5" />
						<div>
							<Label for="invoicing-none" class="font-medium">
								{m['orgAdmin.billing.invoicingMode.none']()}
							</Label>
							<p class="text-sm text-muted-foreground">
								{m['orgAdmin.billing.invoicingMode.noneDescription']()}
							</p>
						</div>
					</div>
					<div class="flex items-start space-x-3">
						<RadioGroup.Item value="hybrid" id="invoicing-hybrid" class="mt-0.5" />
						<div>
							<Label for="invoicing-hybrid" class="font-medium">
								{m['orgAdmin.billing.invoicingMode.hybrid']()}
							</Label>
							<p class="text-sm text-muted-foreground">
								{m['orgAdmin.billing.invoicingMode.hybridDescription']()}
							</p>
						</div>
					</div>
					<div class="flex items-start space-x-3">
						<RadioGroup.Item value="auto" id="invoicing-auto" class="mt-0.5" />
						<div>
							<Label for="invoicing-auto" class="font-medium">
								{m['orgAdmin.billing.invoicingMode.auto']()}
							</Label>
							<p class="text-sm text-muted-foreground">
								{m['orgAdmin.billing.invoicingMode.autoDescription']()}
							</p>
						</div>
					</div>
				</div>
			</RadioGroup.Root>

			<div class="flex justify-end">
				<Button
					onclick={() => setInvoicingModeMutation?.mutate()}
					disabled={setInvoicingModeMutation?.isPending}
				>
					{#if setInvoicingModeMutation?.isPending}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
						{m['orgAdmin.billing.invoicingMode.saving']()}
					{:else}
						{m['common.actions_save']()}
					{/if}
				</Button>
			</div>
		</section>

		<!-- ────────────────────────────────────────────────────────────
		     Section 1: Billing Information Form
		     ──────────────────────────────────────────────────────────── -->
		<section class="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
			<div class="flex items-center gap-2">
				<Receipt class="h-5 w-5 text-muted-foreground" aria-hidden="true" />
				<div>
					<h2 class="text-lg font-semibold">{m['orgAdmin.billing.billingInfo.title']()}</h2>
					<p class="text-sm text-muted-foreground">
						{m['orgAdmin.billing.billingInfo.description']()}
					</p>
				</div>
			</div>

			<form onsubmit={handleSaveBillingInfo} class="space-y-4">
				<!-- Billing Name -->
				<div class="space-y-2">
					<Label for="billing-name">{m['orgAdmin.billing.billingInfo.billingName']()}</Label>
					<Input
						id="billing-name"
						type="text"
						placeholder={m['orgAdmin.billing.billingInfo.billingNamePlaceholder']()}
						bind:value={billingName}
						oninput={markBillingDirty}
					/>
					<p class="text-xs text-muted-foreground">
						{m['orgAdmin.billing.billingInfo.billingNameHelp']()}
					</p>
				</div>

				<!-- Billing Address -->
				<div class="space-y-2">
					<Label for="billing-address">{m['orgAdmin.billing.billingInfo.billingAddress']()}</Label>
					<Textarea
						id="billing-address"
						placeholder={m['orgAdmin.billing.billingInfo.billingAddressPlaceholder']()}
						bind:value={billingAddress}
						oninput={markBillingDirty}
						rows={3}
					/>
				</div>

				<!-- Billing Email -->
				<div class="space-y-2">
					<Label for="billing-email">{m['orgAdmin.billing.billingInfo.billingEmail']()}</Label>
					<Input
						id="billing-email"
						type="email"
						placeholder={m['orgAdmin.billing.billingInfo.billingEmailPlaceholder']()}
						bind:value={billingEmail}
						oninput={markBillingDirty}
					/>
					<p class="text-xs text-muted-foreground">
						{m['orgAdmin.billing.billingInfo.billingEmailHelp']()}
					</p>
				</div>

				<!-- Save Button -->
				<div class="flex justify-end">
					<Button type="submit" disabled={updateBillingMutation?.isPending || !billingFormDirty}>
						{#if updateBillingMutation?.isPending}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
							{m['orgAdmin.billing.billingInfo.saving']()}
						{:else}
							{m['orgAdmin.billing.billingInfo.saveButton']()}
						{/if}
					</Button>
				</div>
			</form>
		</section>
	{/if}
</div>
