<script>
	import { createEventDispatcher } from "svelte";

	const THUMB_RADIUS = 9.0;
	const GAP = 8.0;

	export let min;
	export let max;
	export let value;
	export let roundingFactor = 10_000;
	export let shouldDisplayRelativeLimitIndicators = false;
	export let shouldExpandRangeAutomatically = true;
	export let relativeMin = undefined;
	export let relativeMax = undefined;
	export let minIndicator = undefined;
	export let maxIndicator = undefined;

	const dispatch = createEventDispatcher();
	const MIN = min;
	const MAX = max;

	let inputRangeElement;
	let minLabelElement;
	let manualValue = formattedCurrency(value);
	let rangeValue = value;

	$: min && max && didChangeManualValue({ target: { value: manualValue } });

	function map(n, low1, high1, low2, high2) {
		return low2 + (high2 - low2) * ((n - low1) / (high1 - low1));
	}

	function formattedCurrency(value) {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			maximumFractionDigits: 0
		})
			.format(value)
			.replace("$", "");
	}

	let leftValue = 0.0;

	$: (() => {
		setTimeout(() => {
			leftValue = inputRangeElement
				? minLabelElement.clientWidth +
				  GAP +
				  map(
						rangeValue,
						min,
						max,
						THUMB_RADIUS,
						inputRangeElement.clientWidth - THUMB_RADIUS
				  )
				: 0.0;
		}, 0);
	})();

	$: leftStyle = `left: ${leftValue.toFixed(2)}px`;

	const minMaxlabelFormatter = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		notation: "compact"
	});

	$: minLabel = shouldDisplayRelativeLimitIndicators
		? minIndicator || "Min" //(relativeMin * 100).toFixed() + "%"
		: minMaxlabelFormatter.format(min).replace("K", "k");

	$: maxLabel = shouldDisplayRelativeLimitIndicators
		? maxIndicator || "Max" //(relativeMax * 100).toFixed() + "%"
		: minMaxlabelFormatter.format(max).replace("K", "k");

	$: relativeValue =
		(
			map(rangeValue, min, max, relativeMin, relativeMax) * 100.0
		).toFixed() + "%";

	function didChangeRangeValue(e) {
		manualValue = formattedCurrency(Math.round(e.target.value));
		rangeValue = Math.round(e.target.value);
		dispatch("change", { value: rangeValue });
	}

	function didEndChangingRangeValue() {
		dispatch("change", { value: rangeValue });
		dispatch("end", { value: rangeValue });
	}

	function didChangeManualValue(e) {
		let value = Math.round(
			parseFloat(e.target.value.replace(/[^0-9.-]+/g, "")) || 0.0
		);

		if (shouldExpandRangeAutomatically) {
			min =
				value < MIN
					? Math.round(
							Math.min(value - value * 0.25, 500_000) /
								roundingFactor
					  ) * roundingFactor
					: MIN;

			max =
				value > MAX
					? Math.round(
							Math.max(value + value * 0.25, 3_000_000) /
								roundingFactor
					  ) * roundingFactor
					: MAX;
		} else {
			value = Math.min(Math.max(value, min), max);
		}

		rangeValue = value;
		didEndChangingRangeValue();

		const previousValue = manualValue;
		const previousRadix = previousValue.replace(/[^\,]/g, "").length;
		const isInvalidInput =
			e.target.value.replace(/[^0-9.]/g, "").length <
			e.target.value.replace(/\$|\,/g, "").length;

		let { selectionEnd } = e.target;

		const nextValue = formattedCurrency(Math.round(rangeValue));
		manualValue = nextValue;
		e.target.value = nextValue;

		const radix = manualValue.replace(/[^\,]/g, "").length;

		let caretOffset = 0;

		if (isInvalidInput) {
			caretOffset -= 1;
		}

		if (radix > previousRadix) {
			caretOffset += 1;
		} else if (radix < previousRadix) {
			caretOffset -= 1;
		}

		if (manualValue === "$0") {
			selectionEnd = 1;
			caretOffset = 0;
		}

		if (selectionEnd === 0) {
			selectionEnd = 1;
			caretOffset = 0;
		}

		if (manualValue.length < 2) {
			selectionEnd = manualValue.length;
			caretOffset = 0;
		}

		if (
			window.innerWidth > 768.0 ||
			(window.innerWidth <= 768.0 &&
				shouldDisplayRelativeLimitIndicators === false)
		) {
			setTimeout(() => {
				if (e.target.setSelectionRange) {
					e.target.setSelectionRange(
						selectionEnd + caretOffset,
						selectionEnd + caretOffset
					);
				}
			}, 0);
		}
	}
