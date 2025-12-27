import { ref, watch } from "vue";

import AppHeader from "./AppHeader.vue";
import { fn } from "storybook/test";

export default {
  title: "Organisms/AppHeader",
  component: AppHeader,
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text" },
    state: {
      control: "select",
      options: ["ready", "running", "paused", "finished"],
    },
    generateDisabled: { control: "boolean" },
    startPauseDisabled: { control: "boolean" },
    onGenerate: { action: "generate" },
    onStart: { action: "start" },
    onPause: { action: "pause" },
  },
  args: {
    title: "Horse Racing",
    state: "ready",
    generateDisabled: false,
    startPauseDisabled: false,
    onGenerate: fn(),
    onStart: fn(),
    onPause: fn(),
  },
  render: (args: any) => ({
    components: { AppHeader },
    setup() {
      const state = ref(args.state);

      watch(
        () => args.state,
        (v) => (state.value = v),
        { immediate: true }
      );

      function onGenerate() {
        args.onGenerate?.();
      }

      function onStart() {
        args.onStart?.();
        state.value = "running";
      }

      function onPause() {
        args.onPause?.();
        state.value = "paused";
      }

      return { args, state, onGenerate, onStart, onPause };
    },
    template: `
      <div style="width: 900px;">
        <AppHeader
          :title="args.title"
          :state="state"
          :generateDisabled="args.generateDisabled"
          :startPauseDisabled="args.startPauseDisabled"
          @generate="onGenerate"
          @start="onStart"
          @pause="onPause"
        />
      </div>
    `,
  }),
};

export const Default = {};
export const Running = { args: { state: "running" } };
export const Paused = { args: { state: "paused" } };
