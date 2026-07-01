import type { Lang } from './constants';

/**
 * The app's UI is Portuguese-only, so there is nothing to negotiate from
 * Accept-Language. Kept as a function (rather than inlining 'pt' at call
 * sites) so SEO callers don't need to change if a second UI locale ever
 * returns.
 */
export function resolveLang(_request: Request): Lang {
	return 'pt';
}
