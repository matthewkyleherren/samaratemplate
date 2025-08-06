<script>
	import Modal from "../common/Modal.svelte";
	import ModelSelectorButton from "./views/model-selector-button.svelte";
	import ModelSelector from "./views/model-selector.svelte";
	import tour from "./stores/tour";
	import ProgressBar from "./views/progress-bar.svelte";
	import "../../tour/samara_backyard_3d";
	import { onDestroy, onMount } from "svelte";

	const ZOOM = 1.0;
	const FOV_LIMIT = [65, 80];
	const LENS_ANIMATION_DURATION_S = 0.4;

	const NORMAL_QUALITY = { useBicubic: true, sharpness: 0.2, lodBias: -0.5 };

	const ENCHANCED_QUALITY = {
		useBicubic: true,
		sharpness: 0.25,
		lodBias: -0.75
	};

	const DEFAULT_CAMERA_STATES = [
		{
			model: "studio",
			azimuthAngle: -105,
			polarAngle: 80.37,
			sphereIndex: 4
		},
		{
			model: "onebed",
			azimuthAngle: -102.03,
			polarAngle: 84.66,
			sphereIndex: 2
		},
		{
			model: "twobed",
			azimuthAngle: -658.34,
			polarAngle: 75.88,
			sphereIndex: 3
		},
		{
			model: "xl8",
			azimuthAngle: -191.88,
			polarAngle: 77.92,
			sphereIndex: 8
		},
		{
			model: "xl10",
			azimuthAngle: 178.23,
			polarAngle: 76.63,
			sphereIndex: 2
		}
	];

	const SCROLL_OFFSET_PADDING = 180;
	const CAMERA_CHANGE_DEBOUNCE_MS = 300;
	const SPECS_SCROLL_DELAY_MS = 400;
	const RESTORE_STATE_DELAY_MS = 500;

	const MODEL_URL_PATHS = {
		studio: "studio",
		onebed: "one-bedroom",
		twobed: "two-bedroom",
		xl8: "xl-8",
		xl10: "xl-10"
	};

	const ACTIVE_MODEL_NAMES = {
		studio: "studio",
		onebed: "1B",
		twobed: "2B",
		xl8: "xl8",
		xl10: "xl10"
	};

	let scene = undefined;
	let progress = 0.0;
	let isSceneInitialized = false;
	let cameraChangeDebounceTimer = undefined;
	let isRestoringState = false;
	let previousModel = null;
	let initialModel = null;

	function didDismissModal() {
		gtag("event", "tour_closed", {
			model: $tour.model,
			source: $tour.source
		});
		window.Tour.hide();
	}

	function deserializeState(encoded) {
		try {
			const decoded = atob(encoded);
			const zoomMatch = decoded.match(/z([01])/);
			const cameraMatch = decoded.match(/c([-\d.]+),([-\d.]+)/);
			const sphereMatch = decoded.match(/s(\d+)/);

			if (
				zoomMatch === null ||
				cameraMatch === null ||
				sphereMatch === null
			) {
				return null;
			}

			return {
				isZoomed: zoomMatch[1] === "1",
				azimuthAngle: parseFloat(cameraMatch[1]),
				polarAngle: parseFloat(cameraMatch[2]),
				sphereIndex: parseInt(sphereMatch[1], 10)
			};
		} catch (error) {
			return null;
		}
	}

	function didLoadProgress(e) {
		progress = e.detail.isLoading === true ? e.detail.percent / 100.0 : 1.0;
	}

	function didCameraChange(event) {
		if (isRestoringState === true) {
			return;
		}

		if (cameraChangeDebounceTimer !== undefined) {
			clearTimeout(cameraChangeDebounceTimer);
		}

		cameraChangeDebounceTimer = setTimeout(() => {
			const { azimuthAngle, polarAngle, sphereIndex } = event.detail;

			const encoded = btoa(
				`z${$tour.isZoomed === true ? 1 : 0}` +
					`c${azimuthAngle.toFixed(2)},${polarAngle.toFixed(2)}` +
					`s${sphereIndex}`
			).replaceAll("=", "");

			history.replaceState(
				null,
				"",
				`/backyard/${MODEL_URL_PATHS[$tour.model]}/#${encoded}`
			);
		}, CAMERA_CHANGE_DEBOUNCE_MS);
	}

	function didRoomChange(event) {
		if (isRestoringState === true) {
			return;
		}

		const { previousRoom, currentRoom } = event.detail;
		
		gtag("event", "tour_room_navigated", {
			model: $tour.model,
			source: $tour.source,
			previous_room: previousRoom,
			current_room: currentRoom
		});
	}

	$: didClickZoomButton = () => {
		$tour.isZoomed = !$tour.isZoomed;
		updateSceneZoom(true);
		gtag("event", "tour_zoom_toggled", { 
			model: $tour.model,
			zoom_state: $tour.isZoomed === true ? "zoomed_in" : "zoomed_out",
			source: $tour.source
		});
	};

	function didClickSpecsPricingButton() {
		gtag("event", "tour_specs_pricing_clicked", {
			model: $tour.model,
			source: $tour.source,
			action: $tour.model !== initialModel ? "navigate_to_model" : "scroll_to_specs"
		});

		if ($tour.model !== initialModel) {
			window.openRoute(`/backyard/${MODEL_URL_PATHS[$tour.model]}`);
		} else {
			window.Tour.hide();

			setTimeout(() => {
				const techSpecsElement = document.getElementById("tech-specs");

				if (techSpecsElement !== null) {
					const elementTop =
						techSpecsElement.offsetTop - SCROLL_OFFSET_PADDING;
					window.scrollTo({ top: elementTop, behavior: "smooth" });
				}
			}, SPECS_SCROLL_DELAY_MS);
		}
	}

	function onSceneReady(handler) {
		function handleSamaraInitialized() {
			window.removeEventListener(
				"samara-initialized",
				handleSamaraInitialized
			);

			const checkReady = () => {
				const state = window.engine?.getState();

				if (
					window.engine?.pano?.panoItems &&
					state &&
					!state.loading.value.isLoading
				) {
					handler();
				} else {
					requestAnimationFrame(checkReady);
				}
			};

			checkReady();
		}

		window.addEventListener("samara-initialized", handleSamaraInitialized);

		return () => {
			window.removeEventListener(
				"samara-initialized",
				handleSamaraInitialized
			);
		};
	}

	function updateSceneZoom(animated) {
		if (window.engine === undefined) {
			return;
		}

		window.engine.cameraControls.setCamera(
			ZOOM,
			$tour.isZoomed === true ? FOV_LIMIT[0] : FOV_LIMIT[1],
			animated === true ? LENS_ANIMATION_DURATION_S : 0
		);

		window.engine.pano.setQuality(
			$tour.isZoomed === true ? ENCHANCED_QUALITY : NORMAL_QUALITY
		);
	}

	$: (() => {
		if (isSceneInitialized === true) {
			return;
		}

		if (scene === undefined) {
			return;
		}

		scene.addEventListener("samara-loading-progress", didLoadProgress);
		window.addEventListener("samara-camera-change", didCameraChange);
		window.addEventListener("samara-room-change", didRoomChange);

		let state = null;

		if (window.location.hash.length > 1) {
			const encoded = window.location.hash.substring(1);
			state = deserializeState(encoded);
		}

		if (state === null) {
			const defaultState = DEFAULT_CAMERA_STATES.find(
				(s) => s.model === $tour.model
			);

			if (defaultState !== undefined) {
				state = {
					isZoomed: window.innerWidth <= 768.0,
					azimuthAngle: defaultState.azimuthAngle,
					polarAngle: defaultState.polarAngle,
					sphereIndex: defaultState.sphereIndex
				};
			}
		}

		if (state !== null) {
			$tour.isZoomed = state.isZoomed;
			isRestoringState = true;

			function applyState() {
				window.engine.cameraControls.applyCameraStateFromAngles({
					fov: state.isZoomed === true ? FOV_LIMIT[0] : FOV_LIMIT[1],
					azimuthAngle: state.azimuthAngle,
					polarAngle: state.polarAngle,
					sphereIndex: state.sphereIndex
				});

				window.engine.pano.setQuality(
					state.isZoomed === true ? ENCHANCED_QUALITY : NORMAL_QUALITY
				);

				setTimeout(() => {
					isRestoringState = false;
				}, RESTORE_STATE_DELAY_MS);
			}

			if (
				window.engine !== undefined &&
				window.engine.cameraControls !== undefined
			) {
				applyState();
			} else {
				onSceneReady(applyState);
			}
		}

		isSceneInitialized = true;
		previousModel = $tour.model;
	})();

	$: activeModel = (() => ACTIVE_MODEL_NAMES[$tour.model])();

	$: if (
		isSceneInitialized === true &&
		$tour.model &&
		previousModel !== null &&
		previousModel !== $tour.model
	) {
		previousModel = $tour.model;

		history.replaceState(null, "", document.location.pathname);

		const applyDefaultCameraState = () => {
			const defaultState = DEFAULT_CAMERA_STATES.find(
				(s) => s.model === $tour.model
			);

			if (
				defaultState !== undefined &&
				window.engine !== undefined &&
				window.engine.cameraControls !== undefined
			) {
				isRestoringState = true;

				setTimeout(() => {
					window.engine.cameraControls.applyCameraStateFromAngles({
						fov:
							$tour.isZoomed === true
								? FOV_LIMIT[0]
								: FOV_LIMIT[1],
						azimuthAngle: defaultState.azimuthAngle,
						polarAngle: defaultState.polarAngle,
						sphereIndex: defaultState.sphereIndex
					});

					setTimeout(() => {
						isRestoringState = false;
					}, RESTORE_STATE_DELAY_MS);
				}, 100);
			}
		};

		onSceneReady(applyDefaultCameraState);
	}

	onMount(() => {
		initialModel = $tour.model;

		if ($tour.variant === "full-screen") {
			const floorPlanElement = document.getElementById("floor-plan");

			if (floorPlanElement !== null) {
				const elementTop =
					floorPlanElement.offsetTop - SCROLL_OFFSET_PADDING;

				setTimeout(() => {
					window.scrollTo({ top: elementTop });
				}, 600);
			}
		}

		return onSceneReady(() => {
			updateSceneZoom(false);
		});
	});

	onDestroy(() => {
		if (cameraChangeDebounceTimer !== undefined) {
			clearTimeout(cameraChangeDebounceTimer);
		}

		history.replaceState(
			null,
			"",
			$tour.source === "home" ? "/" : document.location.pathname
		);

		window.removeEventListener("samara-camera-change", didCameraChange);
		window.removeEventListener("samara-room-change", didRoomChange);

		delete window.engine;
	});
