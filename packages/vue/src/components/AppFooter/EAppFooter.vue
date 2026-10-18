<script setup lang="ts">
import "../../styles/base.css";

defineSlots<{
  /** Small print, privacy and terms links, contact. */
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
    padding: var(--e-space-6) var(--e-space-4);
    border-top: var(--e-stroke-hair) solid var(--e-border);
    font: 400 var(--e-text-sm) / 1.5 var(--e-font-sans);
    color: var(--e-muted);
  }

  /* the page's one column */
  .e-shell-inner {
    width: 100%;
    max-width: 72rem;
    margin-inline: auto;
    padding-inline: var(--e-space-4);
  }
}
</style>
