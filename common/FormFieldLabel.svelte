<script>
    export let variant = "default";
</script>

<div class={`common-form-field-label common-form-field-label-${variant}`}>
    <h2 class="type-24 m-type-18">
        <slot name="label" />
    </h2>
    <p class="color-text-60 type-15 m-type-14"><slot name="subtitle" /></p>
</div>

<style>
    .common-form-field-label {
        display: flex;
        flex-direction: column;
        gap: 6px;
        text-align: left;
    }
</style>
