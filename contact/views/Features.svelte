<script>
	import iconClock from "../../../images/icons/clock.svg";
	import iconPhone from "../../../images/icons/phone-circled.svg";

	export let variant = "default";
	export let leftIcon = iconClock;
	export let leftText = "15 minutes";
	export let rightIcon = iconPhone;
	export let rightText = "Phone call";
</script>

<div
	class={`contact-schedule-feature-group contact-schedule-feature-group-${variant}`}>
	<div class="type-18 m-type-15 contact-schedule-feature">
		{@html leftIcon}
		{leftText}
	</div>
	<div class="type-18 m-type-15 contact-schedule-feature">
		{@html rightIcon}
		{rightText}
	</div>
</div>

<style>
	.contact-schedule-feature-group {
		display: flex;
		gap: 32px;
		border-top: var(--color-black-10) 1px solid;
		border-bottom: var(--color-black-10) 1px solid;
		padding-top: 20px;
		padding-bottom: 20px;
	}

	@media (max-width: 768px) {
		.contact-schedule-feature-group {
			gap: 16px;
		}
	}

	.contact-schedule-feature-group-half-split {
		gap: 0;
	}

	.contact-schedule-feature {
		display: flex;
		align-items: center;
		gap: 8px;
		overflow: hidden;
		white-space: nowrap;
	}

	.contact-schedule-feature-group-half-split .contact-schedule-feature {
		width: 50%;
	}

	.contact-schedule-feature:last-child {
		flex-grow: unset;
		max-width: unset;
	}
</style>
