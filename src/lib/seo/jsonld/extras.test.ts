import { describe, it, expect } from 'vitest';
import { generateHowToJsonLd } from '$lib/seo/jsonld/howto';

describe('HowTo jsonld', () => {
	it('emits HowTo with named steps', () => {
		const ld = generateHowToJsonLd({
			name: 'Self-host Revel',
			description: 'Run Revel on your own infra',
			steps: [
				{ name: 'Clone the repo', text: 'git clone …' },
				{ name: 'docker compose up', text: 'docker compose up -d' }
			]
		});
		expect(ld['@type']).toBe('HowTo');
		expect(ld.name).toBe('Self-host Revel');
		expect(ld.step).toHaveLength(2);
		expect(ld.step[0]).toMatchObject({ '@type': 'HowToStep', position: 1 });
	});
});
