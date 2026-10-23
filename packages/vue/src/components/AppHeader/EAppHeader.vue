<script setup lang="ts">
import { inject } from "vue";
import EIconButton from "../IconButton/EIconButton.vue";
import { shellKey } from "../AppShell/shellContext.js";
import { useMessages } from "../../config.js";
import "../../styles/base.css";
import "./shell.css";

defineProps<{
  /** Pins the header to the top while the page scrolls. */
  sticky?: boolean;
  /** Shows a menu button before the logo, for a navigation that opens on demand. Inside an `EAppShell` it shows by itself while the sidebar is in a drawer, so you do not set it. */
  navToggle?: boolean;
}>();

defineSlots<{
  /** The logo or the name. Link it to the home page. */
  logo?(): unknown;
  /** The person's menu or a sign-in Button, at the end of the bar. */
  actions?(): unknown;
  /** The navigation, such as an `ENavList`. It sits on its own row. A list of links wraps when it does not fit, and anything that cannot wrap scrolls sideways. */
  default?(): unknown;
}>();

/** Whether the navigation the menu button opens is open. It is the `aria-expanded` of the button. Inside an `EAppShell` the shell keeps it. */
const navOpen = defineModel<boolean>("navOpen", { default: false });

const t = useMessages();
const shell = inject(shellKey, null);

function toggle() {
  if (shell?.drawer.value) shell.toggle();
  else navOpen.value = !navOpen.value;
}
</script>

<template>
  <header class="e-appheader" :class="sticky && 'e-appheader--sticky'">
    <div class="e-appheader-bar e-shell-inner">
      <EIconButton
        v-if="navToggle || shell?.drawer.value"
        class="e-appheader-toggle"
        icon="menu"
        :label="t('menu')"
        :aria-expanded="shell?.drawer.value ? shell.open.value : navOpen"
        @click="toggle"
      />
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
    gap: var(--e-gap-loose);
    min-height: calc(var(--e-control-height) + var(--e-gap-loose));
  }

  .e-appheader-logo {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    font: var(--e-type-h3);
    font-weight: var(--e-weight-strong);
  }

  .e-appheader-logo a {
    color: var(--e-ink);
    text-decoration: none;
  }

  .e-appheader-logo a:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: var(--e-stroke-focus);
    border-radius: var(--e-radius-sm);
  }

  .e-appheader-actions {
    display: flex;
    align-items: center;
    gap: var(--e-gap-snug);
  }

  .e-appheader-nav {
    border-top: var(--e-stroke-hair) solid var(--e-border);
    overflow-x: auto;
    padding-block: var(--e-gap-snug);
  }

  @media print {
    .e-appheader-nav,
    .e-appheader-toggle {
      display: none;
    }
  }

  .e-appheader-nav .e-nav {
    margin-inline-start: calc(-1 * var(--e-pad-control-sm));
  }

  .e-appheader-nav .e-nav > ul {
    display: flex;
    flex-wrap: wrap;
    gap: var(--e-gap-tight);
  }
}
</style>
