import Button from "./Button.vue";
import { fn } from "storybook/test";

export default {
  title: "Atoms/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary"],
    },
    disabled: { control: { type: "boolean" } },

    default: { control: "text" },
  },
  args: {
    variant: "primary",
    disabled: false,
    default: "Button",
    onClick: fn(),
  },
};

export const Primary = {
  args: {
    variant: "primary",
    default: "Primary Button",
  },
};

export const Secondary = {
  args: {
    variant: "secondary",
    default: "Secondary Button",
  },
};

export const Disabled = {
  args: {
    disabled: true,
    default: "Disabled Button",
  },
};
