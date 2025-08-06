<script>
    import intake, { INTAKE_STEP } from "../../stores/intake";
    import BackButtonControl from "../BackButtonControl.svelte";
    import SubmitButton from "../SubmitButton.svelte";

    function didClickContinueButton() {
        intake.changeStep(INTAKE_STEP.schedule);
    }
</script>

<BackButtonControl canGoBack={true} />

<h1 class="type-36">It looks like we’ll need more information to help.</h1>
<div class="spacer-24"></div>
<p class="type-15 color-text-60">
    Based on the information you provided, we’ll need to ask a few additional
    questions to help you find the best financing solution.
</p>

<div class="spacer-72"></div>
<div class="type-center type-21-light finance-book-cta">
    Book a 15 minute phone call to<br /> get an installation estimate for<br />
    your&nbsp;property.
</div>
<div class="spacer-36"></div>
<SubmitButton
    title="Schedule a call"
    isDisabled={false}
    on:click={didClickContinueButton} />
