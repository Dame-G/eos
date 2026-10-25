<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, ref, useSlots, watch } from "vue";
import EDrawer from "../Drawer/EDrawer.vue";
import ESkipLink from "../SkipLink/ESkipLink.vue";
import { shellKey } from "./shellContext.js";
import { useMessages } from "../../config.js";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** The `id` of the `main` element, which the skip link targets. It must be unique on the page. */
    mainId?: string;
    /** The name of the sidebar landmark. @default "Sidebar" */
    sidebarLabel?: string;
    /** Below 48rem the sidebar leaves the page and opens in a drawer from a menu button in the header. Turn it off to keep the sidebar above the content on a phone. @default true */
    navToggle?: boolean;
  }>(),
  { mainId: "main", navToggle: true },
);

defineSlots<{
  /** An EAppHeader. */
  header?(): unknown;
  /** The side navigation, such as an `ENavList`. It sits beside the content from 48rem wide, and below that it opens in a drawer. */
  sidebar?(): unknown;
  /** An EAppFooter. */
  footer?(): unknown;
  /** The page: start it with an EPageHeader. */
  default?(): unknown;
}>();

/** Whether the sidebar drawer is open. It only exists below 48rem. */
const navOpen = defineModel<boolean>("navOpen", { default: false });

const t = useMessages();

// The page-frame breakpoint (48rem) is a window query, not the shell's own width; the sidebar is in one place at a time.
const narrow = ref(false);
let query: MediaQueryList | undefined;
const sync = () => (narrow.value = !!query?.matches);
onMounted(() => {
  if (typeof matchMedia === "undefined") return;
  query = matchMedia("(max-width: 47.99rem)");
  sync();
  query.addEventListener("change", sync);
});
onBeforeUnmount(() => query?.removeEventListener("change", sync));

const drawer = computed(() => props.navToggle && narrow.value);
watch(drawer, (on) => on || (navOpen.value = false));

const slots = useSlots();
const toggleable = computed(() => props.navToggle && !!slots.sidebar);
const uid = useUid();
const drawerId = `${uid.value}-nav`;

provide(shellKey, { drawer, toggleable, drawerId, open: navOpen, toggle: () => (navOpen.value = !navOpen.value) });

/** Following a link in the drawer takes the person to a page, so the drawer gets out of the way. */
function closeOnLink(event: MouseEvent) {
  if ((event.target as Element).closest("a[href]")) navOpen.value = false;
}
</script>

<template>
  <div class="e-shell" :class="[$slots.sidebar && 'e-shell--side', toggleable && 'e-shell--toggle']">
    <ESkipLink :href="`#${mainId}`" />
    <slot name="header" />
    <div class="e-shell-body">
      <aside v-if="$slots.sidebar && !drawer" class="e-shell-side" :aria-label="sidebarLabel || t('sidebar')">
        <slot name="sidebar" />
      </aside>
      <main :id="mainId" class="e-shell-main">
        <slot />
      </main>
    </div>
    <slot name="footer" />
    <EDrawer
      v-if="$slots.sidebar && drawer"
      :id="drawerId"
      v-model:open="navOpen"
      side="start"
      :title="sidebarLabel || t('menu')"
      @click="closeOnLink"
    >
      <slot name="sidebar" />
    </EDrawer>
  </div>
</template>

<style>
@layer e.page {
  .e-shell {
    /* The width of the sidebar column. */
    --_side-w: 15rem;

    position: relative;
    overflow-x: clip;
    display: grid;
    grid-template-rows: auto 1fr auto;
    min-height: 100%;

    /* The ground beside the page column: a quiet near-neutral, the surface with a touch of ink, carrying only part of the brand tint, so the margins of a wide screen do not read as a coloured band. */
    background: color-mix(in oklab, var(--e-surface-tint) 40%, color-mix(in oklab, var(--e-surface), var(--e-ink) 6%));
  }

  /* The column is the page; the screen beside it, when the column does not fill it, is the ground. */
  .e-shell-body {
    box-sizing: border-box;
    background: var(--e-background);
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    position: relative;
    gap: var(--e-gap-section);
    width: 100%;
    max-width: var(--e-shell-width);
    margin-inline: auto;
    padding: var(--e-gap-section) var(--e-gutter);
  }

  /* Hairlines just outside both edges of the page column, from the header to the footer and not through them. When the column fills the screen they fall off it and nothing shows. They are borders, not shadows, so forced colors keeps them. */
  .e-shell-body::after {
    content: "";
    position: absolute;
    inset-block: 0;
    inset-inline: calc(-1 * var(--e-stroke-hair));
    border-inline: var(--e-stroke-hair) solid var(--e-shell-rail);
    pointer-events: none;
  }

  /* A viewport query on purpose: the shell is the page frame, so its two-column layout follows the window (48rem, the page-frame breakpoint), not a container. */
  @media (min-width: 48rem) {
    .e-shell--side .e-shell-body {
      grid-template-columns: var(--_side-w) minmax(0, 1fr);
    }
  }

  /* On a phone the sidebar goes into a drawer once the page runs. The server renders it in the page, so CSS hides it until then and the content does not jump up when it goes. */
  @media (max-width: 47.99rem) {
    .e-shell--toggle .e-shell-side {
      display: none;
    }
  }

  .e-shell-main {
    min-width: 0;
  }

  .e-shell-main:focus:not(:focus-visible) {
    outline: none;
  }

  @media print {
    .e-shell-body::after,
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
