export type HorseState = "ready" | "running" | "won";

export interface HorseProps {
  color?: string;
  state?: HorseState;
  condition?: number;
}
