<script>
	import iconCheckmark from "../../images/icons/checkmark-white.svg";

	export let options = [];
	export let name;
	export let store;
	export let className = "";
	export let allowsMultiple = false;
	export let withCheckmark = false;
	export let variant = "default";
	export let isTwoColumn = false;
	export let isFullWidth = false;

	$: isSelected = (option) => {
		const value = $store && $store.data[name];

		if (value && allowsMultiple) {
			return value.includes(option);
		}

		return value === option;
	};

	function didSelectOption(option) {
		if (allowsMultiple) {
			const current = $store.data[name] ?? [];
			const value = current.includes(option)
				? current.filter((value) => value !== option)
				: [...current, option];

			store.updateData(name, value);
		} else {
			store.updateData(name, option);
		}
	}
</script>

<div
	class={[
		"common-form-button-select",
		className,
		`common-form-button-select-${variant}`
	].join(" ")}
	class:common-form-button-select-two-column={isTwoColumn}
	class:common-form-button-select-full-width={isFullWidth}>
	{#each options as option}
		<button
			on:click={() => didSelectOption(option)}
			class:selected={isSelected(option)}
			class="type-15 m-type-14">
			{@html option}
			{#if withCheckmark && isSelected(option)}
				{@html iconCheckmark}
			{/if}
		</button>
	{/each}
</div>

<style>
	.common-form-button-select {
		display: flex;
		gap: 12px;
	}

	@media (max-width: 768px) {
		.common-form-button-select {
			gap: 9px;
		}
	}

	.common-form-button-select button {
		display: flex;
		flex-grow: 1;
		flex-basis: 0;
		justify-content: center;
		align-items: center;
		gap: 6px;
		appearance: none;
		margin: 0;
		box-shadow: 0px 0.5px 1px 0px rgba(0, 0, 0, 0.12);
		border: none;
		border-radius: 12px;
		background-color: #f7f7f7;
		padding: 18px 0;
		color: #000000;
	}

	@media (max-width: 768px) {
		.common-form-button-select button {
			padding: 15px 0;
		}
	}

	:global(.common-form-button-select button svg) {
		position: relative;
		top: -0.05em;
		width: auto;
		height: 0.8em;
	}

	.common-form-button-select button.selected {
		background-color: #000000;
		color: #ffffff;
	}

	.common-form-button-select-blue button.selected {
		background: var(--color-blue);
	}

	@media (hover: hover) {
		.common-form-button-select-inverted button:hover {
			background-color: rgba(255, 255, 255, 0.4);
		}
	}

	.common-form-button-select-inverted button {
		background-color: rgba(255, 255, 255, 0.2);
		color: #ffffff;
	}

	.common-form-button-select-inverted button.selected {
		background-color: rgba(255, 255, 255, 1);
		color: #000000;
	}

	.common-form-button-select-full-width {
		flex-direction: column;
	}

	.common-form-button-select-two-column {
		flex-wrap: wrap;
	}

	.common-form-button-select-two-column button {
		flex-grow: unset;
		flex-basis: unset;
		width: calc(50% - 6px);
	}

	.common-form-button-select-full-width {
		width: 100%;
	}
</style>
