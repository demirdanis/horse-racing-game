<template>
  <button class="btn" :class="variant" :disabled="disabled" @click="handleClick">
    <slot />
  </button>
</template>

<script setup lang="ts">
import type { ButtonProps } from "./Button.types";

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: "primary",
  disabled: false,
});

const emit = defineEmits<{
  (e: "click"): void;
}>();

function handleClick() {
  if (!props.disabled) {
    emit("click");
  }
}
</script>

<style scoped>
.btn {
  padding: 10px 16px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition:
    transform 120ms ease,
    opacity 120ms ease;
}

.primary {
  background: var(--color-primary);
  color: white;
}

.secondary {
  background: var(--color-secondary);
  color: white;
}

.btn:not(:disabled):hover {
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
