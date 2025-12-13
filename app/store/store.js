// store/store.js
import layoutsDictionary, { moduleOrder } from "../views/layouts/layouts-dictionary.js";
import inductionArcadeStore from "./induction-arcade-store.js";
import preTestSurveyStore from "./pre-test-survey-store.js";

function applyPatch(state, emitter, key, patch) {
  state[key] = {
    ...(state[key] || {}),
    ...patch,
  };
  emitter.emit("render");
}

function pushModuleRoute(emitter, moduleName, resolver) {
  const target = resolver(moduleName);
  emitter.emit("pushState", `#${target}`);
}

export default function store(state, emitter) {
  state.moduleOrder = moduleOrder;
  state.startModule = moduleOrder[0] || "consent";

  const resolveModuleName = (moduleName) =>
    layoutsDictionary[moduleName] ? moduleName : state.startModule;

  state.applyPatch = (key, patch) => applyPatch(state, emitter, key, patch);
  state.pushModuleRoute = (moduleName) =>
    pushModuleRoute(emitter, moduleName, resolveModuleName);

  inductionArcadeStore(state, emitter);
  preTestSurveyStore(state, emitter);

  state.personalInfo = {
    name: "",
    gender: "",
    modality: "",
    age: 18,
    consentGiven: false,
  };

  emitter.on("personalInfo/update", (payload) => {
    state.applyPatch("personalInfo", payload);
  });

  emitter.on("nav/goToModule", (moduleName) => {
    state.pushModuleRoute(moduleName);
  });

  emitter.on("nav/nextModule", () => {
    const currentParams = state.params || {};
    const currentName = currentParams.module || state.startModule;
    const currentIndex = state.moduleOrder.indexOf(currentName);
    const nextModuleName =
      currentIndex >= 0 && currentIndex < state.moduleOrder.length - 1
        ? state.moduleOrder[currentIndex + 1]
        : currentName || state.startModule;
    state.pushModuleRoute(resolveModuleName(nextModuleName));
  });
}
