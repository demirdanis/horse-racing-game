import AppHeader from "../../organisms/app-header/AppHeader.vue";
import AppLayout from "./AppLayout.vue";
import Table from "../../atoms/table/Table.vue";
import TitledSection from "../titled-section/TitledSection.vue";

export default {
  title: "Layout/AppLayout",
  component: AppLayout,
  tags: ["autodocs"],
  render: (args: Record<string, unknown>) => ({
    components: { AppLayout, AppHeader, TitledSection, Table },
    setup() {
      const horsesColumns = [
        { key: "name", title: "Name" },
        { key: "condition", title: "Condition", align: "center" },
        { key: "color", title: "Color" },
      ];

      const horsesRows = [
        { name: "Thunder", condition: 85, color: "#2D6CDF" },
        { name: "Blaze", condition: 65, color: "#FF8A00" },
        { name: "Mint", condition: 95, color: "#00C48C" },
        { name: "Violet", condition: 55, color: "#B455FF" },
      ];

      const oddsColumns = [
        { key: "horse", title: "Horse" },
        { key: "odds", title: "Odds", align: "right" },
      ];

      const oddsRows = [
        { horse: "Thunder", odds: "2.40" },
        { horse: "Blaze", odds: "3.10" },
        { horse: "Mint", odds: "1.95" },
        { horse: "Violet", odds: "4.80" },
      ];

      const resultsColumns = [
        { key: "place", title: "Place", align: "center" },
        { key: "horse", title: "Horse" },
      ];

      const resultsRows = [
        { place: 1, horse: "-" },
        { place: 2, horse: "-" },
        { place: 3, horse: "-" },
      ];

      return {
        args,
        horsesColumns,
        horsesRows,
        oddsColumns,
        oddsRows,
        resultsColumns,
        resultsRows,
      };
    },
    template: `
      <div style="height: 92vh;">
        <AppLayout>
          <template #top>
            <AppHeader title="Horse Racing" state="ready" />
          </template>

          <template #left>
            <TitledSection title="Left Panel">
              <Table :columns="horsesColumns" :rows="horsesRows" />
            </TitledSection>
          </template>

          <template #center>
            <TitledSection title="Main Panel" subtitle="Race area / canvas">
              <div style="height: 420px; border: 1px dashed rgba(0,0,0,.25);  display:flex; align-items:center; justify-content:center; opacity:.75;">
                CENTER CONTENT
              </div>
            </TitledSection>
          </template>

          <template #right>
            <div style="display:flex; flex-direction:row; gap:12px;">
              <TitledSection title="Right Panel - Odds">
                <Table :columns="oddsColumns" :rows="oddsRows" />
              </TitledSection>

              <TitledSection title="Right Panel - Results">
                <Table :columns="resultsColumns" :rows="resultsRows" />
              </TitledSection>
            </div>
          </template>
        </AppLayout>
      </div>
    `,
  }),
};

export const Default = {};
