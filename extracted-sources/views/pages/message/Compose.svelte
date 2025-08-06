<script>
	import FormFieldLabel from "../../../../common/FormFieldLabel.svelte";
	import FormFieldInput from "../../../../common/FormFieldInput.svelte";
	import Header from "../../Header.svelte";
	import Footer from "../../Footer.svelte";
	import contact, {
		CONTACT_VARIANTS,
		MESSAGE_STEPS,
		isValidMessage
	} from "../../../stores/contact.js";
	import FormFieldCheckbox from "../../../../common/FormFieldCheckbox.svelte";
	import FormFieldAddress from "../../../../common/FormFieldAddress.svelte";
	import Error from "../../Error.svelte";
	import createErrorLink from "../../../utils/createErrorLink";
	import isServicableAddress from "../../../../common/isServicableAddress";

	let isLoading = false;
	let isFailed = false;
	let isSpamming = false;
	let honeypotValue = "";
	let honeypotInput; // Reference to the honeypot input element

	$: isServicable = isServicableAddress($contact);

	$: errorLink = createErrorLink("Site error: sending a message", [
		["Request type", "Message"],
		["Name", `${$contact.data.firstName} ${$contact.data.lastName}`],
		["Installation address", $contact.data.address],
		["Phone number", $contact.data.phone],
		["Message", $contact.data.message]
	]);

	async function didSubmitForm() {
		isLoading = true;
		isFailed = false;
		isSpamming = false;

		const currentHoneypotValue = honeypotInput ? honeypotInput.value : "";

		if (currentHoneypotValue !== "") {
			isSpamming = true;
			isFailed = true;
			isLoading = false;
			return;
		}

		try {
			const res = await API.contact(
				JSON.stringify({ ...$contact.data, subject: 1 })
			);

			isSpamming = res.status === 418;

			if (res.ok !== true && res.status !== 418 && res.status !== 429) {
				throw new Error("failed to send message");
			}

			if ($contact.data.shouldSubscribe) {
				API.subscribe($contact.data.email, ["contact", "message"]);
				contact.updateData("isSubscribed", undefined);
			}

			contact.openMessageStep(MESSAGE_STEPS.success);

			gtag("event", "contact_message_sent");

			setTimeout(() => {
				contact.updateData("message", undefined);
			}, 0);
		} catch (error) {
			isFailed = true;
			console.error("failed to send message", error);
		}

		isLoading = false;
	}
</script>

<div class="spacer-8 m-spacer-24"></div>

<Header>
	<span slot="title">Send us a message</span>
	<span slot="subtitle">
		Have questions? Use this form to get in touch with our team over email.
	</span>
</Header>

{#if $contact.variant !== CONTACT_VARIANTS.confirmation && $contact.variant !== CONTACT_VARIANTS.schedule}
	<div class="modal-grid">
		<div class="modal-grid-column-6">
			<div class="spacer-50 m-spacer-32" />
			<FormFieldLabel>
				<span slot="label">Enter your contact information</span>
			</FormFieldLabel>
		</div>
	</div>
	<div class="spacer-16" />
{/if}

{#if $contact.variant !== CONTACT_VARIANTS.confirmation && $contact.variant !== CONTACT_VARIANTS.schedule}
	<div class="modal-grid modal-grid-half-gap">
		<div class="modal-grid-column-3">
			<FormFieldInput
				title="First name"
				name="firstName"
				store={contact} />
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
{/if}

{#if $contact.variant === CONTACT_VARIANTS.default}
	<div class="spacer-50 m-spacer-32" />
	<FormFieldAddress
		title="Where do you want Backyard installed?"
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
				You can still get in touch through this&nbsp;form.
			</div>
			<div class="spacer-16" />
		</div>
	{/if}
{/if}

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

<div style="position: absolute; left: -5000px;">
	<label
		>Do not fill this field
		<input
			tabindex="-1"
			type="text"
			id="website"
			name="website"
			bind:value={honeypotValue}
			bind:this={honeypotInput}
			autocomplete="off" />
	</label>
</div>

<Footer
	submitTitle="Submit"
	on:submit={didSubmitForm}
	canSubmit={isValidMessage($contact)}
	{isLoading} />

{#if isFailed}
	<Error>
		{#if isSpamming === false}
			<a href={errorLink}>Click here</a> to get in touch via email.
		{/if}
	</Error>
{/if}
