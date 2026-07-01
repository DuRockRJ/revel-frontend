/**
 * Landing page content data for SEO pages
 * Each page targets specific keywords and audiences with tailored messaging
 */

export interface LandingPageFeature {
	icon:
		| 'ticket'
		| 'shield'
		| 'users'
		| 'server'
		| 'eye'
		| 'check'
		| 'euro'
		| 'lock'
		| 'heart'
		| 'globe'
		| 'code'
		| 'clipboard';
	title: string;
	description: string;
}

export interface LandingPageCTA {
	text: string;
	href: string;
	variant: 'primary' | 'secondary' | 'outline';
}

export interface LandingPageContent {
	slug: string;
	locale: 'en' | 'de' | 'it' | 'fr';
	meta: {
		title: string;
		description: string;
		keywords: string;
	};
	hero: {
		headline: string;
		subheadline: string;
	};
	intro: {
		paragraphs: string[];
	};
	features: LandingPageFeature[];
	benefits: {
		title: string;
		items: string[];
	};
	cta: {
		title: string;
		description: string;
		buttons: LandingPageCTA[];
	};
	faq: Array<{
		question: string;
		answer: string;
	}>;
	relatedPages: string[];
}

export type LandingPageSlug =
	| 'eventbrite-alternative'
	| 'queer-event-management'
	| 'kink-event-ticketing'
	| 'self-hosted-event-platform'
	| 'privacy-focused-events'
	| 'community-first-event-platform';

// =============================================================================
// ENGLISH CONTENT
// =============================================================================

const eventbriteAlternativeEN: LandingPageContent = {
	slug: 'eventbrite-alternative',
	locale: 'en',
	meta: {
		title: 'Eventbrite Alternative – Lower Fees, Full Control | Revel',
		description:
			'Open-source event ticketing with just 1.5% + €0.25 per ticket. Self-host for zero fees. Own your data. No platform lock-in. Hosted in Europe.',
		keywords:
			'eventbrite alternative, cheap event ticketing, low fee ticketing, event platform, ticketing software'
	},
	hero: {
		headline: 'Stop Losing Money to Platform Fees',
		subheadline:
			'Revel is the open-source Eventbrite alternative with transparent pricing and full data ownership.'
	},
	intro: {
		paragraphs: [
			"Tired of Eventbrite taking 3.7% plus fees from every ticket sold? You're not alone. Event organizers everywhere are looking for alternatives that don't eat into their margins or lock them into a platform they can't control.",
			'Revel is an open-source event management platform with simple, fair pricing: just 1.5% + €0.25 per paid ticket on our hosted version—or completely free if you self-host. Your ticket revenue goes to you, not to a corporation.',
			'Built by community organizers in Europe, Revel gives you everything you need: ticketing, RSVPs, attendee management, check-in tools, and more. All while keeping your data yours and your costs predictable.'
		]
	},
	features: [
		{
			icon: 'euro',
			title: 'Transparent, Low Fees',
			description:
				'Just 1.5% + €0.25 per paid ticket. Free events are always free. Self-host and pay nothing at all.'
		},
		{
			icon: 'server',
			title: 'Self-Host Option',
			description:
				'Deploy Revel on your own infrastructure with Docker. Zero platform fees, complete control, MIT licensed.'
		},
		{
			icon: 'ticket',
			title: 'Full Ticketing Suite',
			description:
				'Multiple ticket tiers, batch purchases, QR code check-in, Apple Wallet integration, and Stripe-powered payments.'
		},
		{
			icon: 'shield',
			title: 'Your Data, Your Rules',
			description:
				'No third-party trackers. No data selling. Full GDPR compliance. Hosted on European infrastructure.'
		},
		{
			icon: 'users',
			title: 'Community Tools',
			description:
				'Organizations, memberships, roles and permissions. Build lasting communities, not just one-off events.'
		},
		{
			icon: 'code',
			title: 'Open Source (MIT)',
			description:
				'Fully transparent codebase. Audit it, modify it, contribute to it. No vendor lock-in, ever.'
		}
	],
	benefits: {
		title: 'Why Organizers Choose Revel',
		items: [
			'Keep more of your ticket revenue with fees up to 60% lower than Eventbrite',
			'Direct Stripe payouts—no waiting for platform disbursements',
			'Export your attendee data anytime, in standard formats',
			'No risk of platform policy changes shutting down your events',
			'European hosting with full GDPR compliance',
			'Active development by a community that listens'
		]
	},
	cta: {
		title: 'Ready to Switch?',
		description: 'See Revel in action or deploy it yourself. No credit card required.',
		buttons: [
			{ text: 'Try the Live Demo', href: 'https://demo.letsrevel.io', variant: 'primary' },
			{ text: 'Self-Host (GitHub)', href: 'https://github.com/letsrevel', variant: 'secondary' },
			{ text: 'Contact Us', href: 'mailto:contact@letsrevel.io', variant: 'outline' }
		]
	},
	faq: [
		{
			question: 'How does Revel compare to Eventbrite pricing?',
			answer:
				"Eventbrite charges around 3.7% + fees per ticket, plus payment processing. Revel charges just 1.5% + €0.25 per paid ticket (plus Stripe's standard ~1.5% + €0.25). Free events and self-hosted deployments have zero platform fees."
		},
		{
			question: 'Can I migrate my events from Eventbrite?',
			answer:
				'Yes. Revel makes it easy to recreate your events with our intuitive event builder. You can export your attendee lists from Eventbrite as CSV and use them to invite your existing community to your new Revel events.'
		},
		{
			question: 'Is Revel really free to self-host?',
			answer:
				"Absolutely. Revel is MIT licensed, which means you can run it on your own servers without paying us anything. You only pay for your own infrastructure and Stripe's payment processing fees."
		},
		{
			question: 'Where is Revel hosted?',
			answer:
				'Our hosted version runs on European infrastructure, ensuring GDPR compliance and data sovereignty. If you self-host, you choose where your data lives.'
		}
	],
	relatedPages: ['self-hosted-event-platform', 'privacy-focused-events']
};

