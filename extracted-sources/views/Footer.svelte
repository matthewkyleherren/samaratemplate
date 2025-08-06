<script>
	import { createEventDispatcher } from "svelte";
	import Loader from "../../common/Loader.svelte";
	export let submitTitle;
	export let canSubmit;
	export let isLoading = false;

	const dispatchEvent = createEventDispatcher();

	function didClickButton() {
		dispatchEvent("submit");
	}
</script>

<div class="contact-footer">
	<div class="spacer-64 m-spacer-32" />
	<button
		class="button-rounded button-rounded-blue type-18"
		on:click={didClickButton}
		disabled={canSubmit !== true && isLoading !== true}>
		{#if isLoading}
			<Loader variant="light" />
		{:else}
			{submitTitle}
		{/if}
	</button>
</div>

<style>
	.contact-footer {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	button {
		display: flex;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		border-radius: 12px !important;
		width: 100%;
		height: 57px;
	}

	button:disabled {
		pointer-events: none;
	}
</style>
