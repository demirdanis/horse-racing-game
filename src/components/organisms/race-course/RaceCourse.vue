<template>
  <div class="course">
    <div v-for="lane in props.lanes" :key="lane.id" class="course__lane">
      <Track
        :laneNumber="lane.laneNumber"
        :state="props.state"
        :durationSec="calculateLaneDurationSec(lane.condition, props.distance)"
        :direction="props.direction"
        @finished="handleLaneFinished(lane.id)"
      >
        <template #default>
          <Horse
            :state="horseState(lane.id)"
            :condition="lane.condition"
            :color="lane.color ?? 'currentColor'"
          />
        </template>
      </Track>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import Track from "@/components/molecules/track/Track.vue";
import Horse from "@/components/atoms/horse/Horse.vue";
import type { RaceCourseEmits, RaceCourseProps } from "./RaceCourse.types";
import { calculateLaneDurationSec } from "@/store/modules/race/race.helpers";

const props = withDefaults(defineProps<RaceCourseProps>(), {
  state: "ready",
  direction: "ltr",
});

type LaneId = string | number;

const emit = defineEmits<RaceCourseEmits>();

const finishedMap = reactive<Record<LaneId, boolean>>({});

const finishedOrder = ref<LaneId[]>([]);

function resetFinished() {
  for (const k of Object.keys(finishedMap)) delete finishedMap[k as any];
  for (const lane of props.lanes) finishedMap[lane.id] = false;

  finishedOrder.value = [];
}

watch(
  () => [props.state, props.lanes] as const,
  () => {
    if (props.state === "ready" || props.state === "running") {
      resetFinished();
    }
  },
  { immediate: true, deep: true }
);

function handleLaneFinished(laneId: LaneId) {
  if (finishedMap[laneId]) return;

  finishedMap[laneId] = true;

  finishedOrder.value.push(laneId);
  const place = finishedOrder.value.length;

  emit("laneFinished", { laneId, place, order: [...finishedOrder.value] });

  const allDone = props.lanes.every((l) => finishedMap[l.id]);
  if (allDone) {
    emit("finished", { order: [...finishedOrder.value] });
  }
}

function horseState(laneId: LaneId) {
  if (finishedMap[laneId]) return "won";
  if (props.state === "running") return "running";
  return "ready";
}
</script>

<style scoped>
.course {
  display: flex;
  flex-direction: column;
}

.course__lane {
  width: 100%;
}
</style>
