import { describe, it, expect } from 'vitest';
import { resolveLang } from '$lib/seo/server';

describe('resolveLang', () => {
	it('always returns pt (single-locale site), regardless of Accept-Language', () => {
		const req = new Request('https://x.test/', {
			headers: { 'accept-language': 'en-US,en;q=0.9' }
		});
		expect(resolveLang(req)).toBe('pt');
	});

	it('returns pt when no header is set', () => {
		const req = new Request('https://x.test/');
		expect(resolveLang(req)).toBe('pt');
	});
});
