<script>
	import { createEventDispatcher } from "svelte";
	import Loader from "../../common/Loader.svelte";
	import { simpleFormattedLuxonTime } from "../../common/time.js";

	export let variant = "default";
	export let availableSlots = [];
	export let selectedSlot = null;
	export let selectedDate;
	export let isLoading = false;

	const dispatchEvent = createEventDispatcher();

	$: formattedDay = selectedDate.weekdayLong;

	$: formattedDate = selectedDate.toLocaleString({
		month: "short",
		day: "numeric"
	});

	function didClickTimeSlot(slot) {
		if (selectedSlot === slot) {
			selectedSlot = undefined;
		} else {
			selectedSlot = slot;
		}
	}

	function didClickSelectButton(e) {
		e.stopPropagation();
		dispatchEvent("confirm");
	}
</script>

<div class="date type-24 m-type-18">
	{formattedDay}<span class="color-text-40">, {formattedDate}</span>
</div>
<div class="spacer-32" />

<ul class={variant}>
	{#each availableSlots as slot}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
		<li
			class:selected={slot === selectedSlot}
			on:click={() => didClickTimeSlot(slot)}>
			{#if variant === "default"}
				{simpleFormattedLuxonTime(slot)}
				{#if slot === selectedSlot}
					<img
						src="/assets/images/icons/checkmark-white.svg"
						width="16"
						height="16"
						alt="Checkmark" />
				{/if}
			{:else if variant === "confirmable"}
				<div>{simpleFormattedLuxonTime(slot)}</div>

				{#if slot === selectedSlot}
					<button
						class="type-18"
						on:click={didClickSelectButton}
						disabled={isLoading}>
						{#if isLoading}
							<Loader variant="light" />
						{:else}
							Continue
						{/if}
					</button>
				{/if}
			{/if}
		</li>
		{#if slot === selectedSlot}
			<slot />
		{/if}
	{/each}
</ul>

<div class="m-spacer-32"></div>

<style>
	ul {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin: 0;
		padding: 0;
		list-style-type: none;
	}

	li {
		display: flex;
		justify-content: center;
		gap: 10px;
		cursor: pointer;
		box-shadow: 0px 0.5px 1px 0px rgba(0, 0, 0, 0.12);
		border-radius: 12px;
		background: rgba(0, 0, 0, 0.02);
		padding: 16px 0;
		font-family: regola-medium, sans-serif;
		user-select: none;
		-webkit-user-select: none;
		text-align: center;
	}

	.confirmable li > * {
		box-sizing: border-box;
		width: 50%;
	}

	@media (hover: hover) {
		li:hover {
			background: rgba(0, 0, 0, 0.01);
		}
	}

	.default .selected {
		background: var(--color-blue);
		color: #ffffff;
	}

	@media (hover: hover) {
		.default .selected:hover {
			background: var(--color-blue-black-2);
		}
	}

	.confirmable .selected {
		box-shadow: none;
		background: transparent;
		padding: 0;
	}

	.confirmable .selected div {
		outline: 1px solid rgba(0, 0, 0, 0.2);
		box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.05);
		border-radius: 12px;
		background: #ffffff;
		padding: 16px;
	}

	button {
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 12px;
		background: var(--color-blue);
		color: #ffffff;
		text-align: center;
	}
</style>
