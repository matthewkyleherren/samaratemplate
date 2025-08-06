<script>
	import { DateTime } from "luxon";

	export let availableDates = [];
	export let selectedDate = undefined;

	const now = () =>
		DateTime.now().setLocale("en-US").setZone("America/Los_Angeles");

	$: date = (() => {
		if (selectedDate !== undefined) {
			return selectedDate.startOf("month");
		}

		if (availableDates.length > 0) {
			return availableDates[0].startOf("month");
		}

		return now().startOf("month");
	})();

	$: days = (() => {
		const result = [];
		const month = date.month;
		let next = date;

		while (next.month === month) {
			result.push(next);
			next = next.plus({ days: 1 });
		}

		return result;
	})();

	$: leftPad = Array(date.weekday).fill();
	$: hasPrevious = date.month !== now().month;
	$: hasNext = availableDates.find(
		(d) => d.month > date.month || d.year > date.year
	);
	$: monthName = date.monthLong;
	$: yearName = date.year.toString();

	function didClickPreviousMonthButton() {
		date = date.minus({ months: 1 });
	}

	function didClickNextMonthButton() {
		date = date.plus({ months: 1 });
	}

	function isWeekend(date) {
		return date.weekday > 5;
	}

	$: isAvailable = (date) => {
		return availableDates.find(
			(d) =>
				d.year === date.year &&
				d.month === date.month &&
				d.day === date.day
		);
	};

	$: isSelected = (date) => {
		if (selectedDate === undefined) {
			return false;
		}

		return (
			selectedDate.year === date.year &&
			selectedDate.month === date.month &&
			selectedDate.day === date.day
		);
	};

	function isPast(date) {
		return date < DateTime.now();
	}

	function didClickAvailableDate(date) {
		selectedDate = date;
	}
</script>

<div class="contact-calendar">
	<div class="contact-calendar-header">
		<div class="contact-calendar-date type-24 m-type-18">
			{monthName}
			<span class="contact-calendar-year color-text-40">{yearName}</span>
		</div>
		<button on:click={didClickPreviousMonthButton} disabled={!hasPrevious}>
			<img
				src="/assets/images/icons/chevron-blue.svg"
				width="11"
				height="18"
				alt="Previous month" />
		</button>
		<button
			class="contact-calendar-header-button-next"
			on:click={didClickNextMonthButton}
			disabled={!hasNext}>
			<img
				src="/assets/images/icons/chevron-blue.svg"
				width="11"
				height="18"
				alt="Next month" />
		</button>
	</div>
	<div class="spacer-32" />
	<div class="content-calendar-days-legend">
		<div class="type-12 type-regola-regular">Sun</div>
		<div class="type-12 type-regola-regular">Mon</div>
		<div class="type-12 type-regola-regular">Tue</div>
		<div class="type-12 type-regola-regular">Wed</div>
		<div class="type-12 type-regola-regular">Thu</div>
		<div class="type-12 type-regola-regular">Fri</div>
		<div class="type-12 type-regola-regular">Sat</div>
	</div>
	<div class="spacer-16" />
	<div class="content-calendar-grid">
		{#if leftPad.length < 7}
			{#each leftPad as { }}
				<div class="content-calendar-grid-day-empty" />
			{/each}
		{/if}
		{#each days as day}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<div
				class:content-calendar-grid-day-past={isPast(day)}
				class:content-calendar-grid-day-weekend={isWeekend(day)}
				class:content-calendar-grid-day-available={isAvailable(day)}
				class:content-calendar-grid-day-selected={isSelected(day)}
				class="color-text-60"
				on:click={() => didClickAvailableDate(day)}>
				{day.day}
			</div>
		{/each}
	</div>
</div>

<style>
	.contact-calendar {
		margin: 0 auto;
		width: 100%;
		user-select: none;
		-webkit-user-select: none;
	}

	@media (max-width: 768px) {
		.contact-calendar {
			width: 100%;
		}
	}

	.contact-calendar-header {
		display: flex;
		gap: 32px;
	}

	.contact-calendar-header button {
		appearance: none;
		cursor: pointer;
		border: none;
		background: transparent;
		padding: 0;
	}

	.contact-calendar-header button:disabled {
		opacity: 0.2;
		filter: saturate(0);
	}

	.contact-calendar-header-button-next {
		transform: scaleX(-1);
	}

	.contact-calendar-date {
		flex-grow: 1;
		font-size: 24px;
	}

	@media (max-width: 768px) {
		.contact-calendar-date {
			font-size: 18px;
		}
	}

	.content-calendar-days-legend {
		display: flex;
		gap: 10px;
	}

	@media (max-width: 768px) {
		.content-calendar-days-legend {
			gap: 6px;
		}
	}

	.content-calendar-days-legend div {
		width: calc((100% - 10px * 6) / 7);
		letter-spacing: 0.04em;
		text-align: center;
		text-transform: uppercase;
	}

	@media (max-width: 768px) {
		.content-calendar-days-legend div {
			width: calc((100% - 6px * 6) / 7);
			font-size: 10px !important;
			text-align: center;
		}
	}

	.content-calendar-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	@media (max-width: 768px) {
		.content-calendar-grid {
			gap: 6px;
		}
	}

	.content-calendar-grid div {
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 12px;
		background: none;
		aspect-ratio: 1;
		width: calc((100% - 10px * 6) / 7);
		height: auto;
		pointer-events: none;
		font-size: 18px;
		font-feature-settings: "tnum", "lnum";
	}

	@media (max-width: 768px) {
		.content-calendar-grid div {
			border-radius: 10px;
			width: calc((100% - 6px * 6) / 7);
			font-size: 15px;
		}
	}

	.content-calendar-grid div span {
		visibility: hidden;
	}

	.content-calendar-grid .content-calendar-grid-day-available {
		cursor: pointer;
		box-shadow: 0px 0.5px 1px 0px rgba(0, 0, 0, 0.12);
		background: rgba(0, 0, 0, 0.03);
		pointer-events: all;
		color: var(--color-blue);
		font-family: regola-medium, sans-serif;
	}

	@media (hover: hover) {
		.content-calendar-grid .content-calendar-grid-day-available:hover {
			background: var(--color-blue-20);
		}
	}

	.content-calendar-grid .content-calendar-grid-day-selected {
		background: var(--color-blue);
		color: #ffffff;
	}

	@media (hover: hover) {
		.content-calendar-grid .content-calendar-grid-day-selected:hover {
			background: var(--color-blue-black-6);
		}
	}
</style>
