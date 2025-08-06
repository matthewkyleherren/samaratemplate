<script>
    import contact from "../../../stores/contact.js";
    import Header from "../../Header.svelte";
    import CalendarLinks from "../../../../common/CalendarLinks.svelte";
    import Features from "../../Features.svelte";
    import { getContext } from "svelte";
    import { key } from "../../../../common/modal.js";
    import { simpleFormattedLuxonTime } from "../../../../common/time.js";
    import iconCalendar from "../../../../../images/icons/calendar.svg";

    getContext(key)?.setBackgroundClickable(true);

    $: formattedDate =
        $contact.data.slot &&
        $contact.data.slot.toLocaleString({
            weekday: "long",
            month: "short",
            day: "numeric",
            year: "numeric"
        });

    $: calendarDescription =
        "A specialist will share an overview of Samara’s ADU product offerings and pricing, make recommendations, and answer your questions.";

    gtag("event", "hello_survey_completed");
</script>

<div class="success survey-success">
    <Header>
        <span slot="title">You’re all set.</span>
        <span slot="subtitle">
            We’ll send you an email with everything you need to know about
            your&nbsp;call.
        </span>
    </Header>

    {#if $contact.data.slot}
        <div class="spacer-50 m-spacer-32" />
        <Features
            leftText={simpleFormattedLuxonTime($contact.data.slot)}
            rightIcon={iconCalendar}
            rightText={formattedDate} />

        <div class="spacer-64 m-spacer-32" />

        <div class="confirmation-download">
            <CalendarLinks
                variant="centered"
                date={$contact.data.slot}
                title="Quick phone call re: Samara ADU"
                description={calendarDescription}
                address="Phone call"
                duration={15} />
        </div>
    {/if}
</div>
