<template>
  <div
    class="horse"
    :class="stateClass"
    :style="{
      '--horse-color': colorComputed,
      color: 'var(--horse-color)',
      '--gallop-duration': `${gallopDuration}ms`,
      '--gallop-amp': gallopAmp, // ✅ eklendi
    }"
    role="img"
    aria-label="Horse"
  >
    <div
      class="horse__icon"
      :class="{ 'is-won': state === 'won', 'is-running': state === 'running' }"
    >
      <HorseIcon class="horse__svg" :color="colorComputed" :size="48" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import HorseIcon from "@/icons/HorseIcon.vue";
import type { HorseProps } from "./Horse.types";

const props = withDefaults(defineProps<HorseProps>(), {
  state: "ready",
  condition: 50,
  color: "var(--color-primary)",
});

const colorComputed = computed(() => {
  if (!props.color) return "var(--color-danger)";
  return props.color;
});

const conditionClamped = computed(() => {
  return Math.max(1, Math.min(100, props.condition ?? 50));
});

// hızlılık: condition yüksek => ms daha düşük
const gallopDuration = computed(() => {
  const slowest = 1500;
  const fastest = 600;
  const t = (conditionClamped.value - 1) / 99; // 0..1
  return Math.round(slowest + (fastest - slowest) * t);
});

// amplitude: condition yüksek => daha büyük hareket
const gallopAmp = computed(() => {
  // 1 => 0.35, 100 => 1.0
  const t = (conditionClamped.value - 1) / 99; // 0..1
  const min = 0.35;
  const max = 1.0;
  return (min + (max - min) * t).toFixed(3);
});

const stateClass = computed(() => ({
  "is-ready": props.state === "ready",
  "is-running": props.state === "running",
  "is-won": props.state === "won",
}));
</script>

<style scoped>
.horse {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 0 4px var(--color-shadow));
}

.horse__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease-in-out;
  will-change: transform;
}

.horse.is-running .horse__icon {
  transform-origin: 70% 55%;
  animation: gallop var(--gallop-duration) infinite ease-in-out;
}

@keyframes gallop {
  0% {
    transform: rotateZ(0deg) translateY(0);
  }
  25% {
    transform: rotateZ(calc(18deg * var(--gallop-amp)))
      translateY(calc(-2px * var(--gallop-amp)));
  }
  50% {
    transform: rotateZ(0deg) translateY(0);
  }
  75% {
    transform: rotateZ(calc(-18deg * var(--gallop-amp)))
      translateY(calc(2px * var(--gallop-amp)));
  }
  100% {
    transform: rotateZ(0deg) translateY(0);
  }
}

.horse__icon.is-won {
  animation: won-glow 0.6s infinite;
}

@keyframes won-glow {
  0% {
    filter: drop-shadow(0 0 4px var(--horse-won-shadow-1));
  }
  50% {
    filter: drop-shadow(0 0 12px var(--horse-won-shadow-2));
  }
  100% {
    filter: drop-shadow(0 0 4px var(--horse-won-shadow-3));
  }
}
</style>
