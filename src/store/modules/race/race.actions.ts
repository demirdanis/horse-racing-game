import {
  AUTO_START_DELAY_MS,
  DEFAULT_RACE_COUNT,
  HORSES_PER_RACE,
  RACE_DISTANCES,
} from "./race.constants";
import { Race, RaceModuleState, RaceResult } from "./race.types";

import { HORSES } from "@/data/horses";
import type { Horse } from "@/types/horse";
import { mutations } from "./race.mutations";
import { sampleUniqueBy } from "./race.helpers";

type MutationHandlers = typeof mutations;

type MutationPayload<K extends keyof MutationHandlers> =
  Parameters<MutationHandlers[K]> extends [RaceModuleState, infer P] ? P : undefined;

type Commit = <K extends keyof MutationHandlers>(
  type: K,
  ...args: MutationPayload<K> extends undefined ? [] : [payload: MutationPayload<K>]
) => void;

type DispatchPayloads = {
  generateRaces: number | undefined;
  startRace: number | undefined;
  pauseRace: number;
  finishRace: { raceIndex: number; result: RaceResult };
  goToNextRace: undefined;
  reset: undefined;
  startCurrentRace: undefined;
  pauseCurrentRace: undefined;
  finishCurrentRace: { order: Array<string | number> };
};

type Dispatch = <K extends keyof DispatchPayloads>(
  type: K,
  ...args: DispatchPayloads[K] extends undefined ? [] : [payload: DispatchPayloads[K]]
) => unknown;

type Context = {
  commit: Commit;
  dispatch: Dispatch;
  state: RaceModuleState;
};

export const actions = {
  generateRaces({ commit }: Context, raceCount: number = DEFAULT_RACE_COUNT) {
    commit("SET_AUTO_START_TIMER_ID", null);
    commit("SET_PROGRAM_LOCKED", false);

    const races: Race[] = [];

    for (let i = 0; i < raceCount; i++) {
      const selectedHorses = sampleUniqueBy(HORSES, HORSES_PER_RACE, (h) => h.id);

      if (selectedHorses.length < HORSES_PER_RACE) {
        throw new Error(
          `Not enough unique horses. Need ${HORSES_PER_RACE}, have ${selectedHorses.length}`
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

  startCurrentRace({ state, dispatch, commit }: Context) {
    if (state.currentRaceIndex == null) return;
    commit("SET_PROGRAM_LOCKED", true);
    dispatch("startRace", state.currentRaceIndex);
  },

  pauseCurrentRace({ state, dispatch, commit }: Context) {
    if (state.currentRaceIndex == null) return;
    if (state.autoStartTimerId != null) {
      clearTimeout(state.autoStartTimerId);
      commit("SET_AUTO_START_TIMER_ID", null);
    }
    dispatch("pauseRace", state.currentRaceIndex);
  },

  async finishCurrentRace(
    { state, dispatch, commit }: Context,
    payload: { order: Array<string | number> }
  ) {
    const idx = state.currentRaceIndex;
    if (idx == null) return;

    const race = state.races[idx];
    if (!race) return;

    const finishOrder = payload.order
      .map((laneId) => {
        const lane = race.lanes.find((l) => l.horse.id === String(laneId));
        return lane ? lane.horse : null;
      })
      .filter((horse): horse is Horse => horse !== null);

    await dispatch("finishRace", {
      raceIndex: idx,
      result: { finishOrder },
    });

    await dispatch("goToNextRace");

    const nextIdx = state.currentRaceIndex;
    if (nextIdx == null) return;
    if (!state.races[nextIdx]) return;
    if (state.races[nextIdx].status !== "ready") return;

    if (state.autoStartTimerId != null) {
      clearTimeout(state.autoStartTimerId);
      commit("SET_AUTO_START_TIMER_ID", null);
    }

    const timerId = setTimeout(() => {
      dispatch("startRace", nextIdx);
      commit("SET_AUTO_START_TIMER_ID", null);
    }, AUTO_START_DELAY_MS);

    commit("SET_AUTO_START_TIMER_ID", timerId);
  },

  startRace({ commit, state }: Context, raceIndex: number = state.currentRaceIndex ?? 0) {
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

  finishRace({ commit }: Context, payload: { raceIndex: number; result: RaceResult }) {
    commit("SET_RACE_RESULT", payload);
  },

  goToNextRace({ commit, state }: Context) {
    if (state.currentRaceIndex === null) return;

    const nextIndex = state.currentRaceIndex + 1;
    if (nextIndex < state.races.length) {
      commit("SET_CURRENT_RACE_INDEX", nextIndex);
    }
  },

  reset({ commit, state }: Context) {
    if (state.autoStartTimerId != null) {
      clearTimeout(state.autoStartTimerId);
      commit("SET_AUTO_START_TIMER_ID", null);
    }
    commit("RESET");
  },
};
