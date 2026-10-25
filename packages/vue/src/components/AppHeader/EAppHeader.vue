<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, watch, type Component } from "vue";
import EIconButton from "../IconButton/EIconButton.vue";
import { shellKey } from "../AppShell/shellContext.js";
import { useMessages } from "../../config.js";
import { linkTarget } from "../../composables/useLink.js";
import { useOverflow } from "../../composables/useOverflow.js";
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
  linkTarget(
    { href: props.brandHref ?? (props.brandTo === undefined ? "/" : undefined), to: props.brandTo },
    props.linkComponent,
  ),
);

function toggle() {
  if (shell?.drawer.value) shell.toggle();
  else navOpen.value = !navOpen.value;
}

/** The shell's menu button is drawn from the first render; CSS shows it only below 48rem, where the sidebar is a drawer. */
const shellButton = computed(() => !props.navToggle && !!shell?.toggleable.value);
const expanded = computed(() => (shell?.drawer.value ? shell.open.value : navOpen.value));

/*
 * The navigation row scrolls sideways when its content cannot wrap, so while it scrolls it is a tab stop: the keyboard
 * can then scroll it too.
 */
const navRow = ref<HTMLElement | null>(null);
const navScrolls = useOverflow(navRow, [], { children: true });

/*
 * `--e-header-height` on the page root: the height of a sticky header, and 0px for one that scrolls away, so a sticky
 * part of the page (a sidebar, a table head) can sit under it with `top: var(--e-header-height, 0px)`.
 */
const root = ref<HTMLElement | null>(null);
let sizes: ResizeObserver | undefined;
function publishHeight() {
  const height = props.sticky && root.value ? root.value.offsetHeight : 0;
  document.documentElement.style.setProperty("--e-header-height", `${height}px`);
}
onMounted(() => {
  publishHeight();
  if (typeof ResizeObserver === "undefined" || !root.value) return;
  sizes = new ResizeObserver(publishHeight);
  sizes.observe(root.value);
});
watch(() => props.sticky, publishHeight);
onBeforeUnmount(() => {
  sizes?.disconnect();
  document.documentElement.style.removeProperty("--e-header-height");
});
</script>

<template>
  <header ref="root" class="e-appheader" :class="sticky && 'e-appheader--sticky'">
    <div class="e-appheader-bar e-shell-inner">
      <EIconButton
        v-if="navToggle || shellButton"
        class="e-appheader-toggle"
        :class="shellButton && 'e-appheader-toggle--shell'"
        icon="menu"
        :label="t('menu')"
        :aria-expanded="expanded"
        :aria-controls="shell?.drawer.value && expanded ? shell.drawerId : undefined"
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
    <div v-if="$slots.default" ref="navRow" class="e-appheader-nav" :tabindex="navScrolls ? 0 : undefined">
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
    /* One above z-focus, in place of a header layer of its own. */
    --_z: calc(var(--e-z-focus) + 1);

    position: sticky;
    top: 0;
    z-index: var(--_z);
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

  /* A tab stop only while it scrolls; its ring is drawn inside, where the row does not clip it. */
  .e-appheader-nav:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: calc(-1 * var(--e-stroke-focus));
  }

  /* The shell's menu button, drawn from the first render, shows only where the sidebar is a drawer (the page-frame breakpoint). */
  @media (min-width: 48rem) {
    .e-appheader-toggle--shell {
      display: none;
    }
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
