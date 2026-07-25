import { describe, it, expect } from 'vitest';
import { formatCityRegion } from './city';

describe('formatCityRegion', () => {
	it('combines city and region when they differ', () => {
		expect(formatCityRegion({ name: 'Copacabana', admin_name: 'Zona Sul' })).toBe(
			'Copacabana, Zona Sul'
		);
	});

	it('falls back to just the name when there is no region', () => {
		expect(formatCityRegion({ name: 'Copacabana', admin_name: null })).toBe('Copacabana');
		expect(formatCityRegion({ name: 'Copacabana' })).toBe('Copacabana');
	});

	it('avoids repeating the name when the region matches it (e.g. the Centro bairro)', () => {
		expect(formatCityRegion({ name: 'Centro', admin_name: 'Centro' })).toBe('Centro');
	});
});
