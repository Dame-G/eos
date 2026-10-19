<script setup lang="ts">
import { computed, useAttrs, type Component } from "vue";
import EIcon from "../Icon/EIcon.vue";
import { useMessages } from "../../config.js";
import "../../styles/base.css";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Where it goes. Defaults to `#`; pass `to` as an attribute with `linkComponent` for a router. */
    href?: string;
    /** What renders the link: `"a"` by default, or `RouterLink` (or any component that takes `href` or `to` and a default slot). */
    linkComponent?: string | Component;
  }>(),
  { href: "#", linkComponent: "a" },
);

defineSlots<{
  /** The words: name the destination ("Back to statements"). Defaults to "Back". */
  default?(): unknown;
}>();

const t = useMessages();
const attrs = useAttrs();
const linkAttrs = computed(() => ({ ...(attrs.to === undefined && { href: props.href }), ...attrs }));
</script>

<template>
  <component :is="linkComponent" class="e-backlink" v-bind="linkAttrs">
    <EIcon name="arrow-left" />
    <slot>{{ t("back") }}</slot>
  </component>
</template>

<style>
@layer e.page {
  .e-backlink {
    display: inline-flex;
    align-items: center;
    gap: var(--e-space-2);
    min-height: var(--e-control-height);
    color: var(--e-primary);
    font: 500 var(--e-text-md) / 1.3 var(--e-font-sans);
    text-decoration: underline;
    text-decoration-color: var(--e-primary);
    text-underline-offset: 4px;
  }

  .e-backlink:hover {
    color: var(--e-ink);
    text-decoration-color: var(--e-ink);
  }

  .e-backlink:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: var(--e-focus-gap);
    border-radius: var(--e-radius-sm);
  }

  @media print {
    .e-backlink {
      display: none;
    }
  }
}
</style>
