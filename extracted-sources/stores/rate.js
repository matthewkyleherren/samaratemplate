import intake, {
    LOAN_TYPE
} from "./intake";
import {
    derived
} from "svelte/store";

const CLTV_BUCKETS = [0.0, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85];
const CUSTOMER_INTEREST_BUCKETS = [700, 730, 760, Infinity];
const CUSTOMER_INTEREST_RATES = [
    [0.08, 0.08, 0.08, 0.08, 0.085, 0.0875, 0.095, 0.1],
    [0.0725, 0.0725, 0.0725, 0.0725, 0.07625, 0.07875, 0.085, 0.095],
    [0.065, 0.065, 0.065, 0.065, 0.06875, 0.07, 0.075, 0.085]
];
const SECOND_HOME_RATE_ADJUSTERS = [0.00125, 0.00125, 0.00375, 0.005, 0.005];
const INVESTOR_ADJUSTERS = [
    0.00375, 0.00375, 0.00625, 0.0075, 0.00875, 0.00875
];
const INTEREST_ONLY_ADJUSTERS = [
    0.00125, 0.00125, 0.0025, 0.0025, 0.0025, 0.005, 0.005, 0.005
];
const LOAN_BALANCE_250_ADJUSTERS = [
    0.0025, 0.0025, 0.0025, 0.0025, 0.0025, 0.0025, 0.0025, 0.0025
];
const NOT_EMPLOYED_ADJUSTERS = [
    0.00375, 0.00375, 0.00375, 0.00375, 0.00375, 0.00375
];

function bucketIndex(value, buckets) {
    return buckets.findIndex(
        (min, index) => value >= min && value < (buckets[index + 1] || 0.0)
    );
}

function creditScoreNumber(creditScore) {
    switch (creditScore) {
        case "760+":
            return 800;
        case "730–759":
            return 745;
        case "700–729":
            return 715;
        case "680-699":
            return 690;
        default:
            return 0;
    }
}

function RATE(nper, pmt, pv, fv, type, guess) {
    // Sets default values for missing parameters
    fv = typeof fv !== "undefined" ? fv : 0;
    type = typeof type !== "undefined" ? type : 0;
    guess = typeof guess !== "undefined" ? guess : 0.1;

    // Sets the limits for possible guesses to any
    // number between 0% and 100%
    var lowLimit = 0;
    var highLimit = 1;

    // Defines a tolerance of up to +/- 0.00005% of pmt, to accept
    // the solution as valid.
    var tolerance = Math.abs(0.00000005 * pmt);

    // Tries at most 40 times to find a solution within the tolerance.
    for (var i = 0; i < 40; i++) {
        // Resets the balance to the original pv.
        var balance = pv;

        // Calculates the balance at the end of the loan, based
        // on loan conditions.
        for (var j = 0; j < nper; j++) {
            if (type == 0) {
                // Interests applied before payment
                balance = balance * (1 + guess) + pmt;
            } else {
                // Payments applied before insterests
                balance = (balance + pmt) * (1 + guess);
            }
        }

        // Returns the guess if balance is within tolerance.  If not, adjusts
        // the limits and starts with a new guess.
        if (Math.abs(balance + fv) < tolerance) {
            return guess;
        } else if (balance + fv > 0) {
            // Sets a new highLimit knowing that
            // the current guess was too big.
            highLimit = guess;
        } else {
            // Sets a new lowLimit knowing that
            // the current guess was too small.
            lowLimit = guess;
        }

        // Calculates the new guess.
        guess = (highLimit + lowLimit) / 2;
    }

    // Returns null if no acceptable result was found after 40 tries.
    return null;
}

function PMT(rate, nper, pv, fv, type) {
    /*
     * rate   - interest rate per month
     * nper   - number of periods (months)
     * pv   - present value
     * fv   - future value
     * type - when the payments are due:
     *        0: end of the period, e.g. end of month (default)
     *        1: beginning of period
     */
    let pmt, pvif;

    fv || (fv = 0);
    type || (type = 0);

    if (rate === 0) return -(pv + fv) / nper;

    pvif = Math.pow(1 + rate, nper);
    pmt = (-rate * (pv * pvif + fv)) / (pvif - 1);

    if (type === 1) pmt /= 1 + rate;
    return pmt;
}

