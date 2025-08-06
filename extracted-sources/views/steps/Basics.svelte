<script>
    import SubmitButton from "../SubmitButton.svelte";
    import intake, { INTAKE_STEP } from "../../stores/intake";
    import BackButtonControl from "../BackButtonControl.svelte";
    import FormFieldAddress from "../../../common/FormFieldAddress.svelte";
    import contact, {
        EMAIL_PATTERN,
        PHONE_PATTERN
    } from "../../../contact/stores/contact";
    import FormFieldLabel from "../../../common/FormFieldLabel.svelte";
    import FormFieldInput from "../../../common/FormFieldInput.svelte";
    import isServicableAddress from "../../../common/isServicableAddress";
    import zips from "../../../../../../.backyard/zips.js";
    import { costForConfiguration } from "../../../configurator/stores/cost";
    import FormFieldCheckbox from "../../../common/FormFieldCheckbox.svelte";

    $: isValid =
        !!$contact.data.firstName &&
        !!$contact.data.lastName &&
        !!$contact.data.email &&
        (isServicable === false ||
            (!!$contact.data.phone &&
                PHONE_PATTERN.test($contact.data.phone))) &&
        EMAIL_PATTERN.test($contact.data.email) &&
        !!$contact.data.address;

    $: isServicable = isServicableAddress($contact);

    function didClickContinueButton() {
        if (isServicable) {
            if ($contact.data.shouldSubscribe) {
                API.subscribe($contact.data.email, ["financing", "modal"]);
            }

            intake.changeStep(INTAKE_STEP.propertyDetails);
        } else {
            API.expand(
                $contact.data.zip,
                $contact.data.email,
                "financing",
                undefined,
                $contact.data.address
            );

            intake.changeStep(INTAKE_STEP.notifyResult);
        }
    }

    $: (() => {
        if ($contact.data.zip === undefined || $intake.layout !== undefined) {
            return;
        }

        const region = zips.highInstallationCost.includes($contact.data.zip)
            ? "nocal"
            : "socal";

        intake.updateData("layout", "onebed");

        intake.updateData(
            "cost",
            costForConfiguration({
                region,
                layout: "onebed"
            }).total
        );
    })();
</script>

<BackButtonControl canGoBack={false} />

<h1 class="type-36">Estimate your rate with Financing for Backyard.</h1>
<div class="spacer-24"></div>
<p class="type-18 m-type-15 color-text-60">
    Answer eight questions to get a quick estimate of your rates through Samara.
</p>
<div class="spacer-64"></div>

<FormFieldAddress
    variant="financing"
    title="Where do you want Backyard installed?"
    fieldTitle="Address"
    store={contact} />

{#if isServicable === false}
    <div class="type-center m-type-left">
        <div class="spacer-32" />
        <h2 class="type-18 m-type-15 color-red">
            Sorry, we're not available in&nbsp;your area...&nbsp;yet.
        </h2>
        <div class="spacer-8 m-spacer-4" />
        <div class="type-15 m-type-14 color-text-40">
            But we can notify you when Backyard comes to&nbsp;your&nbsp;area.
        </div>
        <div class="spacer-16" />
    </div>
{/if}

<div class="modal-grid">
    <div class="modal-grid-column-6">
        <div class="spacer-64 m-spacer-50" />
        <FormFieldLabel variant="financing">
            <span slot="label">Enter your contact information</span>
        </FormFieldLabel>
    </div>
</div>
<div class="spacer-16" />

<div class="modal-grid modal-grid-half-gap">
    <div class="modal-grid-column-3">
        <FormFieldInput
            variant="financing"
            title="First name"
            name="firstName"
            store={contact} />
    </div>
    <div class="modal-grid-column-3">
        <FormFieldInput
            variant="financing"
            title="Last name"
            name="lastName"
            store={contact} />
    </div>
    <div class="modal-grid-column-6">
        <div class="spacer-12 m-spacer-8" />
        <FormFieldInput
            variant="financing"
            title="Email"
            name="email"
            type="email"
            store={contact} />
    </div>
    <div class="modal-grid-column-6">
        <div class="spacer-12 m-spacer-8" />
        <FormFieldInput
            variant="financing"
            title="Phone"
            name="phone"
            type="phone"
            store={contact} />
    </div>
</div>

{#if isServicable !== false && $contact.data.isSubscribed !== true}
    <div class="spacer-50 m-spacer-32" />
    <div class="modal-grid">
        <div class="modal-grid-column-6">
            <FormFieldCheckbox
                title="Send me general updates about&nbsp;Samara"
                name="shouldSubscribe"
                store={contact} />
        </div>
    </div>
{/if}

<div class="spacer-72"></div>
<SubmitButton
    title={isServicable === false ? "Notify me" : "Continue"}
    isDisabled={isValid === false}
    on:click={didClickContinueButton} />
<div class="spacer-36"></div>
<div class="type-14 color-text-40">
    This is not an application for credit, it is a tool meant to help you
    understand whether Financing for Backyard may be a good fit for you.
    Available rates, terms, and product offerings will be based on your unique
    financial situation.
</div>
<div class="spacer-16"></div>
<div class="type-14 color-text-40">
    This is not a credit decision or commitment to lend. Samara does not make
    loans. All loans are made by Samara’s third party lender partners.
</div>
