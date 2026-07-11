<script lang="ts">
	import { Dialog, DialogContent, DialogTitle } from '$lib/components/ui/dialog';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		src: string;
		alt?: string;
		class?: string;
	}

	const { src, alt = '', class: className }: Props = $props();

	let open = $state(false);
</script>

<button
	type="button"
	onclick={() => (open = true)}
	class="cursor-zoom-in"
	aria-label={m['imageLightbox.expandLabel']()}
>
	<img {src} {alt} class={className} />
</button>

<Dialog
	{open}
	onOpenChange={(isOpen) => {
		open = isOpen;
	}}
>
	<DialogContent
		class="grid max-h-[95vh] max-w-[95vw] place-items-center border-none bg-transparent p-0 shadow-none [&>button]:rounded-full [&>button]:bg-black/50 [&>button]:p-1.5 [&>button]:text-white [&>button]:opacity-100 [&>button]:hover:bg-black/70"
	>
		<DialogTitle class="sr-only">{alt || m['imageLightbox.expandLabel']()}</DialogTitle>
		<img {src} {alt} class="max-h-[95vh] max-w-full rounded-md object-contain" />
	</DialogContent>
</Dialog>
