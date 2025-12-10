
export default function InductionArcadeLayout(state, emit) {
  const arcade = state.inductionArcade || {};
  const { lastAffirmation = "", phase = "intro1" } = arcade;

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

  function onConfirmHeadphones(e) {
    e.preventDefault();
    emit("inductionArcade/confirmHeadphones");
  }

  function onNext(e) {
    e.preventDefault();
    emit("navigateNextModule");
  }

  const introText =
    `This task measures focus and attention. ` +
    `Watch the screen and ${actionWord} on it when it has turned white.`;

  const isIntro = phase === "intro1" || phase === "intro2";
  const isGamePhase = phase === "game1" || phase === "game2";
  const isComplete = phase === "complete";
  const isHeadphones = phase === "headphones";

  const cardClasses = [
    "instruction-card",
    isIntro ? "instruction-card--intro" : "",
    isComplete ? "instruction-card--complete" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return html`
    <section class="layout induction-arcade-layout">
      ${!isGamePhase
        ? html`
            <div class="${cardClasses}">
              ${isIntro
                ? html`
                    <p class="instruction-main">
                      ${introText}
                    </p>
                    <button class="primary-btn" onclick=${onBegin}>
                      I am ready to begin
                    </button>
                  `
                : ""}

              ${isHeadphones
                ? html`
                    <p class="instruction-main">
                      During the following tasks we will be studying the
                      impact of binaurl beats on your focus and attention.
                      Please use headphones for the next task.
                    </p>
                    <button class="primary-btn" onclick=${onConfirmHeadphones}>
                      OK I am wearing headphones
                    </button>
                  `
                : ""}

              ${isComplete
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

      ${lastAffirmation && isGamePhase
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
