<script>
	export let variant = "default";
</script>

<div class={`loader ${variant}`}>
	<div></div>
	<div></div>
	<div></div>
</div>

<style>
	.loader.light div {
		background: #ffffff;
	}
</style>
