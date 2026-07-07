<script lang="ts">
	import { Music, X, Loader2 } from 'lucide-svelte';
	import { cn } from '$lib/utils/cn';
	import { bandListBands } from '$lib/api';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		selectedBands: string[];
		onToggleBand: (band: string) => void;
		class?: string;
	}

	const { selectedBands = [], onToggleBand, class: className }: Props = $props();

	let searchQuery = $state('');
	let isSearching = $state(false);
	let searchResults = $state<string[]>([]);
	let isDropdownOpen = $state(false);
	let hasSearched = $state(false);
	let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

	// Live search against the band registry as the user types — a static
	// preloaded list doesn't scale as the registry grows.
	async function searchBands(query: string): Promise<void> {
		if (!query.trim()) {
			searchResults = [];
			isDropdownOpen = false;
			hasSearched = false;
			return;
		}

		isSearching = true;
		try {
			const response = await bandListBands({ query: { search: query, page_size: 10 } });
			searchResults = (response.data?.results ?? [])
				.map((band) => band.name)
				.filter((name) => !selectedBands.includes(name));
			hasSearched = true;
			isDropdownOpen = true;
		} catch (err) {
			console.error('Failed to search bands:', err);
			searchResults = [];
		} finally {
			isSearching = false;
		}
	}

	function handleInput(event: Event): void {
		const target = event.target as HTMLInputElement;
		searchQuery = target.value;
		hasSearched = false;

		if (debounceTimeout) clearTimeout(debounceTimeout);
		debounceTimeout = setTimeout(() => searchBands(searchQuery), 300);
	}

	function handleSelectBand(band: string): void {
		onToggleBand(band);
		searchQuery = '';
		searchResults = [];
		isDropdownOpen = false;
		hasSearched = false;
	}

	function handleRemoveBand(band: string): void {
		onToggleBand(band);
	}

	function handleBlur(): void {
		// Delay to allow click on dropdown items
		setTimeout(() => {
			isDropdownOpen = false;
		}, 200);
	}

	function handleFocus(): void {
		if (searchQuery && (searchResults.length > 0 || hasSearched)) {
			isDropdownOpen = true;
		}
	}
</script>

<div class={cn('space-y-3', className)}>
	<div class="flex items-center gap-2">
		<Music class="h-4 w-4 text-muted-foreground" aria-hidden="true" />
		<h3 class="text-sm font-medium">{m['filters.bands.heading']()}</h3>
	</div>

	<!-- Selected bands as removable chips -->
	{#if selectedBands.length > 0}
		<div class="flex flex-wrap gap-2">
			{#each selectedBands as band (band)}
				<span
					class="inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
				>
					{band}
					<button
						type="button"
						onclick={() => handleRemoveBand(band)}
						class="rounded-full p-0.5 transition-colors hover:bg-primary-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						aria-label={m['filters.bands.remove']({ band })}
					>
						<X class="h-3 w-3" aria-hidden="true" />
					</button>
				</span>
			{/each}
		</div>
	{/if}

	<!-- Band search input -->
	<div class="relative">
		<div class="relative">
			<Music
				class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
				aria-hidden="true"
			/>
			<input
				type="text"
				value={searchQuery}
				oninput={handleInput}
				onblur={handleBlur}
				onfocus={handleFocus}
				placeholder={m['filters.bands.placeholder']()}
				class="h-10 w-full rounded-md border border-input bg-background pl-9 pr-9 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				aria-label={m['filters.bands.label']()}
				autocomplete="off"
			/>
			{#if isSearching}
				<Loader2
					class="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
					aria-hidden="true"
				/>
			{/if}
		</div>

		<!-- Search Results Dropdown -->
		{#if isDropdownOpen && searchResults.length > 0}
			<div
				class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-popover shadow-md"
			>
				{#each searchResults as band (band)}
					<button
						type="button"
						onclick={() => handleSelectBand(band)}
						class="group flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:outline-none"
					>
						<Music
							class="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-accent-foreground group-focus-visible:text-accent-foreground"
							aria-hidden="true"
						/>
						{band}
					</button>
				{/each}
			</div>
		{:else if isDropdownOpen && hasSearched && !isSearching && searchResults.length === 0}
			<div
				class="absolute z-10 mt-1 w-full rounded-md border border-input bg-popover p-3 shadow-md"
			>
				<p class="text-sm text-muted-foreground">
					{m['filters.bands.noResultsFound']({ query: searchQuery })}
				</p>
			</div>
		{/if}
	</div>

	{#if selectedBands.length > 0}
		<p class="text-xs text-muted-foreground">
			{m['filters.bands.count']({
				count: selectedBands.length,
				bandPlural: selectedBands.length === 1 ? 'banda' : 'bandas'
			})}
		</p>
	{/if}
</div>
