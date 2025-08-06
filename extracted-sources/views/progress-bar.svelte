<script>
	import tour from "../stores/tour";

	export let value = 0.0;

	$: isHidden = value === 1.0 || $tour.isModelSelectorVisible === true;
</script>

<div
	class="tour-progress-bar"
	class:tour-progress-bar-without-animation={value === 0.0}
	class:tour-progress-bar-hidden={isHidden === true}>
	<div style={`width: ${(value * 100).toFixed(1)}%`}></div>
</div>

<style>
	.tour-progress-bar {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translateX(-50%);
		border-radius: 2px;
		background: rgba(255, 255, 255, 0.1);
		width: 200px;
		height: 4px;
		overflow: hidden;
		pointer-events: none;
	}

	.tour-progress-bar div {
		transition: width linear 0.4s;
		background: #ffffff;
		height: 4px;
	}

	.tour-progress-bar-without-animation div,
	.tour-progress-bar-hidden div {
		transition: none;
	}

	.tour-progress-bar-hidden {
		opacity: 0;
		transition: opacity 0.2s ease 0.2s;
	}
</style>
