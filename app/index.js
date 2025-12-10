// index.js
import MainView from "./views/main-view.js";
import store from "./store/store.js";

const choo = Choo({ hash: true });

choo.use(store);

choo.route("/", MainView);
choo.route("/:module", MainView);

choo.route("/compliance-research", MainView);
choo.route("/compliance-research/:module", MainView);
choo.mount("#app");
window.choo = choo;
