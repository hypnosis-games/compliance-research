const genders = ["male", "female", "non-binary", "agender"];
const modalities = ["cisgender", "transgender", "other"];

export default function PersonalInfoScreen(state, emit) {
  function onsubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    emit("updatePersonalInfo", {
      name: form.name.value,
      gender: form.gender.value,
      modality: form.modality.value,
      age: Number(form.age.value),
      consentGiven: form.consent.checked,
    });
    emit("navigateToModule", "pre-test-survey");
  }

  return html`
    <div class="pa4 sans-serif bg-white dark-gray">
      <h1 class="f3 mb3">Personal Information</h1>
      <form onsubmit=${onsubmit} class="measure">
        <label class="f6 b db mb2">Name</label>
        <input
          type="text"
          name="name"
          class="input-reset ba b--black-20 pa2 mb3 db w-100"
          value="${state.personalInfo.name}"
        />

        <label class="f6 b db mb2">Gender</label>
        <select
          name="gender"
          class="input-reset ba b--black-20 pa2 mb3 db w-100"
          value="${state.personalInfo.gender}"
        >
          ${genders.map(
            (gender) => html`<option value="${gender}">${gender}</option>`
          )}
        </select>

        <label class="f6 b db mb2">Modality</label>
        <select
          name="modality"
          class="input-reset ba b--black-20 pa2 mb3 db w-100"
          value="${state.personalInfo.modality}"
        >
          ${modalities.map(
            (modality) => html`<option value="${modality}">${modality}</option>`
          )}
        </select>

        <label class="f6 b db mb2">Age</label>
        <input
          type="number"
          name="age"
          min="18"
          class="input-reset ba b--black-20 pa2 mb3 db w-100"
          value="${state.personalInfo.age}"
        />

        <p class="lh-copy mt3 mb3">
          This research study is an erotic hypnosis experience designed to
          induce trance and obedience. For more information on the content see
          <a href="#content-details">here</a>.
        </p>

        <label class="f6 b db mb3">
          <input
            class="mr2"
            type="checkbox"
            name="consent"
            required
            ${state.personalInfo.consentGiven ? "checked" : ""}
          />
          I understand the description above and consent to proceed.
        </label>

        <button
          type="submit"
          class="f5 link dim br2 ph3 pv2 mb2 dib white bg-dark-blue"
        >
          Continue
        </button>
      </form>
    </div>
  `;
}
