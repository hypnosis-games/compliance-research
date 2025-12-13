/*
/app/store/pre-test-survey-store.js
Manages state and side effects for the pre-test survey workflow.
*/
// store/pre-test-survey-store.js

import {
  complianceInstructions,
  complianceLikertLabels,
  complianceLikertOptions,
} from "../data/affirmation-and-question-strings.js";
import { ContentDirector } from "../directors/content-director.js";

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

  state.conditioning = state.conditioning || { depth: 0 };

  state.preTestSurvey = state.preTestSurvey || {};
  const s = state.preTestSurvey;
  const normalizedDepth = ContentDirector.normalizeDepth(
    state.conditioning.depth || 0
  );

  s.instructions = s.instructions || complianceInstructions;
  s.likertOptions = s.likertOptions || complianceLikertOptions;
  s.likertLabels = s.likertLabels || complianceLikertLabels;
  s.questions =
    s.questions ||
    ContentDirector.getSurvey({ depth: normalizedDepth, count: 5 });

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
