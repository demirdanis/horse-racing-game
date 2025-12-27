<template>
  <div class="track-root" :class="rootClass">
    <div class="lane" aria-label="Lane number">
      <div class="lane__text">
        {{ props.laneNumber }}
      </div>
    </div>

    <div ref="trackEl" class="track" :style="trackStyle">
      <div
        ref="runnerEl"
        class="runner"
        :class="runnerClass"
        :style="runnerStyle"
      >
        <slot :progress="progress" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { TrackProps } from "./Track.types";

const props = withDefaults(defineProps<TrackProps>(), {
  state: "ready",
  durationSec: 5,
  direction: "ltr",
  laneNumber: 1,
});

const emit = defineEmits<{
  (e: "finished"): void;
}>();

const isRunning = computed(() => props.state === "running");
const isPaused = computed(() => props.state === "paused");

const trackEl = ref<HTMLElement | null>(null);
const runnerEl = ref<HTMLElement | null>(null);

const distancePx = ref(0);

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function computeDistance() {
  const track = trackEl.value;
  const runner = runnerEl.value;
  if (!track || !runner) return;

  const trackW = track.clientWidth;
  const runnerW = runner.getBoundingClientRect().width;

  const raw = trackW - runnerW;
  distancePx.value = Math.max(0, Math.floor(raw));
}

let ro: ResizeObserver | null = null;

onMounted(() => {
  computeDistance();

  if (typeof ResizeObserver === "undefined") return;

  ro = new ResizeObserver(() => computeDistance());
  if (trackEl.value) ro.observe(trackEl.value);
  if (runnerEl.value) ro.observe(runnerEl.value);
});

onBeforeUnmount(() => {
  if (ro) ro.disconnect();
  ro = null;
});

const trackStyle = computed(() => ({
  "--dur": `${Math.max(0.1, props.durationSec)}s`,
  "--distance": `${distancePx.value}px`,
}));

const runnerStyle = computed(() => {
  const style: any = {};

  if (distancePx.value > 0) {
    const translateDistance = distancePx.value * progress.value;
    if (props.direction === "ltr") {
      style.transform = `translateY(-50%) translateX(${translateDistance}px)`;
    } else {
      style.transform = `translateY(-50%) translateX(${-translateDistance}px)`;
    }
  }

  return style;
});

const rootClass = computed(() => ({
  "is-ltr": props.direction === "ltr",
  "is-rtl": props.direction === "rtl",
}));

const runnerClass = computed(() => ({
  "is-running": isRunning.value,
  "is-paused": isPaused.value,
  "is-finished": props.state === "finished",
  "dir-ltr": props.direction === "ltr",
  "dir-rtl": props.direction === "rtl",
}));

const progress = ref(0);
const lastState = ref<"ready" | "running" | "paused" | "finished">("ready");
let rafId: number | null = null;
let startTs: number | null = null;
let pausedProgress = 0;

function startProgressLoop() {
  stopProgressLoop();
  if (lastState.value !== "paused") {
    progress.value = 0;
    pausedProgress = 0;
  } else {
    pausedProgress = progress.value;
  }
  startTs = null;

  const step = (ts: number) => {
    if (!isRunning.value) return;
    if (startTs == null) startTs = ts;

    const elapsed = (ts - startTs) / 1000;
    const dur = Math.max(0.1, props.durationSec);

    progress.value = clamp(pausedProgress + elapsed / dur, 0, 1);

    if (progress.value < 1) {
      rafId = requestAnimationFrame(step);
    } else {
      emit("finished");
    }
  };

  rafId = requestAnimationFrame(step);
}

function stopProgressLoop() {
  if (rafId != null) cancelAnimationFrame(rafId);
  rafId = null;
}

watch(
  () => [props.state, props.direction, props.durationSec] as const,
  ([state]) => {
    computeDistance();

    if (state === "running") {
      if (lastState.value !== "paused") {
        progress.value = 0;
        pausedProgress = 0;
      }
      startProgressLoop();
    } else if (state === "paused") {
      stopProgressLoop();
    } else if (state === "ready") {
      stopProgressLoop();
      progress.value = 0;
    } else {
      stopProgressLoop();
    }

    lastState.value = state;
  },
  { immediate: true }
);
</script>

<style scoped>
.track-root {
  display: flex;
  align-items: stretch;
  width: 100%;
  border-bottom: 2px solid var(--color-border);
}

.track-root.is-rtl {
  flex-direction: row-reverse;
}

.lane {
  width: 24px;

  background: var(--color-panel);
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

.lane__text {
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--color-text);
  line-height: 1;
  white-space: nowrap;
}

.track-root.is-ltr .lane__text {
  transform: rotate(-90deg);
}

.track-root.is-rtl .lane__text {
  transform: rotate(90deg);
}

.track {
  position: relative;
  flex: 1;
  height: 64px;
  overflow: hidden;
  border-right: 8px solid var(--color-danger);
  background: var(--grass-color);
  backdrop-filter: blur(8px);

  padding: 0;
  box-sizing: border-box;
}

.track-root.is-ltr .finish {
  right: 10px;
}

.track-root.is-rtl .finish {
  left: 10px;
  border-right: none;
  border-left: 4px solid var(--color-danger);
}

.runner {
  position: absolute;
  top: 50%;
  will-change: transform;
}

.runner.dir-ltr {
  left: 0;
  transform: translateY(-50%) translateX(0);
}

.runner.dir-rtl {
  right: 0;
  transform: translateY(-50%) translateX(0);
}

.runner.is-finished.dir-ltr {
  transform: translateY(-50%) translateX(var(--distance));
}

.runner.is-finished.dir-rtl {
  transform: translateY(-50%) translateX(calc(var(--distance) * -1));
}
</style>
