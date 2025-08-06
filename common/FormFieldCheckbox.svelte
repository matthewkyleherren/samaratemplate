<script>
	export let title;
	export let name;
	export let store;
	export let variant = "default";

	const id = `checkbox-${Math.random().toString(32).substring(2, 5)}`;

	let value = false;
	let previousValue;

	store.subscribe((state) => {
		if (state.data[name] === previousValue) {
			return;
		}

		value = state.data[name];
		previousValue = value;
	});

	$: (() => {
		if (value === previousValue) {
			return;
		}

		store.updateData(name, value);
		previousValue = value;
	})();
</script>

<div class={`common-form-field-checkbox common-form-field-checkbox-${variant}`}>
	<div class="common-form-field-checkbox-box">
		<input {id} {name} type="checkbox" value={name} bind:checked={value} />
		<img
			src="/assets/images/icons/checkmark-grey.svg"
			width="17"
			height="16"
			alt="Check mark" />
	</div>
	<label class="type-15 m-type-14 color-text-60" for={id}>{title}</label>
</div>

<style>
	.common-form-field-checkbox {
		display: flex;
		position: relative;
		justify-content: center;
		align-items: center;
		gap: 16px;
		cursor: pointer;
		user-select: none;
		-webkit-user-select: none;
	}

	@media (max-width: 768px) {
		.common-form-field-checkbox {
			gap: 12px;
		}
	}

	.common-form-field-checkbox-box {
		position: relative;
		line-height: 0;
	}

	input {
		appearance: none;
		cursor: pointer;
		margin: 0;
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 6px;
		background: var(--color-black-2);
		padding: 0;
		width: 28px;
		height: 28px;
	}

	@media (max-width: 768px) {
		input {
			width: 24px;
			height: 24px;
		}
	}

	img {
		display: none;
		position: absolute;
		top: 7px;
		left: 6px;
		pointer-events: none;
	}

	@media (max-width: 768px) {
		img {
			top: 4px;
			left: 4px;
		}
	}

	input:checked + img {
		display: block;
	}
</style>
