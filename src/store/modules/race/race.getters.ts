import { Race, RaceModuleState } from "./race.types";

export const getters = {
  races: (state: RaceModuleState): Race[] => state.races,

  currentRace: (state: RaceModuleState): Race | null => {
    if (state.currentRaceIndex === null) return null;
    return state.races[state.currentRaceIndex] ?? null;
  },

  hasRaces: (state: RaceModuleState): boolean => state.races.length > 0,

  completedRacesCount: (state: RaceModuleState): number => {
    return state.races.filter((r) => r.status === "finished").length;
  },

  totalRacesCount: (state: RaceModuleState): number => state.races.length,

  allRacesCompleted: (state: RaceModuleState): boolean => {
    return state.races.length > 0 && state.races.every((r) => r.status === "finished");
  },

  programLocked: (state: RaceModuleState): boolean => state.programLocked,

  tableBorderStyle: (state: RaceModuleState): "full" | "inner" | "outer" => state.tableBorderStyle,
};
