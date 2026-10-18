<script setup lang="ts">
import "../../styles/base.css";

defineProps<{
  /** Pins the header to the top while the page scrolls. */
  sticky?: boolean;
}>();

defineSlots<{
  /** The logo or the name, usually a link to the home page. */
  logo?(): unknown;
  /** The person's menu or a sign-in Button, at the end of the bar. */
  actions?(): unknown;
  /** The navigation, usually an ENavList. It sits on its own row and scrolls sideways when it does not fit. */
  default?(): unknown;
}>();
</script>

<template>
  <header class="e-appheader" :class="sticky && 'e-appheader--sticky'">
    <div class="e-appheader-bar e-shell-inner">
      <div class="e-appheader-logo"><slot name="logo" /></div>
      <div v-if="$slots.actions" class="e-appheader-actions"><slot name="actions" /></div>
    </div>
    <div v-if="$slots.default" class="e-appheader-nav">
      <div class="e-shell-inner"><slot /></div>
    </div>
  </header>
</template>

<style>
@layer e.page {
  .e-appheader {
    background: var(--e-surface);
    border-bottom: var(--e-stroke-hair) solid var(--e-border);
  }

  .e-appheader--sticky {
    position: sticky;
    top: 0;
    z-index: var(--e-z-sticky);
  }

  .e-appheader-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--e-space-4);
    min-height: 64px;
    padding: 0 var(--e-space-4);
  }

  .e-appheader-logo {
    display: flex;
    align-items: center;
    min-width: 0;
    font: 600 var(--e-text-xl) / 1.2 var(--e-font-sans);
  }

  .e-appheader-logo a {
    color: var(--e-ink);
    text-decoration: none;
  }

  .e-appheader-logo a:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: var(--e-focus-gap);
    border-radius: var(--e-radius-sm);
  }

  .e-appheader-actions {
    display: flex;
    align-items: center;
    gap: var(--e-space-2);
  }

  .e-appheader-nav {
    padding: 0 var(--e-space-4);
    border-top: var(--e-stroke-hair) solid var(--e-border);
    overflow-x: auto;
    padding-block: var(--e-space-2);
    padding-inline: 0;
  }

  @media print {
    .e-appheader-nav {
      display: none;
    }
  }

  /* the first label lines up with the logo, not the edge of its row */
  .e-appheader-nav .e-nav {
    margin-inline-start: calc(-1 * var(--e-space-3));
  }

  .e-appheader-nav .e-nav > ul {
    display: flex;
    flex-wrap: wrap;
    gap: var(--e-space-1);
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
