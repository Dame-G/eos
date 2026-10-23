<script setup lang="ts">
import EIconButton from "../IconButton/EIconButton.vue";
import { useMessages } from "../../config.js";
import { useCopy } from "../../composables/useCopy.js";
import "../../styles/base.css";

const props = defineProps<{
  /** What to copy: the text, or a function that returns it when the button is pressed. */
  text: string | (() => string);
  /** The accessible name. Say what is copied when a page has several. @default "Copy" */
  label?: string;
  /** Milliseconds the check mark (or the alert, after a failure) shows. @default 2000 */
  timeout?: number;
}>();

const emit = defineEmits<{
  /** After each attempt: whether the text reached the clipboard. */
  copy: [ok: boolean];
}>();

const t = useMessages();
const { copied, failed, copy } = useCopy({ timeout: () => props.timeout ?? 2000 });

async function onClick() {
  emit("copy", await copy(typeof props.text === "function" ? props.text() : props.text));
}
</script>

<template>
  <EIconButton
    :icon="copied ? 'check' : failed ? 'alert' : 'copy'"
    :label="label || t('copy')"
    :class="failed && 'e-copy--failed'"
    @click="onClick"
  />
</template>

<style>
@layer e.primitives {
  .e-icon-btn.e-copy--failed {
    color: var(--e-danger);
  }
}
</style>
