import type {
  RaceCourseProps,
  RaceFinishedPayload,
  RaceLaneFinishedPayload,
} from "./RaceCourse.types";
import { ref, watch } from "vue";

import RaceCourse from "./RaceCourse.vue";
import type { RaceState } from "@/types/race-state";
import { fn } from "storybook/test";

type StoryArgs = Omit<RaceCourseProps, "lanes"> & {
  onLaneFinished?: (payload: RaceLaneFinishedPayload) => void;
  onFinished?: (payload: RaceFinishedPayload) => void;
};

export default {
  title: "Organisms/RaceCourse",
  component: RaceCourse,
  tags: ["autodocs"],
  argTypes: {
    state: {
      control: "select",
      options: ["ready", "running", "finished"],
    },
    direction: { control: "select", options: ["ltr", "rtl"] },
    onLaneFinished: { action: "laneFinished" },
    onFinished: { action: "finished" },
  },
  args: {
    state: "ready",
    direction: "ltr",
    distance: 1200,
    onLaneFinished: fn(),
    onFinished: fn(),
  },
  render: (args: StoryArgs) => ({
    components: { RaceCourse },
    setup() {
      const lanes = ref([
        { id: 1, laneNumber: 1, color: "#2D6CDF", condition: 85 },
        { id: 2, laneNumber: 2, color: "#FF8A00", condition: 65 },
        { id: 3, laneNumber: 3, color: "#00C48C", condition: 95 },
        { id: 4, laneNumber: 4, color: "#B455FF", condition: 55 },
      ]);

      const localState = ref<RaceState>(args.state ?? "ready");

      watch(
        () => args.state,
        (val) => {
          localState.value = val ?? "ready";
        },
        { immediate: true }
      );

      function start() {
        localState.value = "ready";
        requestAnimationFrame(() => {
          localState.value = "running";
        });
      }

      function reset() {
        localState.value = "ready";
      }

      function onLaneFinished(payload: RaceLaneFinishedPayload) {
        console.log(`Lane ${payload.laneId} finished at place #${payload.place}`, payload.order);

        args.onLaneFinished?.(payload);
      }

      function onFinished(payload: RaceFinishedPayload) {
        console.log("🏁 RACE FINISHED");
        console.log("Final order (1 → N):", payload.order);

        args.onFinished?.(payload);
        localState.value = "finished";
      }

      return {
        args,
        lanes,
        localState,
        start,
        reset,
        onLaneFinished,
        onFinished,
      };
    },
    template: `
      <div style="width: 900px;">
        <div style="display:flex; gap:8px; margin-bottom:12px;">
          <button
            style="padding:8px 12px; border:1px solid rgba(255,255,255,.15); background:rgba(255,255,255,.08); cursor:pointer;"
            @click="start"
          >
            Start
          </button>

          <button
            style="padding:8px 12px; border:1px solid rgba(255,255,255,.15); background:rgba(255,255,255,.08); cursor:pointer;"
            @click="reset"
          >
            Reset
          </button>

          <div style="margin-left:auto; opacity:.8; display:flex; align-items:center;">
            State: <b style="margin-left:6px;">{{ localState }}</b>
          </div>
        </div>

        <RaceCourse
          :lanes="lanes"
          :distance="args.distance"
          :state="localState"
          :direction="args.direction"
          @laneFinished="onLaneFinished"
          @finished="onFinished"
        />
      </div>
    `,
  }),
};

export const Default = {};

export const Running = {
  args: { state: "running" },
};

export const RTL = {
  args: { state: "running", direction: "rtl" },
};
