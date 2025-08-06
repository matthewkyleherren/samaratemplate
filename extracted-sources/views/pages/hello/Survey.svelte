<script>
	import contact, {
		isValidHelloSurvey,
		HELLO_STEPS
	} from "../../../stores/contact.js";
	import Header from "../../Header.svelte";
	import FormFieldLabel from "../../../../common/FormFieldLabel.svelte";
	import FormButtonSelect from "../../../../common/FormButtonSelect.svelte";
	import FormFieldInput from "../../../../common/FormFieldInput.svelte";
	import Footer from "../../Footer.svelte";

	let isLoading = false;

	gtag("event", "hello_review_scheduled");

	$: didSubmitForm = async () => {
		if (isLoading) {
			return;
		}

		isLoading = true;

		try {
			const { data } = $contact;

			if (data.slug === undefined) {
				throw new Error("no slug");
			}

			const survey = Object.entries(data)
				.filter(([key]) => key.startsWith("survey"))
				.reduce(
					(result, [key, value]) => ({
						...result,
						[key]: value
					}),
					{}
				);

			await API.updateHelloQuestionnaire(data.slug, survey);
		} catch (error) {
			console.error("failed to request quick estimate", error);
		}

		contact.openHelloStep(HELLO_STEPS.surveySuccess);

		isLoading = false;
	};

	function didFocusSurveySourceInput() {
		contact.updateData("survey-source", null);
	}
</script>

<div class="survey">
	<Header>
		<span slot="title">One last thing.</span>
		<span slot="subtitle">
			Answer a few questions to help us prepare for our&nbsp;meeting.
		</span>
	</Header>

	<div class="spacer-64 m-spacer-32" />

	<div class="modal-grid">
		<div class="modal-grid-column-6 contact-page-header">
			<FormFieldLabel>
				<span slot="label">What are the ways you'll use it?</span>
			</FormFieldLabel>
		</div>
		<div class="modal-grid-column-6">
			<div class="spacer-16 m-spacer-8" />
			<FormButtonSelect
				name="survey-use-case"
				store={contact}
				allowsMultiple={true}
				isTwoColumn={true}
				options={[
					"House family",
					"Guesthouse",
					"Rent it out",
					"Office or studio",
					"Home gym",
					"Flex space"
				]} />
		</div>
		<div class="modal-grid-column-6">
			<div class="spacer-12" />
			<FormFieldInput
				title=""
				name="survey-use-case-input"
				placeholder="I have another use in mind…"
				variant="hello"
				store={contact} />
		</div>
	</div>

	<div class="spacer-50 m-spacer-32" />
	<div class="modal-grid">
		<div class="modal-grid-column-6 contact-page-header">
			<FormFieldLabel>
				<span slot="label">What’s your timeline?</span>
			</FormFieldLabel>
		</div>
		<div class="modal-grid-column-6">
			<div class="spacer-16 m-spacer-8" />
			<FormButtonSelect
				name="survey-timeline"
				store={contact}
				allowsMultiple={false}
				isFullWidth={true}
				options={[
					"ASAP",
					"6-12 months",
					"1-2 years",
					"Just exploring"
				]} />
		</div>
	</div>

	<div class="spacer-50 m-spacer-32" />
	<div class="modal-grid">
		<div class="modal-grid-column-6 contact-page-header">
			<FormFieldLabel>
				<span slot="label">Where are you in your ADU journey?</span>
			</FormFieldLabel>
		</div>
		<div class="modal-grid-column-6">
			<div class="spacer-16 m-spacer-8" />
			<FormButtonSelect
				name="survey-journey"
				store={contact}
				allowsMultiple={false}
				isFullWidth={true}
				options={[
					"Just starting",
					"Researching options",
					"Comparing providers",
					"Ready to move forward"
				]} />
		</div>
	</div>

	<div class="spacer-50 m-spacer-32" />
	<div class="modal-grid">
		<div class="modal-grid-column-6 contact-page-header">
			<FormFieldLabel>
				<span slot="label">How did you first discover Samara?</span>
			</FormFieldLabel>
		</div>
		<div class="modal-grid-column-6">
			<div class="spacer-16 m-spacer-8" />
			<FormButtonSelect
				name="survey-source"
				store={contact}
				isTwoColumn={true}
				options={[
					"Online search",
					"Social media",
					"News coverage",
					"Billboard or ad",
					"Event",
					"Word of mouth"
				]} />
		</div>
		<div class="modal-grid-column-6">
			<div class="spacer-12" />
			<FormFieldInput
				title=""
				name="survey-source-input"
				placeholder="I learned about you another way…"
				variant="hello"
				store={contact}
				on:focus={didFocusSurveySourceInput} />
		</div>
	</div>

	<Footer
		submitTitle="Continue"
		on:submit={didSubmitForm}
		canSubmit={isValidHelloSurvey($contact)}
		{isLoading} />
</div>
