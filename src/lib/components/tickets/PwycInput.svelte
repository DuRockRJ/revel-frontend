<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { calculateBuyerFee, formatMoney, type BuyerFeeRate } from '$lib/utils/format';

	interface Props {
		currency: string;
		minAmount: number;
		maxAmount: number | null;
		pwycAmount: string;
		pwycError: string;
		isProcessing: boolean;
		suggestions: number[];
		/** Buyer-fee rate ingredients, for a live fee preview as the amount is typed. */
		buyerFeeRate?: BuyerFeeRate;
		/** Number of tickets being purchased at this PWYC amount (the percent-fee scales with
		 * the batch total, but the fixed fee is only ever charged once per checkout). */
		quantity?: number;
		onAmountChange: (value: string) => void;
		onKeydown: (e: KeyboardEvent) => void;
	}

	const {
		currency,
		minAmount,
		maxAmount,
		pwycAmount,
		pwycError,
		isProcessing,
		suggestions,
		buyerFeeRate,
		quantity = 1,
		onAmountChange,
		onKeydown
	}: Props = $props();

	// Derive aria-invalid from error and validation state
	const hasError = $derived(!!pwycError);

	// Live fee preview, recomputed client-side as the buyer types their amount.
	const buyerFeeAmount = $derived.by(() => {
		if (!buyerFeeRate) return null;
		const value = parseFloat(pwycAmount);
		if (!Number.isFinite(value)) return null;
		return calculateBuyerFee(value * quantity, buyerFeeRate);
	});
</script>

<div class="space-y-3">
	<div class="space-y-2">
		<Label for="pwyc-amount">{m['ticketConfirmationDialog.paymentAmount']()}</Label>
		<div class="text-xs text-muted-foreground">
			{m['pwycModal.rangeLabel']()}: {formatMoney(minAmount, currency)} - {maxAmount !== null
				? formatMoney(maxAmount, currency)
				: m['ticketConfirmationDialog.anyAmount']()}
		</div>
		<div class="relative">
			<span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
				{currency}
			</span>
			<Input
				id="pwyc-amount"
				type="text"
				inputmode="decimal"
				value={pwycAmount}
				oninput={(e) => {
					const val = (e.currentTarget as HTMLInputElement).value
						.replace(/,/g, '.')
						.replace(/[^\d.]/g, '');
					onAmountChange(val);
				}}
				onkeydown={onKeydown}
				class="pl-12 text-lg font-semibold"
				placeholder={minAmount.toFixed(2)}
				disabled={isProcessing}
				aria-invalid={hasError ? 'true' : 'false'}
				aria-describedby={hasError ? 'amount-error' : undefined}
			/>
		</div>
		{#if pwycError}
			<p id="amount-error" class="text-sm text-destructive" role="alert">
				{pwycError}
			</p>
		{/if}
		{#if buyerFeeAmount !== null && buyerFeeAmount > 0}
			<p class="text-sm text-muted-foreground">
				{m['ticketConfirmationDialog.serviceFee']()}: {formatMoney(buyerFeeAmount, currency)} ·
				{m['ticketConfirmationDialog.totalWithFee']({
					amount: formatMoney(parseFloat(pwycAmount) * quantity + buyerFeeAmount, currency)
				})}
			</p>
		{/if}
	</div>

	<!-- Quick Amount Suggestions -->
	<div class="space-y-2">
		<p class="text-sm font-medium">{m['ticketConfirmationDialog.quickSelect']()}</p>
		<div class="grid grid-cols-3 gap-2">
			{#each suggestions as suggested (suggested)}
				<Button
					variant="outline"
					size="sm"
					onclick={() => {
						onAmountChange(suggested.toFixed(2));
					}}
					disabled={isProcessing}
				>
					{formatMoney(suggested, currency)}
				</Button>
			{/each}
		</div>
	</div>
</div>
