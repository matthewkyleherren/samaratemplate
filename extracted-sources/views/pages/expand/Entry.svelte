<script>
	import FormFieldInput from "../../../../common/FormFieldInput.svelte";
	import FormFieldCheckbox from "../../../../common/FormFieldCheckbox.svelte";
	import Header from "../../Header.svelte";
	import Footer from "../../Footer.svelte";
	import contact, {
		EXPAND_STEPS,
		isValidExpand
	} from "../../../stores/contact.js";
	import Error from "../../Error.svelte";
	import createErrorLink from "../../../utils/createErrorLink";

	let isLoading = false;
	let isFailed = false;

	async function didSubmitForm() {
		isLoading = true;
		isFailed = false;

		try {
			const res = await API.expand(
				$contact.data.zip,
				$contact.data.email,
				"backyard"
			);

			if (res.ok !== true) {
				throw new Error("failed to submit expansion request");
			}

			contact.openExpandStep(EXPAND_STEPS.success);
		} catch (error) {
			isFailed = true;
			console.error(error);
		}

		if ($contact.data.shouldSubscribe) {
			API.subscribe($contact.data.email, ["expansion", "modal"]);
			contact.updateData("isSubscribed", undefined);
		}

		isLoading = false;
	}

	$: errorLink = createErrorLink("Site error", [
		["Request type", "Market expansion"],
		["ZIP code", $contact.data.zip]
	]);
</script>

<Header>
	<span slot="title">Where should we build next?</span>
	<span slot="subtitle">
		Drop us your zip code and email to help us plan our expansion strategy.
		We’ll let you know when we get there.
	</span>
</Header>

<div class="spacer-32" />
<div class="modal-grid">
	<div class="modal-grid-column-6">
		<FormFieldInput title="ZIP code" name="zip" store={contact} />
	</div>
	<div class="modal-grid-column-6">
		<div class="spacer-12 m-spacer-8" />
		<FormFieldInput
			title="Email"
			name="email"
			type="email"
			store={contact} />
	</div>
	{#if $contact.data.isSubscribed !== true}
		<div class="modal-grid-column-6 expansion-entry-checkbox">
			<div class="spacer-50 m-spacer-32" />
			<FormFieldCheckbox
				title="Send me general updates about&nbsp;Samara"
				name="shouldSubscribe"
				store={contact} />
		</div>
	{/if}
</div>

<Footer
	submitTitle="Notify me"
	on:submit={didSubmitForm}
	canSubmit={isValidExpand($contact)}
	{isLoading} />

{#if isFailed}
	<Error>
		<a href={errorLink}> Click here </a> to get in touch via email.
	</Error>
{/if}
