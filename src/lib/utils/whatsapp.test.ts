import { describe, it, expect } from 'vitest';
import { buildWhatsappLink } from './whatsapp';

describe('buildWhatsappLink', () => {
	it('extracts the phone number from a wa.me URL', () => {
		expect(buildWhatsappLink('https://wa.me/5521999999999')).toBe(
			'https://wa.me/5521999999999?text=Ol%C3%A1!%20Encontrei%20voc%C3%AAs%20pelo%20DuRock%20RJ%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es.'
		);
	});

	it('extracts the phone number from an api.whatsapp.com/send?phone= URL', () => {
		const result = buildWhatsappLink('https://api.whatsapp.com/send?phone=5521999999999');
		expect(result).toBe(
			'https://wa.me/5521999999999?text=Ol%C3%A1!%20Encontrei%20voc%C3%AAs%20pelo%20DuRock%20RJ%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es.'
		);
	});

	it('always uses the same pre-filled greeting message', () => {
		const a = buildWhatsappLink('https://wa.me/5521111111111');
		const b = buildWhatsappLink('https://wa.me/5521222222222');
		const textParam = (url: string) => new URL(url).searchParams.get('text');
		expect(textParam(a)).toBe(textParam(b));
	});
});
