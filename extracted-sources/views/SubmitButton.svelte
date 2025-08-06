<script>
    import { createEventDispatcher } from "svelte";

    export let isDisabled = true;
    export let title = "Continue";

    const dispatchEvent = createEventDispatcher();

    function didClick() {
        dispatchEvent("click");
    }
</script>

<button
    class="button-rounded button-rounded-blue button-rounded-12 type-18"
    on:click={didClick}
    disabled={isDisabled}>
    {title}
</button>

<style>
    button {
        display: flex;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        border-radius: 12px !important;
        width: 100%;
        height: 57px;
    }

    button:disabled {
        pointer-events: none;
    }
</style>
