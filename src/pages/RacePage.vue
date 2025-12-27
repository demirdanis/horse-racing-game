<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";

import AppLayout from "@/components/layouts/app-layout/AppLayout.vue";
import AppHeader from "@/components/organisms/app-header/AppHeader.vue";
import type { AppRunState } from "@/components/organisms/app-header/AppHeader.types";
import RaceCourse from "@/components/organisms/race-course/RaceCourse.vue";
import TitledSection from "@/components/layouts/titled-section/TitledSection.vue";
import Table from "@/components/atoms/table/Table.vue";
import type { TableColumn } from "@/components/atoms/table/Table.types";
import HorseIcon from "@/icons/HorseIcon.vue";
import { HORSES } from "@/data/horses";
import type { Race, RaceLane } from "@/store/modules/race/race.types";
import type { RaceFinishedPayload } from "@/components/organisms/race-course/RaceCourse.types";
import { DEFAULT_RACE_COUNT } from "@/store/modules/race/race.constants";

const store = useStore();

const races = computed<Race[]>(() => store.getters["race/races"]);
const currentRace = computed<Race | null>(() => store.getters["race/currentRace"]);
const hasRaces = computed(() => store.getters["race/hasRaces"]);
const programLocked = computed<boolean>(() => store.getters["race/programLocked"]);

const generateDisabled = computed(() => {
  const status = currentRace.value?.status;
  return programLocked.value || status === "running" || status === "paused";
});

const resetDisabled = computed(() => !hasRaces.value);
const startPauseDisabled = computed(() => !currentRace.value);

const headerState = computed<AppRunState>(() => {
  return currentRace.value?.status ?? "ready";
});

const raceDetails = computed(() =>
  races.value.map((r) => ({
    title: `Race ${r.raceNo} - ${r.distance}m`,
    rows: r.lanes.map((l, i: number) => ({
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

const results = computed(() =>
  races.value
    .filter((r) => Boolean(r.result))
    .map((r) => ({
      raceNo: r.raceNo,
      distance: r.distance,
      rows: (r.result?.finishOrder ?? []).map((h, i) => ({
        position: i + 1,
        name: h.name + "test",
      })),
    }))
);

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
  store.dispatch("race/generateRaces", DEFAULT_RACE_COUNT);
}

function handleStart() {
  store.dispatch("race/startCurrentRace");
}

function handlePause() {
  store.dispatch("race/pauseCurrentRace");
}

function handleReset() {
  store.dispatch("race/reset");
}

function handleLaneFinished() {}

function handleRaceFinished(payload: RaceFinishedPayload) {
  store.dispatch("race/finishCurrentRace", payload);
}
</script>

<template>
  <div class="page">
    <AppLayout>
      <template #top>
        <AppHeader
          title="Horse Racing"
          :state="headerState"
          :generateDisabled="generateDisabled"
          :resetDisabled="resetDisabled"
          :startPauseDisabled="startPauseDisabled"
          @generate="handleGenerateRaces"
          @reset="handleReset"
          @start="handleStart"
          @pause="handlePause"
        />
      </template>

      <template #left>
        <TitledSection title="Horses" :subtitle="`Available: ${HORSES.length}`">
          <Table :columns="horsesColumns" :rows="horsesRows" borderStyle="inner">
            <template #cell="{ col, value }">
              <HorseIcon
                v-if="col.key === 'color'"
                :color="typeof value === 'string' ? value : undefined"
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
          :title="hasRaces ? `Race ${currentRace?.raceNo} - ${currentRace?.distance}m` : 'No Race'"
          subtitle="Race Track"
        >
          <div v-if="currentRace">
            <RaceCourse
              :lanes="
                currentRace.lanes.map((l: RaceLane) => ({
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
                    <Table :columns="raceDetailColumns" :rows="rd.rows" borderStyle="inner" />
                  </TitledSection>
                </div>
              </div>

              <div v-else class="empty-note">No races yet</div>
            </TitledSection>
          </div>

          <div class="right-col">
            <TitledSection title="Results" :subtitle="`Total: ${results.length}`">
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
                    <Table :columns="resultsColumns" :rows="result.rows" borderStyle="inner" />
                  </TitledSection>
                </div>
              </div>

              <div v-else class="empty-note">Results will appear here as races finish</div>
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
