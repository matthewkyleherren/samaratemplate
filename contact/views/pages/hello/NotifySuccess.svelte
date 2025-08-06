<script>
	import contact from "../../../stores/contact.js";
	import Header from "../../Header.svelte";
	import { getContext } from "svelte";
	import { key } from "../../../../common/modal.js";

	getContext(key)?.setBackgroundClickable(true);

	const { zip } = $contact.data;

	contact.resetData();
</script>

<div class="success">
	<Header>
		<span slot="title">You’re on the list.</span>
		<span slot="subtitle">
			We’ll let you know when Backyard is available in&nbsp;{zip ||
				"your area"}.
		</span>
	</Header>
</div>
