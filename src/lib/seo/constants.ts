// The app's UI is Portuguese-only (Paraglide compiles a single locale). 'en'
// is kept as a second Lang value only because the unsubscribe page still
// carries hardcoded English copy outside Paraglide's message catalog.
export const LANGS = ['pt'] as const;
export type Lang = (typeof LANGS)[number] | 'en';

export const X_DEFAULT = 'x-default' as const;

export const OG_LOCALE: Record<Lang, string> = {
	pt: 'pt_BR',
	en: 'en_US'
};

export const SITE_NAME = 'DuRock RJ';
export const TWITTER_SITE = '@letsrevel';
