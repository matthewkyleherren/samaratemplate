<script>
	import Compose from "./showroom/Compose.svelte";
	import Success from "../Success.svelte";
	import contact, { SHOWROOM_STEPS } from "../../stores/contact.js";
	import { getContext } from "svelte";
	import { key } from "../../../common/modal.js";

	$: getContext(key)?.setCanGoBack(false);
</script>

{#if $contact.showroomStep === SHOWROOM_STEPS.compose}
	<Compose />
{:else if $contact.showroomStep === SHOWROOM_STEPS.success}
	<Success
		title="Your request has been sent."
		body="A Samara specialist will get back to you within one business day." />
{/if}
