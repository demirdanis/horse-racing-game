import { RaceState } from "@/types/race-state";

export interface RaceLane {
  id: string | number;
  laneNumber: number | string;
  color: string;
  condition: number;
}

export type LaneId = RaceLane["id"];

export interface RaceCourseProps {
  distance: number;
  lanes: RaceLane[];
  state?: RaceState;
  direction?: "ltr" | "rtl";
}

export interface RaceLaneFinishedPayload {
  laneId: LaneId;
  place: number;
  order: LaneId[];
}

export interface RaceFinishedPayload {
  order: LaneId[];
}

export type RaceCourseEmits = {
  (e: "laneFinished", payload: RaceLaneFinishedPayload): void;
  (e: "finished", payload: RaceFinishedPayload): void;
};
