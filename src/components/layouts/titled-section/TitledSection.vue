<template>
  <section
    class="section"
    role="region"
    :aria-label="props.title"
    :class="{ borderless: props.borderless }"
  >
    <header class="header">
      <div class="titles">
        <div class="title">{{ props.title }}</div>
        <div v-if="props.subtitle" class="subtitle">
          {{ props.subtitle }}
        </div>
      </div>

      <!-- opsiyonel: sağ üst aksiyonlar -->
      <div v-if="$slots.actions" class="actions">
        <slot name="actions" />
      </div>
    </header>

    <div class="content">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { TitledSectionProps } from "./TitledSection.types";

const props = withDefaults(defineProps<TitledSectionProps>(), {
  borderless: false,
});

console.log("props", props);
</script>

<style scoped>
.section {
  width: 100%;
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.section.borderless {
  background: transparent;
  border: none;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  padding: 10px 12px;
  border-bottom: 1px solid var(--color-border);
  background: var(--table-header-background);
}

.section.borderless .header {
  background: var(--titled-section-header-bg);
}

.title {
  font-weight: 800;
  font-size: 14px;
}

.subtitle {
  margin-top: 2px;
  font-size: 12px;
  opacity: 0.75;
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
