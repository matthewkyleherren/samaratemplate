<script>
	import Header from "./Header.svelte";

	export let title;
	export let body;
</script>

<div class="success">
	<Header>
		<span slot="title">{title}</span>
		<span slot="subtitle">{body}</span>
	</Header>
</div>
