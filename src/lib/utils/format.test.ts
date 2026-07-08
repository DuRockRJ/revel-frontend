import { describe, expect, it } from 'vitest';
import { calculateBuyerFee } from './format';

describe('calculateBuyerFee', () => {
	it('computes percent + fixed fee with no VAT', () => {
		const fee = calculateBuyerFee(20, { percent: '5', fixedAmount: '1', vatRate: '0' });
		expect(fee).toBeCloseTo(2); // 20 * 5% + 1 = 2
	});

	it('grosses up the fee by the VAT rate', () => {
		const fee = calculateBuyerFee(100, { percent: '10', fixedAmount: '0', vatRate: '20' });
		expect(fee).toBeCloseTo(12); // (100 * 10%) * 1.2 = 12
	});

	it('returns null when any rate ingredient is missing', () => {
		expect(calculateBuyerFee(20, { percent: null, fixedAmount: '1', vatRate: '0' })).toBeNull();
		expect(
			calculateBuyerFee(20, { percent: '5', fixedAmount: undefined, vatRate: '0' })
		).toBeNull();
		expect(calculateBuyerFee(20, { percent: '5', fixedAmount: '1', vatRate: null })).toBeNull();
	});

	it('returns null when a rate ingredient is not a valid number', () => {
		expect(calculateBuyerFee(20, { percent: 'abc', fixedAmount: '1', vatRate: '0' })).toBeNull();
	});
});
