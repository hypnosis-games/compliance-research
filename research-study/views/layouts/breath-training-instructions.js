const instructions = [
  "In this next module you will be instructed to breathe slowly and evenly.",
  "You will see a circle on the screen.",
  "You will click or tap on the circle to begin.",
  "You will hold down the click or tap while you are breathing in.",
  "When instructed you will release the click and breathe out nice and slowly.",
  "You will repeat this until you are ready to move on to the next module.",
];

export default function BreathTrainingInstructions(state, emit) {
  const step = state.breathTraining.instructionsStep || 0;
  const instruction = instructions[step];
  const typed = instruction.slice(0, state.breathTraining.typedIndex || 0);

  function startTyping(len) {
    emit("breathTraining/clearTyping");
    emit("breathTraining/startTyping", len);
  }

  function next() {
    if (step < instructions.length - 1) {
      emit("breathTraining/nextInstruction");
      startTyping(instructions[step + 1].length);
    } else {
      emit("breathTraining/clearTyping");
      emit("breathTraining/start");
      emit("navigateToModule", "breath-training");
    }
  }

  const showButton =
    !state.breathTraining.typingInterval &&
    state.breathTraining.typedIndex >= instruction.length;

  return html`
    <div
      class="pa4 sans-serif bg-white dark-gray"
      onload=${() => startTyping(instruction.length)}
    >
      <p class="f4 mb4">${typed}</p>
      ${showButton
        ? html`<button
            class="f5 link dim br2 ph3 pv2 mb2 dib white bg-dark-blue"
            onclick=${next}
          >
            Continue
          </button>`
        : ""}
    </div>
  `;
}
