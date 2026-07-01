import { describe, it, expect } from 'vitest';
import { sameUrlHreflang, selfHreflang } from '$lib/seo/hreflang';

describe('sameUrlHreflang', () => {
	it('returns pt/x-default both pointing to the same absolute URL', () => {
		const result = sameUrlHreflang('https://letsrevel.io/events');
		expect(result).toEqual([
			{ lang: 'pt', href: 'https://letsrevel.io/events' },
			{ lang: 'x-default', href: 'https://letsrevel.io/events' }
		]);
	});
});

describe('selfHreflang', () => {
	it('emits the page own lang plus x-default, both pointing at the same URL', () => {
		const result = selfHreflang('en', 'https://letsrevel.io/eventbrite-alternative');
		expect(result).toEqual([
			{ lang: 'en', href: 'https://letsrevel.io/eventbrite-alternative' },
			{ lang: 'x-default', href: 'https://letsrevel.io/eventbrite-alternative' }
		]);
	});
});
