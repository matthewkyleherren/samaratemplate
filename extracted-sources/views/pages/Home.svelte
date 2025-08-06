<script>
	import Options from "../Options.svelte";
	import { getContext } from "svelte";
	import { key } from "../../../common/modal.js";

	getContext(key)?.setCanGoBack(false);

	function didClickFaqButton(e) {
		e.preventDefault();
		openRoute("/backyard/faq");
	}
</script>

<div class="modal-grid contact-content-home">
	<div class="modal-grid-column-6">
		<h1 class="type-36 m-type-24-light">We’re here to help.</h1>
		<div class="spacer-16 m-spacer-8" />
		<p class="type-18 m-type-15 color-text-60">
			Get in touch with our team of specialists. Or give us a call. We’re
			here for you every step of the way.
		</p>
		<div class="spacer-50 m-spacer-24" />
	</div>
	<Options />
	<div
		class="contact-faq-link modal-grid-column-6 type-15 m-type-12 color-text-60">
		<div class="spacer-50 m-spacer-24" />
		Read the answers to common questions<br />
		<a href="/backyard/faq" on:click={didClickFaqButton}>
			Frequently Asked Questions
		</a>
	</div>
</div>

<style>
	:global(.hello .contact-faq-link) {
		display: none;
	}

	:global(.contact-content:has(.contact-content-home)) {
		padding: 42px 36px !important;
	}

	@media (max-width: 768px) {
		:global(.contact-content:has(.contact-content-home)) {
			padding: 32px 16px !important;
		}
	}

	.contact-faq-link {
		line-height: 1.33 !important;
	}

	.modal-grid-column-6 {
		padding: 0 24px;
	}

	@media (max-width: 768px) {
		.modal-grid-column-6 {
			padding: 0 16px;
		}
	}
</style>
