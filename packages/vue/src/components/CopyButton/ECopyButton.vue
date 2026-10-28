<script setup lang="ts">
import { computed } from "vue";
import EButton from "../Button/EButton.vue";
import EIconButton from "../IconButton/EIconButton.vue";
import { useMessages } from "../../config.js";
import { useAnnouncer } from "../../composables/useAnnouncer.js";
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
    /** `xs` is a dense square, `sm` a compact one, `lg` a larger one. Every size keeps a 44px target. */
    size?: "xs" | "sm" | "md" | "lg";
    /** Shows `label` as the button's text beside the icon, instead of an icon alone: "Copy FEN". After a copy the text becomes `copiedLabel`. */
    showLabel?: boolean;
    /** The text and announcement after a successful copy, with `showLabel`: "FEN copied". @default "Copied" */
    copiedLabel?: string;
  }>(),
  { timeout: 2000, variant: "quiet", size: "md" },
);

const emit = defineEmits<{
  /** After each attempt: whether the text reached the clipboard. */
  copy: [ok: boolean];
}>();

const t = useMessages();
const { announce } = useAnnouncer();
// A button with its own copied words announces those, so the shared "Copied" is not said over them.
const own = () => !!props.showLabel && !!props.copiedLabel;
const { copied, failed, copy } = useCopy({ timeout: () => props.timeout, announce: !own() });
const name = computed(() => props.label || t("copy"));
const shown = computed(() =>
  copied.value ? (props.copiedLabel ?? t("copied")) : failed.value ? t("copyFailed") : name.value,
);

async function onClick() {
  const ok = await copy(typeof props.text === "function" ? props.text() : props.text);
  if (own() && ok) announce(props.copiedLabel!);
  emit("copy", ok);
}
</script>

<template>
  <EButton
    v-if="showLabel"
    :variant="variant"
    :size="size === 'md' ? undefined : size"
    :icon="copied ? 'check' : failed ? 'alert' : 'copy'"
    :class="failed && 'e-copy--failed'"
    @click="onClick"
  >
    {{ shown }}
  </EButton>
  <EIconButton
    v-else
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
  .e-icon-btn.e-copy--failed,
  .e-btn.e-copy--failed {
    color: var(--e-danger);
  }
}
</style>
