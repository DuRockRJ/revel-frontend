<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
</script>

<footer class="border-t bg-muted/30">
	<div class="container mx-auto max-w-5xl px-4 py-8 md:py-12">
		<div class="grid grid-cols-2 gap-8 md:grid-cols-4">
			<!-- Solutions - spans 2 columns on md+ -->
			<div class="col-span-2">
				<h3 class="mb-4 text-lg font-semibold">{m['footer.solutionsTitle']()}</h3>
				<div class="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
					<a
						href="/eventbrite-alternative"
						class="text-muted-foreground transition-colors hover:text-foreground"
					>
						{m['footer.solutionEventbrite']()}
					</a>
					<a
						href="/privacy-focused-events"
						class="text-muted-foreground transition-colors hover:text-foreground"
					>
						{m['footer.solutionPrivacy']()}
					</a>
					<a
						href="/self-hosted-event-platform"
						class="text-muted-foreground transition-colors hover:text-foreground"
					>
						{m['footer.solutionSelfHosted']()}
					</a>
					<a
						href="/community-first-event-platform"
						class="text-muted-foreground transition-colors hover:text-foreground"
					>
						{m['footer.solutionCommunity']()}
					</a>
					<a
						href="/queer-event-management"
						class="text-muted-foreground transition-colors hover:text-foreground"
					>
						{m['footer.solutionQueer']()}
					</a>
					<a
						href="/kink-event-ticketing"
						class="text-muted-foreground transition-colors hover:text-foreground"
					>
						{m['footer.solutionKink']()}
					</a>
				</div>
			</div>

			<!-- Legal Links -->
			<div>
				<h3 class="mb-4 text-lg font-semibold">{m['footer.legalTitle']()}</h3>
				<ul class="space-y-2 text-sm">
					<li>
						<a
							href="/legal/privacy"
							class="text-muted-foreground transition-colors hover:text-foreground"
						>
							{m['footer.privacyPolicy']()}
						</a>
					</li>
					<li>
						<a
							href="/legal/terms"
							class="text-muted-foreground transition-colors hover:text-foreground"
						>
							{m['footer.termsOfService']()}
						</a>
					</li>
					<li>
						<a
							href="mailto:contact@letsrevel.io"
							class="text-muted-foreground transition-colors hover:text-foreground"
						>
							{m['footer.contact']()}
						</a>
					</li>
				</ul>
			</div>

			<!-- Resources -->
			<div>
				<h3 class="mb-4 text-lg font-semibold">{m['footer.resourcesTitle']()}</h3>
				<ul class="space-y-2 text-sm">
					<li>
						<a href="/events" class="text-muted-foreground transition-colors hover:text-foreground">
							{m['nav.browseEvents']()}
						</a>
					</li>
					<li>
						<a
							href="/organizations"
							class="text-muted-foreground transition-colors hover:text-foreground"
						>
							{m['nav.organizations']()}
						</a>
					</li>
					<li>
						<a
							href="https://github.com/letsrevel"
							target="_blank"
							rel="noopener noreferrer"
							class="text-muted-foreground transition-colors hover:text-foreground"
						>
							{m['footer.github']()}
						</a>
					</li>
					<li>
						<a
							href="https://forms.gle/7wAqQXqrWk3X6Ddu7"
							target="_blank"
							rel="noopener noreferrer"
							class="text-muted-foreground transition-colors hover:text-foreground"
						>
							{m['footer.sendFeedback']()}
						</a>
					</li>
				</ul>
			</div>
		</div>

		<!-- Bottom links -->
		<div
			class="mt-8 flex flex-wrap items-center justify-center gap-4 border-t pt-6 text-sm text-muted-foreground"
		>
			<a href="/legal/privacy" class="transition-colors hover:text-foreground">
				{m['footer.privacyPolicy']()}
			</a>
			<span class="text-muted-foreground/50">|</span>
			<a href="/legal/terms" class="transition-colors hover:text-foreground">
				{m['footer.termsOfService']()}
			</a>
		</div>

		<!-- Copyright -->
		<div class="mt-6 text-center text-sm text-muted-foreground">
			<p>&copy; {new Date().getFullYear()} DuRock RJ. {m['footer.copyright']()}</p>
		</div>
	</div>
</footer>
