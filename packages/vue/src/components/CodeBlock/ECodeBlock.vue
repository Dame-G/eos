<script setup lang="ts">
import { ref } from "vue";
import ECopyButton from "../CopyButton/ECopyButton.vue";
import { useMessages } from "../../config.js";
import "../../styles/base.css";

const props = defineProps<{
  /** The text to show, as plain text. Leave it out to use the slot and put your own highlighted markup there. */
  code?: string;
  /** The language, named for screen readers (the code's accessible name). */
  lang?: string;
  /** The copy button's name. Say what is copied when a page has several. @default "Copy code" */
  copyLabel?: string;
}>();

defineSlots<{
  /** Your own markup, such as a highlighted `<pre><code>`. The copy button copies the text of the first `<pre>`. */
  default?(): unknown;
}>();

const t = useMessages();
const root = ref<HTMLElement | null>(null);
const text = () => props.code ?? root.value?.querySelector("pre")?.textContent ?? "";
</script>

<template>
  <div ref="root" class="e-code">
    <div class="e-code-body">
      <slot>
        <pre tabindex="0" :aria-label="lang"><code>{{ code }}</code></pre>
      </slot>
    </div>
    <div class="e-code-side">
      <ECopyButton :text="text" :label="copyLabel || t('copyCode')" />
    </div>
  </div>
</template>

<style>
@layer e.blocks {
  .e-code {
    /* The colours a Shiki dual-theme (css-variables) highlighter reads for syntax tokens. */
    --shiki-foreground: var(--e-ink);
    --shiki-background: transparent;
    --shiki-token-comment: var(--e-muted);
    --shiki-token-keyword: var(--e-primary);
    --shiki-token-function: var(--e-primary);
    --shiki-token-string: var(--e-secondary);
    --shiki-token-string-expression: var(--e-secondary);
    --shiki-token-constant: var(--e-warning-strong);
    --shiki-token-parameter: var(--e-ink);
    --shiki-token-punctuation: var(--e-muted);
    --shiki-token-link: var(--e-primary);

    display: flex;
    align-items: stretch;
    min-width: 0;
    overflow: hidden;
    border-radius: var(--e-radius-md);
    background: var(--e-surface);
    box-shadow: var(--e-edge);
  }

  /* Code blocks stacked back to back share one seam: the rings overlap into a single line. */
  .e-code:has(+ .e-code) {
    border-end-start-radius: 0;
    border-end-end-radius: 0;
  }

  .e-code + .e-code {
    margin-top: max(var(--e-stroke-card), 1px);
    border-start-start-radius: 0;
    border-start-end-radius: 0;
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
