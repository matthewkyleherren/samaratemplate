import c from "../../../../../.backyard/config.js";
import {
    BASELINE_CONFIGURATION,
    OPTIONAL_UPGRADES
} from "./constants.js";

export const config = c;

export function optionWithKey(key) {
    const result = config.options.find((option) => option.key === key);

    if (result === undefined && typeof Sentry !== "undefined") {
        Sentry.captureException(`can't find option with key "${key}"`);
    }

    return result;
}

export function variantWithKey(key, option) {
    if (!option) {
        return null;
    }

    return option.values.find((variant) => variant.key === key);
}

export function variantAtKeyPath(option, variant) {
    return variantWithKey(variant, optionWithKey(option));
}

export function configurableOptionsFor($configuration) {
    return config.options
        .filter((option) => {
            if (option.conditions) {
                return Object.entries(option.conditions).every(
                    ([key, expression]) => expression($configuration[key])
                );
            }

            return true;
        })
        .map((option) => {
            return {
                ...option,
                values: option.values.filter((variant) => {
                    if (variant.conditions) {
                        return Object.entries(variant.conditions).every(
                            ([key, expression]) =>
                            expression($configuration[key])
                        );
                    }

                    return true;
                })
            };
        });
}

export function completeConfiguration(configuration) {
    const completeConfiguration = {
        ...BASELINE_CONFIGURATION,
        ...configuration
    };

    return configurableOptionsFor(completeConfiguration).reduce(
        (result, option) => {
            if (
                OPTIONAL_UPGRADES.includes(option.key) &&
                completeConfiguration[option.key] === undefined
            ) {
                return result;
            }

            const isAllowedValue = option.values.some(
                (variant) => variant.key === configuration[option.key]
            );

            const value = isAllowedValue ?
                configuration[option.key] :
                BASELINE_CONFIGURATION[option.key];

            return {
                ...result,
                [option.key]: value,
                region: completeConfiguration.region
            };
        }, {}
    );
}

export function humanReadableConfiguration(configuration) {
    const configurableOptions = configurableOptionsFor({
        ...BASELINE_CONFIGURATION,
        ...configuration
    }).map(({
        key
    }) => key);

    return Object.fromEntries(
        Object.entries(configuration)
        .filter(
            ([key, value]) => value && configurableOptions.includes(key)
        )
        .map(([key, value]) => {
            const optionTitle =
                optionWithKey(key).display.title || "Add-on";
            const variantTitle = variantAtKeyPath(key, value).display.title;

            return [
                (typeof optionTitle === "function" ?
                    optionTitle(configuration) :
                    optionTitle
                ).replace("Choose your ", ""),
                (typeof variantTitle === "function" ?
                    variantTitle(configuration) :
                    variantTitle
                ).replace(/<[^>]*>/g, "")
            ];
        })
        .map(([key, value]) => [
            key.slice(0, 1).toUpperCase() + key.slice(1),
            value
        ])
    );
}