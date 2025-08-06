<script>
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();

	function didClick() {
		dispatch("click");
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="contact-option" on:click={didClick}>
	<div class="contact-option-icon type-24 m-type-18">
		<slot name="icon" />
	</div>
	<div class="contact-option-body">
		<div class="contact-option-title type-24 m-type-18">
			<slot name="title" />
		</div>
		<div class="spacer-8" />
		<div class="contact-option-subtitle type-15 m-type-14 color-text-40">
			<slot name="subtitle" />
		</div>
	</div>
</div>

<style>
	.contact-option {
		display: flex;
		align-items: flex-start;
		gap: 18px;
		cursor: pointer;
		margin: 0;
		box-shadow: 0px 0.5px 1px 0px rgba(0, 0, 0, 0.12);
		border-radius: 12px;
		background: rgba(0, 0, 0, 0.02);
		padding: 18px 24px;
	}

	@media (hover: hover) {
		.contact-option:hover {
			box-shadow: 0px 0.5px 1px 0px rgba(0, 0, 0, 0.2);
			background: rgba(0, 0, 0, 0.01);
		}
	}

	@media (max-width: 768px) {
		.contact-option {
			gap: 14px;
			padding: 14px 8px 14px 14px;
		}
	}

	.contact-option-icon {
		height: 1.25em;
	}

	@media (max-width: 768px) {
		.contact-option-icon {
			top: 2px;
		}

		:global(.contact-option-icon svg) {
			width: 1em;
		}
	}

	.contact-option-title {
		color: var(--color-blue);
	}

	.contact-option-subtitle {
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-height: 2em;
	}
</style>
