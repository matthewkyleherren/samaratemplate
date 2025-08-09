import persisted from "../../common/persisted";
import stateNameFromZip from "../../common/stateNameFromZip";
import synchronized from "../../common/synchronized";
import {
    writable
} from "svelte/store";

export const EMAIL_PATTERN =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const ZIP_PATTERN = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
export const PHONE_PATTERN =
    /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/;

export const CONTACT_VARIANTS = {
    default: 40,
    classic: 41,
    confirmation: 42,
    schedule: 43,
    wildfires: 45
};

export const CONTACT_PAGES = {
    home: "home",
    message: "message",
    schedule: "schedule",
    expand: "expand",
    hello: "hello",
    showroom: "showroom"
};

export const MESSAGE_STEPS = {
    compose: 10,
    success: 11
};

export const SCHEDULE_STEPS = {
    intro: 20,
    picker: 21,
    success: 22,
    notifySuccess: 23
};

export const HELLO_STEPS = {
    compose: 10,
    success: 11,
    schedule: 12,
    survey: 13,
    notifySuccess: 14,
    surveySuccess: 15
};

export const EXPAND_STEPS = {
    entry: 50,
    success: 51
};

export const SHOWROOM_STEPS = {
    compose: 10,
    success: 11
};

export function isValidMessage({
    data
}) {
    const {
        firstName,
        lastName,
        email,
        message
    } = data;

    const isFirstNameValid = !!firstName;
    const isLastNameValid = !!lastName;
    const isEmailValid = !!email && EMAIL_PATTERN.test(email);
    const isMessageValid = !!message && message.length > 0;

    return (
        isFirstNameValid && isLastNameValid && isEmailValid && isMessageValid
    );
}

export function isValidSchedule({
    data
}) {
    const {
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        zip
    } = data;

    const isFirstNameValid = !!firstName;
    const isLastNameValid = !!lastName;
    const isEmailValid = !!email && EMAIL_PATTERN.test(email);
    const isPhoneValid = !!phone && PHONE_PATTERN.test(phone);
    const isAddressValid = !!address;
    const isCityValid = !!city;
    const isZipValid = !!zip && ZIP_PATTERN.test(zip);

    return (
        isFirstNameValid &&
        isLastNameValid &&
        isEmailValid &&
        isPhoneValid &&
        isAddressValid &&
        isCityValid &&
        isZipValid
    );
}

export function isValidHello({
    data
}) {
    const {
        firstName,
        lastName,
        email,
        address,
        city,
        zip,
        phone
    } = data;

    const isFirstNameValid = !!firstName;
    const isLastNameValid = !!lastName;
    const isAddressValid = !!address;
    const isCityValid = !!city;
    const isZipValid = !!zip && ZIP_PATTERN.test(zip);
    const isPhoneValid = !!phone && PHONE_PATTERN.test(phone);
    const isEmailValid = !!email && EMAIL_PATTERN.test(email);

    return (
        isFirstNameValid &&
        isLastNameValid &&
        isAddressValid &&
        isCityValid &&
        isZipValid &&
        isPhoneValid &&
        isEmailValid
    );
}

export function isValidMultiunit({
    data
}) {
    const isFirstNameValid = !!data.firstName;
    const isLastNameValid = !!data.lastName;
    const isEmailValid = !!data.email && EMAIL_PATTERN.test(data.email);

    return isFirstNameValid && isLastNameValid && isEmailValid;
}

export function isValidExpand({
    data
}) {
    const isEmailValid = !!data.email && EMAIL_PATTERN.test(data.email);
    const isZipValid = !!data.zip && ZIP_PATTERN.test(data.zip);

    return isEmailValid && isZipValid;
}

export function isValidShowroomTour({
    data
}) {
    const isFirstNameValid = !!data.firstName;
    const isLastNameValid = !!data.lastName;
    const isEmailValid = !!data.email && EMAIL_PATTERN.test(data.email);
    const isPhoneValid = !!data.phone && PHONE_PATTERN.test(data.phone);
    const isAddressValid = !!data.address;
    const isCityValid = !!data.city;
    const isZipValid = !!data.zip && ZIP_PATTERN.test(data.zip);

    return (
        isFirstNameValid &&
        isLastNameValid &&
        isEmailValid &&
        isPhoneValid &&
        isAddressValid &&
        isCityValid &&
        isZipValid
    );
}

export function isValidEvent({
    data
}) {
    const isFirstNameValid = !!data.firstName;
    const isLastNameValid = !!data.lastName;
    const isEmailValid = !!data.email && EMAIL_PATTERN.test(data.email);
    const isPhoneValid = !!data.phone && PHONE_PATTERN.test(data.phone);

    return isFirstNameValid && isLastNameValid && isEmailValid && isPhoneValid;
}

