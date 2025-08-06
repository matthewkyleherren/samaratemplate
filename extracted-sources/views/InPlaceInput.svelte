<script>
    import { createEventDispatcher } from "svelte";

    export let value = 0;
    export let minimumValue = 0;
    export let maximumValue = 0;
    export let isEditing = false;

    const dispatch = createEventDispatcher();

    $: numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ""), 0.0);
    $: isValid = numericValue >= minimumValue && numericValue <= maximumValue;

    let input;
    let shouldDisplayHint = false;

    function didClick() {
        isEditing = true;
        input.focus();
    }

    function didInput(e) {
        if (shouldDisplayHint) {
            shouldDisplayHint = isValid === false;
        }

        const previousValue = value;
        const previousRadix = previousValue.replace(/[^\,]/g, "").length;
        const isInvalidInput =
            e.target.value.replace(/[^0-9.]/g, "").length <
            e.target.value.replace(/\$|\,/g, "").length;

        let { selectionEnd } = e.target;

        value = formattedCurrency(e.target.value.replace(/[^0-9.]/g, ""));
        const radix = value.replace(/[^\,]/g, "").length;

        let caretOffset = 0;

        if (isInvalidInput) {
            caretOffset -= 1;
        }

        if (radix > previousRadix) {
            caretOffset += 1;
        } else if (radix < previousRadix) {
            caretOffset -= 1;
        }

        if (value === "$0") {
            selectionEnd = 1;
            caretOffset = 0;
        }

        if (selectionEnd === 0) {
            selectionEnd = 1;
            caretOffset = 0;
        }

        if (value.length < 3) {
            selectionEnd = value.length;
            caretOffset = 0;
        }

        setTimeout(() => {
            e.target.setSelectionRange(
                selectionEnd + caretOffset,
                selectionEnd + caretOffset
            );
        }, 0);
    }

    function didEndEditing(e) {
        if (isEditing === false) {
            return;
        }

        if (isValid === false) {
            e.preventDefault();
            shouldDisplayHint = true;
            input.focus();
            return;
        }

        isEditing = false;
        dispatch("change", { value, numericValue });
    }

    function didMouseDown(e) {
        if (e.target === input) {
            return;
        }

        didEndEditing(e);
    }

    function didClickHint() {
        value = formattedCurrency(minimumValue);
        shouldDisplayHint = false;
    }

    function didPressKey(e) {
        if (e.key === "Escape" || e.key === "Enter") {
            didEndEditing(e);
        }
    }

    function formattedCurrency(value) {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0
        }).format(value);
    }
</script>

