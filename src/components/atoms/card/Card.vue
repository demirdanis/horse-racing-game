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
  padding: var(--space-md);
  border: 1px solid var(--color-border);
}
</style>