const queerEventManagementEN: LandingPageContent = {
	slug: 'queer-event-management',
	locale: 'en',
	meta: {
		title: 'Event Management for LGBTQ+ Communities | Revel',
		description:
			'Open-source event platform built by and for queer communities. Privacy controls, attendee screening, no censorship risk. Hosted in Europe.',
		keywords:
			'lgbtq event platform, queer event management, gay event ticketing, pride events, queer community'
	},
	hero: {
		headline: 'Event Software That Gets Queer Communities',
		subheadline:
			"Built by LGBTQ+ organizers for events that mainstream platforms weren't designed to support."
	},
	intro: {
		paragraphs: [
			"Mainstream event platforms weren't built with queer communities in mind. Vague content policies that flag your events. Algorithms that suppress visibility. No understanding of safer spaces or community-specific needs.",
			"Revel is different. Created by queer event organizers in Europe, it's an open-source platform designed for communities that need more than just ticketing—they need trust, privacy, and the freedom to run events without fear of deplatforming.",
			"Whether you're organizing Pride parties, queer meetups, drag shows, or community gatherings, Revel gives you the tools to build and protect your community. Member management, attendee screening, visibility controls, and complete data ownership—all in one platform."
		]
	},
	features: [
		{
			icon: 'heart',
			title: 'Built for Community',
			description:
				'Organizations, memberships, and community-building tools. Create spaces where your community can thrive beyond single events.'
		},
		{
			icon: 'shield',
			title: 'No Censorship Risk',
			description:
				'Self-host or use our European servers. No corporate content policies deciding what events you can run.'
		},
		{
			icon: 'clipboard',
			title: 'Attendee Screening',
			description:
				'Custom questionnaires to ensure attendees align with your community values. Manual review, auto-approval, or hybrid workflows.'
		},
		{
			icon: 'eye',
			title: 'Privacy Controls',
			description:
				'Public, members-only, or invite-only events. Control who sees what, and keep attendee lists private.'
		},
		{
			icon: 'lock',
			title: 'Data Sovereignty',
			description:
				"Your community's data stays yours. No third-party trackers, no data selling, full GDPR compliance."
		},
		{
			icon: 'globe',
			title: 'European Hosting',
			description:
				'Hosted on European infrastructure with strong privacy protections. Self-host anywhere you choose.'
		}
	],
	benefits: {
		title: 'Why LGBTQ+ Organizers Trust Revel',
		items: [
			'No risk of events being flagged or removed by platform policies',
			'Screen attendees to maintain safer spaces',
			'Build lasting community membership, not just event-by-event lists',
			"Full control over your community's data",
			'Created by people who understand queer event organizing',
			'Open source and transparent—see exactly how it works'
		]
	},
	cta: {
		title: 'Your Community Deserves Better Tools',
		description: 'See how Revel works or start building your community today.',
		buttons: [
			{ text: 'Try the Live Demo', href: 'https://demo.letsrevel.io', variant: 'primary' },
			{ text: 'Self-Host (GitHub)', href: 'https://github.com/letsrevel', variant: 'secondary' },
			{ text: 'Contact Us', href: 'mailto:contact@letsrevel.io', variant: 'outline' }
		]
	},
	faq: [
		{
			question: 'What makes Revel different from Eventbrite or Meetup?',
			answer:
				"Revel was built specifically for communities that need privacy, screening, and freedom from platform censorship. We don't have content policies that restrict adult or queer events, and we give you full control over your data."
		},
		{
			question: 'Can I screen who attends my events?',
			answer:
				'Yes. Revel includes a powerful questionnaire system that lets you require attendees to answer questions before purchasing tickets or RSVPing. You can review submissions manually, set up auto-approval rules, or use a hybrid approach.'
		},
		{
			question: "Is my community's data safe?",
			answer:
				"Absolutely. We don't sell data or use third-party trackers. Our hosted version runs on European servers with GDPR compliance. If you self-host, you have complete control over where your data lives."
		},
		{
			question: 'Can I run members-only events?',
			answer:
				'Yes. You can create organizations with membership tiers and restrict events to members only, specific membership levels, or make them public. You control visibility at every level.'
		}
	],
	relatedPages: ['kink-event-ticketing', 'privacy-focused-events']
};

