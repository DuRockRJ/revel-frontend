<script lang="ts">
	import { mode, toggleMode } from 'mode-watcher';
	import { Sun, Moon } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages.js';
</script>

<button
	type="button"
	class="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
	onclick={toggleMode}
	aria-label={m['theme.toggleTheme']()}
>
	{#if $mode === 'dark'}
		<Moon class="h-5 w-5" aria-hidden="true" />
	{:else}
		<Sun class="h-5 w-5" aria-hidden="true" />
	{/if}
</button>
