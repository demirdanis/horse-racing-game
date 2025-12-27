<template>
  <header class="header">
    <div class="left">
      <div class="title">{{ props.title }}</div>
    </div>

    <div class="right">
      <Button
        variant="secondary"
        :disabled="props.generateDisabled"
        @click="onGenerate"
      >
        Generate Program
      </Button>

      <Button
        variant="primary"
        :disabled="props.startPauseDisabled"
        @click="onStartPause"
      >
        {{ startPauseLabel }}
      </Button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { AppHeaderProps } from "./AppHeader.types";
import Button from "../../atoms/button/Button.vue";

const props = withDefaults(defineProps<AppHeaderProps>(), {
  title: "Race App",
  state: "ready",
  generateDisabled: false,
  startPauseDisabled: false,
});

const emit = defineEmits<{
  (e: "generate"): void;
  (e: "start"): void;
  (e: "pause"): void;
}>();

const startPauseLabel = computed(() => {
  return props.state === "running" ? "Pause" : "Start";
});

function onGenerate() {
  if (!props.generateDisabled) emit("generate");
}

function onStartPause() {
  if (props.startPauseDisabled) return;

  if (props.state === "running") emit("pause");
  else emit("start");
}
</script>

<style scoped>
.header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--color-border);
  backdrop-filter: blur(8px);
}

.title {
  font-weight: 900;
  font-size: 16px;
  letter-spacing: 0.2px;
}

.right {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>