const kinkEventTicketingEN: LandingPageContent = {
	slug: 'kink-event-ticketing',
	locale: 'en',
	meta: {
		title: 'Ticketing for Kink & BDSM Events – Private & Secure | Revel',
		description:
			'Event management for kink, BDSM, and sex-positive communities. Attendee screening, privacy controls, discretion. Open-source, self-hostable.',
		keywords:
			'bdsm event ticketing, kink event management, sex positive events, fetish party ticketing, adult event platform'
	},
	hero: {
		headline: 'Discreet Event Management for Kink Communities',
		subheadline:
			'Attendee screening, privacy controls, and complete data ownership. Built for events that need discretion.'
	},
	intro: {
		paragraphs: [
			"Organizing kink and BDSM events means balancing privacy, consent, and trust—while still handling the logistics of ticketing, RSVPs, and attendee management. Most platforms aren't built for this. Revel is.",
			'Created by community organizers who understand the unique needs of sex-positive spaces, Revel is open-source event software designed for discretion. Screen attendees with custom questionnaires. Control exactly who sees your events. Keep attendee data completely private.',
			"Whether you're running play parties, munches, workshops, or large fetish events, Revel gives you the tools to maintain the trust and safety your community expects—without compromising on features or worrying about platform censorship."
		]
	},
	features: [
		{
			icon: 'clipboard',
			title: 'Attendee Screening',
			description:
				'Require questionnaires before ticket purchase. Review applications manually, auto-approve based on criteria, or use hybrid workflows.'
		},
		{
			icon: 'eye',
			title: 'Visibility Controls',
			description:
				'Public listings, members-only, or completely private invite-only events. You decide who knows about your events.'
		},
		{
			icon: 'lock',
			title: 'Complete Discretion',
			description:
				'No platform that can leak your attendee list. Self-host for maximum privacy, or use our secure European servers.'
		},
		{
			icon: 'shield',
			title: 'No Deplatforming Risk',
			description:
				'Open source and self-hostable. No corporate content policies. Your events, your rules.'
		},
		{
			icon: 'users',
			title: 'Community Membership',
			description:
				'Build trusted member lists over time. Restrict events to vetted community members.'
		},
		{
			icon: 'ticket',
			title: 'Full Event Features',
			description:
				'Multiple ticket tiers, QR check-in, Apple Wallet passes, batch purchases—everything you need to run professional events.'
		}
	],
	benefits: {
		title: 'Why Kink Organizers Choose Revel',
		items: [
			'Screen attendees to maintain community standards and consent culture',
			'Keep attendee identities and event details private',
			'No risk of events being removed due to platform content policies',
			'Build and maintain trusted member communities',
			'Self-host for complete control over sensitive data',
			'Created by people who understand kink event organizing'
		]
	},
	cta: {
		title: 'Events That Respect Privacy and Consent',
		description: 'See how Revel protects your community or deploy it yourself.',
		buttons: [
			{ text: 'Try the Live Demo', href: 'https://demo.letsrevel.io', variant: 'primary' },
			{ text: 'Self-Host (GitHub)', href: 'https://github.com/letsrevel', variant: 'secondary' },
			{ text: 'Contact Us', href: 'mailto:contact@letsrevel.io', variant: 'outline' }
		]
	},
	faq: [
		{
			question: 'How does attendee screening work?',
			answer:
				'You create questionnaires with any questions you need—experience level, community references, consent acknowledgments, etc. Attendees must complete the questionnaire before they can purchase tickets. You can review submissions manually, set auto-approval rules, or combine both approaches.'
		},
		{
			question: 'Can I keep my events completely private?',
			answer:
				'Yes. Events can be set to invite-only, visible only to members, or completely unlisted. You can also send direct invitations that bypass normal requirements for trusted guests.'
		},
		{
			question: 'What if I need maximum privacy?',
			answer:
				'Self-host Revel on your own infrastructure. Your data never touches our servers. The software is MIT licensed and free to use—you only pay for your own hosting and Stripe payment processing.'
		},
		{
			question: 'Is there any risk of my events being censored?',
			answer:
				"Not with Revel. We're open source with no content policies restricting adult events. If you self-host, you have complete autonomy. Our hosted version is run on European infrastructure and we explicitly support sex-positive communities."
		}
	],
	relatedPages: ['queer-event-management', 'privacy-focused-events', 'self-hosted-event-platform']
};

