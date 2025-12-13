/*
/app/views/layouts/personal-info-screen.js
Renders the personal information form for collecting participant details.
*/
const genders = ["male", "female", "non-binary", "agender"];
const modalities = ["cisgender", "transgender", "other"];

export default function PersonalInfoScreen(state, emit) {
  function onsubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    emit("personalInfo/update", {
      name: form.name.value,
      gender: form.gender.value,
      modality: form.modality.value,
      age: Number(form.age.value),
      consentGiven: form.consent.checked,
    });
    emit("nav/goToModule", "pre-test-survey");
  }

  return html`
    <div class="screen-shell">
      <div class="screen-card">
        <h1 class="screen-title">Personal Information</h1>
        <p class="screen-subtitle">
          Tell us a little about yourself before we begin the session.
        </p>

        <form onsubmit=${onsubmit} class="form-stack">
          <label class="field-label">Name</label>
          <input
            type="text"
            name="name"
            class="input-control"
            value="${state.personalInfo.name}"
            required
          />

          <label class="field-label">Gender</label>
          <select
            name="gender"
            class="input-control"
            value="${state.personalInfo.gender}"
          >
            ${genders.map(
              (gender) => html`<option value="${gender}">${gender}</option>`
            )}
          </select>

          <label class="field-label">Modality</label>
          <select
            name="modality"
            class="input-control"
            value="${state.personalInfo.modality}"
          >
            ${modalities.map(
              (modality) =>
                html`<option value="${modality}">${modality}</option>`
            )}
          </select>

          <label class="field-label">Age</label>
          <input
            type="number"
            name="age"
            min="18"
            class="input-control"
            value="${state.personalInfo.age}"
            required
          />

          <p class="body-text">
            This research study is an erotic hypnosis experience designed to
            induce trance and obedience. For more information on the content see
            <a href="#content-details">here</a>.
          </p>

          <label class="checkbox-row">
            <input
              class="checkbox-input"
              type="checkbox"
              name="consent"
              required
              ${state.personalInfo.consentGiven ? "checked" : ""}
            />
            <span>I understand the description above and consent to proceed.</span>
          </label>

          <button type="submit" class="primary-button">Continue</button>
        </form>
      </div>
    </div>
  `;
}
