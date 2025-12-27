<script setup lang="ts">
import { computed, ref } from "vue";
import { useStore } from "vuex";

import AppLayout from "@/components/layouts/app-layout/AppLayout.vue";
import AppHeader from "@/components/organisms/app-header/AppHeader.vue";
import RaceCourse from "@/components/organisms/race-course/RaceCourse.vue";
import TitledSection from "@/components/layouts/titled-section/TitledSection.vue";
import Table from "@/components/atoms/table/Table.vue";
import type { TableColumn } from "@/components/atoms/table/Table.types";
import HorseIcon from "@/icons/HorseIcon.vue";
import { HORSES } from "@/data/horses";

const store = useStore();

const races = computed(() => store.getters["race/races"]);
const currentRace = computed(() => store.getters["race/currentRace"]);
const hasRaces = computed(() => store.getters["race/hasRaces"]);

const headerState = computed(() => {
  const status = currentRace.value?.status ?? "ready";
  return status === "running" || status === "finished" ? "running" : "ready";
});

const raceDetails = computed(() =>
  races.value.map((r: any) => ({
    title: `Race ${r.raceNo} - ${r.distance}m`,
    rows: r.lanes.map((l: any, i: number) => ({
      position: i + 1,
      name: l.horse.name,
    })),
  }))
);

const horsesRows = computed(() =>
  HORSES.map((h) => ({
    name: h.name,
    condition: h.condition,
    color: h.color,
  }))
);

const results = ref<
  Array<{
    raceNo: number;
    distance: number;
    rows: Array<{ position: number; name: string }>;
  }>
>([]);

const horsesColumns: TableColumn[] = [
  { key: "name", title: "Name", align: "left", width: 64 },
  { key: "condition", title: "Condition", align: "left", width: 56 },
  { key: "color", title: "Color", align: "left", width: 48 },
];

const raceDetailColumns: TableColumn[] = [
  { key: "position", title: "Position", align: "left", width: 36 },
  { key: "name", title: "Name", align: "left", width: 64 },
];

const resultsColumns: TableColumn[] = [
  { key: "position", title: "Position", align: "left", width: 36 },
  { key: "name", title: "Name", align: "left", width: 64 },
];

function handleGenerateRaces() {
  store.dispatch("race/generateRaces", 6);
  results.value = [];
}

function handleStart() {
  const idx = store.getters["race/currentRace"]
    ? store.state.race.currentRaceIndex
    : null;

  if (idx !== null) {
    store.dispatch("race/startRace", idx);
  }
}

function handlePause() {
  const idx = store.getters["race/currentRace"]
    ? store.state.race.currentRaceIndex
    : null;
  if (idx !== null) store.dispatch("race/pauseRace", idx);
}

function handleLaneFinished() {}

function handleRaceFinished(payload: any) {
  const idx = store.state.race.currentRaceIndex;
  if (idx === null) return;

  const race = store.state.race.races[idx];
  if (!race) return;

  const finishOrder = payload.order
    .map((laneId: string) => {
      const lane = race.lanes.find((l: any) => l.horse.id === laneId);
      return lane ? lane.horse : null;
    })
    .filter(Boolean);

  store.dispatch("race/finishRace", {
    raceIndex: idx,
    result: { finishOrder },
  });

  results.value.push({
    raceNo: race.raceNo,
    distance: race.distance,
    rows: finishOrder.map((h: any, i: number) => ({
      position: i + 1,
      name: h.name,
    })),
  });

  store.dispatch("race/goToNextRace");

  setTimeout(() => {
    const nextIdx = store.state.race.currentRaceIndex;
    if (
      nextIdx !== null &&
      store.state.race.races[nextIdx].status === "ready"
    ) {
      console.log("Starting next race");
      handleStart();
    }
  }, 1000);
}
</script>

<template>
  <div class="page">
    <AppLayout>
      <template #top>
        <AppHeader
          title="Horse Racing"
          :state="headerState"
          @generate="handleGenerateRaces"
          @start="handleStart"
          @pause="handlePause"
        />
      </template>

      <template #left>
        <TitledSection title="Horses" :subtitle="`Available: ${HORSES.length}`">
          <Table
            :columns="horsesColumns"
            :rows="horsesRows"
            borderStyle="inner"
          >
            <template #cell="{ col, value }">
              <HorseIcon
                v-if="col.key === 'color'"
                :color="value"
                :size="32"
                class="inline-block"
              />
              <span v-else>{{ value }}</span>
            </template>
          </Table>
        </TitledSection>
      </template>

      <template #center>
        <TitledSection
          :title="
            hasRaces
              ? `Race ${currentRace?.raceNo} - ${currentRace?.distance}m`
              : 'No Race'
          "
          subtitle="Race Track"
        >
          <div v-if="currentRace">
            <RaceCourse
              :lanes="
                currentRace.lanes.map((l: any) => ({
                  id: l.horse.id,
                  laneNumber: l.laneNumber,
                  color: l.horse.color,
                  condition: l.horse.condition,
                }))
              "
              :distance="currentRace.distance"
              :state="currentRace.status"
              direction="ltr"
              @laneFinished="handleLaneFinished"
              @finished="handleRaceFinished"
            />
          </div>

          <div v-else class="empty-track">
            <div class="empty-track__content">
              <p class="empty-track__text">Click "Generate Races" to start</p>
            </div>
          </div>
        </TitledSection>
      </template>

      <template #right>
        <div class="right-columns">
          <div class="right-col">
            <TitledSection title="Races" :subtitle="`Total: ${races.length}`">
              <div v-if="hasRaces" class="list">
                <div
                  v-for="(rd, idx) in raceDetails"
                  :key="idx"
                  class="list-item"
                  :class="{
                    'list-item--divided': idx < raceDetails.length - 1,
                  }"
                >
                  <TitledSection :title="rd.title" :borderless="true">
                    <Table
                      :columns="raceDetailColumns"
                      :rows="rd.rows"
                      borderStyle="inner"
                    />
                  </TitledSection>
                </div>
              </div>

              <div v-else class="empty-note">No races yet</div>
            </TitledSection>
          </div>

          <div class="right-col">
            <TitledSection
              title="Results"
              :subtitle="`Total: ${results.length}`"
            >
              <div v-if="results.length > 0" class="list">
                <div
                  v-for="(result, idx) in results"
                  :key="`race-${result.raceNo}`"
                  class="list-item"
                  :class="{ 'list-item--divided': idx < results.length - 1 }"
                >
                  <TitledSection
                    :title="`Race ${result.raceNo} - ${result.distance}m`"
                    :borderless="true"
                  >
                    <Table
                      :columns="resultsColumns"
                      :rows="result.rows"
                      borderStyle="inner"
                    />
                  </TitledSection>
                </div>
              </div>

              <div v-else class="empty-note">
                Results will appear here as races finish
              </div>
            </TitledSection>
          </div>
        </div>
      </template>
    </AppLayout>
  </div>
</template>

<style scoped>
.page {
  height: 100vh;
}

.empty-track {
  height: 400px;
  border: 1px dashed var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
}

.empty-track__content {
  text-align: center;
}

.empty-track__text {
  margin: 0;
  font-size: 16px;
}

.right-columns {
  display: flex;
  gap: 12px;
  height: 100%;
  overflow: hidden;
}

.right-col {
  flex: 1;
  overflow-y: auto;
}

.list {
  display: flex;
  flex-direction: column;
}

.list-item--divided {
  border-bottom: 1px solid var(--color-border);
}

.empty-note {
  padding: 16px;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 14px;
}
</style>
