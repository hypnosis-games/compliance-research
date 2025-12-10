export default function breathTrainingStore(state, emitter) {
  state.breathTraining = {
    breathPhase: "idle",
    holding: false,
    cycleCount: 0,
    timer: null,
    inhaleComplete: false,
    instructionsStep: 0,
    typedIndex: 0,
    typingInterval: null,
  };

  emitter.on("breathTraining/start", () => {
    state.breathTraining.breathPhase = "idle";
    state.breathTraining.holding = false;
    state.breathTraining.cycleCount = 0;
    state.breathTraining.inhaleComplete = false;

    if (state.breathTraining.timer) clearTimeout(state.breathTraining.timer);
    state.breathTraining.timer = null;

    emitter.emit("render");
  });

  emitter.on("breathTraining/resetInstructions", () => {
    state.breathTraining.instructionsStep = 0;
    state.breathTraining.typedIndex = 0;
    if (state.breathTraining.typingInterval)
      clearInterval(state.breathTraining.typingInterval);
    state.breathTraining.typingInterval = null;
    emitter.emit("render");
  });

  emitter.on("breathTraining/startTyping", (len) => {
    if (state.breathTraining.typingInterval)
      clearInterval(state.breathTraining.typingInterval);
    state.breathTraining.typedIndex = 0;
    state.breathTraining.typingInterval = setInterval(() => {
      state.breathTraining.typedIndex++;
      if (state.breathTraining.typedIndex >= len) {
        clearInterval(state.breathTraining.typingInterval);
        state.breathTraining.typingInterval = null;
      }
      emitter.emit("render");
    }, 40);
  });

  emitter.on("breathTraining/clearTyping", () => {
    if (state.breathTraining.typingInterval)
      clearInterval(state.breathTraining.typingInterval);
    state.breathTraining.typingInterval = null;
  });

  emitter.on("breathTraining/nextInstruction", () => {
    state.breathTraining.instructionsStep++;
    state.breathTraining.typedIndex = 0;
    emitter.emit("render");
  });

  emitter.on("breathTraining/holdStart", () => {
    if (state.breathTraining.breathPhase === "idle") {
      state.breathTraining.breathPhase = "inhale";
      state.breathTraining.holding = true;
      state.breathTraining.inhaleComplete = false;

      state.breathTraining.timer = setTimeout(() => {
        state.breathTraining.inhaleComplete = true;
        emitter.emit("render");
      }, 3000);
    } else {
      state.breathTraining.holding = true;
    }

    emitter.emit("render");
  });

  emitter.on("breathTraining/holdEnd", () => {
    state.breathTraining.holding = false;

    if (state.breathTraining.breathPhase === "inhale") {
      if (state.breathTraining.timer) clearTimeout(state.breathTraining.timer);
      state.breathTraining.breathPhase = "idle";
      state.breathTraining.inhaleComplete = false;
    } else if (state.breathTraining.inhaleComplete) {
      state.breathTraining.breathPhase = "exhale";

      state.breathTraining.timer = setTimeout(() => {
        state.breathTraining.cycleCount++;
        if (state.breathTraining.cycleCount >= 4) {
          if (state.breathTraining.timer) clearTimeout(state.breathTraining.timer);
          emitter.emit("navigateNextModule");
          return;
        }

        state.breathTraining.breathPhase = "idle";
        state.breathTraining.inhaleComplete = false;
        state.breathTraining.timer = null;
        emitter.emit("render");
      }, 1500);
    }

    emitter.emit("render");
  });
}
