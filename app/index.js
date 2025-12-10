// index.js
import MainView from "./views/main-view.js";
import store from "./store/store.js";
import { initArcadeGame } from "./phaser/induction-arcade-game.js";

const choo = Choo({ hash: true });

choo.use(store);

choo.route("/", MainView);
choo.route("/:module", MainView);

choo.route("/compliance-research", MainView);
choo.route("/compliance-research/:module", MainView);
choo.mount("#app");
initArcadeGame({
  onGameEvent: (evt) => {
    // forward events into Choo
    // you can refine this later
    choo.emitter.emit("inductionArcade/gameEvent", evt);
  },
});

window.choo = choo;
