<script>
	import Compose from "./hello/Compose.svelte";
	import Success from "./hello/Success.svelte";
	import contact, { HELLO_STEPS } from "../../stores/contact.js";
	import Schedule from "./hello/Schedule.svelte";
	import Survey from "./hello/Survey.svelte";
	import NotifySuccess from "./hello/NotifySuccess.svelte";
	import { getContext } from "svelte";
	import { key } from "../../../common/modal.js";
	import SurveySuccess from "./hello/SurveySuccess.svelte";

	getContext(key)?.setBackgroundClickable(true);
	getContext(key)?.setCanGoBack(false);
</script>

{#if $contact.helloStep === HELLO_STEPS.compose}
	<Compose />
{:else if $contact.helloStep === HELLO_STEPS.success}
	<Success />
{:else if $contact.helloStep === HELLO_STEPS.schedule}
	<Schedule />
{:else if $contact.helloStep === HELLO_STEPS.survey}
	<Survey />
{:else if $contact.helloStep === HELLO_STEPS.notifySuccess}
	<NotifySuccess />
{:else if $contact.helloStep === HELLO_STEPS.surveySuccess}
	<SurveySuccess />
{/if}
