<script>
    import contact from "../../../contact/stores/contact";
    import Header from "../../../contact/views/Header.svelte";
    import Features from "../../../contact/views/Features.svelte";
    import CalendarLinks from "../../../common/CalendarLinks.svelte";
    import { simpleFormattedLuxonTime } from "../../../common/time.js";
    import iconCalendar from "../../../../images/icons/calendar.svg";
    import BackButtonControl from "../BackButtonControl.svelte";

    const date = $contact.data.slot;

    const formattedDate = date.toLocaleString({
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
    });

    const calendarDescription =
        "A specialist will share an overview of Samara’s ADU product offerings and pricing, make recommendations, and answer your questions.";
</script>

<BackButtonControl canGoBack={false} canClickBackground={true} />

<div class="success">
    <Header>
        <span slot="title">You’re all set.</span>
        <span slot="subtitle">
            We’ll send you an email with everything you need to know about
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
