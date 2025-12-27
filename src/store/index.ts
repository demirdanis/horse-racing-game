import { createStore } from "vuex";
import { race } from "./modules/race/race.index";

export const store = createStore({
  modules: {
    race,
  },
});

export type RootState = ReturnType<typeof store.state>;
