import { describe, it, expect } from 'vitest';
import { sameUrlHreflang } from '$lib/seo/hreflang';

describe('sameUrlHreflang', () => {
	it('returns pt/x-default both pointing to the same absolute URL', () => {
		const result = sameUrlHreflang('https://letsrevel.io/events');
		expect(result).toEqual([
			{ lang: 'pt', href: 'https://letsrevel.io/events' },
			{ lang: 'x-default', href: 'https://letsrevel.io/events' }
		]);
	});
});
