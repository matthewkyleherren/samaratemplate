<script>
	import { optionWithKey } from "../../configurator/common/options";
	import tour from "../stores/tour";

	const models = optionWithKey("layout").values;

	$: selectedModel =
		models[models.findIndex((variant) => variant.key === $tour.nextModel)];

	function didClick() {
		$tour.isModelSelectorVisible = !$tour.isModelSelectorVisible;
		gtag("event", "tour_model_selector_toggled", {
			model: $tour.model,
			source: $tour.source,
			action: $tour.isModelSelectorVisible === true ? "opened" : "closed"
		});
	}
</script>

<button
	class="tour-controls-selector-button type-15 type-regola-regular"
	class:tour-controls-selector-button-visible={$tour.isModelSelectorVisible ===
		true}
	class:tour-controls-selector-button-full-screen={$tour.variant ===
		"full-screen"}
	class:tour-controls-selector-button-none={$tour.model === null}
	on:click={didClick}>
	<span class="type-alt">
		{selectedModel ? selectedModel.display.title : "Choose Model"}
	</span>
	<svg
		width="12"
		height="7"
		viewBox="0 0 12 7"
		fill="none"
		xmlns="http://www.w3.org/2000/svg">
		<path
			d="M6.00195 6.56738C5.77148 6.56738 5.56055 6.47363 5.36914 6.28613L0.957031 1.77441C0.882812 1.69629 0.826172 1.6123 0.787109 1.52246C0.751953 1.43262 0.734375 1.33301 0.734375 1.22363C0.734375 1.0791 0.769531 0.946289 0.839844 0.825195C0.910156 0.704102 1.00391 0.608398 1.12109 0.538086C1.24219 0.467773 1.375 0.432617 1.51953 0.432617C1.73828 0.432617 1.92969 0.512695 2.09375 0.672852L6.27148 4.96191H5.73828L9.9043 0.672852C10.0684 0.512695 10.2598 0.432617 10.4785 0.432617C10.623 0.432617 10.7539 0.467773 10.8711 0.538086C10.9922 0.608398 11.0879 0.704102 11.1582 0.825195C11.2285 0.946289 11.2637 1.0791 11.2637 1.22363C11.2637 1.43848 11.1875 1.62012 11.0352 1.76855L6.63477 6.28613C6.54102 6.37988 6.44141 6.4502 6.33594 6.49707C6.23438 6.54004 6.12305 6.56348 6.00195 6.56738Z"
			fill="white"
			style="fill:white;fill-opacity:1;" />
	</svg>
</button>

<style>
	.tour-controls-selector-button {
		display: flex;
		position: absolute;
		top: 24px;
		left: 50%;
		align-items: center;
		gap: 8px;
		transform: translateX(-50%);
		z-index: 100;
		transition: opacity 0.4s ease;
		padding-right: 22px !important;
	}

	@media (max-width: 768px) {
		.tour-controls-selector-button {
			top: calc(5dvh + 25px);
		}

		.tour-controls-selector-button-full-screen {
			top: 24px;
		}
	}

	.tour-controls-selector-button svg {
		transform: translateY(1px);
	}

	.tour-controls-selector-button-visible svg {
		transform: scaleY(-1);
	}

	.tour-controls-selector-button-none {
		opacity: 0;
		pointer-events: none;
	}
</style>
