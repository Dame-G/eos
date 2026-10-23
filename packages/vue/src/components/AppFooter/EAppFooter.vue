<script setup lang="ts">
import "../../styles/base.css";
import "../AppHeader/shell.css";

defineSlots<{
  /** Small print, privacy and terms links, contact. The first item stays at the start of the row and the rest sit at the end. */
  default(): unknown;
}>();
</script>

<template>
  <footer class="e-appfooter">
    <div class="e-shell-inner">
      <slot />
    </div>
  </footer>
</template>

<style>
@layer e.page {
  .e-appfooter {
    padding: var(--e-gap-section) 0;
    border-top: var(--e-stroke-hair) solid var(--e-border);
    font: var(--e-weight-regular) var(--e-text-sm) / 1.5 var(--e-font-sans);
    color: var(--e-muted);
  }

  .e-appfooter .e-shell-inner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--e-gap-snug) var(--e-gap-section);
  }

  .e-appfooter .e-shell-inner > :first-child:not(:last-child) {
    margin-inline-end: auto;
  }

  .e-appfooter p {
    margin: 0;
  }
}
</style>
