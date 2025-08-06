import { writable } from "svelte/store";
import { BASELINE_CONFIGURATION } from "../common/constants";
import { completeConfiguration } from "../common/options";

function createStore() {
    const { set, update, subscribe } = writable({});

    return {
        subscribe,

        set(state) {
            set({ ...state });
        },

        reset() {
            set({});
        },

        select(key, value) {
            gtag("event", `configurator_option_${key}_${value}`);

            update((state) =>
                completeConfiguration({
                    ...BASELINE_CONFIGURATION,
                    ...state,
                    [key]: value
                })
            );
        }
    };
}

const store = createStore();

export default store;
