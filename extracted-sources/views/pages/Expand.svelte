<script>
	import Entry from "./expand/Entry.svelte";
	import Success from "../Success.svelte";
	import contact, { EXPAND_STEPS } from "../../stores/contact.js";
	import { getContext } from "svelte";
	import { key } from "../../../common/modal.js";

	getContext(key)?.setCanGoBack(false);
</script>

{#if $contact.expandStep === EXPAND_STEPS.entry}
	<Entry />
{:else if $contact.expandStep === EXPAND_STEPS.success}
	<Success
		title="Thanks for sharing."
		body="We'll let you know if Backyard becomes available in {$contact.data
			.zip}." />
{/if}
