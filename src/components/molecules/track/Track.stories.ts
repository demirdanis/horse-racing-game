import { ref, watch } from "vue";

import Horse from "@/components/atoms/horse/Horse.vue";
import Track from "./Track.vue";
import { fn } from "storybook/test";

export default {
  title: "Molecules/Track",
  component: Track,
  tags: ["autodocs"],
  argTypes: {
    state: { control: "select", options: ["ready", "running", "finished"] },
    durationSec: {
      control: { type: "number", min: 0.5, max: 20, step: 0.5 },
    },
    direction: { control: "select", options: ["ltr", "rtl"] },
    laneNumber: { control: "text" },
    onFinished: { action: "finished" },
  },
  args: {
    state: "ready",
    durationSec: 5,
    direction: "ltr",
    laneNumber: 1,
    onFinished: fn(),
  },
  render: (args: any) => ({
    components: { Track, Horse },
    setup() {
      const trackState = ref<"ready" | "running" | "finished">(args.state);
      const horseState = ref<"ready" | "running" | "won">("ready");

      watch(
        () => args.state,
        (val) => {
          trackState.value = val;

          if (val === "running") horseState.value = "running";
          else if (val === "finished") horseState.value = "won";
          else horseState.value = "ready";
        },
        { immediate: true }
      );

      function onFinished() {
        args.onFinished?.();
        trackState.value = "finished";
        horseState.value = "won";
      }

      return { args, trackState, horseState, onFinished };
    },
    template: `
      <div style="width: 800px;">
        <Track
          :state="trackState"
          :durationSec="args.durationSec"
          :direction="args.direction"
          :laneNumber="args.laneNumber"
          @finished="onFinished"
        >
          <template #default>
            <Horse :state="horseState" :condition="85" color="#2D6CDF" />
          </template>
        </Track>
      </div>
    `,
  }),
};

export const Default = {};
export const Running = { args: { state: "running" } };
export const Finished = { args: { state: "finished" } };
export const RTL = { args: { state: "running", direction: "rtl" } };
