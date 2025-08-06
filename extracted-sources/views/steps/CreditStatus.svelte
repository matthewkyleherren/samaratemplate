<script>
    import SubmitButton from "../SubmitButton.svelte";
    import intake, { INTAKE_STEP } from "../../stores/intake";
    import BackButtonControl from "../BackButtonControl.svelte";
    import FormFieldLabel from "../../../common/FormFieldLabel.svelte";
    import FormButtonSelect from "../../../common/FormButtonSelect.svelte";

    function didClickContinueButton() {
        intake.changeStep(INTAKE_STEP.result);
    }
</script>

<BackButtonControl canGoBack={true} />

<h1 class="type-36">Tell us more about you.</h1>
<div class="spacer-64"></div>

<div class="modal-grid">
    <div class="modal-grid-column-6 contact-page-header">
        <FormFieldLabel variant="financing">
            <span slot="label">What’s your employment status?</span>
        </FormFieldLabel>
    </div>
    <div class="modal-grid-column-6">
        <div class="spacer-16 m-spacer-8" />
        <FormButtonSelect
            variant="financing"
            name="employmentStatus"
            store={intake}
            allowsMultiple={false}
            isFullWidth={true}
            className="common-form-button-select-full-width common-form-button-select-blue"
            options={[
                "Employed",
                "Self-employed",
                "Retired",
                "Not employed"
            ]} />
    </div>
</div>

<div class="spacer-64 m-spacer-50" />

<div class="modal-grid">
    <div class="modal-grid-column-6 contact-page-header">
        <FormFieldLabel variant="financing">
            <span slot="label">What’s your credit score?</span>
        </FormFieldLabel>
    </div>
    <div class="modal-grid-column-6">
        <div class="spacer-16 m-spacer-8" />
        <FormButtonSelect
            variant="financing"
            name="creditScore"
            store={intake}
            allowsMultiple={false}
            isFullWidth={true}
            className="common-form-button-select-full-width common-form-button-select-blue"
            options={["760+", "730–759", "700–729", "680-699", "Below 680"]} />
    </div>
</div>

<div class="spacer-72"></div>
<SubmitButton
    title="Get your rate estimate"
    isDisabled={$intake.data.employmentStatus === undefined ||
        $intake.data.creditScore === undefined}
    on:click={didClickContinueButton} />