function baseRateWithDownPayment(downPayment, $intake) {
    const loanAmountToBorrow = $intake.data.cost * (1.0 - downPayment);

    if (loanAmountToBorrow < 150_000) {
        return {
            rejected: "loan amount is too low"
        };
    }

    if (loanAmountToBorrow > 550_000) {
        return {
            rejected: "loan amount is too high"
        };
    }

    const combinedLoan =
        $intake.data.mortgageBalance +
        $intake.data.helocBalance +
        loanAmountToBorrow;

    const cltvWithoutAdu = combinedLoan / $intake.data.propertyValue;

    if (loanAmountToBorrow === $intake.data.cost && cltvWithoutAdu > 0.9) {
        return {
            rejected: "loan amount to borrow is equal to adu cost and cltv without adu is greater than 0.9"
        };
    }

    if ($intake.data.helocBalance > 0 && cltvWithoutAdu > 0.9) {
        return {
            rejected: "heloc balance is positive and cltv without adu is greater than 0.9"
        };
    }

    if (cltvWithoutAdu > 1.15) {
        return {
            rejected: "cltv without adu is greater than 1.15"
        };
    }

    const combinedValue = $intake.data.propertyValue + $intake.data.cost;

    const cltv = combinedLoan / combinedValue;

    const cltvBucketIndex = bucketIndex(cltv, CLTV_BUCKETS);

    if (cltvBucketIndex < 0) {
        return {
            rejected: "out of cltv buckets"
        };
    }

    const customerInterestRateBucketIndex = bucketIndex(
        creditScoreNumber($intake.data.creditScore),
        CUSTOMER_INTEREST_BUCKETS
    );

    if (customerInterestRateBucketIndex < 0) {
        return {
            rejected: "out of customer interest rate buckets"
        };
    }

    const customerInterestRate =
        CUSTOMER_INTEREST_RATES[customerInterestRateBucketIndex][
            cltvBucketIndex
        ];

    let baseRate = customerInterestRate;

    if ($intake.data.propertyKind === "Secondary property") {
        const adjuster = SECOND_HOME_RATE_ADJUSTERS[cltvBucketIndex];

        if (adjuster === undefined) {
            return {
                rejected: "out of second home buckets"
            };
        }

        baseRate += adjuster;
    }

    if ($intake.data.propertyKind === "Investment property") {
        const adjuster = INVESTOR_ADJUSTERS[cltvBucketIndex];

        if (adjuster === undefined) {
            return {
                rejected: "out of insvetment buckets"
            };
        }

        baseRate += adjuster;
    }

    if ($intake.data.loanType === LOAN_TYPE.interestOnly) {
        const adjuster = INTEREST_ONLY_ADJUSTERS[cltvBucketIndex];

        if (adjuster === undefined) {
            return {
                rejected: "out of interest only buckets"
            };
        }

        baseRate += adjuster;
    }

    if (loanAmountToBorrow < 250_000) {
        const adjuster = LOAN_BALANCE_250_ADJUSTERS[cltvBucketIndex];

        if (adjuster === undefined) {
            return {
                rejected: "out of loan amount to borrow buckets"
            };
        }

        baseRate += adjuster;
    }

    if ($intake.data.employmentStatus !== "Employed") {
        const adjuster = NOT_EMPLOYED_ADJUSTERS[cltvBucketIndex];

        if (adjuster === undefined) {
            return {
                rejected: "out of employment buckets"
            };
        }

        baseRate += adjuster;
    }

    return {
        baseRate: Math.round(baseRate * 1000) / 1000,
        loanAmountToBorrow
    };
}

export function calculateFinancing($intake, termYears) {
    if ($intake.data.helocBalance > 50_000) {
        return {
            rejected: "heloc balance too high"
        };
    }

    let minimumDownPayment = 1.0;
    let maximumDownPayment = 0.0;

    for (let i = 0; i <= 100; i++) {
        const result = baseRateWithDownPayment(i / 100.0, $intake);

        if (result.rejected) {
            continue;
        }

        const p = i / 100.0;

        if (minimumDownPayment > p) {
            minimumDownPayment = p;
        }

        if (maximumDownPayment < p) {
            maximumDownPayment = p;
        }
    }

    if (minimumDownPayment === 1.0) {
        return {
            rejected: "minimum down payment is too high"
        };
    }

    const downPayment = Math.min(
        Math.max($intake.data.downPayment, minimumDownPayment),
        maximumDownPayment
    );

    const {
        baseRate,
        loanAmountToBorrow,
        rejected
    } = baseRateWithDownPayment(
        downPayment,
        $intake
    );

    if (rejected) {
        return rejected;
    }

    const monthlyPayment = PMT(
        baseRate / 12,
        termYears * 12,
        -loanAmountToBorrow,
        0,
        0
    );

    const closingCosts = 1_500;

    const apr =
        Math.round(
            RATE(
                termYears * 12,
                -monthlyPayment,
                loanAmountToBorrow - closingCosts
            ) *
            12 *
            1000
        ) / 1000;

    return {
        apr,
        min: Math.round(apr * 1000) / 1000,
        max: Math.round((apr + 0.005) * 1000) / 1000,
        interestOnlyMonthlyPayment: (loanAmountToBorrow * apr) / 12,
        monthlyPayment,
        minimumDownPayment,
        maximumDownPayment,
        loanAmountToBorrow
    };
}

let timer;

const store = derived([intake], ([$intake], set) => {
    clearTimeout(timer);

    timer = setTimeout(() => {
        set(calculateFinancing($intake, $intake.data.termYears));
    }, 1000 / 60);
});

export default store;