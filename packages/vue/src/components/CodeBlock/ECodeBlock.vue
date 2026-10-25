<script setup lang="ts">
import { computed, ref } from "vue";
import ECopyButton from "../CopyButton/ECopyButton.vue";
import { useMessages } from "../../config.js";
import { useOverflow } from "../../composables/useOverflow.js";
import "../../styles/base.css";

const props = defineProps<{
  /** The text to show, as plain text. Leave it out to use the slot and put your own highlighted markup there. */
  code?: string;
  /** The language, such as `ts` or `vue`. A common one is read by its name ("TypeScript") as the name of the code group. */
  lang?: string;
  /** Names the code group for screen readers, instead of the language. @default the language's name, else "Code" */
  label?: string;
  /** The copy button's name. Say what is copied when a page has several. @default "Copy code" */
  copyLabel?: string;
  /** Wraps long lines instead of scrolling sideways. */
  wrap?: boolean;
  /** Numbers the lines. Plain `code` is numbered by itself; your own markup needs each line in an element with the class `line` (Shiki writes them). */
  lineNumbers?: boolean;
}>();

defineSlots<{
  /** Your own markup, such as a highlighted `<pre><code>`. The copy button copies the text of the first `<pre>`. */
  default?(): unknown;
}>();

/** Readable names for the languages people write most, so a screen reader does not spell out "t s". */
const LANGS: Record<string, string> = {
  bash: "Bash",
  css: "CSS",
  diff: "Diff",
  html: "HTML",
  js: "JavaScript",
  javascript: "JavaScript",
  json: "JSON",
  jsx: "JSX",
  md: "Markdown",
  markdown: "Markdown",
  py: "Python",
  python: "Python",
  scss: "SCSS",
  sh: "Shell",
  shell: "Shell",
  sql: "SQL",
  ts: "TypeScript",
  tsx: "TSX",
  typescript: "TypeScript",
  vue: "Vue",
  xml: "XML",
  yaml: "YAML",
  yml: "YAML",
};

const t = useMessages();
const root = ref<HTMLElement | null>(null);
const body = ref<HTMLElement | null>(null);
const name = computed(
  () => props.label || (props.lang && (LANGS[props.lang.toLowerCase()] ?? props.lang)) || t("codeBlock"),
);
// The body is a tab stop only while it scrolls (never with `wrap`), so the keys can scroll it.
const overflows = useOverflow(body, [], { children: true });
const text = () => props.code ?? root.value?.querySelector("pre")?.textContent ?? "";
const lines = computed(() => (props.lineNumbers && props.code !== undefined ? props.code.split("\n") : undefined));
</script>

<template>
  <div ref="root" class="e-code" :class="{ 'e-code--wrap': wrap, 'e-code--numbered': lineNumbers }">
    <div ref="body" class="e-code-body" role="group" :tabindex="overflows ? 0 : undefined" :aria-label="name">
      <slot>
        <pre><code v-if="lines"><span v-for="(line, i) in lines" :key="i" class="line">{{ line }}</span></code><code v-else>{{ code }}</code></pre>
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
    border-radius: var(--e-radius-md);
    background: var(--e-surface);
    box-shadow: var(--e-frame);
  }

  /* Code blocks stacked back to back share one seam: the rings overlap into a single line. */
  .e-code:has(+ .e-code) {
    border-end-start-radius: 0;
    border-end-end-radius: 0;
  }

  .e-code + .e-code {
    border-start-start-radius: 0;
    border-start-end-radius: 0;
  }

  .e-code-body {
    display: grid;
    flex: 1;
    align-content: center;
    min-width: 0;
    overflow-x: auto;

    /* Flush against the block's start edge, so the block's corners (its own, which differ where blocks are stacked): the body scrolls itself and the block does not clip, so the ring around the block is painted once on a curve nothing else clips; the body takes the corner so its focus ring follows it. The block has no border of its own, so inheriting fills it exactly. */
    border-start-start-radius: inherit;
    border-end-start-radius: inherit;
  }

  .e-code pre {
    margin: 0;
    padding: var(--e-space-3) var(--e-space-4);
    background: transparent;
    font: var(--e-weight-medium) var(--e-text-sm) / var(--e-leading-normal) var(--e-font-mono);
    color: var(--e-ink);
  }

  .e-code-body:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: calc(-1 * var(--e-stroke-focus));
  }

  .e-code code {
    display: block;
    width: fit-content;
    min-width: 100%;
    padding: 0;
    background: transparent;
    font: inherit;
  }

  .e-code--wrap code {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .e-code--numbered code {
    counter-reset: line;
  }

  .e-code--numbered .line {
    display: block;
  }

  .e-code--numbered .line::before {
    counter-increment: line;
    content: counter(line);
    display: inline-block;
    min-width: 2ch;
    margin-inline-end: var(--e-gap-base);
    text-align: end;
    color: var(--e-muted);
    user-select: none;
  }

  .e-code-side {
    flex: none;
    align-self: flex-start;
    padding: var(--e-gap-tight);
  }

  @media print {
    .e-code-side {
      display: none;
    }
  }
}
</style>
