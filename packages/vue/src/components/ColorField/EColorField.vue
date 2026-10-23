<script setup lang="ts">
import { computed, ref, watch } from "vue";
import EField from "../Field/EField.vue";
import { useFieldAttrs } from "../../composables/useFieldAttrs.js";
import { useMessages } from "../../config.js";
import "../../styles/base.css";
import "../TextField/input.css";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  /** The visible label. */
  label: string;
  /** Keeps the label for screen readers and hides it from the page. */
  hideLabel?: boolean;
  /** Shows help text under the input. */
  hint?: string;
  /** Shows what to fix in place of the hint, marks the input invalid and is announced. Invalid typed text shows "Enter a colour like #2c95b4" after blur. */
  error?: string;
  /** Sets the `required` attribute and shows a word beside the label. */
  required?: boolean;
  /** Shows a word beside the label. Use it on whichever of required and optional is rarer. */
  optional?: boolean;
  /** Disables the field. */
  disabled?: boolean;
  /** Keeps the value but stops it being changed. The text box can still be focused and selected. */
  readonly?: boolean;
  /** The name submitted with a form: the normalised `#rrggbb`, or empty when the text is not a colour. */
  name?: string;
  /** The `id` of the text input, which the label points at. @default generated */
  id?: string;
}>();

/** `#rrggbb`, lower case. Only complete, valid colours are written, and clearing the text writes an empty string. `#abc` expands to `#aabbcc`. */
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
// An <input type="color"> always has a value, so an empty field gives it black and an overlay hides that.
const swatch = computed(() => normalize(model.value) ?? "#000000");
const empty = computed(() => normalize(model.value) === null);
const submitted = computed(() => normalize(text.value) ?? "");

function onText(e: Event) {
  if (props.readonly) return;
  text.value = (e.target as HTMLInputElement).value;
  const hex = normalize(text.value);
  if (hex) model.value = hex;
  else if (text.value.trim() === "") model.value = "";
}

function onBlur() {
  touched.value = true;
  const hex = normalize(text.value);
  if (hex) text.value = hex;
}

function onWrapClick(e: MouseEvent) {
  if (!(e.target as Element).closest(".e-color-swatch-box") && !props.disabled) input.value?.focus();
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
        :data-readonly="readonly ? '' : undefined"
        @click="onWrapClick"
      >
        <span class="e-color-swatch-box">
          <input
            ref="swatchEl"
            class="e-color-swatch"
            type="color"
            :value="swatch"
            :disabled="disabled || readonly"
            :aria-label="t('pickColor')"
            @input="onPick"
          />
          <span v-if="empty" class="e-color-empty" aria-hidden="true"></span>
        </span>
        <input v-if="name" type="hidden" :name="name" :value="submitted" :disabled="disabled" />
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
          :readonly="readonly"
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

  .e-color-swatch-box {
    display: inline-grid;
    flex: none;
  }

  .e-color-swatch-box > * {
    grid-area: 1 / 1;
  }

  /* No colour yet: a neutral struck-through chip over the picker's black, which still opens on click. */
  .e-color-empty {
    border-radius: var(--e-radius-sm);
    background:
      linear-gradient(
        to top right,
        transparent calc(50% - var(--e-stroke-hair)),
        var(--e-border-strong) 50%,
        transparent calc(50% + var(--e-stroke-hair))
      ),
      var(--e-skeleton);
    box-shadow: inset 0 0 0 var(--e-stroke-hair) var(--e-border-strong);
    pointer-events: none;
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
    box-shadow: inset 0 0 0 var(--e-stroke-hair) var(--e-border-strong);
  }

  .e-color-swatch::-moz-color-swatch {
    border: 0;
    border-radius: var(--e-radius-sm);
    box-shadow: inset 0 0 0 var(--e-stroke-hair) var(--e-border-strong);
  }

  .e-colorfield[data-readonly] .e-color-swatch {
    cursor: default;
  }

  .e-colorfield:not([data-readonly]) .e-color-swatch:disabled {
    cursor: not-allowed;
    outline: var(--e-stroke-hair) dashed var(--e-muted);
    outline-offset: calc(-1 * var(--e-stroke-hair));
  }

  .e-colorfield .e-input {
    font-family: var(--e-font-mono);
    font-variant-numeric: tabular-nums;
  }
}
</style>