const selfHostedEventPlatformEN: LandingPageContent = {
	slug: 'self-hosted-event-platform',
	locale: 'en',
	meta: {
		title: 'Self-Hosted Event Management – Open Source & Free | Revel',
		description:
			'MIT-licensed event platform you can deploy on your own servers. Zero fees, full control, Docker-ready. Ticketing, RSVPs, member management.',
		keywords:
			'self hosted event management, open source ticketing, self hosted eventbrite, event management software, docker event platform'
	},
	hero: {
		headline: 'Your Events, Your Servers, Zero Fees',
		subheadline:
			'MIT-licensed event management you can deploy anywhere. Full ticketing, RSVPs, and community tools—completely under your control.'
	},
	intro: {
		paragraphs: [
			"Why pay monthly SaaS fees and trust a corporation with your community's data? Revel is open-source event management software you can deploy on your own infrastructure in minutes.",
			'Built with modern technologies—Django, PostgreSQL, Redis, and Docker—Revel is production-ready and battle-tested. Full ticketing with Stripe integration, RSVPs, member management, attendee screening, QR check-in, and more. All the features of commercial platforms, without the recurring costs or data concerns.',
			'MIT licensed means you can use it, modify it, and deploy it however you want. No vendor lock-in. No surprise pricing changes. No platform deciding what events you can run. Your infrastructure, your rules.'
		]
	},
	features: [
		{
			icon: 'server',
			title: 'Docker-Ready Deployment',
			description:
				'Get running in minutes with Docker Compose. PostgreSQL, Redis, Celery—all configured and ready to go.'
		},
		{
			icon: 'euro',
			title: 'Zero Platform Fees',
			description:
				"No per-ticket fees, no monthly costs. You only pay for your own infrastructure and Stripe's payment processing."
		},
		{
			icon: 'code',
			title: 'MIT Licensed',
			description:
				"Use it commercially, modify it, contribute back—or don't. No restrictions, no copyleft requirements."
		},
		{
			icon: 'lock',
			title: 'Complete Data Control',
			description:
				'Your data never leaves your servers. Full GDPR compliance because you control everything.'
		},
		{
			icon: 'ticket',
			title: 'Full Feature Set',
			description:
				'Ticketing, RSVPs, organizations, memberships, questionnaires, QR check-in, potluck coordination, and more.'
		},
		{
			icon: 'globe',
			title: 'Modern API',
			description:
				'REST API with OpenAPI documentation. Build custom frontends, integrations, or mobile apps.'
		}
	],
	benefits: {
		title: 'Why Self-Host Revel',
		items: [
			'Eliminate recurring SaaS costs—pay only for your infrastructure',
			'Complete data sovereignty and privacy',
			'No risk of platform policy changes or price increases',
			'Customize and extend the codebase for your needs',
			'Deploy in any region for data compliance',
			'Active community and development'
		]
	},
	cta: {
		title: 'Deploy in Minutes',
		description: 'Check out the code, read the docs, or try the hosted demo first.',
		buttons: [
			{ text: 'View on GitHub', href: 'https://github.com/letsrevel', variant: 'primary' },
			{ text: 'Try the Demo', href: 'https://demo.letsrevel.io', variant: 'secondary' },
			{ text: 'Contact Us', href: 'mailto:contact@letsrevel.io', variant: 'outline' }
		]
	},
	faq: [
		{
			question: 'What are the system requirements?',
			answer:
				"Revel runs anywhere Docker runs. Minimum recommended: 2 CPU cores, 4GB RAM, 20GB storage. For production with many events, we recommend 4+ cores and 8GB+ RAM. You'll also need PostgreSQL (with PostGIS), Redis, and a Stripe account for payments."
		},
		{
			question: 'How long does deployment take?',
			answer:
				'With Docker Compose, you can have a working instance in under 10 minutes. The repository includes complete deployment configurations and documentation.'
		},
		{
			question: 'Can I still get support if I self-host?',
			answer:
				'Yes. We offer community support through GitHub issues. For organizations needing guaranteed response times or custom development, contact us about professional support options.'
		},
		{
			question: "What's the difference between self-hosted and your hosted version?",
			answer:
				'Functionally identical. Our hosted version adds convenience (we manage infrastructure, updates, backups) in exchange for a small per-ticket fee. Self-hosted is free but you manage everything yourself.'
		}
	],
	relatedPages: ['eventbrite-alternative', 'privacy-focused-events']
};

