import { ref, watch } from "vue";

import RaceCourse from "./RaceCourse.vue";
import { fn } from "storybook/test";

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
    onLaneFinished: fn(),
    onFinished: fn(),
  },
  render: (args: any) => ({
    components: { RaceCourse },
    setup() {
      const lanes = ref([
        { id: 1, laneNumber: 1, color: "#2D6CDF", condition: 85 },
        { id: 2, laneNumber: 2, color: "#FF8A00", condition: 65 },
        { id: 3, laneNumber: 3, color: "#00C48C", condition: 95 },
        { id: 4, laneNumber: 4, color: "#B455FF", condition: 55 },
      ]);

      const localState = ref<"ready" | "running" | "finished">(args.state);

      watch(
        () => args.state,
        (val) => {
          localState.value = val;
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

      function onLaneFinished(payload: {
        laneId: number | string;
        place: number;
        order: Array<number | string>;
      }) {
        console.log(
          `Lane ${payload.laneId} finished at place #${payload.place}`,
          payload.order
        );

        args.onLaneFinished?.(payload);
      }

      function onFinished(payload: { order: Array<number | string> }) {
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
