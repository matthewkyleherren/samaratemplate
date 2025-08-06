<script>
	import Suggestions from "./Suggestions.svelte";
	import FormFieldInput from "./FormFieldInput.svelte";
	import FormFieldLabel from "./FormFieldLabel.svelte";

	export let title = undefined;
	export let subtitle = "";
	export let fieldTitle;
	export let fieldClassName = "";
	export let store;
	export let isError = false;
	export let variant = "default";
	export let shouldDisplayExtraFields = true;
	export let streetInputElement;
	export let shouldAllowArbitraryInput = false;

	let isAddressFieldFocused = false;
	let selectedSuggestion;

	function selectSuggestion(suggestion) {
		selectedSuggestion = suggestion;

		const { address, coordinates } = selectedSuggestion;
		const [_, street, city, state, zip] = address.match(
			/^(.*), (.*), (.*) (\d+)$/
		);

		if (shouldDisplayExtraFields === false) {
			store.updateData("address", address);
		}

		store.updateData("street", street);
		store.updateData("zip", zip);
		store.updateData("city", city);
		store.updateData("state", state);
		store.updateData("latitude", coordinates[1]);
		store.updateData("longitude", coordinates[0]);
	}

	function didSelectSuggestion(e) {
		selectSuggestion(e.detail.suggestion);
	}

	function didBlurStreetInputElement() {
		if (shouldAllowArbitraryInput === true) {
			return;
		}

		if (shouldDisplayExtraFields === true) {
			return;
		}

		if (selectedSuggestion !== undefined) {
			selectSuggestion(selectedSuggestion);
		}
	}
</script>

<div class={`modal-grid modal-grid-half-gap form-field-address-${variant}`}>
	{#if title !== undefined}
		<div class="modal-grid-column-6 contact-page-header">
			<FormFieldLabel {variant}>
				<span slot="label">{title}</span>
				<span slot="subtitle">{subtitle}</span>
			</FormFieldLabel>
		</div>
	{/if}
	<div class="modal-grid-column-6">
		<div class="spacer-16 m-spacer-8" />
		<FormFieldInput
			{variant}
			title={fieldTitle}
			name={shouldDisplayExtraFields ? "street" : "address"}
			{store}
			className={fieldClassName}
			{isError}
			bind:isFocused={isAddressFieldFocused}
			bind:input={streetInputElement}
			on:blur={didBlurStreetInputElement} />

		<Suggestions
			variant="contact"
			query={shouldDisplayExtraFields
				? $store.data.street
				: $store.data.address}
			isVisible={isAddressFieldFocused}
			on:select={didSelectSuggestion} />
	</div>
	{#if shouldDisplayExtraFields === true}
		<div class="modal-grid-column-3">
			<div class="spacer-12 m-spacer-8" />
			<FormFieldInput
				{variant}
				title="ZIP code"
				name="zip"
				{store}
				className={fieldClassName} />
		</div>
		<div class="modal-grid-column-3">
			<div class="spacer-12 m-spacer-8" />
			<FormFieldInput
				{variant}
				title="City"
				name="city"
				{store}
				className={fieldClassName} />
		</div>
	{/if}
</div>
