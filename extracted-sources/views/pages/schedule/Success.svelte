<script>
	import contact from "../../../stores/contact.js";
	import Header from "../../Header.svelte";
	import CalendarLinks from "../../../../common/CalendarLinks.svelte";
	import Features from "../../Features.svelte";
	import { simpleFormattedLuxonTime } from "../../../../common/time.js";
	import iconCalendar from "../../../../../images/icons/calendar.svg";
	import { onMount } from "svelte";

	const date = $contact.data.slot;

	const formattedDate = date.toLocaleString({
		weekday: "short",
		month: "short",
		day: "numeric",
		year: "numeric"
	});

	const calendarDescription =
		"A specialist will share an overview of Samara’s ADU product offerings and pricing, make recommendations, and answer your questions.";

	onMount(() => {
		gtag("event", "contact_phone_call_did_schedule");
	});
</script>

<div class="success">
	<Header>
		<span slot="title">Your phone call is confirmed</span>
		<span slot="subtitle">
			You’ll receive a confirmation by email with all of the details for
			your&nbsp;call.
		</span>
	</Header>

	<div class="spacer-50 m-spacer-32" />
	<Features
		leftText={simpleFormattedLuxonTime(date)}
		rightIcon={iconCalendar}
		rightText={formattedDate} />

	<div class="spacer-50 m-spacer-32" />
	<div class="confirmation-download">
		<CalendarLinks
			variant="centered"
			{date}
			title="Quick phone call re: Samara ADU"
			description={calendarDescription}
			address="Phone call"
			duration={15} />
	</div>
</div>
