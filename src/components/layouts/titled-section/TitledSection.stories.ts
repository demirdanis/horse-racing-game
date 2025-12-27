import Table from "../../atoms/table/Table.vue";
import TitledSection from "./TitledSection.vue";

export default {
  title: "Layout/TitledSection",
  component: TitledSection,
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text" },
    subtitle: { control: "text" },
  },
  args: {
    title: "Horse List",
    subtitle: "Race #5",
  },
  render: (args: any) => ({
    components: { TitledSection, Table },
    setup() {
      const columns = [
        { key: "name", title: "Name" },
        { key: "condition", title: "Condition", align: "center" },
        { key: "color", title: "Color" },
      ];

      const rows = [
        { name: "Thunder", condition: 85, color: "#2D6CDF" },
        { name: "Blaze", condition: 65, color: "#FF8A00" },
        { name: "Mint", condition: 95, color: "#00C48C" },
      ];

      return { args, columns, rows };
    },
    template: `
      <div style="width: 650px;">
        <TitledSection :title="args.title" :subtitle="args.subtitle" :borderless="args.borderless">
          <Table :columns="columns" :rows="rows" :borderStyle="'inner'" />
        </TitledSection>
      </div>
    `,
  }),
};

export const Default = {};

export const Borderless = {
  args: {
    borderless: true,
  },
};

export const WithoutSubtitle = {
  args: {
    subtitle: "",
  },
};

export const WithActions = {
  render: (args: any) => ({
    components: { TitledSection, Table },
    setup() {
      const columns = [
        { key: "horse", title: "Horse" },
        { key: "odds", title: "Odds", align: "right" },
      ];

      const rows = [
        { horse: "Thunder", odds: "2.40" },
        { horse: "Blaze", odds: "3.10" },
      ];

      return { args, columns, rows };
    },
    template: `
      <div style="width: 650px;">
        <TitledSection :title="args.title" subtitle="With actions">
          <template #actions>
            <button
              style="
                padding:6px 10px;
                border:1px solid rgba(0,0,0,.2);
                background:rgba(255,255,255,.1);
                cursor:pointer;
              "
            >
              Refresh
            </button>
          </template>

          <Table :columns="columns" :rows="rows" />
        </TitledSection>
      </div>
    `,
  }),
};
