<script>
	import Compose from "./message/Compose.svelte";
	import Success from "../Success.svelte";
	import contact, {
		CONTACT_PAGES,
		MESSAGE_STEPS
	} from "../../stores/contact.js";
	import { getContext } from "svelte";
	import { key } from "../../../common/modal.js";

	$: getContext(key)?.setCanGoBack(
		$contact.messageStep === MESSAGE_STEPS.compose
	);

	function didClickBackButton() {
		contact.openPage(CONTACT_PAGES.home);
	}
</script>

<svelte:window on:modal:did-click-back-button={didClickBackButton} />

{#if $contact.messageStep === MESSAGE_STEPS.compose}
	<Compose />
{:else if $contact.messageStep === MESSAGE_STEPS.success}
	<Success
		title="Your message has been sent."
		body="A Samara specialist will get back to you within one business day." />
{/if}
