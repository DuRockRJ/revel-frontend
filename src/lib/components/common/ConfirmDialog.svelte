<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { cn } from '$lib/utils/cn';
	import { AlertTriangle } from 'lucide-svelte';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription
	} from '$lib/components/ui/dialog';

	interface Props {
		isOpen: boolean;
		title: string;
		message: string;
		confirmText?: string;
		cancelText?: string;
		variant?: 'warning' | 'danger' | 'info';
		onConfirm: () => void;
		onCancel: () => void;
		class?: string;
	}

	const {
		isOpen,
		title,
		message,
		confirmText = m['confirmDialog.confirm'](),
		cancelText = m['confirmDialog.cancel'](),
		variant = 'warning',
		onConfirm,
		onCancel,
		class: className
	}: Props = $props();
</script>

<!--
  Confirm Dialog Component

  A reusable confirmation dialog. Built on the shadcn/bits-ui Dialog primitive, which
  handles focus trapping, auto-focus on open, focus return to the trigger on close, and
  Escape/overlay dismissal.

  @component
  @example
  <ConfirmDialog
    isOpen={showDialog}
    title="Confirm Action"
    message="Are you sure you want to proceed?"
    onConfirm={handleConfirm}
    onCancel={handleCancel}
  />
-->
<Dialog
	open={isOpen}
	onOpenChange={(open) => {
		if (!open) onCancel();
	}}
>
	<DialogContent class={cn('sm:max-w-lg', className)}>
		<DialogHeader>
			<div class="flex items-start gap-4">
				<div
					class={cn(
						'shrink-0 rounded-full p-3',
						variant === 'warning' &&
							'bg-yellow-100 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400',
						variant === 'danger' && 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400',
						variant === 'info' && 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
					)}
					aria-hidden="true"
				>
					<AlertTriangle class="h-6 w-6" />
				</div>

				<div class="flex-1 pt-1 text-left">
					<DialogTitle class="text-lg font-semibold text-foreground">
						{title}
					</DialogTitle>
				</div>
			</div>
		</DialogHeader>

		<!-- Message -->
		<DialogDescription>
			{message}
		</DialogDescription>

		<!-- Actions -->
		<div class="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
			<button
				type="button"
				onclick={onCancel}
				class="rounded-md border border-input bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			>
				{cancelText}
			</button>
			<button
				type="button"
				onclick={onConfirm}
				class={cn(
					'rounded-md px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
					variant === 'warning' &&
						'bg-yellow-600 text-white hover:bg-yellow-700 focus-visible:ring-yellow-600 dark:bg-yellow-500 dark:hover:bg-yellow-600',
					variant === 'danger' &&
						'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600 dark:bg-red-500 dark:hover:bg-red-600',
					variant === 'info' &&
						'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600'
				)}
			>
				{confirmText}
			</button>
		</div>
	</DialogContent>
</Dialog>
