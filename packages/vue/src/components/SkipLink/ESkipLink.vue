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

function decode(id: string) {
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
}

async function go(event: MouseEvent) {
  if (event.defaultPrevented || !props.href.startsWith("#") || props.href.length < 2) return;
  await nextTick();
  const target = document.getElementById(decode(props.href.slice(1)));
  if (!target || document.activeElement === target) return;
  // A target with no tabindex cannot take focus, so give it one only for as long as focus is there.
  if (!target.hasAttribute("tabindex")) {
    target.setAttribute("tabindex", "-1");
    target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
  }
  target.focus();
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
    inset-inline-start: var(--e-gutter-min);
    inset-block-start: var(--e-gap-snug);
    transform: translateY(calc(-100% - var(--e-gap-loose)));
    z-index: var(--e-z-skip);
    display: inline-flex;
    align-items: center;
    height: var(--e-control-height);
    padding: 0 var(--e-pad-control);
    border-radius: var(--e-radius-md);
    background: var(--e-primary);
    color: var(--e-on-primary);
    font: var(--e-type-button);
    font-weight: var(--e-weight-strong);
    text-decoration: none;
    transition: var(--e-transition-state);
  }

  .e-skip:hover {
    background: var(--e-primary-hover);
  }

  .e-skip:active {
    background: var(--e-primary-press);
  }

  .e-skip:focus {
    transform: none;
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: var(--e-stroke-focus);
  }

  @media print {
    .e-skip {
      display: none;
    }
  }
}
</style>
