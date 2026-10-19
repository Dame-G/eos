<script setup lang="ts">
import { computed, type Component } from "vue";
import ESurface from "../Surface/ESurface.vue";
import EText from "../Text/EText.vue";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** The card's title, and the text of the one link the whole card is. */
    title: string;
    /** Where the card goes. */
    href?: string;
    /** A router location, passed to `linkComponent` as `to` (for `RouterLink`). Used instead of `href`. */
    to?: unknown;
    /** A line under the title saying what is there. */
    description?: string;
    /** A small mono label above the title. */
    kicker?: string;
    /** The level of the title's heading element, 1 to 6. Pick the one that fits the page outline. */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Opens in a new tab. */
    external?: boolean;
    /** The element to render, `div` by default. Use `li` inside a list, such as `<EGrid as="ul">`. */
    as?: string;
    /** What renders the link: `"a"` by default, or `RouterLink` (or any component that takes `href` or `to` and a default slot). */
    linkComponent?: string | Component;
  }>(),
  { headingLevel: 3, as: "div", linkComponent: "a" },
);

defineSlots<{
  /** Anything more under the description, such as a stamp or a count. It must not hold links or buttons: the whole card is already one link. */
  default?(): unknown;
}>();

const linkAttrs = computed(() => ({
  ...(props.to !== undefined ? { to: props.to } : { href: props.href ?? "#" }),
  ...(props.external && { target: "_blank", rel: "noreferrer" }),
}));
</script>

<template>
  <ESurface :as="as" pad="sm" class="e-linkcard">
    <p v-if="kicker" class="e-kicker e-linkcard-kicker">{{ kicker }}</p>
    <component :is="`h${headingLevel}`" class="e-linkcard-title">
      <component :is="linkComponent" class="e-linkcard-link" v-bind="linkAttrs">{{ title }}</component>
    </component>
    <EText v-if="description" variant="small" muted>{{ description }}</EText>
    <slot />
  </ESurface>
</template>

<style>
@layer e.blocks {
  .e-linkcard {
    position: relative;
    display: grid;
    gap: var(--e-space-1);
    align-content: start;
    transition: box-shadow var(--e-duration-tap) var(--e-easing-out);
  }

  .e-linkcard:hover {
    box-shadow: 0 0 0 var(--e-stroke-edge) var(--e-border-strong);
  }

  .e-linkcard:has(.e-linkcard-link:focus-visible) {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: var(--e-focus-gap);
  }

  .e-linkcard-kicker,
  .e-linkcard-title {
    margin: 0;
  }

  .e-linkcard-title {
    font: 500 var(--e-text-md) / 1.3 var(--e-font-sans);
  }

  .e-linkcard-link {
    color: var(--e-primary);
    text-decoration: underline;
    text-decoration-thickness: var(--e-stroke-edge);
    text-underline-offset: 4px;
    text-decoration-color: var(--e-primary);
  }

  .e-linkcard-link::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: var(--e-radius-md);
  }

  .e-linkcard-link:focus-visible {
    outline: none;
  }

  .e-linkcard:hover .e-linkcard-link {
    color: var(--e-ink);
    text-decoration-color: var(--e-ink);
  }

  @media (prefers-reduced-motion: reduce) {
    .e-linkcard {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    .e-linkcard:hover {
      outline: var(--e-stroke-edge) solid Highlight;
    }
  }
}
</style>
