<script setup lang="ts">
import ESkipLink from "../SkipLink/ESkipLink.vue";
import { useMessages } from "../../config.js";
import "../../styles/base.css";

withDefaults(
  defineProps<{
    /** The `id` of the `main` element, which the skip link targets. It must be unique on the page. */
    mainId?: string;
    /** The name of the sidebar landmark. @default "Main" */
    sidebarLabel?: string;
  }>(),
  { mainId: "main" },
);

defineSlots<{
  /** An EAppHeader. */
  header?(): unknown;
  /** The side navigation, such as an `ENavList`. It sits beside the content from 48rem wide and above the content below that. */
  sidebar?(): unknown;
  /** An EAppFooter. */
  footer?(): unknown;
  /** The page: start it with an EPageHeader. */
  default?(): unknown;
}>();

const t = useMessages();
</script>

<template>
  <div class="e-shell" :class="$slots.sidebar && 'e-shell--side'">
    <ESkipLink :href="`#${mainId}`" />
    <slot name="header" />
    <div class="e-shell-body">
      <aside v-if="$slots.sidebar" class="e-shell-side" :aria-label="sidebarLabel || t('mainNav')">
        <slot name="sidebar" />
      </aside>
      <main :id="mainId" class="e-shell-main" tabindex="-1">
        <slot />
      </main>
    </div>
    <slot name="footer" />
  </div>
</template>

<style>
@layer e.page {
  .e-shell {
    position: relative;
    overflow-x: clip;
    display: grid;
    grid-template-rows: auto 1fr auto;
    min-height: 100%;
    background: var(--e-background);
  }

  .e-shell-body {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--e-space-6);
    width: 100%;
    max-width: var(--e-shell-width, 72rem);
    margin-inline: auto;
    padding: var(--e-space-6) var(--e-space-4);
  }

  /* Hairlines just outside both edges of the page column, drawn over the header and footer. When the column fills the screen they fall off it and nothing shows. */
  .e-shell::after {
    content: "";
    position: absolute;
    inset-block: 0;
    inset-inline: 0;
    z-index: var(--e-z-sticky);
    width: min(100%, var(--e-shell-width, 72rem));
    margin-inline: auto;
    box-shadow:
      calc(-1 * var(--e-stroke-hair)) 0 0 0 var(--e-shell-rail, var(--e-border)),
      var(--e-stroke-hair) 0 0 0 var(--e-shell-rail, var(--e-border));
    pointer-events: none;
  }

  /* A viewport query on purpose: the shell is the page frame, so its two-column layout follows the window (48rem, the page-frame breakpoint), not a container. */
  @media (min-width: 48rem) {
    .e-shell--side .e-shell-body {
      grid-template-columns: 15rem minmax(0, 1fr);
    }
  }

  .e-shell-main {
    min-width: 0;
  }

  .e-shell-main:focus:not(:focus-visible) {
    outline: none;
  }

  .e-shell-main:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: calc(-1 * var(--e-stroke-focus));
  }

  @media print {
    .e-shell::after,
    .e-shell-side {
      display: none;
    }

    .e-shell-body {
      max-width: none;
      padding: 0;
    }
  }
}
</style>