const privacyFocusedEventsEN: LandingPageContent = {
	slug: 'privacy-focused-events',
	locale: 'en',
	meta: {
		title: 'Privacy-First Event Platform – GDPR Compliant | Revel',
		description:
			'Event management that respects privacy. No data harvesting, no third-party trackers. European hosting, full GDPR compliance. Open source.',
		keywords:
			'gdpr event platform, privacy focused events, european event software, data protection events, private event management'
	},
	hero: {
		headline: 'Event Management That Respects Privacy',
		subheadline:
			'No data harvesting. No third-party trackers. European hosting with full GDPR compliance.'
	},
	intro: {
		paragraphs: [
			"Most event platforms harvest your attendee data for advertising, share it with third parties, and bury the details in lengthy privacy policies. If you care about your community's privacy—or simply need to comply with GDPR—you need a different approach.",
			"Revel is open-source event management built with privacy as a core principle, not an afterthought. We don't track users across the web. We don't sell data. We don't even have the business model that would incentivize us to do so.",
			'Hosted on European infrastructure with full GDPR compliance, or self-host for complete control. Your attendee data stays yours, and your community can trust that their information is handled responsibly.'
		]
	},
	features: [
		{
			icon: 'shield',
			title: 'No Third-Party Trackers',
			description:
				"No Google Analytics, no Facebook pixels, no advertising SDKs. We don't track your attendees across the web."
		},
		{
			icon: 'globe',
			title: 'European Hosting',
			description:
				'Our hosted version runs on European infrastructure, ensuring your data stays under EU jurisdiction and GDPR protection.'
		},
		{
			icon: 'lock',
			title: 'Data Minimization',
			description:
				"We collect only what's needed to run events. No building profiles, no behavioral analysis, no data monetization."
		},
		{
			icon: 'server',
			title: 'Self-Host Option',
			description:
				'For maximum control, deploy Revel on your own infrastructure. Your data never touches our servers.'
		},
		{
			icon: 'code',
			title: 'Transparent Codebase',
			description:
				'Open source means you can audit exactly how your data is handled. No hidden tracking, no surprises.'
		},
		{
			icon: 'check',
			title: 'GDPR by Design',
			description:
				'Data export, deletion requests, consent management—privacy compliance is built into the platform.'
		}
	],
	benefits: {
		title: 'Privacy as a Feature, Not a Checkbox',
		items: [
			'Full GDPR compliance for European organizers and attendees',
			'No data selling or sharing with advertisers',
			'Transparent, auditable open-source codebase',
			'European hosting with data sovereignty',
			'Self-host option for complete control',
			'Clear, honest privacy practices you can explain to your community'
		]
	},
	cta: {
		title: 'Events Without Surveillance',
		description: 'See how Revel handles data or deploy it yourself for complete control.',
		buttons: [
			{ text: 'Try the Live Demo', href: 'https://demo.letsrevel.io', variant: 'primary' },
			{ text: 'Self-Host (GitHub)', href: 'https://github.com/letsrevel', variant: 'secondary' },
			{ text: 'Contact Us', href: 'mailto:contact@letsrevel.io', variant: 'outline' }
		]
	},
	faq: [
		{
			question: 'How is Revel GDPR compliant?',
			answer:
				'We practice data minimization, provide data export and deletion tools, obtain proper consent, and host on European infrastructure. As open source, you can audit our data practices directly in the code.'
		},
		{
			question: 'Do you sell attendee data?',
			answer:
				'No. We have no advertising business model. Our revenue comes from a small per-ticket fee on paid events (for hosted customers). We have no incentive to monetize your data.'
		},
		{
			question: 'What data do you collect?',
			answer:
				"Only what's necessary: account information, event details, ticket purchases, and attendee lists. We don't track browsing behavior, build advertising profiles, or collect data beyond what you explicitly provide."
		},
		{
			question: 'Can I get complete data control?',
			answer:
				'Yes. Self-host Revel on your own infrastructure and your data never touches our servers. The platform is MIT licensed and free to deploy.'
		}
	],
	relatedPages: ['self-hosted-event-platform', 'queer-event-management']
};

