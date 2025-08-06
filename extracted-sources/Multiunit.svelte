<script>
	import FormButtonSelect from "../common/FormButtonSelect.svelte";
	import FormFieldAddress from "../common/FormFieldAddress.svelte";
	import FormFieldInput from "../common/FormFieldInput.svelte";
	import FormFieldLabel from "../common/FormFieldLabel.svelte";
	import Loader from "../common/Loader.svelte";
	import contact, { isValidMultiunit } from "../contact/stores/contact.js";
	import createErrorLink from "../contact/utils/createErrorLink";
	import Error from "../contact/views/Error.svelte";
	import Success from "./Success.svelte";

	let isLoading = false;
	let isFailed = false;
	let isComplete = false;
	let form;

	$: errorLink = createErrorLink("Site error: multiunit inquiry", [
		["Request type", "Backyard multiunit"],
		["Name", `${$contact.data.firstName} ${$contact.data.lastName}`],
		["Business name", $contact.data.businessName],
		["Phone number", $contact.data.phone],
		["Address", $contact.data.address],
		[
			"About how many units are you considering?",
			$contact.data.howManyUnits
		],
		["About the project", $contact.data.note]
	]);

	async function didClickConfirmButton() {
		isLoading = true;
		isFailed = false;

		try {
			await API.multiUnitGetInTouch($contact.data);
			form.reset();
			contact.resetData();
			isComplete = true;
		} catch (error) {
			isFailed = true;
			console.error(error);
		}

		isLoading = false;
	}

	function didSubmitForm(e) {
		e.preventDefault();
	}
</script>

<Success bind:isVisible={isComplete} />

<form class="get-in-touch" on:submit={didSubmitForm} bind:this={form}>
	<div class:complete={isComplete} class:loading={isLoading}>
		<div class="modal-grid modal-grid-half-gap">
			<div class="modal-grid-column-6">
				<FormFieldLabel>
					<span slot="label">
						Enter your contact information&nbsp;&nbsp;
						<span class="color-white-60">(required)</span>
					</span>
				</FormFieldLabel>
				<div class="spacer-16 m-spacer-8" />
			</div>
			<div class="modal-grid-column-3">
				<FormFieldInput
					title="First name"
					name="firstName"
					store={contact}
					className="common-form-field-input-inverted" />
			</div>
			<div class="modal-grid-column-3">
				<FormFieldInput
					title="Last name"
					name="lastName"
					store={contact}
					className="common-form-field-input-inverted" />
			</div>
			<div class="modal-grid-column-6">
				<div class="spacer-12 m-spacer-8" />
				<FormFieldInput
					title="Business name"
					name="businessName"
					store={contact}
					className="common-form-field-input-inverted" />
			</div>
			<div class="modal-grid-column-6">
				<div class="spacer-12 m-spacer-8" />
				<FormFieldInput
					title="Email address"
					name="email"
					type="email"
					store={contact}
					className="common-form-field-input-inverted" />
			</div>
			<div class="modal-grid-column-6">
				<div class="spacer-12 m-spacer-8" />
				<FormFieldInput
					title="Phone number"
					name="phone"
					type="phone"
					store={contact}
					className="common-form-field-input-inverted" />
			</div>
		</div>

		<div class="spacer-50 m-spacer-32" />
		<FormFieldAddress
			title="What is the property’s address?"
			fieldTitle="Address"
			fieldClassName="common-form-field-input-inverted"
			store={contact} />

		<div class="spacer-50 m-spacer-32" />

		<div class="modal-grid">
			<div class="modal-grid-column-6">
				<FormFieldLabel>
					<span slot="label">
						About how many units are you considering?
					</span>
				</FormFieldLabel>
			</div>
			<div class="modal-grid-column-6">
				<div class="spacer-12 m-spacer-8" />
				<FormButtonSelect
					name="howManyUnits"
					options={["1-4", "5-20", "20+"]}
					store={contact}
					className="common-form-button-select-inverted" />
			</div>
		</div>

		<div class="spacer-50 m-spacer-32" />

		<div class="modal-grid">
			<div class="modal-grid-column-6">
				<FormFieldLabel>
					<span slot="label">Tell us about your project</span>
				</FormFieldLabel>
			</div>
			<div class="modal-grid-column-6">
				<div class="spacer-12 m-spacer-8" />
				<FormFieldInput
					name="note"
					type="textarea"
					store={contact}
					className="common-form-field-input-inverted" />
			</div>
		</div>
	</div>

	<div class="spacer-50 m-spacer-32" />

	<button
		class="button-rounded button-rounded-blue button-rounded-12 type-18"
		class:complete={isComplete}
		class:loading={isLoading}
		disabled={isComplete ||
			isLoading ||
			isValidMultiunit($contact) === false}
		on:click={didClickConfirmButton}>
		{#if isComplete}
			Submitted
			<svg
				width="17"
				height="16"
				viewBox="0 0 17 16"
				fill="none"
				xmlns="http://www.w3.org/2000/svg">
				<path
					d="M6.34961 15.5557C5.88086 15.5557 5.48242 15.3535 5.1543 14.9492L0.601562 9.3418C0.472656 9.18945 0.378906 9.04004 0.320312 8.89355C0.267578 8.74707 0.241211 8.59473 0.241211 8.43652C0.241211 8.08496 0.358398 7.79492 0.592773 7.56641C0.827148 7.33789 1.12305 7.22363 1.48047 7.22363C1.88477 7.22363 2.22461 7.39648 2.5 7.74219L6.31445 12.5762L13.7588 0.78125C13.9111 0.546875 14.0693 0.382812 14.2334 0.289062C14.3975 0.189453 14.6025 0.139648 14.8486 0.139648C15.2061 0.139648 15.499 0.250977 15.7275 0.473633C15.9561 0.696289 16.0703 0.980469 16.0703 1.32617C16.0703 1.4668 16.0469 1.60742 16 1.74805C15.9531 1.88867 15.8799 2.03516 15.7803 2.1875L7.55371 14.9141C7.27246 15.3418 6.87109 15.5557 6.34961 15.5557Z"
					fill="#ffffff" />
			</svg>
		{:else if isLoading}
			<Loader variant="light" />
		{:else}
			Submit
		{/if}
	</button>
	{#if isFailed}
		<Error>
			<a href={errorLink}>Click here</a> to get in touch via email.
		</Error>
	{/if}
</form>

<style>
	button.loading,
	button.complete {
		pointer-events: none;
	}

	button.button-rounded {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 10px;
		padding: 16px !important;
		width: 100%;
		min-height: 57px;
	}

	@media (hover: hover) {
		button.button-rounded:hover {
			background: var(--color-blue-white-6) !important;
		}
	}

	button.button-rounded:disabled {
		background: rgba(255, 255, 255, 0.15) !important;
		color: rgba(255, 255, 255, 0.2) !important;
	}

	div.loading,
	div.complete {
		opacity: 0.66;
		transition: opacity 0.4s ease;
		pointer-events: none;
	}

	button svg {
		opacity: 0.2;
	}

	:global(.get-in-touch .loader) {
		opacity: 0.4;
	}
</style>
