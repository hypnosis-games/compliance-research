// store/store.js
import layoutsDictionary, { moduleOrder } from "../views/layouts/layouts-dictionary.js";
import inductionArcadeStore from "./induction-arcade-store.js";
import preTestSurveyStore from "./pre-test-survey-store.js";
export default function store(state, emitter) {
  inductionArcadeStore(state, emitter);
  preTestSurveyStore(state, emitter);
  state.moduleOrder = moduleOrder;
  state.startModule = moduleOrder[0] || "consent";

  const resolveModuleName = (moduleName) =>
    layoutsDictionary[moduleName] ? moduleName : state.startModule;

  const pushModuleRoute = (moduleName) => {
    const target = resolveModuleName(moduleName);
    emitter.emit("pushState", `#${target}`);
  };

  state.personalInfo = {
    name: "",
    gender: "",
    modality: "",
    age: 18,
    consentGiven: false,
  };

  emitter.on("personalInfo/update", (payload) => {
    state.personalInfo = {
      ...state.personalInfo,
      ...payload,
    };
    emitter.emit("render");
  });

  emitter.on("nav/goToModule", (moduleName) => {
    pushModuleRoute(moduleName);
  });

  emitter.on("nav/goToNextModule", () => {
    const currentParams = state.params || {};
    const currentName = currentParams.module || state.startModule;
    const idx = state.moduleOrder.indexOf(currentName);
    const next =
      idx >= 0 && idx < state.moduleOrder.length - 1
        ? state.moduleOrder[idx + 1]
        : currentName || state.startModule;
    pushModuleRoute(resolveModuleName(next));
  });
}
