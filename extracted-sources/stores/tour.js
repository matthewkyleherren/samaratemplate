import {
    writable
} from "svelte/store";

const store = writable({
    variant: "modal",
    source: null,
    model: "studio",
    nextModel: "studio",
    isModelSelectorVisible: false,
    isChangingModel: false,
    isZoomed: false
});

export default store;