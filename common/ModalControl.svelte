<script>
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();

	function didClick() {
		dispatch("click");
	}
</script>

<button class="modal-control type-18 m-type-15 color-text-40" on:click={didClick}>
	<slot />
</button>

<style>
	.modal-control {
		display: flex;
		align-items: center;
		gap: 12px;
		-webkit-backdrop-filter: blur(18px) saturate(1.5);
		backdrop-filter: blur(18px) saturate(1.5);
		cursor: pointer;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.2);
		padding: 0 14px;
		height: 40px;
		pointer-events: all;
	}

	@media (max-width: 768px) {
		.modal-control {
			border-radius: 9px;
		}
	}

	@media (hover: hover) {
		.modal-control:hover {
			box-shadow: 0px 0.5px 0.5px 0px rgba(0, 0, 0, 0.12);
			background: rgba(0, 0, 0, 0.02);
		}
	}
</style>
