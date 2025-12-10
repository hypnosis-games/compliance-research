
export default function InductionArcadeLayout(state, emit) {
  const arcade = state.inductionArcade || {};
  const { lastAffirmation = "", gameStarted, gameCompleted } = arcade;

  let isTouch = true;
  if (typeof window !== "undefined") {
    isTouch =
      "ontouchstart" in window ||
      (navigator && navigator.maxTouchPoints > 0);
  }
  const actionWord = isTouch ? "tap" : "click";

  function onBegin(e) {
    e.preventDefault();
    emit("inductionArcade/startGame");
  }

  function onNext(e) {
    e.preventDefault();
    emit("navigateNextModule");
  }

  const introText =
    `This task measures focus and attention. ` +
    `Watch the screen and ${actionWord} on it when it has turned white.`;

  const cardClasses = [
    "instruction-card",
    !gameStarted && !gameCompleted ? "instruction-card--intro" : "",
    gameCompleted ? "instruction-card--complete" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return html`
    <section class="layout induction-arcade-layout">
      ${!gameStarted || gameCompleted
        ? html`
            <div class="${cardClasses}">
              ${!gameStarted && !gameCompleted
                ? html`
                    <p class="instruction-main">
                      ${introText}
                    </p>
                    <button class="primary-btn" onclick=${onBegin}>
                      I am ready to begin
                    </button>
                  `
                : ""}

              ${gameCompleted
                ? html`
                    <p class="instruction-main">
                      Nice work. You have completed this task.
                    </p>
                    <button class="primary-btn" onclick=${onNext}>
                      Continue to next part
                    </button>
                  `
                : ""}
            </div>
          `
        : ""}

      ${lastAffirmation && gameStarted && !gameCompleted
        ? html`
            <div class="induction-arcade-affirmation-floating">
              <p class="induction-arcade-affirmation">
                ${lastAffirmation}
              </p>
            </div>
          `
        : ""}
    </section>
  `;
}
