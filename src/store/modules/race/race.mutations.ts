import { Race, RaceModuleState, RaceResult } from "./race.types";

import { RaceState } from "@/types/race-state";

export const mutations = {
  SET_RACES(state: RaceModuleState, races: Race[]) {
    state.races = races;
  },

  SET_CURRENT_RACE_INDEX(state: RaceModuleState, index: number | null) {
    state.currentRaceIndex = index;
  },

  SET_RACE_RESULT(state: RaceModuleState, payload: { raceIndex: number; result: RaceResult }) {
    if (state.races[payload.raceIndex]) {
      state.races[payload.raceIndex].result = payload.result;
      state.races[payload.raceIndex].status = "finished";
    }
  },

  SET_RACE_STATUS(state: RaceModuleState, payload: { raceIndex: number; status: RaceState }) {
    if (state.races[payload.raceIndex]) {
      state.races[payload.raceIndex].status = payload.status;
    }
  },

  RESET(state: RaceModuleState) {
    state.races = [];
    state.currentRaceIndex = null;
    state.autoStartTimerId = null;
    state.programLocked = false;
  },

  SET_AUTO_START_TIMER_ID(state: RaceModuleState, timerId: ReturnType<typeof setTimeout> | null) {
    state.autoStartTimerId = timerId;
  },

  SET_PROGRAM_LOCKED(state: RaceModuleState, locked: boolean) {
    state.programLocked = locked;
  },
};
