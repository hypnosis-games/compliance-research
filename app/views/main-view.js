/*
/app/views/main-view.js
Composes the primary view routing logic that switches between layout components.
*/
// views/main-view.js 
import layoutsDictionary from "./layouts/layouts-dictionary.js";

export default function MainView(state, emit) {
  const startModule = state.startModule || Object.keys(layoutsDictionary)[0];
  const requestedModule = state.params && state.params.module;
  const normalizedRequestedModule =
    requestedModule === "task-phase" ? "induction-arcade" : requestedModule;
  const moduleName = layoutsDictionary[normalizedRequestedModule]
    ? normalizedRequestedModule
    : startModule;

  const CurrentLayout = layoutsDictionary[moduleName];
  // When we SWITCH INTO induction-arcade, tell store to enter.
  if (moduleName === "induction-arcade" && !state.inductionArcade?.active) {
    emit("inductionArcade/enter");
  }

  // When we SWITCH OUT, tell store to exit.
  if (moduleName   !== "induction-arcade" && state.inductionArcade?.active) {
    emit("inductionArcade/exit");
  }
  return html`
    <div id="app">
      ${CurrentLayout ? CurrentLayout(state, emit) : "Layout not found"}
    </div>
  `;
}
