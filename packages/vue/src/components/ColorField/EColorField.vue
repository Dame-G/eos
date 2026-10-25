<script setup lang="ts">
import { computed, ref, watch } from "vue";
import EField from "../Field/EField.vue";
import EInputShell from "../Field/EInputShell.vue";
import type { EFieldBoxProps, EFieldCommonProps } from "../Field/fieldProps.js";
import { useFieldControl } from "../../composables/useFieldControl.js";
import { useMessages } from "../../config.js";
import "../../styles/base.css";
import "../../styles/controls/input.css";

defineOptions({ inheritAttrs: false });

const props = defineProps<
  EFieldCommonProps &
    Pick<EFieldBoxProps, "size"> & {
      /** The visible label. */
      label: string;
      /** The name submitted with a form: the normalised `#rrggbb`, or empty when the text is not a colour. Posts nothing while disabled. */
      name?: string;
    }
>();

/** `#rrggbb`, lower case. Only complete, valid colours are written, and clearing the text writes an empty string. `#abc` expands to `#aabbcc`. */
const model = defineModel<string>({ default: "" });

const t = useMessages();
const control = useFieldControl(props);
const input = control.input;

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

function onPick(e: Event) {
  model.value = (e.target as HTMLInputElement).value;
  text.value = model.value;
}

defineExpose(control.exposed);
</script>

<template>
  <EField
    v-bind="control.attrs.wrapper()"
    :id="id"
    :label="label"
    :hide-label="hideLabel"
    :hint="hint"
    :error="shownError"
    :required="required"
    :optional="optional"
  >
    <template #default="field">
      <EInputShell v-bind="control.shell(shownError)" class="e-colorfield">
        <span class="e-color-swatch-box">
          <input
            class="e-color-swatch"
            type="color"
            :value="swatch"
            :disabled="disabled || readonly"
            :aria-label="t('pickColor')"
            @input="onPick"
          />
          <span v-if="empty" class="e-color-empty" aria-hidden="true"></span>
        </span>
        <input v-if="name" type="hidden" v-bind="control.hidden(name, submitted)" />
        <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
        <input
          ref="input"
          class="e-input"
          type="text"
          spellcheck="false"
          autocomplete="off"
          maxlength="7"
          :placeholder="t('colorPlaceholder')"
          :value="text"
          v-bind="control.bind(field)"
          @input="onText"
          @blur="onBlur"
        />
      </EInputShell>
    </template>
  </EField>
</template>

<style>
@layer e.composites {
  /* The swatch nearly fills the field and sits `gap-tight` inside its edge. Its corner uses `pad-inset`, the smaller distance the corner maths assumes, so it rounds almost as much as the field: the same curve, not a sharper one. */
  .e-colorfield {
    --_inset: var(--e-gap-tight);

    align-items: center;
    gap: var(--e-gap-snug);
    padding-inline-start: var(--_inset);
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
    border-radius: max(0px, calc(var(--e-radius-md) - var(--e-stroke-edge) - var(--e-pad-inset)));
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
    width: calc(var(--_h, var(--e-control-height)) - 2 * (var(--e-stroke-edge) + var(--_inset)));
    height: calc(var(--_h, var(--e-control-height)) - 2 * (var(--e-stroke-edge) + var(--_inset)));
    padding: 0;
    border: 0;
    border-radius: max(0px, calc(var(--e-radius-md) - var(--e-stroke-edge) - var(--e-pad-inset)));
    background: none;
    cursor: pointer;
  }

  .e-color-swatch::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .e-color-swatch::-webkit-color-swatch {
    border: 0;
    border-radius: max(0px, calc(var(--e-radius-md) - var(--e-stroke-edge) - var(--e-pad-inset)));
    box-shadow: inset 0 0 0 var(--e-stroke-hair) var(--e-border-strong);
  }

  .e-color-swatch::-moz-color-swatch {
    border: 0;
    border-radius: max(0px, calc(var(--e-radius-md) - var(--e-stroke-edge) - var(--e-pad-inset)));
    box-shadow: inset 0 0 0 var(--e-stroke-hair) var(--e-border-strong);
  }

  .e-colorfield[data-readonly] .e-color-swatch {
    cursor: default;
  }

  .e-colorfield:not([data-readonly]) .e-color-swatch:disabled {
    cursor: not-allowed;
    outline: var(--e-stroke-edge) dashed var(--e-border-strong);
    outline-offset: calc(-1 * var(--e-stroke-edge));
  }

  .e-colorfield .e-input {
    font-family: var(--e-font-mono);
    font-variant-numeric: tabular-nums;
  }
}
</style>
