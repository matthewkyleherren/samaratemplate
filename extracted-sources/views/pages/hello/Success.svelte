<script>
	import contact, { HELLO_STEPS } from "../../../stores/contact.js";
	import slots from "../../../stores/slots.js";
	import Footer from "../../Footer.svelte";
	import Header from "../../Header.svelte";

	slots("discovery").refresh($contact.data.zip, $contact.data.slug);

	function didClickContinueButton() {
		contact.openHelloStep(HELLO_STEPS.schedule);

		gtag("event", "hello_continue_button");
	}
</script>

<div class="success hello-success">
	<Header>
		<span slot="title">You're in our service area.</span>
		<span slot="subtitle">
			We'll review your details to confirm we can install Backyard on your
			property.
		</span>
	</Header>
	<div class="spacer-50" />
	<hr class="divider" />
	<div class="spacer-50" />
	<p class="type-15 color-text-60">Next step:</p>
	<div class="spacer-8"></div>
	<Header>
		<span slot="title">Schedule a follow-up call</span>
		<span slot="subtitle">
			To get more information, schedule a quick
			<nobr class="nobr">15-minute call</nobr> with a&nbsp;specialist.
		</span>
	</Header>
	<div class="hello-success-footer">
		<Footer
			submitTitle="Continue"
			canSubmit={true}
			on:submit={didClickContinueButton} />
	</div>
</div>

<style>
	.hello-success-footer {
		width: 100%;
	}
</style>
