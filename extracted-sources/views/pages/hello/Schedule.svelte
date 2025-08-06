<script>
	import Calendar from "../../Calendar.svelte";
	import Times from "../../Times.svelte";
	import Header from "../../Header.svelte";
	import contact, {
		CONTACT_VARIANTS,
		HELLO_STEPS
	} from "../../../stores/contact.js";
	import slots from "../../../stores/slots.js";
	import Loader from "../../../../common/Loader.svelte";
	import Features from "../../Features.svelte";
	import Error from "../../Error.svelte";
	import createErrorLink from "../../../utils/createErrorLink";
	import { DateTime } from "luxon";
	import FormFieldLabel from "../../../../common/FormFieldLabel.svelte";

	const quickSlots = slots("discovery");
	quickSlots.refresh($contact.data.zip, $contact.data.slug);

	let isLoading = false;
	let isFailed = false;
	let selectedDate = $contact.data.slot;
	let selectedSlot = $contact.data.slot;

	$: selectedSlot && contact.updateData("slot", selectedSlot);

	$: availableSlotsForSelectedDate =
		selectedDate &&
		$quickSlots.slots &&
		$quickSlots.slots.filter(
			(slot) =>
				slot.month === selectedDate.month &&
				slot.day === selectedDate.day
		);

	$: errorLink = createErrorLink(
		"Site error: requesting a quick estimate review",
		[
			["Request type", "Quick estimate review"],
			[
				"Requested time",
				$contact.data.slot &&
					$contact.data.slot.toLocaleString(DateTime.DATETIME_MED)
			],
			["Name", `${$contact.data.firstName} ${$contact.data.lastName}`],
			["Installation address", $contact.data.address],
			["Phone number", $contact.data.phone]
		]
	);

	$: didClickContinueButton = async () => {
		isLoading = true;
		isFailed = false;

		try {
			const res = await API.bookAppointment(
				"discovery",
				$contact.data.slot.toISO(),
				$contact.data
			);

			if (res.ok !== true) {
				throw new Error("failed to book appointment");
			}

			if ($contact.variant === CONTACT_VARIANTS.wildfires) {
				contact.openHelloStep(HELLO_STEPS.surveySuccess);
			} else {
				contact.openHelloStep(HELLO_STEPS.survey);
			}
		} catch (error) {
			isFailed = true;
			console.error(error);
		}

		isLoading = false;
	};
</script>

<div
	class="contact-schedule-picker"
	class:contact-schedule-picker-loading={isLoading}>
	<Header>
		<span slot="title">Schedule a follow-up call</span>
		<span slot="subtitle">
			To get more information, schedule a quick
			<nobr class="nobr">15-minute call</nobr> with a&nbsp;specialist.
		</span>
	</Header>

	<div class="spacer-32 m-spacer-32" />
	<Features variant="half-split" />
	<div class="spacer-64" />

	{#if $quickSlots.isLoading}
		<div class="slots-loading-message type-15 color-text-60">
			Loading available dates <Loader />
		</div>
	{:else}
		<div class="modal-grid-column-6">
			<FormFieldLabel>
				<span slot="label">When should we call you?</span>
				<span slot="subtitle">
					Times are displayed in Pacific Time.
				</span>
			</FormFieldLabel>
		</div>

		<div class="spacer-32" />
		<hr class="divider" />
		<div class="spacer-32" />
		<Calendar availableDates={$quickSlots.dates} bind:selectedDate />
	{/if}

	{#if selectedDate !== undefined}
		<div class="spacer-64 m-spacer-32" />
		<hr class="divider" />
		<div class="spacer-50" />
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
