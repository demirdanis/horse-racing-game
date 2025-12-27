import { RaceModuleState } from "./race.types";

export const state = (): RaceModuleState => ({
  races: [],
  currentRaceIndex: null,
  tableBorderStyle: "inner",
  autoStartTimerId: null,
  programLocked: false,
});
