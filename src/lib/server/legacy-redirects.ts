import { redirect, type Handle } from '@sveltejs/kit';

/**
 * Legacy English URL → Portuguese URL redirects.
 *
 * The public/member-facing routes were translated to Portuguese (keeping
 * `/dashboard`, `/login`, `/logout`, `/legal`, `/org`, and the
 * `/org/[slug]/admin/*` panel in English). This 308-redirects the old English
 * paths to their new home so existing bookmarks, shared links, and indexed
 * search results keep working. Nested leaf-word rules (questionnaire, series)
 * run before their parent's general prefix swap. The `/org/:slug/...` rules
 * never match `/org/:slug/admin/...` since "polls"/"resources" must sit
 * directly after the slug segment.
 */
const LEGACY_REDIRECTS: Array<[RegExp, string]> = [
	// events tree
	[/^\/events\/([^/]+)\/([^/]+)\/questionnaire\//, '/eventos/$1/$2/questionario/'],
	[/^\/events\/([^/]+)\/series\//, '/eventos/$1/serie/'],
	[/^\/events\/confirm-action(\/|$)/, '/eventos/confirmar-acao$1'],
	[/^\/events(\/|$)/, '/eventos$1'],

	// organizations listing (kept "org", matching the /org/[slug] profile convention)
	[/^\/organizations(\/|$)/, '/org$1'],

	// login subpages (login itself stays English)
	[/^\/login\/confirm-email(\/|$)/, '/login/confirmar-email$1'],
	[/^\/login\/reset-password(\/|$)/, '/login/redefinir-senha$1'],

	// top-level auth/account flows
	[/^\/password-reset(\/|$)/, '/redefinir-senha$1'],
	[/^\/register\/check-email(\/|$)/, '/cadastro/verificar-email$1'],
	[/^\/register(\/|$)/, '/cadastro$1'],
	[/^\/join\/event\//, '/participar/evento/'],
	[/^\/join\/org\//, '/participar/org/'],
	[/^\/join(\/|$)/, '/participar$1'],
	[/^\/unsubscribe(\/|$)/, '/cancelar-inscricao$1'],
	[/^\/verify-contact-email(\/|$)/, '/verificar-email-contato$1'],
	[/^\/verify(\/|$)/, '/verificar$1'],

	// legal
	[/^\/legal\/privacy(\/|$)/, '/legal/privacidade$1'],
	[/^\/legal\/terms(\/|$)/, '/legal/termos$1'],

	// account -> conta (leaves first, then the general prefix)
	[/^\/account\/confirm-deletion(\/|$)/, '/conta/confirmar-exclusao$1'],
	[/^\/account\/confirm-email-change(\/|$)/, '/conta/confirmar-troca-email$1'],
	[/^\/account\/invoices(\/|$)/, '/conta/faturas$1'],
	[/^\/account\/memberships(\/|$)/, '/conta/associacoes$1'],
	[/^\/account\/notifications(\/|$)/, '/conta/notificacoes$1'],
	[/^\/account\/privacy(\/|$)/, '/conta/privacidade$1'],
	[/^\/account\/profile(\/|$)/, '/conta/perfil$1'],
	[/^\/account\/referral\/payouts(\/|$)/, '/conta/indicacoes/pagamentos$1'],
	[/^\/account\/referral(\/|$)/, '/conta/indicacoes$1'],
	[/^\/account\/security(\/|$)/, '/conta/seguranca$1'],
	[/^\/account\/settings(\/|$)/, '/conta/configuracoes$1'],
	[/^\/account(\/|$)/, '/conta$1'],

	// org profile sub-pages
	[/^\/org\/([^/]+)\/polls(\/|$)/, '/org/$1/enquetes$2'],
	[/^\/org\/([^/]+)\/resources(\/|$)/, '/org/$1/recursos$2'],
	[/^\/org\/([^/]+)\/verify-contact-email(\/|$)/, '/org/$1/verificar-email-contato$2'],

	// misc top-level
	[/^\/create-org(\/|$)/, '/criar-org$1'],

	// dashboard leaves (dashboard itself stays English)
	[/^\/dashboard\/following(\/|$)/, '/dashboard/seguindo$1'],
	[/^\/dashboard\/invitations(\/|$)/, '/dashboard/convites$1'],
	[/^\/dashboard\/rsvps(\/|$)/, '/dashboard/confirmacoes$1'],
	[/^\/dashboard\/tickets(\/|$)/, '/dashboard/ingressos$1']
];

export const handleLegacyRedirects: Handle = ({ event, resolve }) => {
	const { pathname, search } = event.url;
	for (const [pattern, replacement] of LEGACY_REDIRECTS) {
		if (pattern.test(pathname)) {
			redirect(308, pathname.replace(pattern, replacement) + search);
		}
	}
	return resolve(event);
};
