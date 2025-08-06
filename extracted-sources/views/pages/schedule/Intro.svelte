<script>
	import FormFieldLabel from "../../../../common/FormFieldLabel.svelte";
	import FormFieldInput from "../../../../common/FormFieldInput.svelte";
	import contact, {
		SCHEDULE_STEPS,
		isValidSchedule
	} from "../../../stores/contact.js";
	import Features from "../../Features.svelte";
	import Header from "../../Header.svelte";
	import Footer from "../../Footer.svelte";
	import FormFieldCheckbox from "../../../../common/FormFieldCheckbox.svelte";
	import FormFieldAddress from "../../../../common/FormFieldAddress.svelte";
	import isServicableAddress from "../../../../common/isServicableAddress";

	let isLoading = false;

	$: isServicable = isServicableAddress($contact);

	async function didClickContinueButton() {
		if (isServicable) {
			contact.openScheduleStep(SCHEDULE_STEPS.picker);
		} else {
			isLoading = true;

			await API.expand(
				$contact.data.zip,
				$contact.data.email,
				"phone",
				undefined,
				$contact.data.address
			);

			contact.openScheduleStep(SCHEDULE_STEPS.notifySuccess);

			isLoading = false;
		}
	}
</script>

<div class="spacer-8 m-spacer-24"></div>

<Header>
	<span slot="title">Schedule a phone call</span>
	<span slot="subtitle">
		Book a 15 minute phone call to learn how Backyard works on
		your&nbsp;property.
	</span>
</Header>

<div class="spacer-50 m-spacer-32" />
<Features variant="half-split" />

<div class="modal-grid">
	<div class="modal-grid-column-6">
		<div class="spacer-50 m-spacer-32" />
		<FormFieldLabel>
			<span slot="label">Enter your contact information</span>
		</FormFieldLabel>
	</div>
</div>

<div class="spacer-16 m-spacer-8" />
<div class="modal-grid modal-grid-half-gap">
	<div class="modal-grid-column-3">
		<FormFieldInput title="First name" name="firstName" store={contact} />
	</div>
	<div class="modal-grid-column-3">
		<FormFieldInput title="Last name" name="lastName" store={contact} />
	</div>

	<div class="modal-grid-column-6">
		<div class="spacer-12 m-spacer-8" />
		<FormFieldInput
			title="Email"
			name="email"
			type="email"
			store={contact} />
	</div>

	<div class="modal-grid-column-6">
		<div class="spacer-12 m-spacer-8" />
		<FormFieldInput
			title="Phone"
			name="phone"
			type="phone"
			store={contact} />
	</div>
</div>

<div class="spacer-50 m-spacer-32" />
<FormFieldAddress
	title="Where do you want Backyard installed?"
	fieldTitle="Installation address"
	store={contact} />

{#if isServicable === false}
	<div class="type-center m-type-left">
		<div class="spacer-32" />
		<h2 class="type-18 m-type-15 color-red">
			Sorry, we're not available in&nbsp;your area...&nbsp;yet.
		</h2>
		<div class="spacer-8 m-spacer-4" />
		<div class="type-15 m-type-14 color-text-40">
			But we can notify you when Backyard comes to&nbsp;your&nbsp;area.
		</div>
		<div class="spacer-16" />
	</div>
{:else}
	<div class="spacer-50 m-spacer-32" />
	<div class="modal-grid">
		<div class="modal-grid-column-6 contact-page-header">
			<FormFieldLabel>
				<span slot="label">How can we help?</span>
			</FormFieldLabel>
		</div>
		<div class="modal-grid-column-6">
			<div class="spacer-16 m-spacer-8" />
			<FormFieldInput
				title="Message"
				name="message"
				type="textarea"
				store={contact} />
		</div>
	</div>
{/if}

{#if $contact.data.isSubscribed !== true}
	<div class="spacer-50 m-spacer-32" />
	<div class="modal-grid">
		<div class="modal-grid-column-6">
			<FormFieldCheckbox
				title="Send me general updates about&nbsp;Samara"
				name="shouldSubscribe"
				store={contact} />
		</div>
	</div>
{/if}

<Footer
	submitTitle={isServicable === false ? "Notify me" : "Continue"}
	on:submit={didClickContinueButton}
	canSubmit={isValidSchedule($contact)}
	{isLoading} />
