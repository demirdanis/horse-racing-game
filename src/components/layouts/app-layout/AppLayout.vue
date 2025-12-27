<template>
  <div class="app-layout">
    <header class="top">
      <slot name="top" />
    </header>

    <div class="body body--desktop">
      <aside class="left">
        <slot name="left" />
      </aside>

      <main class="center">
        <slot name="center" />
      </main>

      <aside class="right">
        <slot name="right" />
      </aside>
    </div>

    <div class="body body--mobile">
      <main class="center">
        <slot name="center" />
      </main>

      <aside class="left">
        <slot name="left" />
      </aside>

      <section class="right-mobile">
        <slot name="right" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 12px;
  gap: 12px;
  box-sizing: border-box;
}

.top {
  flex: 0 0 auto;
}

.body--desktop {
  flex: 1;
  display: grid;
  grid-template-columns: 200px 1fr 320px;
  gap: 12px;
  min-height: 0;
}

.left,
.center,
.right {
  min-height: 0;
  overflow: auto;
}

.body--mobile {
  display: none;
}

@media (max-width: 960px) {
  .body--desktop {
    display: none;
  }

  .body--mobile {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .body--mobile .left,
  .body--mobile .center,
  .body--mobile .right-mobile {
    overflow: visible;
  }
}
</style>
