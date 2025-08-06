<script>
	import FormFieldLabel from "../../../../common/FormFieldLabel.svelte";
	import FormFieldInput from "../../../../common/FormFieldInput.svelte";
	import Header from "../../Header.svelte";
	import Footer from "../../Footer.svelte";
	import contact, {
		CONTACT_VARIANTS,
		HELLO_STEPS,
		isValidHello
	} from "../../../stores/contact.js";
	import FormFieldAddress from "../../../../common/FormFieldAddress.svelte";
	import FormFieldCheckbox from "../../../../common/FormFieldCheckbox.svelte";
	import { key } from "../../../../common/modal.js";
	import { getContext } from "svelte";
	import Error from "../../Error.svelte";
	import createErrorLink from "../../../utils/createErrorLink";
	import isServicableAddress from "../../../../common/isServicableAddress";

	const context = getContext(key);

	const shouldRestrictAddressInput =
		location.search.includes("utm_medium=pmax") === true ||
		location.search.includes("utm_medium=display") === true;

	let isLoading = false;
	let isFailed = false;
	let isSpamming = false;
	let addressFieldInputElement;

	$: errorLink = createErrorLink("Site error: requesting a quick estimate", [
		["Request type", "Quick estimate"],
		["Name", `${$contact.data.firstName} ${$contact.data.lastName}`],
		["Installation address", $contact.data.address],
		["Phone number", $contact.data.phone]
	]);

	$: isServicable = isServicableAddress($contact);

	$: didSubmitForm = async () => {
		if (isLoading) {
			return;
		}

		isLoading = true;
		isFailed = false;
		isSpamming = false;

		if ($contact.data.shouldSubscribe) {
			API.subscribe($contact.data.email, ["hello"]);
		}

		if (isServicable) {
			let followUp = 15;

			if (process.env.NODE_ENV === "development") {
				followUp = 5;
			}

			if ($contact.variant === CONTACT_VARIANTS.wildfires) {
				followUp = undefined;
			}

			try {
				const res = await API.requestEstimate(
					JSON.stringify({ ...$contact.data, followUp })
				);

				isSpamming = res.status === 418;

				if (res.ok !== true) {
					throw new Error("failed to request estimate");
				}

				const json = await res.json();

				contact.updateData("slug", json.slug);
				contact.openHelloStep(HELLO_STEPS.success);

				gtag("event", "hello_request_estimate", {
					slug: json.slug,
					host: location.host
				});
			} catch (error) {
				isFailed = true;
				console.error("failed to request quick estimate", error);
			}
		} else {
			gtag("event", "hello_address_blocked", { zip: $contact.data.zip });

			await API.expand(
				$contact.data.zip,
				$contact.data.email,
				"hello",
				undefined,
				$contact.data.address
			);

			contact.openHelloStep(HELLO_STEPS.notifySuccess);
		}

		isLoading = false;
	};

	function didPressKey() {
		context?.setBackgroundClickable(false);
	}

	$: didClickAddressDependencyGroup = (e) => {
		if ($contact.data.zip !== undefined) {
			return;
		}

		if (shouldRestrictAddressInput === false) {
			return;
		}

		e.preventDefault();
		e.stopPropagation();

		addressFieldInputElement.focus();
	};
</script>

<svelte:window on:keydown={didPressKey} />

<Header>
	<span slot="title">
		{#if $contact.variant === CONTACT_VARIANTS.wildfires}
			Connect with us
		{:else}
			Check your property
		{/if}
	</span>
	<span slot="subtitle">
		Share your installation address and contact information to get started.
	</span>
</Header>

<div class="spacer-64 m-spacer-32" />

<div class:loading={isLoading}>
	<FormFieldAddress
		title={$contact.variant === CONTACT_VARIANTS.wildfires
			? "Where do you want an ADU installed?"
			: "Where do you want Backyard installed?"}
		fieldTitle="Address"
		store={contact}
		shouldDisplayExtraFields={shouldRestrictAddressInput === false}
		bind:streetInputElement={addressFieldInputElement} />

	{#if isServicable === false}
		<div class="type-center m-type-left">
			<div class="spacer-32" />
			<h2 class="type-18 m-type-15 color-red">
				Sorry, we're not available in&nbsp;your area...&nbsp;yet.
			</h2>
			<div class="spacer-8 m-spacer-4" />
			<div class="type-15 m-type-14 color-text-40">
				But we can notify you when Backyard comes
				to&nbsp;your&nbsp;area.
			</div>
			<div class="spacer-16" />
		</div>
	{/if}

	<div
		class="address-dependency-group"
		class:disabled={shouldRestrictAddressInput &&
			$contact.data.zip === undefined}
		on:mousedown={didClickAddressDependencyGroup}>
		<div class="modal-grid">
			<div class="modal-grid-column-6">
				<div class="spacer-36 m-spacer-32" />
				<FormFieldLabel>
					<span slot="label">Enter your contact information</span>
				</FormFieldLabel>
			</div>
		</div>
		<div class="spacer-16" />

		<div class="modal-grid modal-grid-half-gap">
			<div class="modal-grid-column-3">
				<FormFieldInput
					title="First name"
					name="firstName"
					store={contact} />
			</div>
			<div class="modal-grid-column-3">
				<FormFieldInput
					title="Last name"
					name="lastName"
					store={contact} />
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
	</div>

	<Footer
		submitTitle={isServicable === false ? "Notify me" : "Continue"}
		on:submit={didSubmitForm}
		canSubmit={isValidHello($contact)}
		{isLoading} />
</div>

{#if isFailed}
	<Error>
		{#if isSpamming === false}
			<a href={errorLink}>Click here</a> to get in touch via email.
		{/if}
	</Error>
{/if}

<style>
	.loading {
		opacity: 0.5;
		pointer-events: none;
	}

	.address-dependency-group.disabled {
		opacity: 0.5;
		filter: saturate(0);
	}
</style>
