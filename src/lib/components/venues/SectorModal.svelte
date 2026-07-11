<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import type {
		VenueSectorWithSeatsSchema,
		VenueSectorCreateSchema
	} from '$lib/api/generated/types.gen';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import {
		organizationadminvenuesCreateSector,
		organizationadminvenuesUpdateSector
	} from '$lib/api/generated/sdk.gen';
	import { authStore } from '$lib/stores/auth.svelte';
	import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
	import { toast } from 'svelte-sonner';

	interface Props {
		sector: VenueSectorWithSeatsSchema | null;
		organizationSlug: string;
		venueId: string;
		onClose: () => void;
		onSuccess: () => void;
	}

	const { sector, organizationSlug, venueId, onClose, onSuccess }: Props = $props();

	const isEditing = $derived(!!sector);
	const accessToken = $derived(authStore.accessToken);
	const queryClient = useQueryClient();

	// Form state
	let name = $state(sector?.name ?? '');
	let code = $state(sector?.code ?? '');
	let capacity = $state<number | undefined>(sector?.capacity ?? undefined);
	let displayOrder = $state(sector?.display_order ?? 0);

	// Create mutation
	const createMutationFn = createMutation(() => ({
		mutationFn: async (data: VenueSectorCreateSchema) => {
			const response = await organizationadminvenuesCreateSector({
				path: { slug: organizationSlug, venue_id: venueId },
				body: data,
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			});

			if (response.error) {
				throw new Error('Failed to create sector');
			}

			return response.data;
		},
		onSuccess: () => {
			toast.success(m['orgAdmin.sectors.toast.created']());
			queryClient.invalidateQueries({ queryKey: ['venue-sectors'] });
			onSuccess();
		},
		onError: () => {
			toast.error(m['orgAdmin.sectors.toast.createError']());
		}
	}));

	// Update mutation
	const updateMutationFn = createMutation(() => ({
		mutationFn: async (data: Omit<VenueSectorCreateSchema, 'seats'>) => {
			if (!sector?.id) throw new Error('No sector ID');

			const response = await organizationadminvenuesUpdateSector({
				path: { slug: organizationSlug, venue_id: venueId, sector_id: sector.id },
				body: data,
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			});

			if (response.error) {
				throw new Error('Failed to update sector');
			}

			return response.data;
		},
		onSuccess: () => {
			toast.success(m['orgAdmin.sectors.toast.updated']());
			queryClient.invalidateQueries({ queryKey: ['venue-sectors'] });
			onSuccess();
		},
		onError: () => {
			toast.error(m['orgAdmin.sectors.toast.updateError']());
		}
	}));

	const isPending = $derived(createMutationFn.isPending || updateMutationFn.isPending);

	function handleSubmit(e: Event) {
		e.preventDefault();

		const data: VenueSectorCreateSchema = {
			name: name.trim(),
			code: code.trim() || undefined,
			capacity: capacity || undefined,
			display_order: displayOrder,
			seats: []
		};

		if (isEditing) {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { seats, ...updateData } = data;
			updateMutationFn.mutate(updateData);
		} else {
			createMutationFn.mutate(data);
		}
	}

	function handleOpenChange(open: boolean) {
		if (!open) onClose();
	}
</script>

<Dialog open={true} onOpenChange={handleOpenChange}>
	<DialogContent class="sm:max-w-lg">
		<DialogHeader>
			<DialogTitle class="text-xl font-semibold">
				{isEditing
					? m['orgAdmin.sectors.form.editTitle']()
					: m['orgAdmin.sectors.form.createTitle']()}
			</DialogTitle>
		</DialogHeader>

		<!-- Form -->
		<form onsubmit={handleSubmit}>
			<div class="space-y-4">
				<!-- Name -->
				<div>
					<label for="sector-name" class="mb-1.5 block text-sm font-medium">
						{m['orgAdmin.sectors.form.nameLabel']()}
					</label>
					<input
						id="sector-name"
						type="text"
						bind:value={name}
						placeholder={m['orgAdmin.sectors.form.namePlaceholder']()}
						required
						class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					/>
				</div>

				<!-- Code -->
				<div>
					<label for="sector-code" class="mb-1.5 block text-sm font-medium">
						{m['orgAdmin.sectors.form.codeLabel']()}
					</label>
					<input
						id="sector-code"
						type="text"
						bind:value={code}
						placeholder={m['orgAdmin.sectors.form.codePlaceholder']()}
						maxlength="30"
						class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					/>
					<p class="mt-1 text-xs text-muted-foreground">
						{m['orgAdmin.sectors.form.codeHelp']()}
					</p>
				</div>

				<!-- Capacity -->
				<div>
					<label for="sector-capacity" class="mb-1.5 block text-sm font-medium">
						{m['orgAdmin.sectors.form.capacityLabel']()}
					</label>
					<input
						id="sector-capacity"
						type="number"
						min="0"
						bind:value={capacity}
						placeholder={m['orgAdmin.sectors.form.capacityPlaceholder']()}
						class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					/>
					<p class="mt-1 text-xs text-muted-foreground">
						{m['orgAdmin.sectors.form.capacityHelp']()}
					</p>
				</div>

				<!-- Display Order -->
				<div>
					<label for="sector-display-order" class="mb-1.5 block text-sm font-medium">
						{m['orgAdmin.sectors.form.displayOrderLabel']()}
					</label>
					<input
						id="sector-display-order"
						type="number"
						min="0"
						bind:value={displayOrder}
						class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					/>
					<p class="mt-1 text-xs text-muted-foreground">
						{m['orgAdmin.sectors.form.displayOrderHelp']()}
					</p>
				</div>
			</div>

			<!-- Actions -->
			<div class="mt-6 flex justify-end gap-3">
				<button
					type="button"
					onclick={onClose}
					disabled={isPending}
					class="rounded-md border border-input px-4 py-2 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
				>
					{m['orgAdmin.sectors.form.cancel']()}
				</button>
				<button
					type="submit"
					disabled={isPending || !name.trim()}
					class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
				>
					{#if isPending}
						{isEditing
							? m['orgAdmin.sectors.form.saving']()
							: m['orgAdmin.sectors.form.creating']()}
					{:else}
						{isEditing ? m['orgAdmin.sectors.form.save']() : m['orgAdmin.sectors.form.create']()}
					{/if}
				</button>
			</div>
		</form>
	</DialogContent>
</Dialog>
