export type AppRunState = "ready" | "running" | "paused" | "finished";

export interface AppHeaderProps {
  title?: string;
  state?: AppRunState;
  generateDisabled?: boolean;
  startPauseDisabled?: boolean;
}
