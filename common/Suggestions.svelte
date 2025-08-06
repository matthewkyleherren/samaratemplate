<script>
	import { createEventDispatcher } from "svelte";
	import Loader from "./Loader.svelte";

	const BIAS = {
		socal: "-118,34",
		nocal: "-122,37"
	};

	export let query;
	export let isVisible;
	export let variant = "default";

	const dispatchEvent = createEventDispatcher();

	let previousQuery;
	let suggestions = [];
	let indexForHighlightedSuggestion = -1;
	let isLoading = false;
	let session;
	let controller;

	$: bias = BIAS.socal;

	$: shouldDisplaySuggestions =
		isVisible &&
		suggestions !== undefined &&
		(suggestions.length > 0 || isLoading);

	$: (async () => {
		const sanitizedQuery = (query || "")
			.split(" ")
			.slice(0, 20)
			.join(" ")
			.slice(0, 256);

		if (sanitizedQuery === previousQuery) {
			return;
		}

		previousQuery = sanitizedQuery;
		indexForHighlightedSuggestion = -1;
		suggestions = [];

		if (controller) {
			controller.abort();
			controller = null;
		}

		if (!sanitizedQuery || sanitizedQuery.length < 3 || !isVisible) {
			return;
		}

		isLoading = true;
		controller = new AbortController();

		try {
			const res = await API.completeAddress(
				encodeURIComponent(sanitizedQuery),
				session,
				bias,
				controller.signal
			);

			const json = await res.json();

			session = json.session;
			bias = json.bias;
			suggestions = json.suggestions;
		} catch (error) {
			if (error.name === "AbortError") {
				return;
			}

			dispatchEvent("error");

			console.error("failed to load address suggestions", error);
		}

		isLoading = false;
	})();

	function selectSuggestion() {
		const suggestion =
			suggestions[indexForHighlightedSuggestion] || suggestions[0];

		if (suggestion !== undefined) {
			dispatchEvent("select", { suggestion });
		}
	}

	function didPressUpArrowKey(e) {
		e.preventDefault();

		indexForHighlightedSuggestion = Math.max(
			indexForHighlightedSuggestion - 1,
			0
		);
	}

	function didPressDownArrowKey(e) {
		e.preventDefault();

		if (suggestions === undefined) {
			return;
		}

		indexForHighlightedSuggestion = Math.min(
			indexForHighlightedSuggestion + 1,
			suggestions.length - 1
		);
	}

	function didPressEnterKey(e) {
		if (isVisible && suggestions.length > 0) {
			e.target.blur();
			e.preventDefault();
			selectSuggestion();
		}
	}

	function didPressEscapeKey(e) {
		e.preventDefault();
		suggestions = [];
	}

	function didPressKey(e) {
		switch (e.key) {
			case "ArrowUp":
				didPressUpArrowKey(e);
				break;

			case "ArrowDown":
				didPressDownArrowKey(e);
				break;

			case "Enter":
				didPressEnterKey(e);
				break;

			case "Escape":
				didPressEscapeKey(e);
				break;

			default:
				break;
		}
	}

	function didMouseOverSuggestion(index) {
		indexForHighlightedSuggestion = index;
	}

	function didClickSuggestion() {
		selectSuggestion();
	}
</script>

<svelte:window on:keydown={didPressKey} />

<div class={`suggestions ${variant}`}>
	<ul class:visible={shouldDisplaySuggestions}>
		{#each suggestions as suggestion, index}
			<li
				class="type-15 m-type-14"
				class:selected={index === indexForHighlightedSuggestion}
				on:mouseover={() => didMouseOverSuggestion(index)}
				on:mousedown={didClickSuggestion}>
				{suggestion.address}
			</li>
		{/each}

		{#if isLoading}
			<li class="loader-container"><Loader /></li>
		{/if}
	</ul>
</div>

<style>
	.suggestions {
		position: relative;
		margin: 0 auto;
		width: 70%;
		min-width: 300px;
		height: 0;
		color: #000000;
		font-size: 15px;
	}

	.contact.suggestions {
		width: 100% !important;
	}

	@media (max-width: 768px) {
		.suggestions {
			width: 100% !important;
			min-width: unset;
		}
	}

	ul {
		display: none;
		position: absolute;
		top: 9px;
		z-index: 10000;
		box-sizing: border-box;
		margin: 0;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
		border-radius: 12px;
		background: #ffffff;
		padding: 8px;
		width: 100%;
		list-style-type: none;
	}

	ul.visible {
		display: unset;
	}

	ul li {
		cursor: pointer;
		border-radius: 6px;
		padding: 8px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	ul li.selected {
		background: var(--color-blue);
		color: #ffffff;
	}

	.loader-container {
		display: flex;
		justify-content: center;
	}
</style>
