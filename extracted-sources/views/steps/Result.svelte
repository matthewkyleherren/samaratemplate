<script>
    import SubmitButton from "../SubmitButton.svelte";
    import intake, { INTAKE_STEP, LOAN_TYPE } from "../../stores/intake";
    import rate from "../../stores/rate";
    import contact from "../../../contact/stores/contact";
    import { costForConfiguration } from "../../../configurator/stores/cost";
    import BackButtonControl from "../BackButtonControl.svelte";
    import FormFieldInput from "../../../common/FormFieldInput.svelte";
    import zips from "../../../../../../.backyard/zips.js";
    import Slider from "../Slider.svelte";
    import InPlaceInput from "../InPlaceInput.svelte";

    const region = zips.highInstallationCost.includes($contact.data.zip)
        ? "nocal"
        : "socal";

    let absoluteDownPaymentValue = 0.0;

    let modelBaseCost = costForConfiguration({
        layout: $intake.data.layout,
        region
    }).total;

    let isEditingCost = false;

    $: availableTerms =
        $intake.data.loanType === LOAN_TYPE.fixed
            ? [
                    [30, "30 years"],
                    [20, "20 years"],
                    [15, "15 years"]
                ]
            : [
                    [30, "30 years"],
                    [25, "25 years"]
                ];

    $: availableTerms.every(([value]) => value !== $intake.data.termYears) ===
        true && intake.updateData("termYears", availableTerms[0][0]);

    $: layoutFeatures = {
        studio: ["420 sq. ft.", "1 bath"],
        onebed: ["540 sq. ft.", "1 bedroom", "1 bath"],
        twobed: ["690 sq. ft.", "2 bedrooms", "1 bath"],
        xl8: ["800 sq. ft.", "2 bedrooms", "2 baths"],
        xl10: ["950 sq. ft.", "2 bedrooms", "2 baths"]
    }[$intake.data.layout];

    function formattedCurrency(value) {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0
        }).format(value);
    }

    function didClickContinueButton() {
        intake.changeStep(INTAKE_STEP.schedule);
    }

    function didClickApplyLink(e) {
        e.preventDefault();
        intake.changeStep(INTAKE_STEP.planetHomeLending);
    }

    function didChangeLayout() {
        modelBaseCost = costForConfiguration({
            region,
            layout: $intake.data.layout
        }).total;

        // to keep downpayment absolute value constant
        intake.updateData(
            "downPayment",
            absoluteDownPaymentValue / $intake.data.cost
        );

        intake.updateData(
            "cost",
            costForConfiguration({
                region,
                layout: $intake.data.layout
            }).total
        );
    }
</script>

<BackButtonControl canGoBack={true} />

<h1 class="type-36">Financing for Backyard looks like a great fit.</h1>
<div class="spacer-24"></div>
<p class="type-15 color-text-60">
    Based on the information you provided, it looks like you may be eligible for
    Financing for Backyard.
</p>
<div class="spacer-64 m-spacer-50"></div>

