<script setup lang="ts">
import { computed, type Component } from "vue";
import EIcon from "../Icon/EIcon.vue";
import { useMessages } from "../../config.js";
import { linkTarget } from "../../composables/useLink.js";
import type { IconProp } from "../../icons/types.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** Where the link goes. Give `href` or, with a `linkComponent`, `to`. */
    href?: string;
    /** A router location, passed to `linkComponent` as `to` (for `RouterLink`). Use it instead of `href`. Without a `linkComponent`, a string `to` is the `href`. */
    to?: unknown;
    /** What renders the link: `RouterLink` or any component that takes `href` or `to` and a default slot. It receives `to` or `href` and the class `e-link`. */
    linkComponent?: string | Component;
    /** Opens in a new tab (`target="_blank"`, `rel="noreferrer"`) and tells screen readers so. */
    external?: boolean;
    /** An icon before the text: a built-in name, a name from your icon set, or an icon component. It is hidden from screen readers, so the text names the link. */
    icon?: IconProp;
  }>(),
  { linkComponent: "a" },
);

defineSlots<{
  /** The link text: say where it goes. */
  default(): unknown;
}>();

const t = useMessages();
const target = computed(() => linkTarget(props, props.linkComponent));
</script>

<template>
  <component
    :is="linkComponent"
    class="e-link"
    :class="icon && 'e-link--icon'"
    v-bind="target"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noreferrer' : undefined"
  >
    <EIcon v-if="icon" :name="icon" />
    <!-- With an icon the underline belongs to the text, so it does not run under the icon or its gap. -->
    <span v-if="icon" class="e-link-text"><slot /></span>
    <slot v-else />
    <span v-if="external" class="e-sr"> {{ t("opensNewTab") }}</span>
  </component>
</template>

<style>
@layer e.primitives {
  .e-link {
    color: var(--e-link);
    font-weight: var(--e-weight-medium);
    text-decoration: underline;
    text-decoration-thickness: var(--e-stroke-edge);
    text-underline-offset: var(--e-stroke-underline-offset);
    text-decoration-color: currentcolor;
    border-radius: var(--e-radius-sm);
    transition: var(--e-transition-state);
  }

  .e-link:is(:hover, :active) {
    color: var(--e-ink);
  }

  .e-link--icon {
    display: inline-flex;
    align-items: center;
    gap: var(--e-gap-tight);
    text-decoration: none;
  }

  .e-link--icon .e-link-text {
    text-decoration: underline;
    text-decoration-thickness: var(--e-stroke-edge);
    text-underline-offset: var(--e-stroke-underline-offset);
  }

  .e-link--icon .e-icon {
    width: 1.25em;
    height: 1.25em;
  }

  /* On paper a link to another site prints its address after the text, so the reader can still follow it. A path on this site, an in-page anchor, a mail or phone link say nothing without the page around them, so they print as text. */
  @media print {
    .e-link:is([href^="http:"], [href^="https:"])::after {
      content: " (" attr(href) ")";
      font-size: 0.85em;
      overflow-wrap: anywhere;
    }
  }
}
</style>
