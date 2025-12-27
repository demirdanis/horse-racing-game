import { actions } from "./race.actions";
import { getters } from "./race.getters";
import { mutations } from "./race.mutations";
import { state } from "./race.state";

export const race = {
  namespaced: true,
  state,
  actions,
  mutations,
  getters,
};
