import {
    DateTime
} from "luxon";

export function simpleFormattedLuxonTime(date) {
    return date
        .toLocaleString(DateTime.TIME_SIMPLE)
        .toLowerCase()
        .replace("am", "a.m.")
        .replace("pm", "p.m.");
}

export function sleep(interval) {
    return new Promise((resolve) => {
        setTimeout(resolve, interval);
    });
}