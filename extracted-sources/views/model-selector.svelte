<script>
	import tour from "../stores/tour";

	let containerElement;

	function didClickContainerElement(e) {
		if (e.target !== containerElement) {
			return;
		}

		if ($tour.model === null) {
			return;
		}

		$tour.isModelSelectorVisible = false;
	}

	function didClickSelectorButton(model) {
		return () => {
			if ($tour.model === model) {
				$tour.isModelSelectorVisible = false;
				return;
			}

			gtag("event", "tour_model_selected", {
				previous_model: $tour.model,
				new_model: model,
				source: $tour.source
			});

			$tour.isChangingModel = true;
			$tour.nextModel = model;

			setTimeout(() => {
				$tour.isZoomed = false;
				$tour.model = model;
				$tour.nextModel = model;
				$tour.isChangingModel = false;
			}, 1000);

			setTimeout(() => {
				$tour.isModelSelectorVisible = false;
			}, 600);
		};
	}
</script>

<div
	class="tour-model-selector"
	class:tour-model-selector-visible={$tour.isModelSelectorVisible === true}
	class:tour-model-selector-null={$tour.model === null}>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		bind:this={containerElement}
		class="tour-model-selector-content"
		on:click={didClickContainerElement}>
		<div class="spacer-150 m-spacer-50"></div>
		<div class="m-spacer-24"></div>
		<h1 class="type-30-light m-type-24-light color-white">
			Choose a model to tour.
		</h1>
		<h2 class="type-30-light m-type-24-light color-white-40">
			Backyard comes in five sizes.
		</h2>
		<div class="spacer-50 m-spacer-36"></div>
		<button
			class:tour-model-selector-selected={$tour.nextModel === "studio"}
			on:click={didClickSelectorButton("studio")}>
			<div class="type-15 color-white">Studio</div>
			<div class="type-14 color-white-60">1 bath · 420 gross sq. ft.</div>
		</button>
		<button
			class:tour-model-selector-selected={$tour.nextModel === "onebed"}
			on:click={didClickSelectorButton("onebed")}>
			<div class="type-15 color-white">One bedroom</div>
			<div class="type-14 color-white-60">
				1 bedroom, 1 bath · 540 gross sq. ft.
			</div>
		</button>
		<button
			class:tour-model-selector-selected={$tour.nextModel === "twobed"}
			on:click={didClickSelectorButton("twobed")}>
			<div class="type-15 color-white">Two bedroom</div>
			<div class="type-14 color-white-60">
				2 bedrooms, 1 bath · 690 gross sq. ft.
			</div>
		</button>
		<button
			class:tour-model-selector-selected={$tour.nextModel === "xl8"}
			on:click={didClickSelectorButton("xl8")}>
			<div class="type-15 color-white type-alt">Backyard XL 8</div>
			<div class="type-14 color-white-60">
				2 bedrooms, 2 baths · 800 gross sq. ft.
			</div>
		</button>
		<button
			class:tour-model-selector-selected={$tour.nextModel === "xl10"}
			on:click={didClickSelectorButton("xl10")}>
			<div class="type-15 color-white type-alt">Backyard XL 10</div>
			<div class="type-14 color-white-60">
				2 bedrooms, 2 baths · 950 gross sq. ft.
			</div>
		</button>
		<div class="spacer-150 m-spacer-50"></div>
	</div>
</div>

<style>
	.tour-model-selector {
		position: absolute;
		opacity: 0;
		z-index: 60;
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		transition: opacity 0.4s ease;
		background: rgba(0, 0, 0, 0.4);
		width: 100%;
		height: 100%;
		max-height: 100%;
		overflow: auto;
		pointer-events: none;
	}

	.tour-model-selector {
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.tour-model-selector::-webkit-scrollbar {
		display: none;
	}

	.tour-model-selector-content {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 4px;
		min-height: 100%;
	}

	@media (max-width: 768px) {
		.tour-model-selector-content {
			gap: 0;
		}
	}

	.tour-model-selector-visible {
		opacity: 1;
		transition: opacity 0.2s ease;
		pointer-events: auto;
	}

	h1,
	h2,
	button {
		transform: translateY(25%);
		opacity: 0;
		transition: all 0.01s linear 0.2s;
		will-change: opacity;
	}

	button {
		display: flex;
		flex-direction: column;
		align-items: flex-start !important;
		gap: 4px !important;
		margin-bottom: 12px !important;
		line-height: 100%;
	}

	@media (max-width: 768px) {
		button {
			margin-bottom: 8px !important;
		}
	}

	.tour-model-selector-visible h1 {
		transform: none;
		opacity: 1;
		transition:
			transform 0.4s ease,
			opacity 0.4s ease;
	}

	.tour-model-selector-visible h2 {
		transform: none;
		opacity: 1;
		transition:
			transform 0.4s ease 0.05s,
			opacity 0.4s ease 0.05s;
	}

	.tour-model-selector-visible button:nth-of-type(1) {
		transform: none;
		opacity: 1;
		transition:
			transform 0.4s ease 0.1s,
			opacity 0.4s ease 0.1s,
			background 0.2s ease;
	}

	.tour-model-selector-visible button:nth-of-type(2) {
		transform: none;
		opacity: 1;
		transition:
			transform 0.4s ease 0.125s,
			opacity 0.4s ease 0.125s,
			background 0.2s ease;
	}

	.tour-model-selector-visible button:nth-of-type(3) {
		transform: none;
		opacity: 1;
		transition:
			transform 0.4s ease 0.15s,
			opacity 0.4s ease 0.15s,
			background 0.2s ease;
	}

	.tour-model-selector-visible button:nth-of-type(4) {
		transform: none;
		opacity: 1;
		transition:
			transform 0.4s ease 0.175s,
			opacity 0.4s ease 0.175s,
			background 0.2s ease;
	}

	.tour-model-selector-visible button:nth-of-type(5) {
		transform: none;
		opacity: 1;
		transition:
			transform 0.4s ease 0.2s,
			opacity 0.4s ease 0.2s,
			background 0.2s ease;
	}

	.tour-model-selector button {
		display: flex;
		flex-direction: column;
		justify-content: center;
		backdrop-filter: none !important;
		-webkit-backdrop-filter: none !important;
		border-radius: 12px !important;
		background: rgba(0, 0, 0, 0.1) !important;
		padding: 0 18px;
		width: 428px;
		height: 90px !important;
	}

	@media (max-width: 1024px) {
		.tour-model-selector button {
			width: 362px;
		}
	}

	@media (max-width: 768px) {
		.tour-model-selector button {
			height: 71px !important;
		}
	}

	.tour-model-selector-null button {
		background: rgba(255, 255, 255, 0.1) !important;
	}

	@media (hover: hover) {
		.tour-model-selector button:hover {
			background: rgba(255, 255, 255, 0.05) !important;
		}

		.tour-model-selector-null button:hover {
			outline-color: rgba(255, 255, 255, 0.25) !important;
			background: rgba(255, 255, 255, 0.15) !important;
		}
	}

	.tour-model-selector button.tour-model-selector-selected,
	.tour-model-selector button.tour-model-selector-selected:hover {
		outline: 2px solid var(--color-blue) !important;
		background: rgba(255, 255, 255, 0.15) !important;
	}
</style>
