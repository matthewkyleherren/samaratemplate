<script>
	import FormFieldLabel from "../../../../common/FormFieldLabel.svelte";
	import FormFieldInput from "../../../../common/FormFieldInput.svelte";
	import Header from "../../Header.svelte";
	import Footer from "../../Footer.svelte";
	import contact, {
		SHOWROOM_STEPS,
		isValidShowroomRequest
	} from "../../../stores/contact.js";
	import FormFieldCheckbox from "../../../../common/FormFieldCheckbox.svelte";
	import FormFieldAddress from "../../../../common/FormFieldAddress.svelte";
	import Error from "../../Error.svelte";
	import createErrorLink from "../../../utils/createErrorLink";
	import FormButtonSelect from "../../../../common/FormButtonSelect.svelte";
	import isServicableAddress from "../../../../common/isServicableAddress";
	import { onMount } from "svelte";

	let isLoading = false;
	let isFailed = false;

	$: isServicable = isServicableAddress($contact);

	$: errorLink = createErrorLink("Site error: requesting a showroom tour", [
		["Request type", "Thousand Oaks showroom tour"],
		["Name", `${$contact.data.firstName} ${$contact.data.lastName}`],
		["Installation address", $contact.data.address],
		["Phone number", $contact.data.phone],
		["Message", $contact.data.message],
		["Preferred days", ($contact.data["preferred-days"] ?? []).join(", ")],
		["Preferred times", ($contact.data["preferred-times"] ?? []).join(", ")]
	]);

	async function didSubmitForm() {
		isLoading = true;
		isFailed = false;

		try {
			const res = await API.requestShowroomTour(
				JSON.stringify({
					...$contact.data,
					preferredDays: $contact.data["preferred-days"],
					preferredTimes: $contact.data["preferred-times"]
				})
			);

			if (res.ok !== true) {
				throw new Error("failed to send message");
			}

			if ($contact.data.shouldSubscribe) {
				API.subscribe($contact.data.email, ["contact", "message"]);
				contact.updateData("isSubscribed", undefined);
			}

			contact.openShowroomStep(SHOWROOM_STEPS.success);

			gtag("event", "showroom_did_request");

			setTimeout(() => {
				contact.updateData("message", undefined);
			}, 0);
		} catch (error) {
			isFailed = true;
			console.error("failed to send message", error);
		}

		isLoading = false;
	}

	onMount(() => {
		gtag("event", "showroom_will_request");
	});
</script>

<div class="spacer-8 m-spacer-24"></div>

<Header>
	<span slot="title">Request a tour</span>
	<span slot="subtitle">
		To schedule a tour at our Thousand Oaks pop-up, share your details below
		and we'll get back to you over&nbsp;email.
	</span>
</Header>

<div class="modal-grid">
	<div class="modal-grid-column-6">
		<div class="spacer-50 m-spacer-32" />
		<FormFieldLabel>
			<span slot="label">Enter your contact information</span>
		</FormFieldLabel>
	</div>
</div>
<div class="spacer-16" />

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
	title="Where would your Backyard go?"
	fieldTitle="Installation address"
	store={contact} />

{#if isServicable === false}
	<div class="type-center m-type-left">
		<div class="spacer-32" />
		<h2 class="type-18 m-type-15 color-red">
			Heads up: we're not available in&nbsp;your&nbsp;area.
		</h2>
		<div class="spacer-8 m-spacer-4" />
		<div class="type-15 m-type-14 color-text-40">
			You can still request a tour through this&nbsp;form.
		</div>
		<div class="spacer-16" />
	</div>
{/if}

<div class="spacer-50 m-spacer-32" />
<div class="modal-grid">
	<div class="modal-grid-column-6 contact-page-header">
		<FormFieldLabel>
			<span slot="label">Preferred days of the week</span>
		</FormFieldLabel>
	</div>
	<div class="modal-grid-column-6">
		<div class="spacer-16 m-spacer-8" />
		<FormButtonSelect
			name="preferred-days"
			store={contact}
			allowsMultiple={true}
			options={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]} />
	</div>
</div>

<div class="spacer-50 m-spacer-32" />
<div class="modal-grid">
	<div class="modal-grid-column-6 contact-page-header">
		<FormFieldLabel>
			<span slot="label">Preferred times of day</span>
		</FormFieldLabel>
	</div>
	<div class="modal-grid-column-6">
		<div class="spacer-16 m-spacer-8" />
		<FormButtonSelect
			name="preferred-times"
			store={contact}
			allowsMultiple={true}
			withCheckmark={true}
			options={["Morning", "Afternoon"]} />
	</div>
</div>

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
	submitTitle="Submit"
	on:submit={didSubmitForm}
	canSubmit={isValidShowroomRequest($contact)}
	{isLoading} />

{#if isFailed}
	<Error>
		<a href={errorLink}>Click here</a> to get in touch via email.
	</Error>
{/if}
