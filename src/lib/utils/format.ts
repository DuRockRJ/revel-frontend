/**
 * Formatting utilities for prices and currencies.
 */

import { getDateLocale } from './date';

/**
 * Format a price with currency using Intl.NumberFormat.
 * Returns `freeLabel` when the price is zero, null, or undefined.
 */
export function formatPrice(
	price: number | string | undefined | null,
	currency?: string | null,
	freeLabel = 'Free'
): string {
	if (price === undefined || price === null) return freeLabel;
	const numPrice = typeof price === 'string' ? parseFloat(price) : price;
	if (numPrice === 0) return freeLabel;
	const currencyCode = currency?.toUpperCase() || 'BRL';
	return new Intl.NumberFormat(getDateLocale(), {
		style: 'currency',
		currency: currencyCode
	}).format(numPrice);
}

/** Rate ingredients for the buyer-facing platform fee, as exposed on TicketTierSchema. */
export interface BuyerFeeRate {
	percent: string | null | undefined;
	fixedAmount: string | null | undefined;
	vatRate: string | null | undefined;
}

/**
 * Compute the buyer-facing platform fee for a given price.
 *
 * Mirrors the backend's `events.service.vat_service.BuyerFeeRate` formula:
 * `net = price * percent / 100 + fixed_amount`, `gross = net * (1 + vat_rate / 100)`.
 * Returns `null` when any rate ingredient is missing (offline tiers never carry
 * buyer-fee data; online tiers can also be `null` if the FX rate isn't seeded).
 */
export function calculateBuyerFee(price: number, rate: BuyerFeeRate): number | null {
	if (rate.percent == null || rate.fixedAmount == null || rate.vatRate == null) return null;
	const percent = parseFloat(rate.percent);
	const fixedAmount = parseFloat(rate.fixedAmount);
	const vatRate = parseFloat(rate.vatRate);
	if (!Number.isFinite(percent) || !Number.isFinite(fixedAmount) || !Number.isFinite(vatRate)) {
		return null;
	}
	const net = (price * percent) / 100 + fixedAmount;
	return net * (1 + vatRate / 100);
}

/**
 * Format a monetary amount with currency, always showing the numeric value
 * (including zero, e.g. "R$ 0,00"). Unlike {@link formatPrice} it never
 * substitutes a "Free" label — use it for accounting figures (revenue, net,
 * refunds) where a zero amount is meaningful.
 */
export function formatMoney(
	amount: number | string | null | undefined,
	currency?: string | null
): string {
	const parsed = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
	const safe = Number.isFinite(parsed) ? parsed : 0;
	const currencyCode = currency?.toUpperCase() || 'BRL';
	try {
		return new Intl.NumberFormat(getDateLocale(), {
			style: 'currency',
			currency: currencyCode
		}).format(safe);
	} catch {
		// Intl.NumberFormat throws RangeError on a malformed currency code
		// (not exactly 3 letters). Fall back to BRL rather than break rendering.
		return new Intl.NumberFormat(getDateLocale(), {
			style: 'currency',
			currency: 'BRL'
		}).format(safe);
	}
}
