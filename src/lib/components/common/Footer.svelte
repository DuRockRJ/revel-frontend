<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { Instagram, Youtube } from 'lucide-svelte';
</script>

<footer class="border-t bg-muted/30">
	<div class="container mx-auto max-w-5xl px-4 py-8 md:py-12">
		<!-- Social links -->
		<div class="flex items-center justify-center gap-4">
			<a
				href="https://www.instagram.com/durockrj"
				target="_blank"
				rel="noopener noreferrer"
				class="text-muted-foreground transition-colors hover:text-pink-500"
				aria-label={m['footer.social_instagram']()}
			>
				<Instagram class="h-5 w-5" aria-hidden="true" />
			</a>
			<a
				href="https://www.youtube.com/@durockrj"
				target="_blank"
				rel="noopener noreferrer"
				class="text-muted-foreground transition-colors hover:text-red-600"
				aria-label={m['footer.social_youtube']()}
			>
				<Youtube class="h-5 w-5" aria-hidden="true" />
			</a>
		</div>

		<!-- Bottom links -->
		<div
			class="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground"
		>
			<a href="/legal/privacidade" class="transition-colors hover:text-foreground">
				{m['footer.privacyPolicy']()}
			</a>
			<span class="text-muted-foreground/50">|</span>
			<a href="/legal/termos" class="transition-colors hover:text-foreground">
				{m['footer.termsOfService']()}
			</a>
		</div>

		<!-- Copyright -->
		<div class="mt-6 text-center text-sm text-muted-foreground">
			<p>&copy; {new Date().getFullYear()} DuRock RJ • {m['footer.copyright']()}</p>
		</div>
	</div>
</footer>
