import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import PollPrivacySummary from './PollPrivacySummary.svelte';
import type { PollResultTiming, ResourceVisibility } from '$lib/api/generated/types.gen';

// Row-visibility matrix for PollPrivacySummary.
//
// The component renders up to five rows:
//   - "Who can vote: {audience}"              (always visible)
//   - "Results visible to: {audience} ({when})"  (hidden when staff-only AND never)
//   - "Your identity is hidden from other voters" OR amber "visible to anyone who can see results"
//     (hidden when result_visibility=staff-only — other voters see nothing anyway)
//   - amber "Staff can see who voted what"    (only when staff_anonymous=false)
//   - "You can change or withdraw your vote"  (only when allow_vote_changes=true)
//
// This file locks down those rules with table-driven cases so future tweaks
// to the rendering logic can't silently regress the matrix that the smoke
// spec § F walks through.

interface Case {
	name: string;
	props: {
		voteVisibility: ResourceVisibility;
		resultVisibility: ResourceVisibility;
		resultTiming: PollResultTiming;
		staffAnonymous: boolean;
		publicAnonymous: boolean;
		allowVoteChanges: boolean;
	};
	expectVisible: string[];
	expectHidden: string[];
}

const cases: Case[] = [
	{
		name: 'C1 — public/public/after_vote, both anon, allow changes',
		props: {
			voteVisibility: 'public',
			resultVisibility: 'public',
			resultTiming: 'after_vote',
			staffAnonymous: true,
			publicAnonymous: true,
			allowVoteChanges: true
		},
		expectVisible: [
			'Quem pode votar: qualquer pessoa',
			'Resultados visíveis para: qualquer pessoa (depois de você votar)',
			'Sua identidade está oculta dos outros eleitores',
			'Você pode alterar ou retirar seu voto'
		],
		expectHidden: [
			'A equipe pode ver quem votou em quê',
			'Sua identidade é visível para quem pode ver os resultados'
		]
	},
	{
		name: 'C3 — private/private/after_close, public_anon=false → amber identity-visible chip',
		props: {
			voteVisibility: 'private',
			resultVisibility: 'private',
			resultTiming: 'after_close',
			staffAnonymous: true,
			publicAnonymous: false,
			allowVoteChanges: false
		},
		expectVisible: [
			'Quem pode votar: somente pessoas convidadas',
			'Resultados visíveis para: somente pessoas convidadas (depois que a enquete encerrar)',
			'Sua identidade é visível para quem pode ver os resultados'
		],
		expectHidden: [
			'Sua identidade está oculta dos outros eleitores',
			'Você pode alterar ou retirar seu voto',
			'A equipe pode ver quem votou em quê'
		]
	},
	{
		name: 'C4 (form default) — members-only vote / staff-only results / never → rows 2+3 hidden',
		props: {
			voteVisibility: 'members-only',
			resultVisibility: 'staff-only',
			resultTiming: 'never',
			staffAnonymous: true,
			publicAnonymous: true,
			allowVoteChanges: true
		},
		expectVisible: ['Quem pode votar: somente membros', 'Você pode alterar ou retirar seu voto'],
		expectHidden: [
			'Resultados visíveis para',
			'Sua identidade está oculta dos outros eleitores',
			'A equipe pode ver quem votou em quê'
		]
	},
	// Pre-existing bug, unrelated to i18n: PollPrivacySummary.svelte's `showResultsRow` is
	// derived as `resultTiming !== 'never'`, so the results row is hidden entirely whenever
	// resultTiming is 'never' — it never renders the "not shared" copy this case expects.
	{
		name: 'C4 (spec) — members-only/members-only/never → row 2 shown with "not shared" copy',
		props: {
			voteVisibility: 'members-only',
			resultVisibility: 'members-only',
			resultTiming: 'never',
			staffAnonymous: true,
			publicAnonymous: true,
			allowVoteChanges: true
		},
		expectVisible: [
			'Quem pode votar: somente membros',
			'Resultados visíveis para: somente membros (os resultados não são compartilhados com os eleitores)',
			'Sua identidade está oculta dos outros eleitores',
			'Você pode alterar ou retirar seu voto'
		],
		expectHidden: ['A equipe pode ver quem votou em quê']
	},
	{
		name: 'C5 — staff-only/staff-only/after_vote + staff_anon=false → amber staff chip, row 3 hidden',
		props: {
			voteVisibility: 'staff-only',
			resultVisibility: 'staff-only',
			resultTiming: 'after_vote',
			staffAnonymous: false,
			publicAnonymous: true,
			allowVoteChanges: false
		},
		expectVisible: [
			'Quem pode votar: somente equipe',
			'Resultados visíveis para: somente equipe (depois de você votar)',
			'A equipe pode ver quem votou em quê'
		],
		expectHidden: [
			'Sua identidade está oculta dos outros eleitores',
			'Sua identidade é visível para quem pode ver os resultados',
			'Você pode alterar ou retirar seu voto'
		]
	},
	{
		name: 'staff-only + never → skip row 2 entirely',
		props: {
			voteVisibility: 'staff-only',
			resultVisibility: 'staff-only',
			resultTiming: 'never',
			staffAnonymous: true,
			publicAnonymous: true,
			allowVoteChanges: false
		},
		expectVisible: ['Quem pode votar: somente equipe'],
		expectHidden: [
			'Resultados visíveis para',
			'Sua identidade está oculta dos outros eleitores',
			'A equipe pode ver quem votou em quê',
			'Você pode alterar ou retirar seu voto'
		]
	}
];

describe('PollPrivacySummary row visibility', () => {
	for (const c of cases) {
		it(c.name, () => {
			render(PollPrivacySummary, { props: c.props });

			for (const needle of c.expectVisible) {
				// Use a regex so partial-text matches catch the "Results visible to: ..."
				// row regardless of the specific interpolated audience/timing copy.
				const re = new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
				expect(
					screen.queryByText(re),
					`expected to find "${needle}" in the rendered output`
				).not.toBeNull();
			}

			for (const needle of c.expectHidden) {
				const re = new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
				expect(
					screen.queryByText(re),
					`expected NOT to find "${needle}" in the rendered output`
				).toBeNull();
			}
		});
	}
});
