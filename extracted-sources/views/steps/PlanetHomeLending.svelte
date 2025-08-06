<script>
    import intake, { INTAKE_STEP } from "../../stores/intake";
    import BackButtonControl from "../BackButtonControl.svelte";
    import SubmitButton from "../SubmitButton.svelte";

    function didClickContinueButton() {
        gtag("financing_modal_open_planethomelending");

        window.open(
            "https://apply.planethomelending.com/#/milestones?referrerId=dkaminsky%40planethomelending.com"
        );

        window.dispatchEvent(new Event("modal:dismiss"));
    }

    function didClickTalkButton(e) {
        e.preventDefault();
        intake.changeStep(INTAKE_STEP.schedule);
    }
</script>

<BackButtonControl canGoBack={true} />

<h1 class="type-36">
    Apply to Financing for Backyard through Planet Home Lending.
</h1>
<div class="spacer-24"></div>
<p class="type-15 color-text-60">
    You’re about to leave Samara’s website and will be directed to Planet Home
    Lending, where you can complete the application for Financing for Backyard.
</p>
<div class="spacer-12"></div>
<p class="type-15 color-text-60">
    We recommend talking to a Samara specialist before applying in order to get
    a complete installation estimate.
</p>
<div class="spacer-64"></div>
<SubmitButton
    title="Continue to Planet Home Lending"
    isDisabled={false}
    on:click={didClickContinueButton} />
<div class="spacer-16"></div>
<div class="type-center">
    <a
        on:click={didClickTalkButton}
        href="/backyard/financing"
        class="type-18 type-regola-regular">
        Talk to a Samara specialist
    </a>
</div>
