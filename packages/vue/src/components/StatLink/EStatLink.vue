<script setup lang="ts">
import { computed, type Component } from "vue";
import { useLocale } from "../../composables/useLocale.js";
import { hasLinkTarget, linkTarget } from "../../composables/useLink.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** What the figure belongs to, such as "You" or a product name. It starts the link's name. */
    label: string;
    /** The one figure, set in mono after the label. A number is formatted for the locale; a string is shown as given, such as "v14". */
    value?: number | string;
    /** Where the link goes. Give `href` or, with a `linkComponent`, `to`. With neither it is text, not a link. */
    href?: string;
    /** A router location, passed to `linkComponent` as `to` (for `RouterLink`). Use it instead of `href`. Without a `linkComponent`, a string `to` is the `href`. */
    to?: unknown;
    /** What renders the link: `RouterLink` or any component that takes `href` or `to` and a default slot. It receives `to` or `href` and the class `e-statlink`. */
    linkComponent?: string | Component;
    /** Marks it as the page you are on (`aria-current="page"`), drawn as the current place. */
    current?: boolean;
  }>(),
  { linkComponent: "a" },
);

const loc = useLocale();
const shown = computed(() => (typeof props.value === "number" ? loc.formatNumber(props.value) : props.value));
const linked = computed(() => hasLinkTarget(props));
const target = computed(() => linkTarget(props, props.linkComponent));
</script>

<template>
  <component
    :is="linked ? linkComponent : 'span'"
    class="e-statlink"
    :class="!linked && 'e-statlink--static'"
    v-bind="linked ? target : {}"
    :aria-current="linked && current ? 'page' : undefined"
  >
    <span class="e-statlink-text">
      <span class="e-statlink-label">{{ label }}</span
      ><template v-if="shown !== undefined && shown !== ''"
        >{{ " " }}<span class="e-statlink-value">{{ shown }}</span></template
      >
    </span>
  </component>
</template>

<style>
@layer e.primitives {
  /* A label and its figure, one tap target. A row-like item with its own edge, transparent at rest, so the current place and the hover recolour it without the box changing size (the nav item's recipe). */
  .e-statlink {
    display: inline-flex;
    align-items: center;
    box-sizing: border-box;
    min-height: var(--e-tap);
    padding-block: 0;
    padding-inline: calc(var(--e-pad-control-sm) - var(--e-stroke-edge));
    border: var(--e-stroke-edge) solid transparent;
    border-radius: var(--e-radius-md);
    background-clip: padding-box;
    color: var(--e-ink);
    font: var(--e-weight-medium) var(--e-text-sm) / var(--e-leading-tight) var(--e-font-sans);
    text-decoration: none;
    white-space: nowrap;
    transition: var(--e-transition-state);
  }

  /* The text sits in the middle of the box. Inside it the label and the figure are one line of text, so the figure shares the label's baseline and the space between them is part of the link's name. */
  .e-statlink-text {
    display: block;
  }

  .e-statlink-value {
    color: var(--e-muted);
    font: var(--e-type-numeral);
    font-variant-numeric: tabular-nums;
  }

  .e-statlink[aria-current="page"] {
    border-color: var(--e-primary);
    background-color: var(--e-primary-soft);
    color: var(--e-primary);
  }

  .e-statlink[aria-current="page"] .e-statlink-value {
    color: inherit;
  }

  .e-statlink:not([aria-current="page"], .e-statlink--static):hover {
    border-color: var(--e-wash-ring);
    background-color: var(--e-wash-hover);
  }

  .e-statlink:not([aria-current="page"], .e-statlink--static):active {
    border-color: var(--e-ink);
    background-color: var(--e-wash-press);
  }

  @media (forced-colors: active) {
    .e-statlink[aria-current="page"] {
      border-color: Highlight;
    }
  }
}
</style>
