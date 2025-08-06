<script>
    import intake, { INTAKE_STEP, LOAN_TYPE } from "./stores/intake";
    import rate, { calculateFinancing } from "./stores/rate";
    import Modal from "../common/Modal.svelte";
    import Basics from "./views/steps/Basics.svelte";
    import PropertyDetails from "./views/steps/PropertyDetails.svelte";
    import CreditStatus from "./views/steps/CreditStatus.svelte";
    import Result from "./views/steps/Result.svelte";
    import Schedule from "./views/steps/Schedule.svelte";
    import NotifySuccess from "../contact/views/pages/hello/NotifySuccess.svelte";
    import ScheduleResult from "./views/steps/ScheduleResult.svelte";
    import PlanetHomeLending from "./views/steps/PlanetHomeLending.svelte";
    import Disqualified from "./views/steps/Disqualified.svelte";
    import contact from "../contact/stores/contact";

    let isModalVisible = false;
    let updateTimer;
    let isUpdating = false;
    let lastUpdateAt = 0;

    function didRequestRateModal() {
        intake.reset();
        isModalVisible = true;
    }

    function didDismissRateModal() {
        isModalVisible = false;
    }

    $: didClickBackButton = () => {
        if ($intake.step === INTAKE_STEP.propertyDetails) {
            intake.changeStep(INTAKE_STEP.basics);
        } else if ($intake.step === INTAKE_STEP.creditStatus) {
            intake.changeStep(INTAKE_STEP.propertyDetails);
        } else if ($intake.step === INTAKE_STEP.result) {
            intake.changeStep(INTAKE_STEP.creditStatus);
        } else if ($intake.step === INTAKE_STEP.schedule) {
            intake.changeStep(INTAKE_STEP.result);
        } else if ($intake.step === INTAKE_STEP.planetHomeLending) {
            intake.changeStep(INTAKE_STEP.result);
        }
    };

    async function update() {
        const {
            firstName,
            lastName,
            email,
            phone,
            address,
            utmCampaign,
            utmSource,
            utmTerm,
            gclid
        } = $contact.data;

        if (!firstName || !lastName || !email) {
            return;
        }

        isUpdating = true;
        lastUpdateAt = Date.now();

        const fixed = calculateFinancing(
            {
                ...$intake,
                data: {
                    ...$intake.data,
                    downPayment: 0.0,
                    loanType: LOAN_TYPE.fixed
                }
            },
            30
        );

        const interestOnly = calculateFinancing(
            {
                ...$intake,
                data: {
                    ...$intake.data,
                    downPayment: 0.0,
                    loanType: LOAN_TYPE.interestOnly
                }
            },
            30
        );

        const fixedApr =
            fixed.apr &&
            `${(fixed.min * 100).toFixed(1)}–${(fixed.max * 100).toFixed(1)}%`;

        const interestOnlyApr =
            interestOnly.apr &&
            `${(interestOnly.min * 100).toFixed(1)}–${(
                interestOnly.max * 100
            ).toFixed(1)}%`;

        const data = {
            ...$intake.data,

            // contact
            firstName,
            lastName,
            email,
            phone,
            address,
            utmCampaign,
            utmSource,
            utmTerm,
            gclid,

            // derived
            fixedApr,
            fixedMonthlyPayment: fixed.monthlyPayment,
            interestOnlyApr,
            interestOnlyMonthlyPayment: interestOnly.monthlyPayment
        };

        if ($intake.slug) {
            await API.updateFinancingRecord($intake.slug, data);
        } else {
            const res = await API.createFinancingRecord(data);
            const { slug } = await res.json();
            intake.update("slug", slug);
        }

        isUpdating = false;
    }

    function updateThottled() {
        clearTimeout(updateTimer);

        const interval = 5_000;
        const intervalSinceLastUpdate = Date.now() - lastUpdateAt;

        if (isUpdating) {
            updateTimer = setTimeout(updateThottled, interval);
        } else if (
            $intake.slug === null ||
            intervalSinceLastUpdate > interval
        ) {
            update();
        } else {
            updateTimer = setTimeout(update, interval);
        }
    }

    $: isModalVisible &&
        $intake.step !== INTAKE_STEP.basics &&
        $contact &&
        $intake &&
        $rate &&
        updateThottled();
</script>

<svelte:window on:financing:rate-modal={didRequestRateModal} />

{#if isModalVisible}
    <Modal on:dismiss={didDismissRateModal} on:back={didClickBackButton}>
        <div class="financing-rate-modal-content">
            {#if $intake.step !== INTAKE_STEP.basics && $intake.step !== INTAKE_STEP.scheduleResult}
                <div class="spacer-32"></div>
            {/if}
            {#if $intake.step === INTAKE_STEP.basics}
                <Basics />
            {:else if $intake.step === INTAKE_STEP.notifyResult}
                <NotifySuccess />
            {:else if $intake.step === INTAKE_STEP.propertyDetails}
                <PropertyDetails />
            {:else if $intake.step === INTAKE_STEP.creditStatus}
                <CreditStatus />
            {:else if $intake.step === INTAKE_STEP.result}
                {#if $rate.apr !== undefined}
                    <Result />
                {:else}
                    <Disqualified />
                {/if}
            {:else if $intake.step === INTAKE_STEP.schedule}
                <Schedule />
            {:else if $intake.step === INTAKE_STEP.scheduleResult}
                <ScheduleResult />
            {:else if $intake.step === INTAKE_STEP.planetHomeLending}
                <PlanetHomeLending />
            {/if}
        </div>
    </Modal>
{/if}

<style>
    .financing-rate-modal-content {
        box-sizing: border-box;
        box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.08);
        border-radius: 24px;
        background: #ffffff;
        padding: 54px;
        width: 540px;
        overflow-x: hidden;
    }

    @media (max-width: 768px) {
        .financing-rate-modal-content {
            border-radius: 18px;
            padding: 42px 32px 48px 32px;
            width: 100%;
            min-width: calc(100vw - 24px);
        }
    }
</style>
