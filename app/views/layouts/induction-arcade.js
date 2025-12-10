export default function InductionArcadeLayout(state, emit) {
  const arcade = state.inductionArcade || {};
  const { lastAffirmation = "", phase = "headphones", nextGameId } = arcade;
  const gameOrder = arcade.gameOrder || [];

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

  function onBeginMinigame(e) {
    e.preventDefault();
    emit("inductionArcade/beginCurrentGame");
  }

  const introText =
    `This task has two focus rounds. ` +
    `First, watch the whole screen pulse brighter and ${actionWord} when it crosses white. ` +
    `Then, keep following a softly glowing dot as it fades in and out while it drifts around the screen.`;

  const tapInstructionText = `Watch the whole screen pulse brighter and ${
    actionWord
  } when the brightness crosses white. Keep a steady rhythm for ten good taps.`;

  const followInstructionText =
    `Stay with the softly glowing dot. ${
      actionWord === "tap" ? "Tap" : "Click"
    } as it brightens, even as it drifts around the screen.`;

  const isIntro = phase === "intro";
  const isGamePhase = phase === "game";
  const isComplete = phase === "complete";
  const isHeadphones = phase === "headphones";
  const isInstructionPhase = phase === "instructions";
  const isTapInstruction = isInstructionPhase && nextGameId === "tapWhenWhite";
  const nextRoundNumber =
    nextGameId && gameOrder.length
      ? gameOrder.indexOf(nextGameId) + 1
      : null;
  const roundLabel = nextRoundNumber ? `round ${nextRoundNumber}` : "this round";

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

                  ${isInstructionPhase
                ? html`
                    <p class="instruction-main">
                      ${isTapInstruction ? tapInstructionText : followInstructionText}
                    </p>
                    <button class="primary-btn" onclick=${onBeginMinigame}>
                      Start ${roundLabel}
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
