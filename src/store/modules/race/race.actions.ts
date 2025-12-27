import { DEFAULT_RACE_COUNT, RACE_DISTANCES } from "./race.constants";
import { Race, RaceModuleState, RaceResult } from "./race.types";

import { HORSES } from "@/data/horses";
import { sampleUniqueBy } from "./race.helpers";

type Context = {
  commit: any;
  state: RaceModuleState;
};

export const actions = {
  generateRaces({ commit }: Context, raceCount: number = DEFAULT_RACE_COUNT) {
    const races: Race[] = [];

    for (let i = 0; i < raceCount; i++) {
      const selectedHorses = sampleUniqueBy(HORSES, 10, (h) => h.id);

      if (selectedHorses.length < 10) {
        throw new Error(
          `Not enough unique horses. Need 10, have ${selectedHorses.length}`
        );
      }

      const lanes = selectedHorses.map((horse, index) => ({
        laneNumber: index + 1,
        horse,
      }));

      const race: Race = {
        id: `race-${i + 1}`,
        raceNo: i + 1,
        distance: RACE_DISTANCES[i] || 2000,
        lanes,
        status: "ready",
        result: null,
      };

      races.push(race);
    }

    commit("SET_RACES", races);
    if (races.length > 0) commit("SET_CURRENT_RACE_INDEX", 0);
  },

  startRace(
    { commit, state }: Context,
    raceIndex: number = state.currentRaceIndex ?? 0
  ) {
    commit("SET_RACE_STATUS", {
      raceIndex,
      status: "running",
    });
  },

  pauseRace({ commit }: Context, raceIndex: number) {
    commit("SET_RACE_STATUS", {
      raceIndex,
      status: "paused",
    });
  },

  finishRace(
    { commit }: Context,
    payload: { raceIndex: number; result: RaceResult }
  ) {
    commit("SET_RACE_RESULT", payload);
  },

  goToNextRace({ commit, state }: Context) {
    if (state.currentRaceIndex === null) return;

    const nextIndex = state.currentRaceIndex + 1;
    if (nextIndex < state.races.length) {
      commit("SET_CURRENT_RACE_INDEX", nextIndex);
    }
  },

  reset({ commit }: Context) {
    commit("RESET");
  },
};
