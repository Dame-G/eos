<script setup lang="ts">
import { computed, inject, type Component } from "vue";
import EIconButton from "../IconButton/EIconButton.vue";
import { shellKey } from "../AppShell/shellContext.js";
import { useMessages } from "../../config.js";
import "../../styles/base.css";
import "./shell.css";

const props = withDefaults(
  defineProps<{
    /** Pins the header to the top while the page scrolls. It stays above anything raised in the page (a sticky table head, a selected tab) and under every dialog, menu and toast. */
    sticky?: boolean;
    /** Shows a menu button before the logo, for a navigation that opens on demand. Inside an `EAppShell` it shows by itself while the sidebar is in a drawer, so you do not set it. */
    navToggle?: boolean;
    /** The name of the site or app, drawn as a styled link to the home page at the start of the bar. The `brand` slot replaces the text (a logo). */
    brand?: string;
    /** Where the brand link goes. @default "/" */
    brandHref?: string;
    /** A router location for the brand link, passed to `linkComponent` as `to`. Use it instead of `brandHref`. */
    brandTo?: unknown;
    /** The brand link's name for screen readers, when the brand is a picture or needs more words ("Acme, home"). */
    brandLabel?: string;
    /** What renders the brand link: `RouterLink` or any component that takes `href` or `to` and a default slot. */
    linkComponent?: string | Component;
  }>(),
  { linkComponent: "a" },
);

defineSlots<{
  /** The brand link's content, such as a logo, in place of the `brand` text. Inside the styled home link. */
  brand?(): unknown;
  /** Anything at the start of the bar, after the brand link: a search button, or your own logo link when you do not use `brand`. */
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
const brandTarget = computed(() =>
  props.brandTo !== undefined ? { to: props.brandTo } : { href: props.brandHref ?? "/" },
);

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
      <div class="e-appheader-logo">
        <component
          :is="linkComponent"
          v-if="brand !== undefined || $slots.brand"
          class="e-appheader-brand"
          v-bind="brandTarget"
          :aria-label="brandLabel || undefined"
        >
          <slot name="brand">{{ brand }}</slot>
        </component>
        <slot name="logo" />
      </div>
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

  /* Above everything the page raises in its own flow (z-raised, z-sticky, z-focus: a sticky table head, a selected tab, a focused control), which would otherwise paint over it as it scrolls under, and below every dialog, menu and toast. */
  .e-appheader--sticky {
    position: sticky;
    top: 0;
    z-index: calc(var(--e-z-focus) + 1);
  }

  .e-appheader-bar {
    display: flex;
    align-items: center;
    min-height: calc(var(--e-control-height) + var(--e-gap-loose));
  }

  .e-appheader-logo {
    display: flex;
    align-items: center;
    gap: var(--e-gap-loose);
    flex: 1;
    min-width: 0;
    font: var(--e-type-h3);
    font-weight: var(--e-weight-strong);
  }

  .e-appheader-logo a {
    color: var(--e-ink);
    text-decoration: none;
  }

  /* The home link: a tap target of its own, in the ink colour, that takes the primary colour on hover. */
  .e-appheader-brand {
    display: inline-flex;
    align-items: center;
    flex: none;
    min-height: var(--e-tap);
    border-radius: var(--e-radius-sm);
    transition: var(--e-transition-state);
  }

  .e-appheader-brand:not(:last-child) {
    margin-inline-end: var(--e-gap-loose);
  }

  .e-appheader-logo a.e-appheader-brand:hover {
    color: var(--e-primary);
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
