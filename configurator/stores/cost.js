import config from "../../../../../.backyard/config.js";
import { completeConfiguration, variantAtKeyPath } from "../common/options.js";
import configuration from "./configuration.js";
import { derived } from "svelte/store";

function costAtKey(costKey, variantKey, optionKey, configuration) {
    let total = 0;

    const variant = variantAtKeyPath(optionKey, variantKey);

    if (!variant) {
        return total;
    }

    if (Number.isFinite(variant[costKey])) {
        total += variant[costKey];
    } else if (variant[costKey]) {
        const cost = variant[costKey](completeConfiguration(configuration));

        if (cost) {
            total += cost;
        }
    }

    return total;
}

function baseCostForVariantWithKey(variantKey, optionKey, configuration) {
    return costAtKey("cost", variantKey, optionKey, configuration);
}

function installationCostForVariantWithKey(
    variantKey,
    optionKey,
    configuration
) {
    return costAtKey("installationCost", variantKey, optionKey, configuration);
}

export function costForVariantWithKey(variantKey, optionKey, configuration) {
    return (
        baseCostForVariantWithKey(variantKey, optionKey, configuration) +
        installationCostForVariantWithKey(variantKey, optionKey, configuration)
    );
}

export function costForConfiguration(currentConfiguration) {
    const configuration = completeConfiguration(currentConfiguration);

    const base = Object.entries(configuration).reduce(
        (result, [optionKey, variantKey]) =>
            result +
            baseCostForVariantWithKey(
                variantKey,
                optionKey,
                configuration,
                true
            ),
        0
    );

    const baseInstallationCost = config.installationCost[configuration.layout];
    const baseDeliveryCost = config.deliveryCost[configuration.layout];

    const installation =
        baseInstallationCost +
        baseDeliveryCost +
        Object.entries(configuration).reduce(
            (result, [optionKey, variantKey]) =>
                result +
                installationCostForVariantWithKey(
                    variantKey,
                    optionKey,
                    configuration,
                    true
                ),
            0
        );

    const total = base + installation;

    return { total, installation, base };
}

const store = derived([configuration], ([$configuration]) =>
    costForConfiguration($configuration)
);

export default store;