<svelte:window on:mousedown={didMouseDown} on:keypress={didPressKey} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    class="in-place-input"
    class:in-place-input-editing={isEditing}
    on:click={didClick}>
    <input
        class="type-30-light m-type-21-light type-center"
        type="numeric"
        bind:value
        bind:this={input}
        on:input={didInput} />
    {#if isEditing === false}
        <div class="in-place-input-value type-30-light m-type-21-light">
            {value}
        </div>
        <span class="in-place-input-idle-icon">
            <svg
                width="15"
                height="15"
                viewBox="0 0 15 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M3.91528 12.5722V10.6361H1.20833C0.817132 10.6361 0.5 10.3189 0.5 9.92773C0.5 9.53653 0.817131 9.2194 1.20833 9.2194H3.91528V7.23607H5.33194V12.5722H3.91528ZM6.74861 10.6361V9.2194H13.7917C14.1829 9.2194 14.5 9.53653 14.5 9.92773C14.5 10.3189 14.1829 10.6361 13.7917 10.6361H6.74861ZM9.66806 5.74023V0.427734H11.0847V2.36385H13.7917C14.1829 2.36385 14.5 2.68098 14.5 3.07218C14.5 3.46338 14.1829 3.78051 13.7917 3.78051H11.0847V5.74023H9.66806ZM1.20833 3.78051C0.817132 3.78051 0.5 3.46338 0.5 3.07218C0.5 2.68098 0.817132 2.36385 1.20833 2.36385H8.25139V3.78051H1.20833Z"
                    fill="rgba(0, 0, 0, 0.2)" />
            </svg>
        </span>
    {:else}
        <span class="in-place-input-idle-icon">
            {#if isValid}
                <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M7.5 14.9414C6.47949 14.9414 5.51758 14.7461 4.61426 14.3555C3.71582 13.9648 2.92236 13.4253 2.23389 12.7368C1.54541 12.0483 1.00586 11.2549 0.615234 10.3564C0.224609 9.45312 0.0292969 8.49121 0.0292969 7.4707C0.0292969 6.4502 0.224609 5.49072 0.615234 4.59229C1.00586 3.68896 1.54297 2.89307 2.22656 2.20459C2.91504 1.51611 3.7085 0.976562 4.60693 0.585938C5.51025 0.195312 6.47217 0 7.49268 0C8.51318 0 9.4751 0.195312 10.3784 0.585938C11.2817 0.976562 12.0776 1.51611 12.7661 2.20459C13.4546 2.89307 13.9941 3.68896 14.3848 4.59229C14.7754 5.49072 14.9707 6.4502 14.9707 7.4707C14.9707 8.49121 14.7754 9.45312 14.3848 10.3564C13.9941 11.2549 13.4546 12.0483 12.7661 12.7368C12.0776 13.4253 11.2817 13.9648 10.3784 14.3555C9.47998 14.7461 8.52051 14.9414 7.5 14.9414ZM6.67969 11.0449C6.80664 11.0449 6.92139 11.0156 7.02393 10.957C7.12646 10.8984 7.2168 10.8105 7.29492 10.6934L10.7373 5.26611C10.7812 5.19287 10.8228 5.11475 10.8618 5.03174C10.9009 4.94873 10.9204 4.86572 10.9204 4.78271C10.9204 4.61182 10.8569 4.47754 10.73 4.37988C10.603 4.27734 10.4614 4.22607 10.3052 4.22607C10.0903 4.22607 9.91455 4.33838 9.77783 4.56299L6.65039 9.5874L5.16357 7.66846C5.0708 7.54639 4.98047 7.46338 4.89258 7.41943C4.80957 7.37549 4.71436 7.35352 4.60693 7.35352C4.44092 7.35352 4.30176 7.41455 4.18945 7.53662C4.07715 7.65381 4.021 7.79541 4.021 7.96143C4.021 8.04443 4.03564 8.12744 4.06494 8.21045C4.09912 8.28857 4.14307 8.36426 4.19678 8.4375L6.03516 10.6934C6.13281 10.8203 6.23291 10.9106 6.33545 10.9644C6.43799 11.0181 6.55273 11.0449 6.67969 11.0449Z"
                        fill="#0096F7" />
                </svg>
            {:else}
                <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M7.5 14.9414C6.47949 14.9414 5.51758 14.7461 4.61426 14.3555C3.71582 13.9648 2.92236 13.4253 2.23389 12.7368C1.54541 12.0483 1.00586 11.2549 0.615234 10.3564C0.224609 9.45312 0.0292969 8.49121 0.0292969 7.4707C0.0292969 6.4502 0.224609 5.49072 0.615234 4.59229C1.00586 3.68896 1.54297 2.89307 2.22656 2.20459C2.91504 1.51611 3.7085 0.976562 4.60693 0.585938C5.51025 0.195312 6.47217 0 7.49268 0C8.51318 0 9.4751 0.195312 10.3784 0.585938C11.2817 0.976562 12.0776 1.51611 12.7661 2.20459C13.4546 2.89307 13.9941 3.68896 14.3848 4.59229C14.7754 5.49072 14.9707 6.4502 14.9707 7.4707C14.9707 8.49121 14.7754 9.45312 14.3848 10.3564C13.9941 11.2549 13.4546 12.0483 12.7661 12.7368C12.0776 13.4253 11.2817 13.9648 10.3784 14.3555C9.47998 14.7461 8.52051 14.9414 7.5 14.9414ZM7.5 13.6963C8.36426 13.6963 9.17236 13.5352 9.92432 13.2129C10.6763 12.8906 11.3379 12.4463 11.9092 11.8799C12.4805 11.3086 12.9248 10.647 13.2422 9.89502C13.5645 9.14307 13.7256 8.33496 13.7256 7.4707C13.7256 6.60645 13.5645 5.79834 13.2422 5.04639C12.9199 4.29443 12.4731 3.63281 11.9019 3.06152C11.3354 2.49023 10.6738 2.0459 9.91699 1.72852C9.16504 1.40625 8.35693 1.24512 7.49268 1.24512C6.62842 1.24512 5.82031 1.40625 5.06836 1.72852C4.31641 2.0459 3.65723 2.49023 3.09082 3.06152C2.52441 3.63281 2.08008 4.29443 1.75781 5.04639C1.44043 5.79834 1.28174 6.60645 1.28174 7.4707C1.28174 8.33496 1.44043 9.14307 1.75781 9.89502C2.08008 10.647 2.52441 11.3086 3.09082 11.8799C3.66211 12.4463 4.32373 12.8906 5.07568 13.2129C5.82764 13.5352 6.63574 13.6963 7.5 13.6963ZM5.31006 10.8252C5.16357 10.8252 5.03662 10.7764 4.9292 10.6787C4.82666 10.5811 4.77539 10.4614 4.77539 10.3198C4.77539 10.188 4.81689 10.061 4.8999 9.93896L6.76758 7.36084L5.00977 4.94385C4.90723 4.80225 4.85596 4.66064 4.85596 4.51904C4.85596 4.37256 4.91211 4.24561 5.02441 4.13818C5.13672 4.03076 5.271 3.97705 5.42725 3.97705C5.54932 3.97705 5.65186 4.00146 5.73486 4.05029C5.81787 4.09912 5.90088 4.18213 5.98389 4.29932L7.54395 6.5625H7.58057L9.11133 4.30664C9.18945 4.18457 9.26758 4.09912 9.3457 4.05029C9.42871 4.00146 9.52881 3.97705 9.646 3.97705C9.80225 3.97705 9.93164 4.02832 10.0342 4.13086C10.1416 4.22852 10.1953 4.34814 10.1953 4.48975C10.1953 4.62158 10.1489 4.75098 10.0562 4.87793L8.20312 7.39746L10.0415 9.90967C10.1343 10.0269 10.1807 10.1538 10.1807 10.2905C10.1807 10.4468 10.1245 10.5762 10.0122 10.6787C9.90479 10.7764 9.76807 10.8252 9.60205 10.8252C9.48975 10.8252 9.39453 10.8008 9.31641 10.752C9.23828 10.7031 9.15283 10.6152 9.06006 10.4883L7.47803 8.23242H7.44873L5.8667 10.4883C5.77393 10.6152 5.68848 10.7031 5.61035 10.752C5.53223 10.8008 5.43213 10.8252 5.31006 10.8252Z"
                        fill="#FF4000" />
                </svg>
            {/if}
        </span>
    {/if}
    {#if shouldDisplayHint}
        <div class="in-place-input-hint type-15" on:click={didClickHint}>
            <div class="spacer-4"></div>
            Please enter between {formattedCurrency(minimumValue)} and {formattedCurrency(
                maximumValue
            )}
        </div>
    {/if}
</div>

<style>
    .in-place-input {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    }

    .in-place-input-editing {
        cursor: unset;
    }

    .in-place-input-value {
        padding: 4px 0 5px 0;
    }

    input {
        appearance: none;
        opacity: 0;
        margin: 0;
        border: none;
        border-radius: 3px;
        background: #ffffff;
        padding: 0;
        width: 0;
    }

    .in-place-input-idle-icon {
        position: relative;
        cursor: pointer;
    }

    .in-place-input-idle-icon svg {
        position: absolute;
        top: -7px;
        left: 10px;
    }

    .in-place-input-editing input {
        opacity: 1;
        box-sizing: border-box;
        outline: none;
        box-shadow: 0px 0.5px 2px 0px rgba(0, 0, 0, 0.2) inset;
        border: rgba(0, 0, 0, 0.2) 1px solid;
        padding: 3px 0 4px 0;
        width: 195px;
    }

    @media (max-width: 768px) {
        .in-place-input-editing input {
            width: 180px;
        }
    }

    .in-place-input-hint {
        cursor: pointer;
        width: 100%;
        color: var(--color-red);
    }
</style>