const communityFirstEventPlatformEN: LandingPageContent = {
	slug: 'community-first-event-platform',
	locale: 'en',
	meta: {
		title: 'Community-First Event Platform – Beyond Ticketing | Revel',
		description:
			'Build lasting communities, not just events. Organizations, membership tiers, potluck coordination, and more. Self-host for free or use our hosted version.',
		keywords:
			'community event platform, membership management, organization events, potluck coordination, community building, meetup alternative'
	},
	hero: {
		headline: 'Build Communities, Not Just Events',
		subheadline:
			'Organizations, memberships, and unique tools like potluck coordination. Revel helps you foster lasting community connections.'
	},
	intro: {
		paragraphs: [
			'Most event platforms treat every gathering as a one-off transaction. But real communities need more than that—they need structure, continuity, and tools that support ongoing relationships.',
			'Revel is built for communities first. Create organizations with membership tiers, assign roles and permissions, and use features like our unique potluck coordination system to make events more collaborative and less work for organizers.',
			"Whether you're running a book club, hobby group, professional network, or maker space, Revel gives you the infrastructure to grow from casual meetups into a thriving community—without expensive subscriptions or platform lock-in."
		]
	},
	features: [
		{
			icon: 'users',
			title: 'Organization Structure',
			description:
				'Create community hubs with membership tiers, not just event listings. Owner, staff, and member roles with granular permissions.'
		},
		{
			icon: 'clipboard',
			title: 'Potluck Coordination',
			description:
				'Built-in system for coordinating who brings what. Handle dietary restrictions, quantities, and item management—no more messy spreadsheets.'
		},
		{
			icon: 'shield',
			title: 'Member-Only Events',
			description:
				'Restrict events to members, specific tiers, or keep them public. Build exclusive spaces for your community.'
		},
		{
			icon: 'ticket',
			title: 'Integrated Ticketing',
			description:
				'Free events, paid tickets, RSVP-only, or hybrid. Handle everything from casual meetups to professional conferences.'
		},
		{
			icon: 'eye',
			title: 'No Ads, Ever',
			description:
				'Your community deserves better than being shown ads. Self-host for free or use our ad-free hosted version.'
		},
		{
			icon: 'code',
			title: 'Open Source (MIT)',
			description:
				'Free to use, modify, and deploy. No vendor lock-in. Run on your own servers with complete control.'
		}
	],
	benefits: {
		title: 'Why Community Organizers Choose Revel',
		items: [
			'Build lasting membership structures, not just event-by-event lists',
			'Coordinate potlucks and shared responsibilities effortlessly',
			'No expensive subscriptions like Meetup ($540/year)',
			'Ad-free experience for your members',
			'Member-only events for building exclusive communities',
			'Self-host for complete control and zero platform fees'
		]
	},
	cta: {
		title: 'Ready to Build Your Community?',
		description: 'See Revel in action or deploy it yourself. No credit card required.',
		buttons: [
			{ text: 'Try the Live Demo', href: 'https://demo.letsrevel.io', variant: 'primary' },
			{ text: 'Self-Host (GitHub)', href: 'https://github.com/letsrevel', variant: 'secondary' },
			{ text: 'Contact Us', href: 'mailto:contact@letsrevel.io', variant: 'outline' }
		]
	},
	faq: [
		{
			question: 'How is this different from Meetup?',
			answer:
				'Meetup charges $540/year and shows ads to your members. Revel is free to self-host and ad-free on our hosted version. We also integrate full ticketing capabilities and unique features like potluck coordination that Meetup lacks.'
		},
		{
			question: 'What is potluck coordination?',
			answer:
				"It's a built-in system that lets attendees coordinate who brings what to events. Handle dietary restrictions, quantity management, and item assignments—no more messy spreadsheets or external tools. It's great for potlucks, equipment sharing, volunteer coordination, and more."
		},
		{
			question: 'Can I create member-only events?',
			answer:
				'Yes. You can create organizations with membership tiers and restrict events to members only, specific membership levels, or keep them public. You have complete control over visibility and access.'
		},
		{
			question: 'Is Revel really free?',
			answer:
				'Yes for self-hosting (MIT licensed). Our hosted version charges a small fee only for paid ticket sales (1.5% + €0.25 per ticket). Free events and RSVP-only events have zero platform fees on either version.'
		},
		{
			question: 'What types of communities use Revel?',
			answer:
				"Book clubs, running groups, maker spaces, professional networks, hobby communities, special interest groups, and more. Any community that wants more than just basic event listings benefits from Revel's organization and membership features."
		}
	],
	relatedPages: ['eventbrite-alternative', 'self-hosted-event-platform']
};

// =============================================================================
// EXPORTS
// =============================================================================

export const landingPages: Record<string, Record<string, LandingPageContent>> = {
	en: {
		'eventbrite-alternative': eventbriteAlternativeEN,
		'queer-event-management': queerEventManagementEN,
		'kink-event-ticketing': kinkEventTicketingEN,
		'self-hosted-event-platform': selfHostedEventPlatformEN,
		'privacy-focused-events': privacyFocusedEventsEN,
		'community-first-event-platform': communityFirstEventPlatformEN
	}
};

export const landingPageSlugs: LandingPageSlug[] = [
	'eventbrite-alternative',
	'queer-event-management',
	'kink-event-ticketing',
	'self-hosted-event-platform',
	'privacy-focused-events',
	'community-first-event-platform'
];

export function getLandingPage(locale: string, slug: string): LandingPageContent | undefined {
	return landingPages[locale]?.[slug];
}

export function getAllLandingPages(): LandingPageContent[] {
	return Object.values(landingPages).flatMap((locale) => Object.values(locale));
}
