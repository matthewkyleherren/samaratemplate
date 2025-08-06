<script>
    import contact from "../../../contact/stores/contact";
    import BackButtonControl from "../BackButtonControl.svelte";
    import Calendar from "../../../contact/views/Calendar.svelte";
    import Times from "../../../contact/views/Times.svelte";
    import Loader from "../../../common/Loader.svelte";
    import FormFieldLabel from "../../../common/FormFieldLabel.svelte";
    import slots from "../../../contact/stores/slots.js";
    import intake, { INTAKE_STEP } from "../../stores/intake";
    import { getContext } from "svelte";
    import { key } from "../../../common/modal";

    const APPOINTMENT_TYPE = "financing";

    const quickSlots = slots(APPOINTMENT_TYPE);
    quickSlots.refresh($contact.data.zip);

    let isLoading = false;
    let selectedDate = $contact.data.slot;
    let selectedSlot = $contact.data.slot;

    $: isLoading && getContext(key)?.setCanGoBack(false);
    $: selectedSlot && contact.updateData("slot", selectedSlot);

    $: availableSlotsForSelectedDate =
        selectedDate &&
        $quickSlots.slots &&
        $quickSlots.slots.filter(
            (slot) =>
                slot.month === selectedDate.month &&
                slot.day === selectedDate.day
        );

    async function didClickContinueButton() {
        isLoading = true;

        try {
            const res = await API.bookAppointment(
                APPOINTMENT_TYPE,
                $contact.data.slot.toISO(),
                { ...$contact.data, slug: $intake.slug }
            );

            if (res.ok !== true) {
                throw new Error("failed to book appointment");
            }

            intake.changeStep(INTAKE_STEP.scheduleResult);
            intake.resetData();
        } catch (error) {
            console.error("failed to book phone call", error);
        }

        isLoading = false;
    }
</script>

<BackButtonControl canGoBack={true} />

<h1 class="type-36">Schedule a phone call.</h1>
<div class="spacer-24"></div>
<p class="type-15 color-text-60">
    Book a 15 minute phone call to get an installation estimate for
    your&nbsp;property.
</p>
<div class="spacer-64"></div>

{#if $quickSlots.isLoading}
    <div class="slots-loading-message type-15 color-text-60">
        Loading available dates <Loader />
    </div>
{:else}
    <FormFieldLabel>
        <span slot="label">Select a date</span>
        <span slot="subtitle">Only available dates are selectable.</span>
    </FormFieldLabel>
    <div class="spacer-32" />
    <hr class="divider" />
    <div class="spacer-32" />
    <Calendar availableDates={$quickSlots.dates} bind:selectedDate />
{/if}

{#if selectedDate !== undefined && $quickSlots.isLoading !== true}
    <div class="spacer-64 m-spacer-32" />
    <FormFieldLabel>
        <span slot="label">Select a time</span>
        <span slot="subtitle">Times are shown in Pacific Time.</span>
    </FormFieldLabel>
    <div class="spacer-32" />
    <hr class="divider" />
    <div class="spacer-32" />
    <Times
        variant="confirmable"
        {selectedDate}
        availableSlots={availableSlotsForSelectedDate}
        bind:selectedSlot
        on:confirm={didClickContinueButton}
        {isLoading}>
    </Times>
{/if}

<style>
    .slots-loading-message {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
    }
</style>
