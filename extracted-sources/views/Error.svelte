<script>
	export let isSingleLine = false;
</script>

<div class="error-message color-text-60 type-center">
	<div class="spacer-16"></div>
	{#if isSingleLine}
		<div class="type-15 m-type-15">Something went wrong. <slot /></div>
	{:else}
		<div class="type-15 m-type-15">Something went wrong.</div>
		<div class="type-15 m-type-15">
			<slot />
		</div>
	{/if}
</div>
