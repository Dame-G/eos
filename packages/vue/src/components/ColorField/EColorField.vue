<script setup lang="ts">
import { computed, ref, watch } from "vue";
import EField from "../Field/EField.vue";
import { useFieldAttrs } from "../../composables/useFieldAttrs.js";
import { useMessages } from "../../config.js";
import "../../styles/base.css";
import "../TextField/input.css";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  /** The visible label, a mono kicker above the input. */
  label: string;
  /** Keep the label for screen readers and remove it from the page. */
  hideLabel?: boolean;
  /** Help that stays under the input. */
  hint?: string;
  /** What to fix. Replaces the hint, marks the input invalid and is announced. */
  error?: string;
  /** A word beside the label. */
  required?: boolean;
  /** A word beside the label. Flag whichever is rarer. */
  optional?: boolean;
  disabled?: boolean;
  /** The id of the text input; the label points at it. Generated when left out. */
  id?: string;
}>();

const model = defineModel<string>({ default: "" });

const t = useMessages();
const attrs = useFieldAttrs();
const input = ref<HTMLInputElement | null>(null);
const swatchEl = ref<HTMLInputElement | null>(null);

function normalize(raw: string): string | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(raw.trim());
  if (!m) return null;
  const hex = m[1]!.length === 3 ? [...m[1]!].map((c) => c + c).join("") : m[1]!;
  return `#${hex.toLowerCase()}`;
}

const text = ref(model.value);
const touched = ref(false);
watch(model, (v) => {
  if (normalize(text.value) !== v) text.value = v;
});

const invalid = computed(() => touched.value && text.value.trim() !== "" && normalize(text.value) === null);
const shownError = computed(
  () => props.error || (invalid.value ? t("colorInvalid", { example: t("colorPlaceholder") }) : undefined),
);
const swatch = computed(() => normalize(model.value) ?? "#000000");

function onText(e: Event) {
  text.value = (e.target as HTMLInputElement).value;
  const hex = normalize(text.value);
  if (hex) model.value = hex;
}

function onBlur() {
  touched.value = true;
  const hex = normalize(text.value);
  if (hex) text.value = hex;
}

function onWrapClick(e: MouseEvent) {
  if (e.target !== swatchEl.value && !props.disabled) input.value?.focus();
}

function onPick(e: Event) {
  model.value = (e.target as HTMLInputElement).value;
  text.value = model.value;
}

defineExpose({
  input,
  focus: () => input.value?.focus(),
});
</script>

<template>
  <EField
    v-bind="attrs.wrapper()"
    :id="id"
    :label="label"
    :hide-label="hideLabel"
    :hint="hint"
    :error="shownError"
    :required="required"
    :optional="optional"
  >
    <template #default="field">
      <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
      <div
        class="e-input-wrap e-colorfield"
        :data-invalid="shownError ? '' : undefined"
        :data-disabled="disabled ? '' : undefined"
        @click="onWrapClick"
      >
        <input
          ref="swatchEl"
          class="e-color-swatch"
          type="color"
          :value="swatch"
          :disabled="disabled"
          :aria-label="t('pickColor')"
          @input="onPick"
        />
        <input
          :id="field.id"
          ref="input"
          class="e-input"
          type="text"
          spellcheck="false"
          autocomplete="off"
          maxlength="7"
          :placeholder="t('colorPlaceholder')"
          :value="text"
          :disabled="disabled"
          :required="required"
          :aria-invalid="field.ariaInvalid"
          v-bind="attrs.input(field.ariaDescribedby)"
          @input="onText"
          @blur="onBlur"
        />
      </div>
    </template>
  </EField>
</template>

<style>
@layer e.composites {
  .e-colorfield {
    align-items: center;
    gap: var(--e-space-2);
    padding-inline-start: var(--e-space-1);
  }

  .e-color-swatch {
    flex: none;
    width: calc(var(--e-control-height) - 2 * (var(--e-stroke-edge) + var(--e-space-1)));
    height: calc(var(--e-control-height) - 2 * (var(--e-stroke-edge) + var(--e-space-1)));
    padding: 0;
    border: 0;
    border-radius: var(--e-radius-sm);
    background: none;
    cursor: pointer;
  }

  .e-color-swatch::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .e-color-swatch::-webkit-color-swatch {
    border: 0;
    border-radius: var(--e-radius-sm);
    box-shadow: inset 0 0 0 var(--e-stroke-hair) rgb(0 0 0 / 0.22);
  }

  .e-color-swatch::-moz-color-swatch {
    border: 0;
    border-radius: var(--e-radius-sm);
    box-shadow: inset 0 0 0 var(--e-stroke-hair) rgb(0 0 0 / 0.22);
  }

  .e-color-swatch:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .e-colorfield .e-input {
    font-family: var(--e-font-mono);
    font-variant-numeric: tabular-nums;
  }
}
</style>
