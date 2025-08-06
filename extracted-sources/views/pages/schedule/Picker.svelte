<script>
	import Calendar from "../../Calendar.svelte";
	import Times from "../../Times.svelte";
	import Features from "../../Features.svelte";
	import Header from "../../Header.svelte";
	import contact, { SCHEDULE_STEPS } from "../../../stores/contact.js";
	import slots from "../../../stores/slots.js";
	import Loader from "../../../../common/Loader.svelte";
	import FormFieldLabel from "../../../../common/FormFieldLabel.svelte";
	import { getContext, onMount } from "svelte";
	import { key } from "../../../../common/modal.js";
	import Error from "../../Error.svelte";
	import { DateTime } from "luxon";
	import createErrorLink from "../../../utils/createErrorLink";

	const quickSlots = slots("contact");

	quickSlots.refresh($contact.data.zip);

	let isLoading = false;
	let isFailed = false;
	let selectedDate = $contact.data.slot;
	let selectedSlot = $contact.data.slot;

	$: isLoading && getContext(key)?.setCanGoBack(false);

	$: selectedSlot && contact.updateData("slot", selectedSlot);

	$: (() => {
		if (selectedSlot) {
			isFailed = false;
		}
	})();

	$: availableSlotsForSelectedDate =
		selectedDate &&
		$quickSlots.slots &&
		$quickSlots.slots.filter(
			(slot) =>
				slot.month === selectedDate.month &&
				slot.day === selectedDate.day
		);

	$: errorLink = createErrorLink("Site error: scheduling a phone call", [
		["Request type", "Phone call"],
		[
			"Requested date",
			$contact.data.slot &&
				$contact.data.slot.toLocaleString(DateTime.DATETIME_MED)
		],
		["Name", `${$contact.data.firstName} ${$contact.data.lastName}`],
		["Installation address", $contact.data.address],
		["Phone number", $contact.data.phone],
		["Message", $contact.data.message]
	]);

	async function didClickContinueButton() {
		isLoading = true;
		isFailed = false;

		try {
			const res = await API.bookAppointment(
				"contact",
				$contact.data.slot.toISO(),
				$contact.data
			);

			if (res.ok !== true) {
				throw new Error("failed to book appointment");
			}

			contact.openScheduleStep(SCHEDULE_STEPS.success);
		} catch (error) {
			isFailed = true;
			console.error("failed to book phone call", error);
		}

		if ($contact.data.shouldSubscribe) {
			API.subscribe($contact.data.email, ["contact"]);
			contact.updateData("isSubscribed", undefined);
		}

		isLoading = false;
	}

	onMount(() => {
		gtag("event", "contact_phone_call_will_schedule");
	});
</script>

<div class="spacer-8 m-spacer-24"></div>

<div
	class="contact-schedule-picker"
	class:contact-schedule-picker-loading={isLoading}>
	<Header>
		<span slot="title">When should we call you?</span>
		<span slot="subtitle">
			To complete scheduling your call, select a date and&nbsp;time.
		</span>
	</Header>

	<div class="spacer-50 m-spacer-32" />
	<Features variant="half-split" />

	<div class="spacer-50" />

	{#if $quickSlots.isLoading}
		<div class="slots-loading-message type-15 color-text-60">
			Loading available dates <Loader />
		</div>
	{:else}
		<FormFieldLabel>
			<span slot="label">Select a date</span>
			<span slot="subtitle">Only available dates are selectable.</span>
		</FormFieldLabel>
		<div class="spacer-32" />
		<hr class="divider" />
		<div class="spacer-32" />
		<Calendar availableDates={$quickSlots.dates} bind:selectedDate />
	{/if}

	{#if selectedDate !== undefined && $quickSlots.isLoading !== true}
		<div class="spacer-64 m-spacer-32" />
		<FormFieldLabel>
			<span slot="label">Select a time</span>
			<span slot="subtitle">Times are shown in Pacific Time.</span>
		</FormFieldLabel>
		<div class="spacer-32" />
		<hr class="divider" />
		<div class="spacer-32" />
		<Times
			variant="confirmable"
			{selectedDate}
			availableSlots={availableSlotsForSelectedDate}
			bind:selectedSlot
			on:confirm={didClickContinueButton}
			{isLoading}>
			{#if isFailed}
				<Error>
					<a href={errorLink}>Click here</a> to schedule your call via
					email.
				</Error>
				<div class="spacer-8"></div>
			{/if}
		</Times>
	{/if}
</div>

<style>
	.slots-loading-message {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 10px;
	}

	.contact-schedule-picker-loading {
		pointer-events: none;
	}
</style>
