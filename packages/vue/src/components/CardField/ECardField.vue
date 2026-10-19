<script setup lang="ts">
import { computed, ref } from "vue";
import EIcon from "../Icon/EIcon.vue";
import ESpinner from "../Spinner/ESpinner.vue";
import EFieldFlag from "../Field/EFieldFlag.vue";
import EFieldMessage from "../Field/EFieldMessage.vue";
import { useMessages } from "../../config.js";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";

const props = defineProps<{
  /** The visible label, a small mono kicker above the frame. Default "Card details". */
  label?: string;
  /** `loading` shows a spinner while the provider's fields load; `error` turns the edge `danger`; `ready` is the default. An `error` text implies `error`. */
  state?: "loading" | "ready" | "error";
  /** What to fix, such as a declined card. Shown under the frame, announced, and turns the edge `danger`. */
  error?: string;
  /** The reassurance line under the frame. Default says the details go straight to the payment provider. */
  note?: string;
  /** The word "Required" beside the label. */
  required?: boolean;
  /** The id of the mount point, for a provider that mounts by id. Generated when left out. */
  mountId?: string;
  /** The id the label, error and note ids are built from. Generated when left out. */
  id?: string;
}>();

defineSlots<{
  /** The provider's element, when it is rendered rather than mounted by id or by the exposed element. */
  default(): unknown;
}>();

const t = useMessages();
const id = useUid(() => props.id);
const status = computed(() => (props.error ? "error" : props.state || "ready"));
const mount = ref<HTMLDivElement | null>(null);

defineExpose({
  mount,
});
</script>

<template>
  <div class="e-field">
    <span :id="`${id}-label`" class="e-field-label e-kicker">
      {{ label || t("cardDetails") }}
      <EFieldFlag :required="required" />
    </span>
    <div
      class="e-cardfield"
      role="group"
      :aria-labelledby="`${id}-label`"
      :aria-describedby="error ? `${id}-hint` : `${id}-note`"
      :data-state="status"
    >
      <div :id="mountId || `${id}-mount`" ref="mount" class="e-cardfield-mount">
        <ESpinner v-if="status === 'loading'" :label="t('cardLoading')" />
        <slot v-else />
      </div>
    </div>
    <EFieldMessage v-if="error" :id="`${id}-hint`" :error="error" />
    <p :id="`${id}-note`" class="e-cardfield-note">
      <EIcon name="lock" small />
      {{ note || t("cardSecure") }}
    </p>
  </div>
</template>

<style>
@layer e.composites {
  .e-cardfield-mount {
    display: flex;
    align-items: center;
    min-height: var(--e-control-height);
    padding: 0 var(--e-space-4);
    border: var(--e-stroke-edge) solid var(--e-border-strong);
    border-radius: var(--e-radius-md);
    background: var(--e-surface);
    box-shadow: var(--e-well);
    transition: border-color var(--e-duration-tap) var(--e-easing-out);
  }

  .e-cardfield-mount > * {
    flex: 1;
    min-width: 0;
  }

  .e-cardfield:hover .e-cardfield-mount {
    border-color: var(--e-ink);
  }

  .e-cardfield:focus-within .e-cardfield-mount {
    border-color: var(--e-focus-field);
    outline: var(--e-stroke-focus) solid var(--e-focus-field);
    outline-offset: var(--e-focus-gap-field);
  }

  .e-cardfield[data-state="error"] .e-cardfield-mount {
    border-color: var(--e-danger);
    box-shadow:
      var(--e-well),
      inset 0 0 0 1px var(--e-danger);
  }

  .e-cardfield-note {
    display: flex;
    align-items: center;
    gap: var(--e-space-2);
    margin: 0;
    font: 400 var(--e-text-sm)/1.4 var(--e-font-sans);
    color: var(--e-muted);
  }
}
</style>
