// store/pre-test-survey-store.js

const instructions = [
  "Please read each item aloud slowly and carefully before answering.",
];

const likertOptions = [1, 2, 3, 4, 5];

const likertLabels = {
  1: "1 - Strongly disagree",
  2: "2 - Disagree",
  3: "3 - Neither agree nor disagree",
  4: "4 - Agree",
  5: "5 - Strongly agree",
};

const questions = [
  { id: "q1", text: "I like being told what to do." },
  { id: "q2", text: "Doing what I’m told feels good." },
  { id: "q3", text: "I want to do things right." },
  { id: "q4", text: "I like being guided." },
  { id: "q5", text: "Being correct feels good." },
  { id: "q6", text: "I want to be good." },
  { id: "q7", text: "I like knowing I’m doing it right." },
  { id: "q8", text: "I feel good when I follow directions." },
  { id: "q9", text: "I like clear instructions." },
  { id: "q10", text: "I try hard to be compliant." },
  { id: "q11", text: "I enjoy being directed." },
  { id: "q12", text: "I want to meet expectations." },
  { id: "q13", text: "I like being praised for doing well." },
  { id: "q14", text: "I feel calm when I’m told what to do." },
  { id: "q15", text: "I like having someone lead me." },
  { id: "q16", text: "I want to be dependable." },
  { id: "q17", text: "I feel good when I obey rules." },
  { id: "q18", text: "I like knowing someone is guiding me." },
  { id: "q19", text: "I want to do what is asked of me." },
  { id: "q20", text: "Being good feels right." },
];

export default function preTestSurveyStore(state, emitter) {
  state.preTestSurvey = state.preTestSurvey || {};
  const s = state.preTestSurvey;

  s.instructions = s.instructions || instructions;
  s.likertOptions = s.likertOptions || likertOptions;
  s.likertLabels = s.likertLabels || likertLabels;
  s.questions = s.questions || questions;

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
    state.preTestSurvey = {
      ...state.preTestSurvey,
      ...payload,
    };
    emitter.emit("render");
  });

  emitter.on("preTestSurvey/reset", () => {
    state.preTestSurvey = {
      ...state.preTestSurvey,
      currentIndex: 0,
      responses: {},
      lastAffirmation: "",
      animPhase: "idle",
      selectedValue: null,
      selectedQuestionId: null,
    };
    emitter.emit("render");
  });
}
