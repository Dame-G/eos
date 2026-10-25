<script setup lang="ts">
import EIconButton from "../IconButton/EIconButton.vue";
import { useMessages } from "../../config.js";
import { useCopy } from "../../composables/useCopy.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** What to copy: the text, or a function that returns it when the button is pressed. */
    text: string | (() => string);
    /** The accessible name. Say what is copied when a page has several. @default "Copy" */
    label?: string;
    /** Milliseconds the check mark (or the alert, after a failure) shows. */
    timeout?: number;
    /** The `EIconButton` variant. */
    variant?: "quiet" | "primary" | "secondary" | "outline" | "danger";
    /** `sm` is a compact square, `lg` a larger one. Every size keeps a 44px target. */
    size?: "sm" | "md" | "lg";
  }>(),
  { timeout: 2000, variant: "quiet", size: "md" },
);

const emit = defineEmits<{
  /** After each attempt: whether the text reached the clipboard. */
  copy: [ok: boolean];
}>();

const t = useMessages();
const { copied, failed, copy } = useCopy({ timeout: () => props.timeout });

async function onClick() {
  emit("copy", await copy(typeof props.text === "function" ? props.text() : props.text));
}
</script>

<template>
  <EIconButton
    :icon="copied ? 'check' : failed ? 'alert' : 'copy'"
    :label="label || t('copy')"
    :variant="variant"
    :size="size"
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
