<script setup lang="ts">
import { inject, onMounted, watch } from "vue";
import EIcon from "../Icon/EIcon.vue";
import { FORM_KEY } from "../../composables/useFormField.js";
import { useAnnouncer } from "../../composables/useAnnouncer.js";

const props = defineProps<{
  /** The id that `aria-describedby` points at. */
  id: string;
  /** What to fix. Replaces the hint, carries an alert glyph and is announced when it appears or changes after the page has loaded. */
  error?: string | undefined;
  /** Help that stays under the control. */
  hint?: string | undefined;
}>();

// An error already there when the page loads is read with the control, not announced over the page. One that appears
// later is announced once: by the EForm around it, which keeps quiet when its own summary speaks for the submit.
const form = inject(FORM_KEY, null);
const { announce } = useAnnouncer();
let mounted = false;
onMounted(() => (mounted = true));
watch(
  () => props.error,
  (now) => {
    if (!mounted || !now) return;
    if (form?.announce) form.announce(now);
    else announce(now, { assertive: true });
  },
);
</script>

<template>
  <p v-if="error" :id="id" class="e-field-error">
    <EIcon name="alert" />
    {{ error }}
  </p>
  <p v-else-if="hint" :id="id" class="e-field-hint">{{ hint }}</p>
</template>

<style>
@layer e.controls {
  .e-field-hint {
    font: var(--e-type-helper);
    color: var(--e-muted);
    margin: 0;
  }

  .e-field-error {
    display: flex;
    align-items: flex-start;
    gap: var(--e-gap-tight);
    font: var(--e-type-helper);
    font-weight: var(--e-weight-medium);
    color: var(--e-danger);
    margin: 0;
  }

  .e-field-error .e-icon {
    width: var(--e-icon-size-sm);
    height: var(--e-icon-size-sm);
    margin-block-start: var(--e-stroke-focus);
  }
}
</style>
