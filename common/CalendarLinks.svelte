<script>
	import { ics, google, outlook } from "calendar-link";

	export let variant = "default";
	export let date;
	export let duration;
	export let title;
	export let address;
	export let description;

	$: calendarEvent = {
		title,
		description,
		start: date.toISO(),
		duration: [duration, "minute"],
		location: address
	};

	$: appleLink = ics(calendarEvent);
	$: googleLink = google(calendarEvent);
	$: outlookLink = outlook(calendarEvent);

	function slugify(text) {
		return text
			.toString()
			.toLowerCase()
			.replace(/\s+/g, "-")
			.replace(/[^\w\-]+/g, "")
			.replace(/\-\-+/g, "-")
			.replace(/^-+/, "")
			.replace(/-+$/, "");
	}
</script>

<div class={`calendar-links calendar-links-variant-${variant}`}>
	<h2 class="type-14 color-text-60">Add to calendar</h2>
	<div class="spacer-8" />
	<div class="type-14 type-regola-regular color-text-60 calendar-links-list">
		<a download={`${slugify(title)}.ics`} href={appleLink}>
			Apple Calendar
		</a>
		<div class="divider" />
		<a href={googleLink} target="_blank">Google Calendar</a>
		<div class="divider" />
		<a href={outlookLink} target="_blank">Outlook</a>
	</div>
</div>

<style>
	.calendar-links-list {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		line-height: 150%;
	}

	@media (max-width: 768px) {
		.calendar-links-list {
			gap: 6px;
		}
	}

	.calendar-links-list .divider {
		background: rgba(0, 0, 0, 0.18);
		width: 1px;
	}

	.calendar-links-variant-centered {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.calendar-links-list a {
		white-space: nowrap;
	}
</style>
