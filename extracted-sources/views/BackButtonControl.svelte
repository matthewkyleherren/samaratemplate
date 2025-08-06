<script>
    import { key } from "../../common/modal";
    import { getContext } from "svelte";

    export let canGoBack = false;
    export let canClickBackground = false;

    getContext(key)?.setCanGoBack(canGoBack);
    getContext(key)?.setBackgroundClickable(canClickBackground || !canGoBack);
</script>
