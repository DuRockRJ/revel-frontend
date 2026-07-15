<script lang="ts">
	// 1. Imports
	import * as m from '$lib/paraglide/messages.js';
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Check, AlertCircle, AlertTriangle, Loader2 } from 'lucide-svelte';
	import {
		userbillingGetBillingProfile,
		userbillingCreateBillingProfile,
		userbillingUpdateBillingProfile
	} from '$lib/api/generated/sdk.gen';
	import type { UserBillingProfileSchema } from '$lib/api/generated/types.gen';

	// 2. Props interface
	interface Props {
		authToken: string | null;
	}

	const { authToken }: Props = $props();

	// 3. Query client
	const queryClient = useQueryClient();

	// 4. Fetch billing profile
	const billingQuery = createQuery<UserBillingProfileSchema | null>(() => ({
		queryKey: ['user-billing-profile'],
		queryFn: async () => {
			if (!authToken) return null;
			const response = await userbillingGetBillingProfile({
				headers: { Authorization: `Bearer ${authToken}` }
			});
			if (response.response?.status === 404) return null;
			if (response.error) throw new Error('Failed to fetch billing profile');
			return (response.data as UserBillingProfileSchema) ?? null;
		},
		enabled: !!authToken,
		retry: false,
		staleTime: 60_000
	}));

	// 5. Derived profile state
	const billingProfile = $derived(billingQuery.data ?? null);
	const hasBillingProfile = $derived(billingProfile !== null && billingProfile !== undefined);
	const isBillingComplete = $derived(
		hasBillingProfile && !!billingProfile?.billing_name && !!billingProfile?.billing_address
	);

	// 6. Form state
	let billingName = $state('');
	let billingAddress = $state('');
	let billingEmail = $state('');
	let saveStatus = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');

	// 7. Sync form from query data
	$effect(() => {
		if (billingProfile) {
			billingName = billingProfile.billing_name ?? '';
			billingAddress = billingProfile.billing_address ?? '';
			billingEmail = billingProfile.billing_email ?? '';
		}
	});

	// 8. Save mutation
	const saveMutation = createMutation(() => ({
		mutationFn: async () => {
			const headers = { Authorization: `Bearer ${authToken}` };
			const body = {
				billing_name: billingName,
				billing_address: billingAddress,
				...(billingEmail.trim() ? { billing_email: billingEmail.trim() } : {})
			};

			if (hasBillingProfile) {
				const response = await userbillingUpdateBillingProfile({ headers, body });
				if (response.error) throw new Error('Failed to update billing profile');
				return response.data;
			} else {
				const response = await userbillingCreateBillingProfile({ headers, body });
				if (response.error) throw new Error('Failed to create billing profile');
				return response.data;
			}
		},
		onSuccess: () => {
			saveStatus = 'saved';
			queryClient.invalidateQueries({ queryKey: ['user-billing-profile'] });
			toast.success(m['billing.form.saved']());
			setTimeout(() => (saveStatus = 'idle'), 2000);
		},
		onError: () => {
			saveStatus = 'error';
			toast.error(m['billing.form.error']());
			setTimeout(() => (saveStatus = 'idle'), 3000);
		}
	}));

	// 9. Submit handler
	function handleSave(): void {
		saveStatus = 'saving';
		saveMutation.mutate();
	}
</script>

<!-- Incomplete warning (only shown when profile exists but is incomplete) -->
{#if hasBillingProfile && !isBillingComplete}
	<div
		class="mt-4 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/30"
		role="alert"
		aria-live="polite"
	>
		<AlertTriangle
			class="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400"
			aria-hidden="true"
		/>
		<div>
			<p class="font-medium text-amber-900 dark:text-amber-100">
				{m['billing.form.incomplete']()}
			</p>
			<p class="mt-1 text-sm text-amber-800 dark:text-amber-200">
				{m['billing.form.incompleteDescription']()}
			</p>
		</div>
	</div>
{/if}

<!-- Billing form -->
<form
	onsubmit={(e) => {
		e.preventDefault();
		handleSave();
	}}
	class="mt-4 space-y-4"
	aria-label={m['billing.form.title']()}
	novalidate
>
	<!-- Billing Name -->
	<div class="space-y-2">
		<Label for="billingName">
			{m['billing.form.billingName']()}
			<span aria-hidden="true" class="ml-0.5 text-destructive">*</span>
			<span class="sr-only">(required)</span>
		</Label>
		<Input
			id="billingName"
			bind:value={billingName}
			placeholder={m['billing.form.billingNamePlaceholder']()}
			required
			aria-required="true"
			autocomplete="organization"
		/>
	</div>

	<!-- Billing Address -->
	<div class="space-y-2">
		<Label for="billingAddress">
			{m['billing.form.billingAddress']()}
			<span aria-hidden="true" class="ml-0.5 text-destructive">*</span>
			<span class="sr-only">(required)</span>
		</Label>
		<Input
			id="billingAddress"
			bind:value={billingAddress}
			placeholder={m['billing.form.billingAddressPlaceholder']()}
			required
			aria-required="true"
			autocomplete="street-address"
		/>
	</div>

	<!-- Billing Email (optional) -->
	<div class="space-y-2">
		<Label for="billingEmail">
			{m['billing.form.billingEmail']()}
		</Label>
		<Input
			id="billingEmail"
			type="email"
			bind:value={billingEmail}
			placeholder={m['billing.form.billingEmailPlaceholder']()}
			autocomplete="email"
		/>
	</div>

	<!-- Submit -->
	<div class="flex items-center gap-3">
		<Button
			type="submit"
			disabled={saveMutation.isPending || !billingName.trim()}
			aria-busy={saveStatus === 'saving'}
		>
			{#if saveStatus === 'saving'}
				<Loader2 class="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
				{m['billing.form.saving']()}
			{:else if saveStatus === 'saved'}
				<Check class="mr-2 h-4 w-4" aria-hidden="true" />
				{m['billing.form.saved']()}
			{:else}
				{hasBillingProfile ? m['billing.form.update']() : m['billing.form.save']()}
			{/if}
		</Button>

		{#if saveStatus === 'error'}
			<span class="text-sm text-destructive" role="alert" aria-live="assertive">
				<AlertCircle class="mr-1 inline h-4 w-4" aria-hidden="true" />
				{m['billing.form.error']()}
			</span>
		{/if}
	</div>
</form>
