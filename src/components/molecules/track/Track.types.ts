import { Direction } from "@/types/direction";
import { RaceState } from "@/types/race-state";

export interface TrackProps {
  state?: RaceState;
  durationSec?: number;
  direction?: Direction;
  laneNumber?: number | string;
}
