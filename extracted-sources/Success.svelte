<script>
	import Modal from "../common/Modal.svelte";

	export let isVisible = false;

	function didDismissModal() {
		isVisible = false;
	}
</script>

{#if isVisible}
	<Modal variant="inverted" on:dismiss={didDismissModal}>
		<div class="multiunit-get-in-touch-success">
			<div class="spacer-100 m-spacer-64" />
			<svg
				width="44"
				height="44"
				viewBox="0 0 44 44"
				fill="none"
				xmlns="http://www.w3.org/2000/svg">
				<path
					d="M11 23L17.6818 30L32 15"
					stroke="white"
					stroke-width="2"
					stroke-linecap="square"
					stroke-linejoin="round" />
				<circle
					cx="22"
					cy="22"
					r="21.25"
					stroke="white"
					stroke-opacity="0.2"
					stroke-width="1.5" />
			</svg>
			<div class="spacer-32" />
			<h1 class="type-24">We’ll be in touch.</h1>
			<div class="spacer-8" />
			<p class="type-18 color-text-40">
				We’ll review the information you shared and will get in touch
				soon.
			</p>
			<div class="spacer-100 m-spacer-64" />
		</div>
	</Modal>
{/if}

<style>
	p {
		padding: 0 !important;
		width: 80%;
		color: var(--color-white-60) !important;
		text-align: center;
	}

	.multiunit-get-in-touch-success {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.08);
		border-radius: 24px;
		background: #222222;
		padding: 60px;
		max-width: 540px;
		color: #ffffff;
	}

	@media (max-width: 768px) {
		.multiunit-get-in-touch-success {
			border-radius: 18px;
			padding: 60px 36px 48px 36px;
		}
	}
</style>
