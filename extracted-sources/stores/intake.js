import {
    get,
    writable
} from "svelte/store";

export const INTAKE_STEP = {
    basics: "basics",
    notifyResult: "notifyResult",
    propertyDetails: "propertyDetails",
    creditStatus: "creditStatus",
    result: "result",
    needInformation: "needInformation",
    schedule: "schedule",
    scheduleResult: "scheduleResult",
    planetHomeLending: "planetHomeLending"
};

export const LOAN_TYPE = {
    fixed: "fixed",
    interestOnly: "interestOnly"
};

const NORMAL_STATE = {
    step: INTAKE_STEP.basics,
    slug: null,
    data: {
        propertyKind: undefined,
        propertyValue: 1_500_000,
        mortgageBalance: 0,
        helocBalance: 0,
        employmentStatus: undefined,
        creditScore: undefined,
        cost: 0,
        loanType: LOAN_TYPE.fixed,
        termYears: 30,
        downPayment: 0.0,
        layout: undefined
    }
};

const TEST_STATE = {
    step: INTAKE_STEP.result,
    slug: null,
    data: {
        ...NORMAL_STATE.data,
        propertyKind: "Primary property",
        employmentStatus: "Employed",
        creditScore: "760+",
        layout: "onebed",
        cost: 295_500
    }
};

const INITAL_STATE = NORMAL_STATE;

function notifyModal() {
    window.dispatchEvent(new Event("modal:did-change-content"));
}

function createStore() {
    const state = writable(INITAL_STATE);
    const {
        subscribe,
        update,
        set
    } = state;

    return {
        subscribe,
        reset() {
            set(INITAL_STATE);
        },
        resetData() {
            update((state) => ({
                ...state,
                data: INITAL_STATE.data
            }));
        },
        update(key, value) {
            if (Object.keys(INITAL_STATE).includes(key) === false) {
                return;
            }

            update((state) => ({
                ...state,
                [key]: value
            }));

            if (key === "step") {
                notifyModal();
            }
        },
        updateData(key, value) {
            update((state) => ({
                ...state,
                data: {
                    ...state.data,
                    [key]: value
                }
            }));
        },
        changeStep(step) {
            const {
                slug
            } = get(state);

            gtag("event", `financing_modal_step_${step}`, {
                slug
            });

            this.update("step", step);
        }
    };
}

const store = createStore();

export default store;