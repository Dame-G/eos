<script setup lang="ts">
import { h, ref } from "vue";
import EIconButton from "../IconButton/EIconButton.vue";
import EVisuallyHidden from "../VisuallyHidden/EVisuallyHidden.vue";
import { useMessages } from "../../config.js";
import "../../styles/base.css";

const props = defineProps<{
  /** The text to show, as plain text. Leave it out to put your own highlighted markup in the slot. */
  code?: string;
  /** The language, named for screen readers (the code's accessible name). */
  lang?: string;
  /** The copy button's name. Default "Copy code". Say what is copied when there are several blocks: "Copy CSS". */
  copyLabel?: string;
}>();

defineSlots<{
  /** Your own markup, usually a highlighted `<pre><code>`. The copy button copies the text of the first `<pre>`. */
  default?(): unknown;
}>();

const t = useMessages();

const CopyIcon = () =>
  h(
    "svg",
    { viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", "stroke-width": "1.6", "aria-hidden": "true" },
    [
      h("rect", { x: "7", y: "7", width: "9", height: "9", rx: "2" }),
      h("path", { d: "M13 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" }),
    ],
  );

const root = ref<HTMLElement | null>(null);
const copied = ref(false);

async function copy() {
  const text = props.code ?? root.value?.querySelector("pre")?.textContent ?? "";
  try {
    await navigator.clipboard.writeText(text);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch {}
}
</script>

<template>
  <div ref="root" class="e-code">
    <div class="e-code-body">
      <slot>
        <pre tabindex="0" :aria-label="lang"><code>{{ code }}</code></pre>
      </slot>
    </div>
    <div class="e-code-side">
      <EIconButton :icon="copied ? 'check' : CopyIcon" :label="copyLabel || t('copyCode')" @click="copy" />
    </div>
    <EVisuallyHidden role="status">{{ copied ? t("codeCopied") : "" }}</EVisuallyHidden>
  </div>
</template>

<style>
@layer e.blocks {
  .e-code {
    display: flex;
    align-items: stretch;
    min-width: 0;
    overflow: hidden;
    border-radius: var(--e-radius-md);
    background: var(--e-surface);
    box-shadow: var(--e-edge);
  }

  .e-code-body {
    display: grid;
    flex: 1;
    align-content: center;
    min-width: 0;
    overflow-x: auto;
  }

  .e-code pre {
    margin: 0;
    padding: var(--e-space-3) var(--e-space-4);
    background: transparent;
    font: 400 var(--e-text-sm) / 1.6 var(--e-font-mono);
    color: var(--e-ink);
  }

  .e-code pre:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: calc(-1 * var(--e-stroke-focus));
    border-radius: var(--e-radius-md);
  }

  .e-code code {
    display: block;
    width: fit-content;
    min-width: 100%;
    padding: 0;
    background: transparent;
    font: inherit;
  }

  .e-code-side {
    flex: none;
    align-self: flex-start;
    padding: var(--e-space-1);
  }

  @media print {
    .e-code-side {
      display: none;
    }
  }
}
</style>
