<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { Music, X } from 'lucide-svelte';
	import { bandListBands } from '$lib/api/generated/sdk.gen';

	interface Props {
		/** Array of selected band names */
		value?: string[];
		/** Unique identifier for the input */
		id?: string;
		/** Label text displayed above the input */
		label?: string;
		/** Placeholder text */
		placeholder?: string;
		/** Whether the field is required */
		required?: boolean;
		/** Whether the field is disabled */
		disabled?: boolean;
		/** Error message to display */
		error?: string;
		/** Additional CSS classes */
		class?: string;
		/** Callback fired when the band list changes */
		onBandsChange?: (bands: string[]) => void;
	}

	let {
		value = $bindable([]),
		id,
		label,
		placeholder = m['detailsStep.addBandsPlaceholder'](),
		required = false,
		disabled = false,
		error,
		class: className,
		onBandsChange
	}: Props = $props();

	const inputId = $derived(id || `band-input-${Math.random().toString(36).substr(2, 9)}`);

	let inputValue = $state('');
	let suggestions = $state<string[]>([]);
	let isSearching = $state(false);
	let showSuggestions = $state(false);
	let selectedSuggestionIndex = $state(-1);
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	// Live search against the band registry as the user types — a static
	// preloaded list doesn't scale as the registry grows.
	async function performSearch(query: string): Promise<void> {
		if (!query.trim()) {
			suggestions = [];
			showSuggestions = false;
			return;
		}

		isSearching = true;
		try {
			const response = await bandListBands({ query: { search: query, page_size: 10 } });
			suggestions = (response.data?.results ?? [])
				.map((band) => band.name)
				.filter((name) => !value.includes(name));
			showSuggestions = true;
			selectedSuggestionIndex = -1;
		} catch (err) {
			console.error('Band search error:', err);
			suggestions = [];
		} finally {
			isSearching = false;
		}
	}

	function addBand(name: string): void {
		const trimmed = name.trim();
		if (!trimmed) return;
		if (value.includes(trimmed)) return;

		value = [...value, trimmed];
		onBandsChange?.(value);
		inputValue = '';
		suggestions = [];
		showSuggestions = false;
		selectedSuggestionIndex = -1;
	}

	function removeBand(index: number): void {
		value = value.filter((_, i) => i !== index);
		onBandsChange?.(value);
	}

	function handleInput(event: Event): void {
		const target = event.target as HTMLInputElement;
		inputValue = target.value;

		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => performSearch(inputValue), 300);
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Enter' || event.key === ',') {
			event.preventDefault();

			if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
				addBand(suggestions[selectedSuggestionIndex]);
			} else if (inputValue.trim()) {
				addBand(inputValue);
			}
			return;
		}

		if (showSuggestions && suggestions.length > 0) {
			if (event.key === 'ArrowDown') {
				event.preventDefault();
				selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, suggestions.length - 1);
			} else if (event.key === 'ArrowUp') {
				event.preventDefault();
				selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
			} else if (event.key === 'Escape') {
				event.preventDefault();
				showSuggestions = false;
				selectedSuggestionIndex = -1;
			}
		}
	}

	function handleBlur(): void {
		// Delay to allow clicking on suggestions
		setTimeout(() => {
			showSuggestions = false;
		}, 200);
	}

	function selectSuggestion(name: string): void {
		addBand(name);
	}
</script>

<div class="space-y-2 {className ?? ''}">
	{#if label}
		<label for={inputId} class="block text-sm font-medium">
			<span class="flex items-center gap-2">
				<Music class="h-4 w-4" aria-hidden="true" />
				{label}
				{#if required}
					<span class="text-destructive" aria-label={m['bandInput.required']()}>*</span>
				{/if}
			</span>
		</label>
	{/if}

	<div class="flex gap-2">
		<div class="relative flex-1">
			<input
				id={inputId}
				type="text"
				value={inputValue}
				oninput={handleInput}
				onkeydown={handleKeydown}
				onfocus={() => {
					if (inputValue.trim() && suggestions.length > 0) {
						showSuggestions = true;
					}
				}}
				onblur={handleBlur}
				{placeholder}
				{required}
				{disabled}
				class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 {error
					? 'border-destructive'
					: ''}"
				autocomplete="off"
				role="combobox"
				aria-expanded={showSuggestions}
				aria-controls="{inputId}-suggestions"
				aria-activedescendant={selectedSuggestionIndex >= 0
					? `${inputId}-suggestion-${selectedSuggestionIndex}`
					: undefined}
				aria-invalid={!!error}
				aria-describedby={error ? `${inputId}-error` : undefined}
			/>

			{#if showSuggestions && suggestions.length > 0}
				<div
					id="{inputId}-suggestions"
					role="listbox"
					class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-popover text-popover-foreground shadow-md"
				>
					{#each suggestions as suggestion, index (suggestion)}
						<button
							type="button"
							id="{inputId}-suggestion-{index}"
							role="option"
							aria-selected={selectedSuggestionIndex === index}
							onclick={() => selectSuggestion(suggestion)}
							class="flex w-full cursor-pointer items-center px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground {selectedSuggestionIndex ===
							index
								? 'bg-accent text-accent-foreground'
								: ''}"
						>
							<Music class="mr-2 h-3 w-3" aria-hidden="true" />
							{suggestion}
						</button>
					{/each}
				</div>
			{/if}

			{#if isSearching}
				<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
					<svg
						class="h-4 w-4 animate-spin text-muted-foreground"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<circle
							class="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="4"
						/>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						/>
					</svg>
				</div>
			{/if}
		</div>
		<button
			type="button"
			disabled={disabled || !inputValue.trim()}
			onclick={() => addBand(inputValue)}
			class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
		>
			{m['detailsStep.add']()}
		</button>
	</div>

	{#if value.length > 0}
		<div class="flex flex-wrap gap-2">
			{#each value as band, index (band)}
				<span
					class="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent"
				>
					{band}
					<button
						type="button"
						onclick={() => removeBand(index)}
						class="ml-1 rounded-full p-0.5 transition-colors hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						aria-label={m['bandInput.removeBand']({ band })}
					>
						<X class="h-3 w-3" aria-hidden="true" />
					</button>
				</span>
			{/each}
		</div>
	{/if}

	{#if error}
		<p id="{inputId}-error" class="text-sm text-destructive" role="alert">
			{error}
		</p>
	{/if}
</div>
