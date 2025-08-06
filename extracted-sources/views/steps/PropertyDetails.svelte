<script>
    import SubmitButton from "../SubmitButton.svelte";
    import intake, { INTAKE_STEP } from "../../stores/intake";
    import contact from "../../../contact/stores/contact";
    import BackButtonControl from "../BackButtonControl.svelte";
    import FormFieldLabel from "../../../common/FormFieldLabel.svelte";
    import FormButtonSelect from "../../../common/FormButtonSelect.svelte";
    import Slider from "../Slider.svelte";

    function didClickContinueButton() {
        intake.changeStep(INTAKE_STEP.creditStatus);
    }
</script>

<BackButtonControl canGoBack={true} />

<h1 class="type-36">
    Tell us more about {$contact.data.street || "your property"}.
</h1>
<div class="spacer-64"></div>

<div class="modal-grid">
    <div class="modal-grid-column-6 contact-page-header">
        <FormFieldLabel variant="financing">
            <span slot="label">What kind of property is it?</span>
        </FormFieldLabel>
    </div>
    <div class="modal-grid-column-6">
        <div class="spacer-16 m-spacer-8" />
        <FormButtonSelect
            variant="financing"
            name="propertyKind"
            store={intake}
            allowsMultiple={false}
            isFullWidth={true}
            className="common-form-button-select-full-width common-form-button-select-blue"
            options={[
                "Primary property",
                "Secondary property",
                "Investment property"
            ]} />
    </div>
</div>

<div class="spacer-72 m-spacer-60" />

<div class="modal-grid">
    <div class="modal-grid-column-6 contact-page-header">
        <FormFieldLabel variant="financing">
            <span slot="label">What’s the property’s value?</span>
            <span slot="subtitle">Just an estimate is fine.</span>
        </FormFieldLabel>
    </div>
    <div class="modal-grid-column-6">
        <div class="spacer-16 m-spacer-8" />
        <Slider
            min={500_000}
            max={3_000_000}
            value={$intake.data.propertyValue}
            on:end={({ detail }) => {
                intake.updateData("propertyValue", detail.value);

                if ($intake.data.mortgageBalance > $intake.data.propertyValue) {
                    intake.updateData(
                        "mortgageBalance",
                        $intake.data.propertyValue
                    );
                }
            }} />
    </div>
</div>

<div class="spacer-72 m-spacer-60" />

<div class="modal-grid">
    <div class="modal-grid-column-6 contact-page-header">
        <FormFieldLabel variant="financing">
            <span slot="label">
                If there’s a mortgage on the property, what’s the balance?
            </span>
            <span slot="subtitle">Again, just an estimate is fine.</span>
        </FormFieldLabel>
    </div>
    <div class="modal-grid-column-6">
        <div class="spacer-16 m-spacer-8" />
        <Slider
            min={0}
            max={$intake.data.propertyValue}
            value={$intake.data.mortgageBalance}
            shouldExpandRangeAutomatically={false}
            on:end={({ detail }) => {
                intake.updateData("mortgageBalance", detail.value);
            }} />
    </div>
</div>

<div class="spacer-72 m-spacer-60" />

<div class="modal-grid">
    <div class="modal-grid-column-6 contact-page-header">
        <FormFieldLabel variant="financing">
            <span slot="label">If you have a HELOC, what’s the balance?</span>
            <span slot="subtitle">An estimate is fine.</span>
        </FormFieldLabel>
    </div>
    <div class="modal-grid-column-6">
        <div class="spacer-16 m-spacer-8" />
        <Slider
            min={0}
            max={150_000}
            roundingFactor={1_000}
            value={$intake.data.helocBalance}
            on:end={({ detail }) => {
                intake.updateData("helocBalance", detail.value);
            }} />
    </div>
</div>

<div class="spacer-72"></div>
<SubmitButton
    isDisabled={$intake.data.propertyKind === undefined}
    on:click={didClickContinueButton} />
