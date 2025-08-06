import config from "../../../../../.backyard/config.js";

export const OPTIONAL_UPGRADES = [
    "interior-blinds",
    "kitchen-pantry",
    "kitchen-cooler",
    "bathroom-accessibility-kit"
];

export const BASELINE_CONFIGURATION = {
    ...config.options.reduce(
        (result, option) =>
            OPTIONAL_UPGRADES.includes(option.key)
                ? result
                : {
                        ...result,
                        [option.key]:
                            option.values.length > 1
                                ? option.values[0].key
                                : undefined
                    },
        {}
    ),
    layout: "onebed",
    solar: "solar-no"
};

export const CONFIGURATION_COLORS = {
    "base-bonewhite": { name: "Bone white base", hex: 0xfcfdfd },
    "base-parchment": { name: "Parchment base", hex: 0xe0ddd3 },
    "base-driftwood": { name: "Driftwood base", hex: 0xdcdfdf },
    "base-evergreen": { name: "Evergreen base", hex: 0x344739 },
    "base-dark-bronze": {
        name: "Dark bronze base",
        hex: 0x423e38
    },
    "roof-metallic-silver": {
        name: "Metallic Silver Roof",
        hex: 0xececec
    },
    "roof-dark-bronze": { name: "Dark Bronze Roof", hex: 0x2f2d2b },
    "floor-natural-oak": {
        name: "Natural oak",
        hex: 0xd3b17d
    },
    "floor-dark-oak": {
        name: "Dark oak",
        hex: 0x43362c
    },
    "kitchen-cabinet-bone-white": {
        name: "Bone white kitchen cabinet finish",
        hex: 0xfcfdfd
    },
    "kitchen-cabinet-natural-oak": {
        name: "Natural oak kitchen cabinet finish",
        hex: 0xd3b17d
    }
};
