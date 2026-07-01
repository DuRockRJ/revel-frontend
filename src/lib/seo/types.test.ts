import { describe, it, expect } from 'vitest';
import { LANGS, X_DEFAULT, SITE_NAME, TWITTER_SITE, OG_LOCALE } from '$lib/seo/constants';

describe('seo constants', () => {
	it('exports the single supported UI language', () => {
		expect(LANGS).toEqual(['pt']);
	});

	it('maps each lang to an OG locale', () => {
		expect(OG_LOCALE).toEqual({
			pt: 'pt_BR',
			en: 'en_US'
		});
	});

	it('defines x-default sentinel', () => {
		expect(X_DEFAULT).toBe('x-default');
	});

	it('defines site name and twitter handle', () => {
		expect(SITE_NAME).toBe('DuRock RJ');
		expect(TWITTER_SITE).toBe('@letsrevel');
	});
});
