// store/store.js
import layoutsDictionary, { moduleOrder } from "../views/layouts/layouts-dictionary.js";
import inductionArcadeStore from "./induction-arcade-store.js";
import preTestSurveyStore from "./pre-test-survey-store.js";
export default function store(state, emitter) {
  inductionArcadeStore(state, emitter);
  preTestSurveyStore(state, emitter);
  state.moduleOrder = moduleOrder;
  state.startModule = moduleOrder[0] || "consent";

  state.personalInfo = {
    name: "",
    gender: "",
    modality: "",
    age: 18,
    consentGiven: false,
  };

  emitter.on("updatePreTestSurvey", (payload) => {
    state.preTestSurvey = {
      ...state.preTestSurvey,
      ...payload,
    };
    emitter.emit("render");
  });

  emitter.on("updatePersonalInfo", (payload) => {
    state.personalInfo = {
      ...state.personalInfo,
      ...payload,
    };
    emitter.emit("render");
  });

  emitter.on("navigateToModule", (moduleName) => {
    const target = layoutsDictionary[moduleName] ? moduleName : state.startModule;
    emitter.emit("pushState", `#${target}`);
  });

  emitter.on("navigateNextModule", () => {
    const currentName = state.params.module || state.startModule;
    const idx = state.moduleOrder.indexOf(currentName);
    const next =
      idx >= 0 && idx < state.moduleOrder.length - 1
        ? state.moduleOrder[idx + 1]
        : currentName || state.startModule;
    emitter.emit("pushState", `/research-study#${next}`);
  });
}
