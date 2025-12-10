import BreathCircle from "../components/breath-circle.js";

export default function BreathTrainingScreen(state, emit) {
  const { breathPhase, holding, cycleCount } = state.breathTraining;
  const started = breathPhase !== "idle" || cycleCount > 0;

  const guidanceText = !started
    ? "Click and hold to begin..."
    : breathPhase === "inhale"
    ? "Click and hold while breathing in..."
    : "Release while breathing out...";

  const praiseText = started
    ? breathPhase === "inhale" && holding
      ? "Good... hold..."
      : breathPhase === "exhale" && !holding
      ? "Very good... relax..."
      : ""
    : "";

  return html`
    <div class="pa4 sans-serif bg-white dark-gray tc">
      <h1 class="f3 mb3">Relaxation and Focus Training</h1>
      <p class="lh-copy mb4">${guidanceText}</p>

      ${BreathCircle({
        started,
        breathPhase,
        holding,
        onHoldStart: () => emit("breathTraining/holdStart"),
        onHoldEnd: () => emit("breathTraining/holdEnd"),
      })}

      <p class="f4 i">${praiseText}</p>
      ${started
        ? html`<p class="f6 mt4">Cycle: ${cycleCount + 1} / 4</p>`
        : ""}
    </div>
  `;
}
