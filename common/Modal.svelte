<script>
	import {
		createEventDispatcher,
		onMount,
		onDestroy,
		setContext
	} from "svelte";
	import { key } from "./modal.js";
	import ModalControl from "./ModalControl.svelte";

	export let variant = "default";
	export let extraClassNames = "";
	export let shouldSkipAnimation = false;

	setContext(key, {
		setCanGoBack,
		setBackgroundClickable
	});

	const dispatch = createEventDispatcher();

	let element;
	let canGoBack = false;
	let canClickBackground = true;
	let isDismissing = false;

	function setCanGoBack(value) {
		canGoBack = value;
	}

	function setBackgroundClickable(value) {
		canClickBackground = value;
	}

	function dismiss(e) {
		isDismissing = true;
		dispatch("will-dismiss");
		setTimeout(dispatch, 400, "dismiss");
	}

	function didClickBackground(e) {
		if (canClickBackground !== true) {
			return;
		}

		if (e.target === element) {
			dismiss();
		}
	}

	function didClickContent(e) {
		e.stopPropagation();
	}

	function didPressKey(e) {
		if (element.matches(":focus-within")) {
			return;
		}

		if (e.key === "Escape") {
			dismiss();
		}
	}

	function didChangeContent() {
		element.scrollTo(0, 0);
	}

	function didMouseMove(e) {
		e.stopPropagation();
	}

	function didTouchStart(e) {
		e.stopPropagation();
	}

	function didTouchMove(e) {
		e.stopPropagation();
	}

	function didTouchEnd(e) {
		e.stopPropagation();
	}

	function didScroll() {}

	function didClickBackButton() {
		dispatch("back");
		window.dispatchEvent(new Event("modal:did-click-back-button"));
	}

	function didClickCloseButton() {
		dismiss();
	}

	onMount(() => {
		document.body.classList.add("common-modal-presented");
		window.addEventListener("router:will-change-url", dismiss);
		window.addEventListener("modal:did-change-content", didChangeContent);
		window.addEventListener("modal:dismiss", dismiss);
	});

	onDestroy(() => {
		document.body.classList.remove("common-modal-presented");
		window.removeEventListener("router:will-change-url", dismiss);
		window.removeEventListener(
			"modal:did-change-content",
			didChangeContent
		);
		window.removeEventListener("modal:dismiss", dismiss);
	});
</script>

<svelte:window on:keydown={didPressKey} />

<div
	class={`common-modal common-modal-variant-${variant} ${extraClassNames}`}
	class:common-modal-without-appear-animation={shouldSkipAnimation}
	class:common-modal-dismissing={isDismissing}>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="common-modal-scroll"
		on:mousedown={didClickBackground}
		on:mousemove={didMouseMove}
		on:touchstart={didTouchStart}
		on:touchmove={didTouchMove}
		on:touchend={didTouchEnd}
		on:scroll={didScroll}
		bind:this={element}>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div class="content" on:click={didClickContent}>
			<div class="common-modal-controls">
				<div class="common-modal-back-button">
					{#if canGoBack}
						<ModalControl on:click={didClickBackButton}>
							<svg
								fill="none"
								height="17"
								viewBox="0 0 9 17"
								width="9"
								xmlns="http://www.w3.org/2000/svg"
								><path
									d="m7.26894 16.6823c.37684.4038 1.00963.4256 1.41338.0488.40375-.3769.42557-1.0097.04874-1.4134zm-6.268941-8.1823-.731055-.68232c-.3585929.38421-.3585929.98043 0 1.36464zm7.731051-6.81768c.37684-.40375.35502-1.03654-.04873-1.413374-.40375-.376835-1.03654-.3550151-1.41338.048736zm.00001 13.63538-7.00001-7.50002-1.462106 1.36464 6.999996 7.49998zm-7.00001-6.13538 7-7.5-1.46211-1.364638-6.999996 7.499998z"
									fill="#000"
									fill-opacity=".4" /></svg>
							Back
						</ModalControl>
					{/if}
				</div>
				<div class="common-modal-close-button">
					<ModalControl on:click={didClickCloseButton}>
						<svg
							fill="none"
							height="14"
							viewBox="0 0 14 14"
							width="14"
							xmlns="http://www.w3.org/2000/svg">
							<path
								d="m13.3007.709971c-.39-.39-1.02-.39-1.41 0l-4.89 4.879999-4.89-4.889999c-.39-.39-1.02-.39-1.409997 0-.39.389999-.39 1.019999 0 1.409999l4.889997 4.89-4.889997 4.89003c-.39.39-.39 1.02 0 1.41.389997.39 1.019997.39 1.409997 0l4.89-4.89003 4.89 4.89003c.39.39 1.02.39 1.41 0s.39-1.02 0-1.41l-4.89-4.89003 4.89-4.89c.38-.38.38-1.02 0-1.399999z"
								fill="#000"
								fill-opacity=".4" />
						</svg>
					</ModalControl>
				</div>
			</div>
			<slot />
		</div>
	</div>
</div>

<style>
	:global(html:has(.common-modal-presented), .common-modal-presented) {
		overflow: clip;
		pointer-events: none;
	}

	.common-modal {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 10000;
		animation: appear 0.6s ease-out;
		will-change: opacity;
		background: rgba(0, 0, 0, 0.4);
		width: 100%;
		height: 100%;
		pointer-events: all;
	}

	.common-modal-without-appear-animation {
		animation: none;
	}

	.common-modal-variant-financing {
		background: transparent;
	}

	.common-modal-scroll {
		display: flex;
		box-sizing: border-box;
		padding: 120px;
		width: 100%;
		height: 100%;
		overflow: auto;
		scrollbar-width: none;
	}

	.common-modal-scroll::-webkit-scrollbar {
		display: none;
	}

	@media (max-width: 768px) {
		.common-modal-scroll {
			padding: 52px 6px 64px 6px;
		}
	}

	.content {
		position: relative;
		animation: appear-content 0.8s cubic-bezier(0.16, 1, 0.3, 1);
		transition: transform 0.2s ease;
		will-change: transform;
		margin: auto;
	}

	.common-modal-without-appear-animation .content {
		animation: none;
	}

	@keyframes appear {
		from {
			opacity: 0;
		}

		50% {
			opacity: 1;
		}
	}

	@keyframes appear-content {
		from {
			transform: translate3d(0, 50px, 0);
			opacity: 0;
		}

		50% {
			opacity: 1;
		}

		to {
			transform: translate3d(0, 0, 0);
		}
	}

	.common-modal-controls {
		display: flex;
		position: sticky;
		top: -120px;
		left: 0;
		justify-content: space-between;
		transform: translateY(12px);
		z-index: 10;
		padding: 0 12px;
		height: 0;
		pointer-events: none;
	}

	@media (max-width: 768px) {
		.common-modal-controls {
			top: -68px;
			transform: translateY(16px);
			padding: 8px;
		}
	}

	.common-modal-variant-inverted .common-modal-close-button svg {
		filter: invert(100%);
	}

	.common-modal-dismissing {
		animation: disappear 0.2s ease-out;
		animation-fill-mode: forwards;
	}

	.common-modal-dismissing .content {
		animation: disappear-content 0.2s cubic-bezier(0.16, 1, 0.3, 1);
		animation-fill-mode: forwards;
	}

	@keyframes disappear {
		from {
			opacity: 1;
		}

		to {
			opacity: 0;
		}
	}

	@keyframes disappear-content {
		from {
			opacity: 1;
		}

		to {
			opacity: 0;
		}
	}
</style>
