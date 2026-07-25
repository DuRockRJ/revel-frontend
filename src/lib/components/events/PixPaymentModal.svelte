<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Copy, Check } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	interface Props {
		open: boolean;
		/** The Pix "Copia e Cola" payload string. */
		payload: string;
		/** The QR code image as a data: URI. */
		qrCodeDataUri: string;
		onClose: () => void;
	}

	let { open = $bindable(), payload, qrCodeDataUri, onClose }: Props = $props();

	let copied = $state(false);

	async function copyPayload() {
		try {
			await navigator.clipboard.writeText(payload);
			copied = true;
			toast.success(m['pixPaymentModal.payloadCopied']());
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch {
			toast.error(m['pixPaymentModal.copyFailed']());
		}
	}
</script>

<Dialog bind:open onOpenChange={(isOpen) => !isOpen && onClose()}>
	<DialogContent class="max-w-sm">
		<DialogHeader>
			<DialogTitle>{m['pixPaymentModal.title']()}</DialogTitle>
			<DialogDescription>{m['pixPaymentModal.description']()}</DialogDescription>
		</DialogHeader>

		<div class="flex flex-col items-center gap-4">
			<img
				src={qrCodeDataUri}
				alt={m['pixPaymentModal.qrCodeAlt']()}
				class="h-56 w-56 rounded-md border border-border"
			/>

			<Button variant="outline" class="w-full" onclick={copyPayload}>
				{#if copied}
					<Check class="h-4 w-4" aria-hidden="true" />
					{m['pixPaymentModal.copied']()}
				{:else}
					<Copy class="h-4 w-4" aria-hidden="true" />
					{m['pixPaymentModal.copyPayload']()}
				{/if}
			</Button>

			<p class="text-center text-sm text-muted-foreground">
				{m['pixPaymentModal.pendingConfirmation']()}
			</p>
		</div>
	</DialogContent>
</Dialog>