</script>

<Modal
	variant="tour"
	extraClassNames={`tour-modal-variant-${$tour.variant}`}
	shouldSkipAnimation={$tour.source === "restore"}
	on:dismiss={didDismissModal}>
	{#if $tour.variant === "modal"}
		<div class="tour-outline"></div>
	{/if}

	<ModelSelectorButton />

	<div class="tour-controls">
		<button
			class="tour-controls-specs-pricing type-15 type-regola-regular"
			on:click={didClickSpecsPricingButton}>
			Specs & pricing
			<svg
				width="14"
				height="13"
				viewBox="0 0 14 13"
				fill="none"
				xmlns="http://www.w3.org/2000/svg">
				<path
					d="M13.9995 6.5C13.9995 6.68555 13.9263 6.84912 13.7798 6.99072L8.90918 11.8467C8.76758 11.9834 8.60889 12.0518 8.43311 12.0518C8.25244 12.0518 8.10107 11.9907 7.979 11.8687C7.85693 11.7515 7.7959 11.6025 7.7959 11.4219C7.7959 11.334 7.81055 11.251 7.83984 11.1729C7.86914 11.0898 7.91309 11.019 7.97168 10.9604L9.6123 9.29053L12.52 6.64648L12.6665 7.00537L10.3081 7.15186H1.04297C0.852539 7.15186 0.696289 7.09082 0.574219 6.96875C0.457031 6.84668 0.398438 6.69043 0.398438 6.5C0.398438 6.30957 0.457031 6.15332 0.574219 6.03125C0.696289 5.90918 0.852539 5.84814 1.04297 5.84814H10.3081L12.6665 5.99463L12.52 6.36084L9.6123 3.70947L7.97168 2.03955C7.91309 1.98096 7.86914 1.9126 7.83984 1.83447C7.81055 1.75146 7.7959 1.66602 7.7959 1.57812C7.7959 1.39746 7.85693 1.24854 7.979 1.13135C8.10107 1.00928 8.25244 0.948242 8.43311 0.948242C8.521 0.948242 8.604 0.965332 8.68213 0.999512C8.76514 1.03369 8.8457 1.08984 8.92383 1.16797L13.7798 6.00928C13.9263 6.15088 13.9995 6.31445 13.9995 6.5Z"
					fill="white"
					style="fill:white;fill-opacity:1;" />
			</svg>
		</button>
		<button
			class="tour-controls-zoom-in type-15 type-regola-regular"
			on:click={didClickZoomButton}>
			{#if $tour.isZoomed === false}
				<svg
					width="15"
					height="15"
					viewBox="0 0 15 15"
					fill="none"
					xmlns="http://www.w3.org/2000/svg">
					<path
						d="M0 6.11914C0 5.31348 0.151367 4.55908 0.454102 3.85596C0.756836 3.14795 1.17676 2.52539 1.71387 1.98828C2.25098 1.45117 2.87109 1.03125 3.57422 0.728516C4.28223 0.425781 5.03906 0.274414 5.84473 0.274414C6.65039 0.274414 7.40479 0.425781 8.10791 0.728516C8.81592 1.03125 9.43848 1.45117 9.97559 1.98828C10.5127 2.52539 10.9326 3.14795 11.2354 3.85596C11.5381 4.55908 11.6895 5.31348 11.6895 6.11914C11.6895 6.78809 11.582 7.42285 11.3672 8.02344C11.1572 8.62402 10.8643 9.16846 10.4883 9.65674L14.0698 13.2603C14.1479 13.3384 14.2065 13.4287 14.2456 13.5312C14.2896 13.6338 14.3115 13.7437 14.3115 13.8608C14.3115 14.022 14.2749 14.1685 14.2017 14.3003C14.1333 14.4321 14.0356 14.5347 13.9087 14.6079C13.7817 14.686 13.6353 14.7251 13.4692 14.7251C13.3521 14.7251 13.2397 14.7031 13.1323 14.6592C13.0298 14.6201 12.9346 14.5591 12.8467 14.4761L9.24316 10.8652C8.76465 11.207 8.2373 11.4756 7.66113 11.6709C7.08496 11.8662 6.47949 11.9639 5.84473 11.9639C5.03906 11.9639 4.28223 11.8125 3.57422 11.5098C2.87109 11.207 2.25098 10.7871 1.71387 10.25C1.17676 9.71289 0.756836 9.09277 0.454102 8.38965C0.151367 7.68164 0 6.9248 0 6.11914ZM1.25244 6.11914C1.25244 6.75391 1.36963 7.34961 1.604 7.90625C1.84326 8.45801 2.17285 8.94385 2.59277 9.36377C3.01758 9.78369 3.50586 10.1133 4.05762 10.3525C4.61426 10.5918 5.20996 10.7114 5.84473 10.7114C6.47949 10.7114 7.07275 10.5918 7.62451 10.3525C8.18115 10.1133 8.66943 9.78369 9.08936 9.36377C9.50928 8.94385 9.83887 8.45801 10.0781 7.90625C10.3174 7.34961 10.437 6.75391 10.437 6.11914C10.437 5.48438 10.3174 4.89111 10.0781 4.33936C9.83887 3.78271 9.50928 3.29443 9.08936 2.87451C8.66943 2.44971 8.18115 2.12012 7.62451 1.88574C7.07275 1.64648 6.47949 1.52686 5.84473 1.52686C5.20996 1.52686 4.61426 1.64648 4.05762 1.88574C3.50586 2.12012 3.01758 2.44971 2.59277 2.87451C2.17285 3.29443 1.84326 3.78271 1.604 4.33936C1.36963 4.89111 1.25244 5.48438 1.25244 6.11914ZM3.42773 6.11914C3.42773 5.96777 3.479 5.84082 3.58154 5.73828C3.68896 5.63086 3.81592 5.57715 3.9624 5.57715H5.31006V4.23682C5.31006 4.08545 5.36133 3.9585 5.46387 3.85596C5.57129 3.74854 5.69824 3.69482 5.84473 3.69482C5.99609 3.69482 6.12305 3.74854 6.22559 3.85596C6.33301 3.9585 6.38672 4.08545 6.38672 4.23682V5.57715H7.72705C7.87842 5.57715 8.00537 5.63086 8.10791 5.73828C8.21045 5.84082 8.26172 5.96777 8.26172 6.11914C8.26172 6.27051 8.21045 6.39746 8.10791 6.5C8.00537 6.60254 7.87842 6.65381 7.72705 6.65381H6.38672V7.99414C6.38672 8.14551 6.33301 8.2749 6.22559 8.38232C6.12305 8.48486 5.99609 8.53613 5.84473 8.53613C5.69824 8.53613 5.57129 8.48486 5.46387 8.38232C5.36133 8.2749 5.31006 8.14551 5.31006 7.99414V6.65381H3.9624C3.81592 6.65381 3.68896 6.60254 3.58154 6.5C3.479 6.39746 3.42773 6.27051 3.42773 6.11914Z"
						fill="white"
						style="fill:white;fill-opacity:1;" />
				</svg>
				Zoom in
			{:else}
				<svg
					width="15"
					height="15"
					viewBox="0 0 15 15"
					fill="none"
					xmlns="http://www.w3.org/2000/svg">
					<path
						d="M0 6.11938C0 5.31372 0.151367 4.55933 0.454102 3.8562C0.756836 3.14819 1.17676 2.52563 1.71387 1.98853C2.25098 1.45142 2.87109 1.03149 3.57422 0.72876C4.28223 0.426025 5.03906 0.274658 5.84473 0.274658C6.65039 0.274658 7.40479 0.426025 8.10791 0.72876C8.81592 1.03149 9.43848 1.45142 9.97559 1.98853C10.5127 2.52563 10.9326 3.14819 11.2354 3.8562C11.5381 4.55933 11.6895 5.31372 11.6895 6.11938C11.6895 6.78833 11.582 7.4231 11.3672 8.02368C11.1572 8.62427 10.8643 9.1687 10.4883 9.65698L14.0698 13.2605C14.1479 13.3386 14.2065 13.429 14.2456 13.5315C14.2896 13.634 14.3115 13.7439 14.3115 13.8611C14.3115 14.0222 14.2749 14.1687 14.2017 14.3005C14.1333 14.4324 14.0356 14.5349 13.9087 14.6082C13.7817 14.6863 13.6353 14.7253 13.4692 14.7253C13.3521 14.7253 13.2397 14.7034 13.1323 14.6594C13.0298 14.6204 12.9346 14.5593 12.8467 14.4763L9.24316 10.8655C8.76465 11.2073 8.2373 11.4758 7.66113 11.6711C7.08496 11.8665 6.47949 11.9641 5.84473 11.9641C5.03906 11.9641 4.28223 11.8127 3.57422 11.51C2.87109 11.2073 2.25098 10.7874 1.71387 10.2502C1.17676 9.71313 0.756836 9.09302 0.454102 8.38989C0.151367 7.68188 0 6.92505 0 6.11938ZM1.25244 6.11938C1.25244 6.75415 1.36963 7.34985 1.604 7.90649C1.84326 8.45825 2.17285 8.94409 2.59277 9.36401C3.01758 9.78394 3.50586 10.1135 4.05762 10.3528C4.61426 10.592 5.20996 10.7117 5.84473 10.7117C6.47949 10.7117 7.07275 10.592 7.62451 10.3528C8.18115 10.1135 8.66943 9.78394 9.08936 9.36401C9.50928 8.94409 9.83887 8.45825 10.0781 7.90649C10.3174 7.34985 10.437 6.75415 10.437 6.11938C10.437 5.48462 10.3174 4.89136 10.0781 4.3396C9.83887 3.78296 9.50928 3.29468 9.08936 2.87476C8.66943 2.44995 8.18115 2.12036 7.62451 1.88599C7.07275 1.64673 6.47949 1.5271 5.84473 1.5271C5.20996 1.5271 4.61426 1.64673 4.05762 1.88599C3.50586 2.12036 3.01758 2.44995 2.59277 2.87476C2.17285 3.29468 1.84326 3.78296 1.604 4.3396C1.36963 4.89136 1.25244 5.48462 1.25244 6.11938ZM3.95508 6.65405C3.80859 6.65405 3.68164 6.60278 3.57422 6.50024C3.47168 6.39282 3.42041 6.26587 3.42041 6.11938C3.42041 5.9729 3.47168 5.84595 3.57422 5.73853C3.68164 5.6311 3.80859 5.57739 3.95508 5.57739H7.72705C7.87354 5.57739 7.99805 5.6311 8.10059 5.73853C8.20801 5.84595 8.26172 5.9729 8.26172 6.11938C8.26172 6.26587 8.20801 6.39282 8.10059 6.50024C7.99805 6.60278 7.87354 6.65405 7.72705 6.65405H3.95508Z"
						fill="white"
						style="fill:white;fill-opacity:1;" />
				</svg>
				Zoom out
			{/if}
		</button>
	</div>
	<div
		class={`tour-content tour-content-variant-${$tour.variant}`}
		class:tour-content-null={$tour.model === null}>
		<ModelSelector />
		<ProgressBar value={progress} />
		{#if $tour.model !== null}
			<samara-room-tour
				class:samara-scene-loaded={progress === 1.0}
				class:samara-scene-changing-model={$tour.isChangingModel ===
					true}
				{activeModel}
				bind:this={scene} />
		{/if}
	</div>
</Modal>

<style>
	.tour-outline {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 100;
		outline: rgba(255, 255, 255, 0.1) 1px solid;
		outline-offset: -1px;
		border-radius: 24.5px;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	@media (max-width: 768px) {
		.tour-outline {
			top: 5dvh;
			border-bottom-right-radius: 0;
			border-bottom-left-radius: 0;
			height: 95dvh;
		}
	}

	:global(.common-modal-variant-tour .common-modal-scroll) {
		padding: 0 !important;
	}

	:global(.common-modal-variant-tour .common-modal-controls) {
		position: absolute !important;
		top: 12px !important;
		right: 0;
		padding: 0 24px !important;
	}

	:global(
			.common-modal-variant-tour:has(.tour-content-null)
				.common-modal-controls
		) {
		z-index: 100 !important;
	}

	@media (max-width: 768px) {
		:global(.common-modal-variant-tour .common-modal-controls) {
			top: calc(5dvh + 10px) !important;
		}

		:global(.tour-modal-variant-full-screen .common-modal-controls) {
			top: 8px !important;
		}
	}

	:global(.common-modal-variant-tour .common-modal-close-button button) {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0 !important;
		width: 48px;
		height: 48px;
	}

	@media (max-width: 768px) {
		:global(.common-modal-variant-tour .common-modal-close-button button) {
			width: 44px;
			height: 44px;
		}
	}

	:global(
			.common-modal-variant-tour
				.common-modal-close-button
				button
				svg
				path
		) {
		fill: #ffffff;
		fill-opacity: 1;
	}

	.tour-content {
		position: relative;
		transition: background 0.4s ease;
		will-change: background;
		box-sizing: border-box;
		box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.08);
		border-radius: 24px;
		background: #000000;
		width: calc(100vw - var(--modern-grid-column-margin) * 2 + 2px);
		height: calc(100vh - var(--modern-grid-column-margin) * 2);
		overflow: hidden;
	}

	@media (max-width: 768px) {
		.tour-content {
			margin-top: 5dvh;
			border-bottom-right-radius: 0;
			border-bottom-left-radius: 0;
			width: 100vw;
			height: 95dvh;
			min-height: unset;
		}
	}

	.tour-content-variant-full-screen {
		border-radius: 0;
		width: 100vw;
		height: 100vh;
	}

	@media (max-width: 768px) {
		.tour-content-variant-full-screen {
			margin: 0;
			height: 100dvh;
		}
	}

	.tour-controls-specs-pricing {
		position: absolute;
		right: 24px;
		bottom: 24px;
		z-index: 50;
	}

	.tour-controls-zoom-in {
		position: absolute;
		bottom: 24px;
		left: 24px;
		z-index: 50;
	}

	:global(#tour button) {
		display: flex;
		align-items: center;
		gap: 8px;
		appearance: none;
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		margin: 0;
		border-radius: 24px;
		background: rgba(0, 0, 0, 0.2);
		padding: 0 24px;
		height: 48px;
		color: #ffffff;
	}

	@media (max-width: 768px) {
		:global(#tour button) {
			height: 44px;
		}
	}

	@media (hover: hover) {
		:global(#tour button:hover) {
			outline: 1px solid rgba(255, 255, 255, 0.2);
			background: rgba(255, 255, 255, 0.1);
		}
	}

	samara-room-tour {
		position: relative;
		opacity: 0;
		z-index: 0;
		transition: opacity 0.8s ease 0.8s;
		height: 100%;
	}

	.samara-scene-loaded {
		opacity: 1;
		transition: opacity 0.8s ease 1s;
	}

	.samara-scene-changing-model {
		opacity: 0;
		transition: opacity 0.8s ease;
	}
</style>