export function isValidReservation({
    data
}) {
    const isFirstNameValid = !!data.firstName;
    const isLastNameValid = !!data.lastName;
    const isEmailValid = !!data.email && EMAIL_PATTERN.test(data.email);
    const isPhoneValid = !!data.phone && PHONE_PATTERN.test(data.phone);
    const isAddressValid = !!data.address;
    const isCityValid = !!data.city;
    const isZipValid = !!data.zip && ZIP_PATTERN.test(data.zip);

    return (
        isFirstNameValid &&
        isLastNameValid &&
        isEmailValid &&
        isPhoneValid &&
        isAddressValid &&
        isCityValid &&
        isZipValid
    );
}

export function isValidShowroomRequest({
    data
}) {
    const isFirstNameValid = !!data.firstName;
    const isLastNameValid = !!data.lastName;
    const isEmailValid = !!data.email && EMAIL_PATTERN.test(data.email);
    const isPhoneValid = !!data.phone && PHONE_PATTERN.test(data.phone);
    const isAddressValid = !!data.address;
    const isCityValid = !!data.city;
    const isZipValid = !!data.zip && ZIP_PATTERN.test(data.zip);

    return (
        isFirstNameValid &&
        isLastNameValid &&
        isEmailValid &&
        isPhoneValid &&
        isAddressValid &&
        isCityValid &&
        isZipValid
    );
}

export function isValidHelloSurvey({
    data
}) {
    return true;
}

function notifyModal() {
    window.dispatchEvent(new Event("modal:did-change-content"));
}

const INITAL_STATE = {
    page: CONTACT_PAGES.home,
    variant: CONTACT_VARIANTS.default,
    messageStep: MESSAGE_STEPS.compose,
    scheduleStep: SCHEDULE_STEPS.intro,
    helloStep: HELLO_STEPS.compose,
    expandStep: EXPAND_STEPS.entry,
    showroomStep: SHOWROOM_STEPS.compose,
    isLoading: false,
    data: {}
};

function createStore() {
    const params = new URLSearchParams(location.search);

    Object.entries({
        utm_campaign: "utmCampaign",
        utm_source: "utmSource",
        utm_term: "utmTerm",
        gclid: "gclid"
    }).forEach(([a, b]) => {
        if (params.has(a)) {
            INITAL_STATE.data[b] = params.get(a);
        }
    });

    const {
        update,
        subscribe,
        set
    } = writable(INITAL_STATE);

    return {
        subscribe,
        update,
        set,

        variant(variant, data = {}) {
            update((state) => ({
                ...state,
                variant,
                data: {
                    ...state.data,
                    ...data
                }
            }));
        },

        openPage(page) {
            update((state) => ({
                ...state,
                page,
                isLoading: false
            }));
            notifyModal();
            gtag("event", `contact_page_${page}`);
        },

        openStep(step) {
            update((state) => ({
                ...state,
                [`${state.page}Step`]: step,
                [`${state.page}StepChangedAt`]: Date.now(),
                isLoading: false
            }));

            notifyModal();
        },

        openMessageStep(step) {
            this.openStep(step);
        },

        openScheduleStep(step) {
            this.openStep(step);
        },

        openHelloStep(step) {
            this.openStep(step);
        },

        openExpandStep(step) {
            this.openStep(step);
        },

        openShowroomStep(step) {
            this.openStep(step);
        },

        loading() {
            update((state) => ({
                ...state,
                isLoading: true
            }));
        },

        resetData() {
            update((state) => ({
                ...state,
                data: {}
            }));
        }
    };
}

const store = persisted(
    "contact:v5",
    synchronized("contact", createStore(), filter),
    filter
);

function filter(state) {
    return {
        ...state,
        messageStep: INITAL_STATE.messageStep,
        scheduleStep: INITAL_STATE.scheduleStep,
        helloStep: INITAL_STATE.helloStep,
        expandStep: INITAL_STATE.expandStep,
        showroomStep: INITAL_STATE.showroomStep,
        data: {
            ...state.data,
            slot: undefined,
            message: undefined
        }
    };
}

store.updateData = function updateData(key, value) {
    store.update((state) => {
        const data = {
            ...state.data,
            [key]: value
        };

        if (
            key === "address" ||
            key === "zip" ||
            key === "street" ||
            key === "city"
        ) {
            let {
                street,
                city,
                zip
            } = data;

            if (street && city && zip) {
                const stateName = stateNameFromZip(zip.toString());

                street = street
                    .replace(new RegExp(stateName, "ig"), "")
                    .replace(new RegExp(city, "ig"), "")
                    .replace(new RegExp(zip, "ig"), "")
                    .replace(/ {2,}/g, " ")
                    .replace(/ ,/g, ",");

                if (stateName) {
                    data.address = `${street}, ${city}, ${stateName} ${zip}`;
                } else {
                    data.address = `${street}, ${city}, ${zip}`;
                }
            }
        }

        return {
            ...state,
            data
        };
    });
};

export default store;