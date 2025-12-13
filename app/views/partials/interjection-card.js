/*
/app/views/partials/interjection-card.js
Renders interjection cards that surface feedback or guidance during gameplay.
*/
export default function InterjectionCard({ interjection = {}, emit }) {
  const { steps = [], currentIndex = 0, type = "focus" } = interjection;
  if (!steps.length) return null;

  const currentStep = steps[currentIndex] || "";
  const totalSteps = steps.length;
  const headline =
    type === "relaxation"
      ? "Sink deeper"
      : type === "wakener"
      ? "Return to wakefulness"
      : "Sharpen focus";
  const actionLabel = currentIndex + 1 >= totalSteps ? "Continue" : "Next";

  function advance() {
    emit("inductionArcade/advanceInterjection");
  }

  return html`
    <div class="screen-shell intermission-survey-shell">
      <div class="screen-card screen-card--tall">
        <div class="flex items-center justify-between mb3">
          <div>
            <h1 class="screen-title mb1">${headline}</h1>
            <p class="f6 gray mt0">
              Step ${currentIndex + 1} of ${totalSteps}
            </p>
          </div>
        </div>

        <div class="affirmation-wrapper mb3">
          <p class="affirmation-big">${currentStep}</p>
        </div>

        <button class="primary-btn" onclick=${advance}>${actionLabel}</button>
      </div>
    </div>
  `;
}
