<script>
	import contact, {
		CONTACT_PAGES,
		SCHEDULE_STEPS,
		MESSAGE_STEPS
	} from "../stores/contact.js";

	import Option from "./Option.svelte";

	import iconCalendar from "../../../images/icons/calendar-blue.svg";
	import iconMail from "../../../images/icons/mail-blue.svg";
	import iconPhone from "../../../images/icons/phone-blue.svg";
	import iconPin from "../../../images/icons/pin-circle-blue.svg";

	function didClickSendMessageButton(e) {
		e.preventDefault();
		contact.openPage(CONTACT_PAGES.message);
		contact.openMessageStep(MESSAGE_STEPS.compose);
	}

	function didClickSpeakWithExpertButton(e) {
		e.preventDefault();
		contact.openPage(CONTACT_PAGES.schedule);
		contact.openScheduleStep(SCHEDULE_STEPS.intro);
	}

	function didClickCallUsButton(e) {
		e.preventDefault();
		location.href = "tel:650-420-2607";
	}

	function didClickVisitShowroomButton(e) {
		e.preventDefault();

		const isShowroomPageAlreadyOpen =
			document.location.pathname.startsWith("/showrooms");

		if (isShowroomPageAlreadyOpen) {
			openRoute("/showrooms");
			window.dispatchEvent(new Event("modal:dismiss"));
			return;
		}

		const isHello = document.body.classList.contains("hello");

		if (isHello) {
			location.href = "https://logmin.by.wrk.ltd/showrooms";
			return;
		}

		openRoute("/showrooms");
	}
</script>

<div class="contact-options modal-grid-column-6">
	<Option on:click={didClickVisitShowroomButton}>
		<div class="contact-option-icon-container" slot="icon">
			{@html iconPin}
		</div>
		<div slot="title">Visit a showroom</div>
		<div slot="subtitle">
			Tour a Backyard unit, discover configuration options, and get
			guidance from our team.
		</div>
	</Option>
	<Option on:click={didClickSpeakWithExpertButton}>
		<div class="contact-option-icon-container" slot="icon">
			{@html iconCalendar}
		</div>
		<div slot="title">Schedule a phone call</div>
		<div slot="subtitle">
			Book a 15 minute phone call to learn how Backyard works on your
			property.
		</div>
	</Option>
	<Option on:click={didClickSendMessageButton}>
		<div class="contact-option-icon-container" slot="icon">
			{@html iconMail}
		</div>
		<div slot="title">Send us a message</div>
		<div slot="subtitle">
			Prefer email? A Samara specialist will get back to you within one
			business day.
		</div>
	</Option>
	<Option on:click={didClickCallUsButton}>
		<div class="contact-option-icon-container" slot="icon">
			{@html iconPhone}
		</div>
		<div slot="title">
			<a href="tel:650-420-2607">Give us a call</a>
		</div>
		<div slot="subtitle">
			Call us at <a href="tel:650-420-2607">(650) 420-2607</a>, available
			<nobr>9 a.m. – 5 p.m.</nobr> PT, Monday through Friday.
		</div>
	</Option>
</div>

<style>
	.contact-options {
		display: inline-flex;
		flex-direction: column;
		gap: 16px;
	}

	.contact-option-icon-container {
		position: relative;
		width: 20px;
		height: 100%;
	}

	@media (max-width: 768px) {
		.contact-option-icon-container {
			width: 14px;
		}
	}

	:global(.contact-option-icon-container svg) {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
	}
</style>
