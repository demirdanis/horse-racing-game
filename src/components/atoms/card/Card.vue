<template>
  <div class="card">
    <slot />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.card {
  background: var(--color-panel);
  color: var(--color-text);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
</style>
