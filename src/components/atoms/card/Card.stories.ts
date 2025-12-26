import Card from "./Card.vue";

export default {
  title: "Atoms/Card",
  component: Card,
  tags: ["autodocs"],
  argTypes: {
    default: {
      control: "text",
      description: "Card content (default slot)",
    },
  },
  args: {
    default: "Card content",
  },
};

export const Default = {
  args: {
    default: "Default Card content",
  },
};
