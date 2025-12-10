// index.js
import MainView from "./views/main-view.js";
import store from "./store/store.js";

const choo = Choo({ hash: true });

choo.use(store);

// Choo will see `/research-study#personal-info` as `/research-study/personal-info`
choo.route("/", MainView);
choo.route("/:module", MainView);

choo.mount("#app");
window.choo = choo;
