import { Horse } from "@/types/horse";
import { RaceState } from "@/types/race-state";

export type RaceId = string;

export interface RaceLane {
  laneNumber: number;
  horse: Horse;
}

export interface RaceResult {
  finishOrder: Horse[];
}

export interface Race {
  id: RaceId;
  raceNo: number;
  distance: number;
  lanes: RaceLane[];
  status: RaceState;
  result: RaceResult | null;
}

export interface RaceModuleState {
  races: Race[];
  currentRaceIndex: number | null;
  tableBorderStyle: "full" | "inner" | "outer";
  autoStartTimerId: ReturnType<typeof setTimeout> | null;
  programLocked: boolean;
}
