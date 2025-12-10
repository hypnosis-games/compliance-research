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

  return html`
    <div id="app">
      ${CurrentLayout ? CurrentLayout(state, emit) : "Layout not found"}
    </div>
  `;
}
