const CONTACT_MESSAGE = 'Olá! Encontrei vocês pelo DuRock RJ e gostaria de mais informações.';

/**
 * Normalizes a stored organization WhatsApp URL into a wa.me link with a
 * fixed pre-filled greeting message.
 *
 * Organizers can save the field as any valid WhatsApp URL (wa.me/<number>,
 * api.whatsapp.com/send?phone=<number>, etc.) — this extracts just the
 * digits, which is the phone number regardless of which format was used.
 *
 * @example
 * buildWhatsappLink('https://wa.me/5521999999999')
 * // => 'https://wa.me/5521999999999?text=Ol%C3%A1!%20...'
 */
export function buildWhatsappLink(rawUrl: string): string {
	const phone = rawUrl.replace(/\D/g, '');
	return `https://wa.me/${phone}?text=${encodeURIComponent(CONTACT_MESSAGE)}`;
}
