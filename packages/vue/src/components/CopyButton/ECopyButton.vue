<script setup lang="ts">
import { h } from "vue";
import EIconButton from "../IconButton/EIconButton.vue";
import { useMessages } from "../../config.js";
import { useCopy } from "../../composables/useCopy.js";
import "../../styles/base.css";

const props = defineProps<{
  /** What to copy: the text, or a function that returns it when the button is pressed. */
  text: string | (() => string);
  /** The accessible name. Say what is copied when a page has several. @default "Copy" */
  label?: string;
  /** Milliseconds the check mark shows after copying. @default 2000 */
  timeout?: number;
}>();

const emit = defineEmits<{
  /** After each attempt: whether the text reached the clipboard. */
  copy: [ok: boolean];
}>();

const t = useMessages();
const { copied, copy } = useCopy({ timeout: () => props.timeout ?? 2000 });

const CopyIcon = () =>
  h(
    "svg",
    { viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", "stroke-width": "1.6", "aria-hidden": "true" },
    [
      h("rect", { x: "7", y: "7", width: "9", height: "9", rx: "2" }),
      h("path", { d: "M13 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" }),
    ],
  );

async function onClick() {
  emit("copy", await copy(typeof props.text === "function" ? props.text() : props.text));
}
</script>

<template>
  <EIconButton :icon="copied ? 'check' : CopyIcon" :label="label || t('copy')" @click="onClick" />
</template>
