<script setup lang="ts">
import { nextTick } from "vue";
import { useMessages } from "../../config.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** The in-page target. It must match the `id` of the main content. */
    href?: string;
  }>(),
  { href: "#main" },
);

defineSlots<{
  /** The link text. */
  default?(): unknown;
}>();

const t = useMessages();

async function go(event: MouseEvent) {
  if (event.defaultPrevented || !props.href.startsWith("#") || props.href.length < 2) return;
  await nextTick();
  const target = document.getElementById(decodeURIComponent(props.href.slice(1)));
  if (target && document.activeElement !== target) target.focus();
}
</script>

<template>
  <a class="e-skip" :href="href" @click="go">
    <slot>{{ t("skipToMain") }}</slot>
  </a>
</template>

<style>
@layer e.page {
  .e-skip {
    position: absolute;
    inset-inline-start: var(--e-space-4);
    top: -100px;
    z-index: var(--e-z-toast);
    display: inline-flex;
    align-items: center;
    height: var(--e-control-height);
    padding: 0 var(--e-space-4);
    border-radius: var(--e-radius-md);
    background: var(--e-primary);
    color: var(--e-on-primary);
    font: 600 var(--e-text-md) / 1 var(--e-font-sans);
    text-decoration: none;
  }

  .e-skip:focus {
    top: var(--e-space-2);
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: var(--e-focus-gap);
  }

  @media print {
    .e-skip {
      display: none;
    }
  }
}
</style>
