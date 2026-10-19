<script setup lang="ts">
import ESkipLink from "../SkipLink/ESkipLink.vue";
import { useMessages } from "../../config.js";
import "../../styles/base.css";

withDefaults(
  defineProps<{
    /** The `id` of the main content, which the skip link targets. */
    mainId?: string;
    /** The sidebar landmark's name. Defaults to "Main". */
    sidebarLabel?: string;
  }>(),
  { mainId: "main" },
);

defineSlots<{
  /** An EAppHeader. */
  header?(): unknown;
  /** The side navigation, usually an ENavList. Two columns from 48rem wide; above the content below that. */
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
    max-width: 72rem;
    margin-inline: auto;
    padding: var(--e-space-6) var(--e-space-4);
  }

  @media (min-width: 48rem) {
    .e-shell--side .e-shell-body {
      grid-template-columns: 15rem minmax(0, 1fr);
    }
  }

  .e-shell-main {
    min-width: 0;
  }

  .e-shell-main:focus {
    outline: none;
  }

  @media print {
    .e-root,
    body {
      background: #fff;
      color: #000;
    }

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
