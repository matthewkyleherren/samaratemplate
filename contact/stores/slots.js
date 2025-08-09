import {
    DateTime
} from "luxon";
import {
    writable
} from "svelte/store";

async function slotsForDate(key, date, zip, slug) {
    try {
        const res = await API.appointmentSlots(key, date, zip, slug);
        const slots = await res.json();

        return slots;
    } catch (error) {
        console.error("failed to load slots", error);
    }

    return [];
}

const stores = {};

export default function slots(key) {
    if (stores[key]) {
        return stores[key];
    }

    const {
        subscribe,
        update
    } = writable({
        dates: [],
        slots: [],
        isLoading: true
    });

    const store = {
        subscribe,
        update,
        refresh
    };

    stores[key] = store;

    async function refresh(zip, slug) {
        update((state) => ({
            ...state,
            isLoading: true
        }));

        const result = await slotsForDate(key, new Date(), zip, slug);

        if (Array.isArray(result) === false) {
            update((state) => ({
                ...state,
                isLoading: false
            }));
            return;
        }

        const slots = result
            .flat()
            .map(({
                    start: {
                        dateTime
                    }
                }) =>
                DateTime.fromISO(dateTime).setZone("America/Los_Angeles")
            );

        const dates = Array.from(
            new Set(slots.map((date) => date.toISODate()))
        ).map((date) => DateTime.fromISO(date));

        update((state) => ({
            ...state,
            dates,
            slots,
            isLoading: false
        }));
    }

    return store;
}