<div class="financing-rate-model-picker type-center">
    <div class="type-24-light">
        Choose a Backyard model<br /> to estimate payments.
    </div>
    <div class="spacer-32 m-spacer-24"></div>
    <div
        class="financing-rate-model-picker-images"
        data-selection={$intake.data.layout}>
        <img
            data-id="studio"
            src="/assets/images/backyard/mini-configurator/studio-bonewhite.png"
            width="100%"
            height="110"
            alt="Studio" />
        <img
            data-id="onebed"
            src="/assets/images/backyard/mini-configurator/onebed-bonewhite.png"
            width="100%"
            height="110"
            alt="One bedroom" />
        <img
            data-id="twobed"
            src="/assets/images/backyard/mini-configurator/twobed-bonewhite.png"
            width="100%"
            height="110"
            alt="Two bedroom" />
        <img
            data-id="xl8"
            src="/assets/images/backyard/mini-configurator/xl-bonewhite.png"
            width="100%"
            height="110"
            alt="Backyard XL 8" />
        <img
            data-id="xl10"
            src="/assets/images/backyard/mini-configurator/xl-bonewhite.png"
            width="100%"
            height="110"
            alt="Backyard XL 10" />
    </div>
    <div class="spacer-16"></div>
    <div class="financing-rate-model-picker-select">
        <FormFieldInput
            variant="financing"
            className="alt"
            type="select"
            name="layout"
            store={intake}
            options={[
                ["studio", "Studio"],
                ["onebed", "One bedroom"],
                ["twobed", "Two bedroom"],
                ["xl8", "Backyard XL 8"],
                ["xl10", "Backyard XL 10"]
            ]}
            on:change={didChangeLayout} />
    </div>
    <div class="spacer-32"></div>
    <hr />
    <div class="spacer-16"></div>
    <InPlaceInput
        value={formattedCurrency($intake.data.cost)}
        minimumValue={modelBaseCost}
        maximumValue={$intake.data.cost * (1.0 - $intake.data.downPayment) +
            550_000}
        bind:isEditing={isEditingCost}
        on:change={({ detail }) => {
            intake.updateData("cost", detail.numericValue);
        }} />
    <div class="spacer-8"></div>
    <div
        class="type-14 color-text-60 financing-rate-model-picker-layout-features">
        {#each layoutFeatures as item, index}
            {#if index < layoutFeatures.length - 1}
                {item}<span>|</span>
            {:else}
                {item}
            {/if}
        {/each}
    </div>
    <div class="spacer-4"></div>
    <div class="type-14 color-text-60">
        Includes example installation estimate
    </div>
</div>
<div class="spacer-32"></div>

<div>
    <div class="type-14 color-text-40">APR between</div>
    <div class="spacer-8"></div>
    <div
        class="type-30-light financing-rate-apr"
        class:financing-rate-blur={isEditingCost}>
        {($rate.min * 100).toFixed(1)}<span class="color-text-40">–</span>{(
            $rate.max * 100
        ).toFixed(1)}<span class="color-text-40">%</span>
    </div>
</div>

<div class="spacer-32"></div>

<div class="modal-grid modal-grid-half-gap">
    <div class="modal-grid-column-3">
        <div class="type-14 color-text-40">Loan type</div>
        <div class="spacer-8"></div>
        <FormFieldInput
            variant="financing"
            type="select"
            name="loanType"
            options={[
                ["fixed", "Fixed"],
                ["interestOnly", "Interest only"]
            ]}
            store={intake} />
    </div>
    <div class="modal-grid-column-3">
        <div class="type-14 color-text-40">Term</div>
        <div class="spacer-8"></div>
        <FormFieldInput
            variant="financing"
            type="select"
            name="termYears"
            options={availableTerms}
            store={intake} />
    </div>
</div>

<div class="spacer-32"></div>

<div>
    <div class="type-14 color-text-40">Down payment</div>
    <Slider
        min={$intake.data.cost * $rate.minimumDownPayment}
        relativeMin={$rate.minimumDownPayment}
        max={$intake.data.cost * $rate.maximumDownPayment}
        relativeMax={$rate.maximumDownPayment}
        value={$intake.data.cost *
            Math.min(
                Math.max($intake.data.downPayment, $rate.minimumDownPayment),
                $rate.maximumDownPayment
            )}
        roundingFactor={1}
        shouldDisplayRelativeLimitIndicators={true}
        shouldExpandRangeAutomatically={false}
        on:end={({ detail }) => {
            intake.updateData("downPayment", detail.value / $intake.data.cost);
            setTimeout(() => {
                // to keep downpayment absolute value constant
                absoluteDownPaymentValue = detail.value;
            }, 0);
        }} />
</div>

<div class="spacer-80"></div>

<div class="financing-rate-result-options">
    <hr />
    <div>
        <span class="type-42">$0</span><span class="type-42 color-text-20"
            >/mo&nbsp;</span
        ><span class="type-14 color-text-40">for 6 months</span>
    </div>
    {#if $intake.data.loanType === LOAN_TYPE.interestOnly}
        <hr />
        <div>
            <span class="type-42">
                {formattedCurrency($rate.interestOnlyMonthlyPayment)}</span
            ><span class="type-42 color-text-20">/mo&nbsp;</span><span
                class="type-14 color-text-40">for 10 years</span>
        </div>
        <hr />
        <div>
            <span class="type-42">
                {formattedCurrency($rate.monthlyPayment)}</span
            ><span class="type-42 color-text-20">/mo&nbsp;</span><span
                class="type-14 color-text-40"
                >for {$intake.data.termYears - 10} years
            </span>
        </div>
    {:else}
        <hr />
        <div>
            <span class="type-42"
                >{formattedCurrency($rate.monthlyPayment)}</span
            ><span class="type-42 color-text-20">/mo&nbsp;</span><span
                class="type-14 color-text-40"
                >for {$intake.data.termYears} years
            </span>
        </div>
    {/if}
</div>

<div class="spacer-32"></div>

<div class="type-14 color-text-60">
    Based on a {formattedCurrency($rate.loanAmountToBorrow)} second mortgage with
    a <span>{(($rate.apr * 1000) / 10).toFixed(1)}%</span>
    APR, 30½-year term and the parameters selected above.
    <span class="color-text-40">Tax and insurance not included.</span>
</div>

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
<div class="spacer-16"></div>
<div class="type-center">
    <a
        on:click={didClickApplyLink}
        class="type-18 type-regola-regular"
        href="https://apply.planethomelending.com/#/milestones?referrerId=samara">
        Apply now through Planet Home Lending
    </a>
</div>
<div class="spacer-72"></div>
<div class="type-14 color-text-40">
    Rates shown are based on the information you provided and are for estimation
    only. Available rates, terms, and product offerings will be based on your
    unique financial situation.
</div>
<div class="spacer-16"></div>
<div class="type-14 color-text-40">
    This is not a credit decision or commitment to lend. Samara does not make
    loans. All loans are made by Samara’s third party lender partners.
</div>

<style>
    .finance-book-cta {
        padding: 0 10%;
    }

    @media (max-width: 768px) {
        .finance-book-cta {
            padding: 0;
        }
    }

    .financing-rate-model-picker {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 0 -30px;
        border-radius: 12px;
        background: rgba(0, 0, 0, 0.02);
        padding: 30px;
        overflow-x: hidden;
    }

    @media (max-width: 768px) {
        .financing-rate-model-picker {
            margin: 0 -24px;
        }
    }

    .financing-rate-model-picker-select {
        width: 200px;
    }

    @media (max-width: 768px) {
        .financing-rate-model-picker-select {
            width: 160px;
        }
    }

    .financing-rate-model-picker hr {
        appearance: none;
        margin: 0 -30px;
        border: none;
        border-top: rgba(0, 0, 0, 0.1) 1px solid;
        padding: 0;
        width: calc(100% + 60px);
    }

    .financing-rate-model-picker-layout-features span {
        opacity: 0.5;
        margin: 0 6px;
    }

    .financing-rate-model-picker-images {
        position: relative;
        width: 100%;
        height: 110px;
    }

    .financing-rate-model-picker-images img {
        position: absolute;
        top: 0;
        left: 0;
        transform: scale(0.95);
        opacity: 0;
        transition:
            opacity 0.4s ease,
            transform 0s linear 0.4s;
        will-change: opacity;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    @media (max-width: 768px) {
        .financing-rate-model-picker-images img {
            left: 50%;
            transform: scale(0.95);
            margin-left: -50vw;
            width: 100vw;
            object-fit: contain;
        }
    }

    .financing-rate-model-picker-images[data-selection="studio"]
        img[data-id="studio"],
    .financing-rate-model-picker-images[data-selection="onebed"]
        img[data-id="onebed"],
    .financing-rate-model-picker-images[data-selection="twobed"]
        img[data-id="twobed"],
    .financing-rate-model-picker-images[data-selection="xl8"]
        img[data-id="xl8"],
    .financing-rate-model-picker-images[data-selection="xl10"]
        img[data-id="xl10"] {
        transform: none;
        opacity: 1;
        transition:
            opacity 0.4s ease 0.2s,
            transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s;
    }

    .financing-rate-result-options {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .financing-rate-result-options hr {
        appearance: none;
        margin: 0;
        border: none;
        border-top: rgba(0, 0, 0, 0.05) 1px solid;
        padding: 0;
    }

    .financing-rate-result-options hr:first-child {
        border-top: rgba(0, 0, 0, 0.2) 1px solid;
    }

    .financing-rate-apr {
        transition: filter 0.4s ease;
    }

    .financing-rate-blur {
        transform: translate3d(0, 0, 0);
        filter: blur(8px);
    }
</style>
