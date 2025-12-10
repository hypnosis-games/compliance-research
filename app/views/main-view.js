// views/main-view.js 
import layoutsDictionary from "./layouts/layouts-dictionary.js";

export default function MainView(state, emit) {
  console.log("MainView state:", state);
  const startModule = state.startModule || Object.keys(layoutsDictionary)[0];
  const requestedModule = state.params && state.params.module;
  const moduleName = layoutsDictionary[requestedModule]
    ? requestedModule
    : startModule;

  const CurrentLayout = layoutsDictionary[moduleName];
  // When we SWITCH INTO induction-arcade, tell store to enter.
  if (moduleName === "induction-arcade" && !state.inductionArcade?.active) {
    emit("inductionArcade/enter");
  }

  // When we SWITCH OUT, tell store to exit.
  if (moduleName !== "induction-arcade" && state.inductionArcade?.active) {
    emit("inductionArcade/exit");
  }
  return html`
    <div id="app">
      ${CurrentLayout ? CurrentLayout(state, emit) : "Layout not found"}
    </div>
  `;
}
