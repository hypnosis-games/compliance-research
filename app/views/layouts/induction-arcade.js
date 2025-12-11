// views/induction-arcade.js
import IntermissionSurvey from "../partials/intermission-survey.js";
export default function InductionArcadeLayout(state, emit) {
  const arcade = state.inductionArcade || {};
  const {
    phase = "headphones",
    lastAffirmation = "",
    nextGameId,
    gameOrder = [],
    survey = {},
  } = arcade;

  let isTouch = true;
  if (typeof window !== "undefined") {
    isTouch =
      "ontouchstart" in window ||
      (navigator && navigator.maxTouchPoints > 0);
  }
  const actionWord = isTouch ? "tap" : "click";

  // Phase helpers
  const isHeadphones = phase === "headphones";
  const isIntro = phase === "intro";
  const isInstructions = phase === "instructions";
  const isGamePhase = phase === "game";
  const isSurvey = phase === "survey";
  const isComplete = phase === "complete";

  // Button handlers
  function onIntroBegin(e) {
    e.preventDefault();
    emit("inductionArcade/startGame");
  }

  function onConfirmHeadphones(e) {
    e.preventDefault();
    emit("inductionArcade/confirmHeadphones");
  }

  function onBeginCurrentGame(e) {
    e.preventDefault();
    emit("inductionArcade/beginCurrentGame");
  }

  function onNext(e) {
    e.preventDefault();
    emit("navigateNextModule");
  }

  // Copy
  const introText =
    `This task measures focus and attention. ` +
    `Watch the screen and ${actionWord} when it reaches the target brightness.`;

  // Instructions for each minigame
  let instructionsText = "";
  let roundLabel = "";

  if (isInstructions && nextGameId) {
    const roundIndex = gameOrder.indexOf(nextGameId);
    const roundNumber = roundIndex >= 0 ? roundIndex + 1 : 1;
    roundLabel = `Start round ${roundNumber}`;

    if (nextGameId === "tapWhenWhite") {
      instructionsText =
        `Watch the screen and ${actionWord} when the whole display ` +
        `brightens to white. Stay focused on the changing light.`;
    } else if (nextGameId === "followTheFade") {
      instructionsText =
        `Stay with the softly glowing dot. ${actionWord} as it brightens, ` +
        `even as it drifts around the screen.`;
    } else {
      instructionsText =
        `Follow the on-screen prompts and ${actionWord} when you reach the target.`;
    }
  }

  const cardClasses = [
    "instruction-card",
    isIntro || isHeadphones || isInstructions ? "instruction-card--intro" : "",
    isComplete ? "instruction-card--complete" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return html`
    <section class="layout induction-arcade-layout">
      ${!isGamePhase && !isSurvey
        ? html`
            <div class="${cardClasses}">
              ${isHeadphones
                ? html`
                    <p class="instruction-main">
                      During the following tasks we will be studying the impact
                      of binaural beats on your focus and attention. Please use
                      headphones for this task.
                    </p>
                    <button
                      class="primary-btn"
                      onclick=${onConfirmHeadphones}
                    >
                      OK, I am wearing headphones
                    </button>
                  `
                : ""}

              ${isIntro
                ? html`
                    <p class="instruction-main">
                      ${introText}
                    </p>
                    <button class="primary-btn" onclick=${onIntroBegin}>
                      I am ready to begin
                    </button>
                  `
                : ""}

              ${isInstructions && instructionsText
                ? html`
                    <p class="instruction-main">
                      ${instructionsText}
                    </p>
                    <button
                      class="primary-btn"
                      onclick=${onBeginCurrentGame}
                    >
                      ${roundLabel || "Start"}
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

      ${isSurvey
        ? IntermissionSurvey({
            survey,
            emit,
          })
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