</script>

<div class="slider-native">
	<div class="slider-native-value" style={leftStyle}>
		<div class="slider-native-value-input type-30-light">
			$
			<input
				class="type-30-light"
				type="text"
				inputmode="numeric"
				on:input={didChangeManualValue}
				on:change={didEndChangingRangeValue}
				bind:value={manualValue} />
		</div>
		<span class="type-30-light">${manualValue}</span>
		<svg
			width="17"
			height="10"
			viewBox="0 0 17 10"
			fill="none"
			xmlns="http://www.w3.org/2000/svg">
			<path d="M1.5 1.5L8.5 8.5L15.5 1.5H1.5Z" fill="#F7F7F7" />
			<path
				d="M1.5 1.5L8.5 8.5L15.5 1.5"
				stroke="#E6E6E6"
				stroke-linecap="square" />
		</svg>
		{#if shouldDisplayRelativeLimitIndicators}
			<div class="type-14 slider-native-value-relative color-text-40">
				{relativeValue}
			</div>
		{/if}
	</div>
	<div
		class="slider-native-label slider-native-label-min type-14 color-text-40"
		bind:this={minLabelElement}>
		{minLabel}
	</div>
	<input
		type="range"
		{min}
		{max}
		step={roundingFactor}
		on:input={didChangeRangeValue}
		on:change={didEndChangingRangeValue}
		bind:this={inputRangeElement}
		bind:value={rangeValue} />
	<div
		class="slider-native-label slider-native-label-max type-14 color-text-40">
		{maxLabel}
	</div>
</div>

<style>
	.slider-native {
		display: flex;
		position: relative;
		align-items: flex-end;
		gap: 8px;
		background: #ffffff;
		height: 90px;
	}

	.slider-native * {
		user-select: none;
		-webkit-user-select: none;
	}

	input[type="range"] {
		flex: 1;
		appearance: none;
		border-top: rgba(0, 0, 0, 0.2) 1px solid;
		height: 1px;
	}

	:global(.slider-native input[type="range"]::-webkit-slider-thumb) {
		appearance: none;
		cursor: pointer;
		box-shadow: none;
		border-radius: 100%;
		background-color: #000000;
		width: 18px;
		height: 18px;
	}

	.slider-native-value {
		position: absolute;
		top: 1px;
		transform: translateX(-50%);
		pointer-events: none;
	}

	.slider-native-value svg {
		position: absolute;
		bottom: -39.5px;
		left: 50%;
		z-index: 1;
		margin-left: -6.6px;
	}

	@media (max-width: 768px) {
		.slider-native-value svg {
			bottom: -40.5px;
		}
	}

	.slider-native-value-input {
		display: flex;
		position: absolute;
		top: 6px;
		left: 0;
		align-items: center;
		will-change: transform;
		border: #e6e6e6 1px solid;
		border-radius: 12px;
		background: #f7f7f7;
		padding: 11px 15px 13px 18px;
		pointer-events: all;
	}

	input[inputmode="numeric"] {
		transform: translateY(-1px);
		appearance: none;
		box-sizing: border-box;
		margin: 0;
		outline: none;
		border: none;
		background: none;
		padding: 0;
		width: 100%;
		line-height: 1;
		text-align: center;
	}

	input[inputmode="numeric"]:focus {
		user-select: text;
		-webkit-user-select: text;
	}

	@media (max-width: 768px) {
		input[inputmode="numeric"] {
			transform: none;
		}
	}

	.slider-native-value span {
		visibility: hidden;
		border: #9a9a9a 1px solid;
		padding: 12px 17px 12px 20px;
		pointer-events: none;
	}

	.slider-native-label {
		transform: translateY(22.5%);
		line-height: 1;
	}

	.slider-native-value-relative {
		position: absolute;
		top: 98px;
		left: 3px;
		width: 100%;
		text-align: center;
	}
</style>
