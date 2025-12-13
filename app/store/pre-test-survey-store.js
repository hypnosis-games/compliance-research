// store/pre-test-survey-store.js

import {
  complianceInstructions,
  complianceLikertLabels,
  complianceLikertOptions,
  sampleComplianceQuestions,
} from "../data/compliance-questions.js";

export default function preTestSurveyStore(state, emitter) {
  const applyPatch = state.applyPatch
    ? (key, patch) => state.applyPatch(key, patch)
    : (key, patch) => {
        state[key] = {
          ...(state[key] || {}),
          ...patch,
        };
        emitter.emit("render");
      };

  state.preTestSurvey = state.preTestSurvey || {};
  const s = state.preTestSurvey;

  s.instructions = s.instructions || complianceInstructions;
  s.likertOptions = s.likertOptions || complianceLikertOptions;
  s.likertLabels = s.likertLabels || complianceLikertLabels;
  s.questions = s.questions || sampleComplianceQuestions();

  s.currentIndex =
    typeof s.currentIndex === "number" ? s.currentIndex : 0;
  s.responses = s.responses || {};
  s.lastAffirmation = s.lastAffirmation || "";

  // animation state
  // phases: 'idle' | 'affirm' | 'out'
  s.animPhase = s.animPhase || "idle";
  s.selectedValue =
    typeof s.selectedValue === "number" ? s.selectedValue : null;
  s.selectedQuestionId = s.selectedQuestionId || null;

  emitter.on("preTestSurvey/update", (payload) => {
    applyPatch("preTestSurvey", payload);
  });

  emitter.on("preTestSurvey/reset", () => {
    applyPatch("preTestSurvey", {
      currentIndex: 0,
      responses: {},
      lastAffirmation: "",
      animPhase: "idle",
      selectedValue: null,
      selectedQuestionId: null,
    });
  });
}
