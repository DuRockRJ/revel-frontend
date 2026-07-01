import { LANGS, X_DEFAULT, type Lang } from './constants';

export type HreflangEntry = { lang: Lang | typeof X_DEFAULT; href: string };

/**
 * Same URL across all locales. Use for pages where Paraglide localizes chrome
 * but content stays at one canonical URL (events, orgs, series, listings).
 */
export function sameUrlHreflang(absoluteUrl: string): HreflangEntry[] {
	return [
		...LANGS.map((lang) => ({ lang, href: absoluteUrl }) as HreflangEntry),
		{ lang: X_DEFAULT, href: absoluteUrl }
	];
}

/**
 * Single-language page with no alternates (e.g. the hand-rolled, untranslated
 * marketing landing pages). Emits just the page's own lang tag plus x-default,
 * both pointing at the same canonical URL.
 */
export function selfHreflang(lang: Lang, absoluteUrl: string): HreflangEntry[] {
	return [
		{ lang, href: absoluteUrl },
		{ lang: X_DEFAULT, href: absoluteUrl }
	];
}
