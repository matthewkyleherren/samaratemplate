import Tour from "./Tour.svelte";
import tour from "./stores/tour.js";

function createTour() {
	const target = document.getElementById("tour");

	if (target === null) {
		return;
	}

	const instance = new Tour({
		target
	});

	return function destroyTour() {
		target.classList.add("dismiss");
		instance.$destroy();
		target.classList.remove("dismiss");
	};
}

let destroy;

window.Tour = {
	show(variant, model, source) {
		if (typeof Tooltip !== "undefined") {
			Tooltip.hide();
		}

		if (model === undefined) {
			const pathname = document.location.pathname;
			const pathMatch = pathname.match(/\/backyard\/([^\/]+)\/?$/);

			model = null;

			if (pathMatch !== null) {
				const modelPath = pathMatch[1];

				const modelMap = {
					"studio": "studio",
					"one-bedroom": "onebed",
					"two-bedroom": "twobed",
					"xl-8": "xl8",
					"xl-10": "xl10"
				};

				if (modelMap[modelPath] !== undefined) {
					model = modelMap[modelPath];
				}
			}
		}

		tour.update((state) => ({
			...state,
			variant,
			source,
			model,
			nextModel: model,
			isModelSelectorVisible: source === "home" || source === "nav"
		}));

		destroy = createTour();

		gtag("event", "tour_opened", { model, source });
	},

	hide() {
		if (destroy === undefined) {
			return;
		}

		destroy();
		destroy = undefined;
	}
};

if (document.location.hash !== "") {
	const pathname = document.location.pathname;
	const pathMatch = pathname.match(/\/backyard\/([^\/]+)\/?$/);

	let model = "onebed";

	if (pathMatch !== null) {
		const modelPath = pathMatch[1];

		const modelMap = {
			"studio": "studio",
			"one-bedroom": "onebed",
			"two-bedroom": "twobed",
			"xl-8": "xl8",
			"xl-10": "xl10"
		};

		if (modelMap[modelPath] !== undefined) {
			model = modelMap[modelPath];
		}
	}

	window.Tour.show("full-screen", model, "restore");
}
