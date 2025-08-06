<script>
	import { createEventDispatcher } from "svelte";

	export let title = "";
	export let name;
	export let type = "text";
	export let options = [];
	export let store = undefined;
	export let className = "";
	export let isFocused = false;
	export let isError = false;
	export let variant = "default";
	export let input = undefined;
	export let placeholder = undefined;

	const id = `input-${Math.random().toString(32).substring(2, 5)}`;
	const dispatch = createEventDispatcher();

	let value = type === "select" ? options[0][0] : "";
	let previousValue;

	if (store !== undefined) {
		store.subscribe((state) => {
			if (previousValue && state.data[name] === previousValue) {
				return;
			}

			value = state.data[name];
			previousValue = value;

			if (type === "select" && !value) {
				value = options[0][0];
			}
		});
	}

	$: (() => {
		if (value === previousValue) {
			return;
		}

		if (store !== undefined) {
			store.updateData(name, value);
		}

		previousValue = value;
	})();

	let previousPhoneValue = "";

	let isTextAreaScrolled = false;

	function didKeyPress(e) {
		dispatch("input", {
			inputEvent: e,
			reset() {
				e.target.value = null;
				value = null;
			}
		});
	}

	function didFocus() {
		isFocused = true;
		dispatch("focus");
	}

	function didBlur() {
		isFocused = false;
		dispatch("blur");
	}

	function didInput(e) {
		if (type !== "phone") {
			return;
		}

		const input = e.target;
		const isErasing = previousPhoneValue.length > input.value.length;

		if (
			e.inputType === "deleteContentBackward" &&
			(input.value === "+1" || input.value === "1")
		) {
			input.value = "";
		}

		previousPhoneValue = input.value;

		if (isErasing) {
			return;
		}

		const hasCountryCode = /^[\+|1]/.test(input.value);
		const numbers = input.value
			.replace(/[^0-9.]/g, "")
			.replace(/^\+?1|\|1|\D/, "");
		const area = numbers.substr(0, 3);
		const start = numbers.substr(3, 3);
		const rest = numbers.substr(6, 4);
		let nextValue = input.value;
		let shouldUpdateSelection = false;

		if (rest) {
			nextValue = `(${area}) ${start}-${rest}`;
		} else if (start) {
			nextValue = `(${area}) ${start}`;
		} else if (area) {
			nextValue = `(${area}) `;
			shouldUpdateSelection = true;
		} else {
			nextValue = numbers;
		}

		if (hasCountryCode) {
			nextValue = `+1 ${nextValue}`;
		}

		value = nextValue;

		if (store !== undefined) {
			store.updateData(name, nextValue);
		}

		setTimeout(() => {
			input.value = nextValue;

			if (shouldUpdateSelection) {
				input.setSelectionRange(
					nextValue.length - 1,
					nextValue.length - 1
				);
			}
		}, 0);
	}

	function didScrollTextArea(e) {
		isTextAreaScrolled = e.target.scrollTop > 0;
	}
</script>

