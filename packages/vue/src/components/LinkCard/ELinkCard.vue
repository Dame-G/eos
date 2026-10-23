<script setup lang="ts">
import { computed, type Component } from "vue";
import ESurface from "../Surface/ESurface.vue";
import { useMessages } from "../../config.js";
import type { ElementTag, Size } from "../../composables/useSize.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** The link text, at the top of the card. Say where it goes: it is the whole card's name for screen readers. */
    title: string;
    /** Where the card goes. Give `href` or, with a `linkComponent`, `to`. */
    href?: string;
    /** A router location, passed to `linkComponent` as `to` (for `RouterLink`). Use it instead of `href`. */
    to?: unknown;
    /** What renders the link: `RouterLink` or any component that takes `href` or `to` and a default slot. */
    linkComponent?: string | Component;
    /** Opens in a new tab (`target="_blank"`, `rel="noreferrer"`) and tells screen readers so. */
    external?: boolean;
    /** The element of the card: `li` inside a list (`EGrid as="ul"`), `article` for a block of its own. */
    as?: ElementTag;
    /** The padding: `sm` for a dense index, `md` or `lg`. */
    size?: Extract<Size, "sm" | "md" | "lg">;
  }>(),
  { linkComponent: "a", as: "div", size: "md" },
);

defineSlots<{
  /** A line or two under the title, such as a summary. Keep links and buttons out: the whole card is already one. */
  default?(): unknown;
}>();

const t = useMessages();
const target = computed(() => (props.to !== undefined ? { to: props.to } : { href: props.href }));
</script>

<template>
  <ESurface :as="as" flush class="e-linkcard" :class="`e-linkcard--${size}`">
    <component
      :is="linkComponent"
      class="e-linkcard-link"
      v-bind="target"
      :target="external ? '_blank' : undefined"
      :rel="external ? 'noreferrer' : undefined"
    >
      {{ title }}<span v-if="external" class="e-sr"> {{ t("opensNewTab") }}</span>
    </component>
    <div v-if="$slots.default" class="e-linkcard-body"><slot /></div>
  </ESurface>
</template>

<style>
@layer e.blocks {
  /* One real border, not the surface's shadow ring: hover recolours it and never thickens it, and the padding gives back what it takes. The link's ::after covers the card, so the whole card is the click target of one link. */
  .e-surface.e-linkcard {
    --_pad-block: var(--e-pad-card);
    --_pad-inline: var(--e-pad-card);

    position: relative;
    display: grid;
    align-content: start;
    gap: var(--e-gap-tight);
    padding: calc(var(--_pad-block) - var(--e-stroke-edge)) calc(var(--_pad-inline) - var(--e-stroke-edge));
    border: var(--e-stroke-edge) solid var(--e-border);
    box-shadow: none;
    transition: var(--e-transition-state);
  }

  .e-surface.e-linkcard--sm {
    --_pad-block: var(--e-gap-base);
  }

  .e-surface.e-linkcard--lg {
    --_pad-block: var(--e-pad-panel);
    --_pad-inline: var(--e-pad-panel);
  }

  .e-surface.e-linkcard:hover {
    border-color: var(--e-wash-ring);
    background-image: linear-gradient(var(--e-wash-hover) 0 0); /* the wash over the card's own surface */
  }

  .e-surface.e-linkcard:has(.e-linkcard-link:active) {
    border-color: var(--e-ink);
  }

  .e-surface.e-linkcard:has(.e-linkcard-link:focus-visible) {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: var(--e-stroke-focus);
  }

  .e-linkcard-link {
    color: var(--e-text-link);
    font: var(--e-weight-medium) var(--e-text-md) / var(--e-leading-snug) var(--e-font-sans);
    text-decoration: underline;
    text-decoration-thickness: var(--e-stroke-edge);
    text-underline-offset: var(--e-gap-tight);
  }

  .e-linkcard-link::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: max(0px, calc(var(--e-radius-md) - var(--e-stroke-edge)));
  }

  .e-linkcard-link:focus-visible {
    outline: none;
  }

  .e-linkcard:hover .e-linkcard-link {
    color: var(--e-ink);
  }

  .e-linkcard-body {
    color: var(--e-muted);
    font: var(--e-type-small);
  }

  @media (forced-colors: active) {
    .e-surface.e-linkcard {
      border-color: CanvasText;
    }

    .e-surface.e-linkcard:hover {
      border-color: Highlight;
    }

    .e-surface.e-linkcard:has(.e-linkcard-link:focus-visible) {
      outline-color: Highlight;
    }
  }
}
</style>
