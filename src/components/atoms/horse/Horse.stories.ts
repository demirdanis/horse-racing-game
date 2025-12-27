import Horse from "./Horse.vue";
import { fn } from "storybook/test";

export default {
  title: "Atoms/Horse",
  component: Horse,
  tags: ["autodocs"],
  argTypes: {
    color: { control: "color" },
    state: {
      control: { type: "select" },
      options: ["ready", "running", "won"],
    },
    condition: {
      control: { type: "number", min: 1, max: 100, step: 1 },
    },
    onClick: { action: "click" },
  },
  args: {
    color: "#2D6CDF",
    state: "ready",
    condition: 50,
    onClick: fn(),
  },
};

export const Ready = {
  args: { state: "ready" },
};

export const RunningSlow = {
  args: { state: "running", condition: 20 },
};

export const RunningFast = {
  args: { state: "running", condition: 95 },
};

export const Won = {
  args: { state: "won" },
};
