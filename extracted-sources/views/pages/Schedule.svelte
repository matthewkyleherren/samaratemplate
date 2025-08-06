<script>
	import contact, { CONTACT_PAGES, SCHEDULE_STEPS } from "../../stores/contact.js";
	import Intro from "./schedule/Intro.svelte";
	import Picker from "./schedule/Picker.svelte";
	import Success from "./schedule/Success.svelte";
	import NotifySuccess from "./hello/NotifySuccess.svelte";
	import { getContext } from "svelte";
	import { key } from "../../../common/modal.js";

	$: getContext(key)?.setCanGoBack(
		$contact.scheduleStep === SCHEDULE_STEPS.intro ||
			$contact.scheduleStep === SCHEDULE_STEPS.picker
	);

	function didClickBackButton() {
		switch ($contact.scheduleStep) {
			case SCHEDULE_STEPS.intro:
				contact.openPage(CONTACT_PAGES.home);
				break;

			case SCHEDULE_STEPS.picker:
				contact.openScheduleStep(SCHEDULE_STEPS.intro);
				break;

			default:
				break;
		}
	}
</script>

<svelte:window on:modal:did-click-back-button={didClickBackButton} />

{#if $contact.scheduleStep === SCHEDULE_STEPS.intro}
	<Intro />
{:else if $contact.scheduleStep === SCHEDULE_STEPS.picker}
	<Picker />
{:else if $contact.scheduleStep === SCHEDULE_STEPS.success}
	<Success />
{:else if $contact.scheduleStep === SCHEDULE_STEPS.notifySuccess}
	<NotifySuccess />
{/if}
