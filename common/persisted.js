import {
    get
} from "svelte/store";

const IS_ENABLED =
    true &&
    (() => {
        try {
            const key = "__storage_test";
            window.localStorage.setItem(key, null);
            window.localStorage.removeItem(key);
            return true;
        } catch (_) {
            return false;
        }
    })();

export const PREFIX = "v7:";
const DEBOUNCE_INTERVAL = 0;
const MAXIMUM_PERSISTENCE_INTERVAL = 0;

let shouldSkipNext = false;

function persisted(key, store, filter = (s) => s) {
    if (!IS_ENABLED) {
        return store;
    }

    let timer;
    let lastPersistedAt = Date.now();

    function persist() {
        if (shouldSkipNext) {
            return;
        }

        const json = JSON.stringify(get(store));

        if (!json) {
            return;
        }

        localStorage.setItem(PREFIX + key, json);
        lastPersistedAt = Date.now();
    }

    window.addEventListener("visibilitychange", persist);
    window.addEventListener("pagehide", persist);

    store.subscribe(() => {
        clearTimeout(timer);

        if (Date.now() - lastPersistedAt > MAXIMUM_PERSISTENCE_INTERVAL) {
            persist();
        } else {
            timer = setTimeout(persist, DEBOUNCE_INTERVAL);
        }
    });

    const persisted = localStorage.getItem(PREFIX + key);

    if (persisted) {
        const json = persisted;
        let state;

        try {
            state = filter(JSON.parse(json));
        } catch (error) {
            console.warn("failed to load store", error.message);
        }

        if (state) {
            store.set(state);
        }
    }

    return store;
}

export function reset() {
    shouldSkipNext = true;
    document.location.reload();
}

export function restore(json) {
    shouldSkipNext = true;

    Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(PREFIX)) {
            localStorage.removeItem(key);
        }
    });

    Object.entries(json).forEach(([key, value]) => {
        localStorage.setItem(key, value);
    });

    document.location.reload();
}

export default persisted;