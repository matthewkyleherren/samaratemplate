<script>
	import contact, { CONTACT_PAGES } from "./stores/contact.js";
	import Modal from "../common/Modal.svelte";
	import Home from "./views/pages/Home.svelte";
	import Message from "./views/pages/Message.svelte";
	import Schedule from "./views/pages/Schedule.svelte";
	import Expand from "./views/pages/Expand.svelte";
	import Hello from "./views/pages/Hello.svelte";
	import Showroom from "./views/pages/Showroom.svelte";

	function didDismissModal() {
		window.Contact.hide();
	}
</script>

<Modal on:dismiss={didDismissModal}>
	<div class="contact-content" class:loading={$contact.isLoadinig}>
		{#if $contact.page === CONTACT_PAGES.home}
			<Home />
		{:else if $contact.page === CONTACT_PAGES.message}
			<Message />
		{:else if $contact.page === CONTACT_PAGES.schedule}
			<Schedule />
		{:else if $contact.page === CONTACT_PAGES.expand}
			<Expand />
		{:else if $contact.page === CONTACT_PAGES.hello}
			<Hello />
		{:else if $contact.page === CONTACT_PAGES.showroom}
			<Showroom />
		{/if}
	</div>
</Modal>

<style>
	.contact-content {
		box-sizing: border-box;
		box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.08);
		border-radius: 24px;
		background: #ffffff;
		padding: 60px;
		width: 540px;
	}

	@media (max-width: 768px) {
		.contact-content {
			border-radius: 18px;
			padding: 32px;
			width: 100%;
		}
	}
</style>
