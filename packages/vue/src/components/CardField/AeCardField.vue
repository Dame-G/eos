<script setup lang="ts">
import { computed, ref } from "vue";
import AeIcon from "../Icon/AeIcon.vue";
import AeSpinner from "../Spinner/AeSpinner.vue";
import AeFieldFlag from "../Field/AeFieldFlag.vue";
import AeFieldMessage from "../Field/AeFieldMessage.vue";
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
  /** The mount point: pass it to the payment provider to mount its hosted fields. */
  mount,
});
</script>

<template>
  <div class="ae-field">
    <span :id="`${id}-label`" class="ae-field-label ae-kicker">
      {{ label || t("cardNumber") }}
      <AeFieldFlag :required="required" />
    </span>
    <div
      class="ae-cardfield"
      role="group"
      :aria-labelledby="`${id}-label`"
      :aria-describedby="error ? `${id}-hint` : `${id}-note`"
      :data-state="status"
    >
      <div :id="mountId || `${id}-mount`" ref="mount" class="ae-cardfield-mount">
        <AeSpinner v-if="status === 'loading'" :label="t('cardLoading')" />
        <slot v-else />
      </div>
    </div>
    <AeFieldMessage v-if="error" :id="`${id}-hint`" :error="error" />
    <p :id="`${id}-note`" class="ae-cardfield-note">
      <AeIcon name="lock" small />
      {{ note || t("cardSecure") }}
    </p>
  </div>
</template>

<style>
@layer ae.composites {
  .ae-cardfield-mount {
    display: flex;
    align-items: center;
    min-height: var(--ae-control-height);
    padding: 0 var(--ae-space-4);
    border: var(--ae-stroke-edge) solid var(--ae-border-strong);
    border-radius: var(--ae-radius-md);
    background: var(--ae-surface);
    box-shadow: var(--ae-well);
    transition: border-color var(--ae-duration-tap) var(--ae-easing-out);
  }

  .ae-cardfield-mount > * {
    flex: 1;
    min-width: 0;
  }

  .ae-cardfield:hover .ae-cardfield-mount {
    border-color: var(--ae-ink);
  }

  .ae-cardfield:focus-within .ae-cardfield-mount {
    border-color: var(--ae-focus-field);
    outline: var(--ae-stroke-focus) solid var(--ae-focus-field);
    outline-offset: var(--ae-focus-gap-field);
  }

  .ae-cardfield[data-state="error"] .ae-cardfield-mount {
    border-color: var(--ae-danger);
    box-shadow:
      var(--ae-well),
      inset 0 0 0 1px var(--ae-danger);
  }

  .ae-cardfield-note {
    display: flex;
    align-items: center;
    gap: var(--ae-space-2);
    margin: 0;
    font: 400 var(--ae-text-sm)/1.4 var(--ae-font-sans);
    color: var(--ae-muted);
  }
}
</style>