<div
	class={[
		`common-form-field-input ${className}`,
		`common-form-field-input-${type}`,
		`common-form-field-input-${variant}`
	].join(" ")}
	class:empty={!value || value.length === 0}
	class:titleless={!title || title.length === 0}
	class:focused={isFocused}
	class:error={isError}>
	{#if title !== undefined}
		<label
			class={{
				default: "type-15 color-text-40",
				financing: "type-18 color-text-40"
			}[variant]}
			class:common-form-field-input-label-hidden={isTextAreaScrolled}
			for={id}>{title}</label>
	{/if}

	{#if type === "select"}
		<select
			{id}
			{name}
			class={{
				default: "type-15 m-type-16",
				financing: "type-18 m-type-15"
			}[variant]}
			bind:value
			on:change={() => {
				dispatch("change", { value });
			}}>
			{#each options as option}
				<option value={option[0]}>
					{option[1]}
				</option>
			{/each}
		</select>
		<img
			class="common-form-field-input-dropdown-arrow"
			src="/assets/images/backyard/arrow-mini-down.svg"
			alt="⋁" />
	{:else if type === "textarea"}
		<textarea
			{id}
			{name}
			class="type-18 m-type-16"
			bind:value
			on:scroll={didScrollTextArea} />
	{:else}
		<input
			{id}
			{name}
			{placeholder}
			inputmode={type}
			autocapitalize={type !== "email"}
			class={{
				default: "type-15 m-type-16",
				hello: "type-15 m-type-16",
				financing: "type-18"
			}[variant]}
			bind:value
			bind:this={input}
			on:focus={didFocus}
			on:blur={didBlur}
			on:input={didInput}
			on:change={didInput}
			on:keypress={didKeyPress} />
	{/if}
</div>

<style>
	.common-form-field-input {
		position: relative;
	}

	.common-form-field-input-inverted {
		color: #ffffff;
	}

	label {
		position: absolute;
		top: 17px;
		left: 22px;
		transform-origin: top left;
		transition:
			transform 0.2s ease,
			opacity 0.2s ease;
		pointer-events: none;
	}

	.common-form-field-input-label-hidden {
		opacity: 0;
	}

	.common-form-field-input-financing label {
		top: 22px;
	}

	@media (max-width: 768px) {
		.common-form-field-input-financing label {
			top: 18px;
		}
	}

	.common-form-field-input-inverted label {
		color: rgba(255, 255, 255, 0.6);
	}

	.common-form-field-input:has(:focus) label,
	.common-form-field-input:has(select) label,
	:not(.empty) label {
		transform: scale(0.75) translateX(-3px) translateY(-12px);
	}

	.common-form-field-input-financing:has(:focus) label,
	.common-form-field-input-financing:has(select) label,
	.common-form-field-input-financing:not(.empty) label {
		transform: scale(0.75) translateX(-3px) translateY(-16px);
	}

	@media (max-width: 768px) {
		.common-form-field-input-financing:has(:focus) label,
		.common-form-field-input-financing:has(select) label,
		.common-form-field-input-financing:not(.empty) label {
			transform: scale(0.7) translateX(-3px) translateY(-16px);
		}
	}

	input,
	select,
	textarea {
		display: block;
		appearance: none;
		box-sizing: border-box;
		outline: none;
		border: none;
		border-radius: 12px;
		background: var(--color-black-2);
		padding: 25px 8px 9px 18px;
		width: 100%;
		scroll-padding-block: 18px;
	}

	.common-form-field-input-financing input {
		padding: 28px 8px 15px 17px;
	}

	@media (max-width: 768px) {
		.common-form-field-input-financing input {
			padding: 25px 8px 12px 16px;
		}
	}

	.titleless select,
	.titleless textarea,
	.titleless input {
		padding-top: 17px;
		padding-bottom: 19px;
	}

	.common-form-field-input-inverted input,
	.common-form-field-input-inverted select,
	.common-form-field-input-inverted textarea {
		background: rgba(255, 255, 255, 0.1);
		color: #ffffff;
	}

	input,
	textarea,
	select {
		border: 1px solid rgba(0, 0, 0, 0.1);
	}

	.common-form-field-input-inverted input,
	.common-form-field-input-inverted textarea {
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.common-form-field-input-inverted input::-webkit-contacts-auto-fill-button {
		background-color: #ffffff;
	}

	.common-form-field-input-inverted:has(input:-webkit-autofill) label {
		color: rgba(0, 0, 0, 0.6);
	}

	input:focus,
	select:focus,
	textarea:focus {
		outline: var(--color-blue) 2px solid;
		background: #ffffff;
	}

	.common-form-field-input-inverted input:focus,
	.common-form-field-input-inverted select:focus,
	.common-form-field-input-inverted textarea:focus {
		outline: var(--color-blue) 2px solid;
		background: #000000;
	}

	textarea {
		height: 12em;
		resize: none;
	}

	select {
		color: #000000;
	}

	.common-form-field-input-dropdown-arrow {
		position: absolute;
		top: 50%;
		right: 18px;
		transform: translateY(-50%);
		pointer-events: none;
	}

	.error input:focus {
		outline: var(--color-red) 2px solid;
	}

	.common-form-field-input-select {
		user-select: none;
		-webkit-user-select: none;
	}

	.common-form-field-input-hello input {
		padding-top: 15px;
		padding-bottom: 15px;
	}
</style>
