import Table from "./Table.vue";

export default {
  title: "Atoms/Table",
  component: Table,
  tags: ["autodocs"],
  args: {
    columns: [
      { key: "name", title: "Name", align: "left" },
      { key: "condition", title: "Condition", align: "left" },
      { key: "color", title: "Color", align: "left" },
    ],
    rows: [
      { name: "Thunder", condition: 85, color: "#2D6CDF" },
      { name: "Blaze", condition: 65, color: "#FF8A00" },
      { name: "Mint", condition: 95, color: "#00C48C" },
    ],
  },
};

export const Default = {};

export const InnerBorder = {
  args: {
    borderStyle: "inner",
  },
};

export const OuterBorder = {
  args: {
    borderStyle: "outer",
  },
};
