<script lang="ts">
export type { SegmentedOption } from "../RadioGroup/options.js";
</script>

<script setup lang="ts" generic="T extends string = string">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import EIcon from "../Icon/EIcon.vue";
import EFieldFlag from "../Field/EFieldFlag.vue";
import ESelect from "../Select/ESelect.vue";
import EFieldMessage from "../Field/EFieldMessage.vue";
import { sizeAttr, type EFieldSize } from "../Field/fieldProps.js";
import { useMessages } from "../../config.js";
import { normalizeChoices } from "../RadioGroup/options.js";
import type { SegmentedOption } from "../RadioGroup/options.js";
import { keepIfReadonly, useChoiceMessage } from "../Checkbox/useChoiceMessage.js";
import { useFieldAttrs } from "../../composables/useFieldAttrs.js";
import { useUid } from "../../composables/useUid.js";
import { useOverflow } from "../../composables/useOverflow.js";
import { useReducedMotion } from "../../composables/useReducedMotion.js";
import { useFormField } from "../../composables/useFormField.js";
import "../../styles/base.css";
import "../../styles/controls/label.css";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  /** The name of the group, shown above the control as a field's label, with the Required or Optional word beside it. */
  label: string;
  /** Keeps the label for screen readers only, where the context already names the control (a view switch in a toolbar). */
  hideLabel?: boolean;
  /** Two to five. A string is both value and label. `SegmentedOption` is `{ value, label, icon?, disabled? }`. */
  options: readonly (T | SegmentedOption<T>)[];
  /** The height: `sm` is a compact control for a toolbar, with smaller text; `lg` is a step over the control height. @default "md" */
  size?: EFieldSize;
  /** The id of the group. The options are `{id}-0`, `{id}-1` and so on. @default generated */
  id?: string;
  /** Help under the control, linked with `aria-describedby`. */
  hint?: string;
  /** What to fix. Replaces the hint and is announced. */
  error?: string;
  /** Adds the word "Optional" to the group's accessible name and to the label. Use it when most fields in the form are required. */
  optional?: boolean;
  /** Marks the group `aria-required` and adds the word "Required" to its accessible name and to the label. */
  required?: boolean;
  /** Disables every option. */
  disabled?: boolean;
  /** Shows the choice but blocks changing it. The options stay focusable and the value is still submitted. */
  readonly?: boolean;
  /** The name the radios share, submitted with a form. @default generated */
  name?: string;
  /** Fills the width of its container, the options sharing it equally. */
  stretch?: boolean;
  /** Lets several options be on at once, as toggles. The values that are on are `v-model:values` (an array) and `v-model` is not used. The group is a `group` of checkboxes, and nothing is on until the person chooses. */
  multiple?: boolean;
  /** When the options do not fit the container, shows a select with the same options instead of a scrolling track. The control then takes the container's full width, to tell how much room there is. */
  collapse?: boolean;
}>();

/** The active value. Left unset, the first option that can be chosen is shown as active, but no radio is checked: `v-model` is not told and a form posts nothing until the person chooses. @default first option */
const model = defineModel<T>();

/** With `multiple`: the values that are on, in the order they were chosen. */
const values = defineModel<T[]>("values");

const t = useMessages();
const uid = useUid(() => props.id);
const labelId = computed(() => `${uid.value}-label`);
const name = useUid(() => props.name);
const message = computed(() => ({ hint: props.hint, error: props.error }));
const { messageId: hintId, describedBy } = useChoiceMessage(uid, message);
const guard = keepIfReadonly(() => props.readonly);
const options = computed(() => normalizeChoices<SegmentedOption<T>>(props.options));
/** What is shown as chosen while the model has no value: the first option that can be chosen. */
const fallback = computed(() => options.value.find((o) => !o.disabled && !props.disabled) ?? options.value[0]);
/** The values that are on, with `multiple`. */
const picked = computed<T[]>(() => (props.multiple ? (values.value ?? []) : []));
const current = computed(() => (props.multiple ? undefined : (model.value ?? fallback.value?.value)));
const isOn = (value: T) => (props.multiple ? picked.value.includes(value) : current.value === value);
function choose(value: T) {
  if (!props.multiple) model.value = value;
  else values.value = picked.value.includes(value) ? picked.value.filter((v) => v !== value) : [...picked.value, value];
}
const attrs = useFieldAttrs();
const calm = useReducedMotion();
const optionId = (i: number) => `${uid.value}-${i}`;
// The summary of an EForm links to the chosen option.
useFormField({
  id: () =>
    optionId(
      Math.max(
        0,
        options.value.findIndex((o) => isOn(o.value)),
      ),
    ),
  label: () => props.label,
  error: () => props.error,
});

const track = ref<HTMLElement | null>(null);
/** Whether the options are wider than the track. Only then does the track clip: a clip along the rounded corners would draw them twice. */
const scrolls = useOverflow(track);
/** Whether the select stands in for the track: only once the options are known not to fit. The track stays in the page, unseen, so the same measure tells when they fit again. */
const collapsed = computed(() => !!props.collapse && scrolls.value);
const asSelect = computed(() => options.value.map(({ value, label, disabled }) => ({ value, label, disabled })));

/** In a space too narrow for every option the track scrolls, and the chosen option is brought into view. */
async function reveal(smooth: boolean) {
  await nextTick();
  const el = track.value;
  const opt = el?.querySelector<HTMLElement>(".e-seg-input[data-on]")?.parentElement;
  if (!el || !opt || el.scrollWidth <= el.clientWidth) return;
  const a = opt.getBoundingClientRect();
  const b = el.getBoundingClientRect();
  // Clamped to the track's own range: an end option would otherwise ask to be centred past the start, and iOS Safari lets the track rest there with empty space showing.
  const reach = el.scrollWidth - el.clientWidth;
  const rtl = getComputedStyle(el).direction === "rtl";
  const left = Math.min(
    Math.max(el.scrollLeft + a.left + a.width / 2 - (b.left + b.width / 2), rtl ? -reach : 0),
    rtl ? 0 : reach,
  );
  el.scrollTo({ left, behavior: smooth && !calm() ? "smooth" : "auto" });
}

onMounted(() => reveal(false));
watch([current, picked], () => reveal(true));
const pick = () =>
  track.value?.querySelector<HTMLInputElement>(".e-seg-input[data-on]") ??
  track.value?.querySelector<HTMLInputElement>(".e-seg-input") ??
  null;

defineExpose({
  /** The chosen radio, or the first one. */
  get input() {
    return pick();
  },
  focus: () => pick()?.focus(),
});

const groupAttrs = () => ({
  id: uid.value,
  // A shown label names the group, Required or Optional word and all.
  "aria-labelledby": props.hideLabel ? undefined : labelId.value,
  "aria-label": !props.hideLabel
    ? undefined
    : props.required
      ? `${props.label}, ${t("required")}`
      : props.optional
        ? `${props.label}, ${t("optional")}`
        : props.label,
  role: props.multiple ? "group" : "radiogroup",
  "aria-required": props.required ? ("true" as const) : undefined,
  "aria-readonly": props.readonly ? ("true" as const) : undefined,
  "aria-invalid": props.error ? ("true" as const) : undefined,
  ...attrs.group(describedBy()),
});
</script>

<template>
  <div
    class="e-seg-field"
    :class="[attrs.wrapper().class, stretch && 'e-seg-field--stretch', collapse && 'e-seg-field--collapse']"
    :style="attrs.wrapper().style"
  >
    <span v-if="!hideLabel" :id="labelId" class="e-field-label e-kicker">
      {{ label }}
      <EFieldFlag :required="required" :optional="optional" />
    </span>
    <ESelect
      v-if="collapsed"
      :model-value="(multiple ? picked : model) as never"
      bare
      class="e-seg-select"
      :aria-label="label"
      :options="asSelect"
      :multiple="multiple"
      :disabled="disabled"
      :readonly="readonly"
      :size="size"
      @update:model-value="multiple ? (values = $event as T[]) : (model = $event as T)"
    />
    <div
      ref="track"
      class="e-seg"
      :class="{
        'e-seg--disabled': disabled,
        'e-seg--scroll': scrolls,
        'e-seg--stretch': stretch,
        'e-seg--hidden': collapsed,
      }"
      :data-size="sizeAttr(size)"
      v-bind="groupAttrs()"
    >
      <label v-for="(o, i) in options" :key="o.value" class="e-seg-opt">
        <input
          :id="optionId(i)"
          :type="multiple ? 'checkbox' : 'radio'"
          class="e-seg-input"
          :name="name"
          :value="o.value"
          :checked="multiple ? isOn(o.value) : model === o.value"
          :data-on="isOn(o.value) ? '' : undefined"
          :disabled="o.disabled || disabled"
          :required="required && !multiple"
          @click="guard"
          @change="choose(o.value)"
        />
        <span class="e-seg-text"><EIcon v-if="o.icon" :name="o.icon" />{{ o.label }}</span>
      </label>
    </div>
    <EFieldMessage :id="hintId" :error="error" :hint="hint" />
  </div>
</template>

<style>
@layer e.controls {
  /* A pressed-in track. Each option draws its own edge, and neighbours share one, so every stroke is drawn once, including round the corners the end options take from the track. The chosen option fills its cell edge to edge in the primary colour: a value you set, not a place you go (that is Tabs). With too many options for the space the track scrolls sideways, with no bar. */
  .e-seg {
    display: inline-flex;
    box-sizing: border-box;
    height: var(--_h, var(--e-control-height));
    position: relative;
    border-radius: var(--e-radius-md);
    background: var(--e-surface-tint);
    box-shadow: var(--e-shadow-well);
    max-width: 100%;
    width: fit-content;
  }

  /* The heights of a field: a step under and over the control height. Small is for a toolbar, so its text and padding shrink too. */
  .e-seg[data-size="sm"] {
    --_h: calc(var(--e-control-height) - var(--e-gap-snug));
  }

  .e-seg[data-size="lg"] {
    --_h: calc(var(--e-control-height) + var(--e-gap-snug));
  }

  .e-seg[data-size="sm"] .e-seg-text {
    gap: var(--e-gap-tight);
    min-width: var(--_h);
    padding-inline: calc(var(--e-pad-control-sm) - var(--e-stroke-edge));
    font-size: var(--e-text-sm);
  }

  .e-seg--scroll {
    /* stylelint-disable-next-line declaration-block-no-redundant-longhand-properties -- the two axes are set apart: sideways scrolls, the rest is clipped */
    overflow-x: auto;
    overflow-y: hidden;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
  }

  .e-seg::-webkit-scrollbar {
    display: none;
  }

  .e-seg-opt {
    position: relative;
    display: inline-flex;
    flex: none;
    cursor: pointer;
  }

  /* Neighbours share one edge, and the one under the pointer or the chosen one is drawn on top of it. */
  .e-seg-opt + .e-seg-opt {
    margin-inline-start: calc(-1 * var(--e-stroke-edge));
  }

  .e-seg-opt:hover {
    z-index: var(--e-z-raised);
  }

  .e-seg-opt:has(.e-seg-input[data-on]) {
    z-index: var(--e-z-sticky);
  }

  .e-seg-input {
    position: absolute;
    inset: 0;
    opacity: 0;
    margin: 0;
    cursor: pointer;
  }

  /* The piece carries the slab contract: the edge of the control in its own colour, which the chosen piece paints primary, with the thicker edge at the bottom. */
  .e-seg-text {
    --_slab: var(--e-border-strong);
    --_lift: 0px;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--e-gap-snug);
    box-sizing: border-box;
    min-width: 4rem;
    padding-inline: calc(var(--e-pad-control) - var(--e-stroke-edge));
    border: var(--e-stroke-edge) solid var(--_slab);
    border-bottom-width: calc(var(--e-stroke-edge) + var(--_lift));
    background: transparent;
    color: var(--e-ink);
    font: var(--e-weight-medium) var(--e-text-md) / var(--e-leading-none) var(--e-font-sans);
    white-space: nowrap;
    transition: var(--e-transition-state);
  }

  /* The end pieces have the track's corners themselves. A piece fills the track edge to edge, so its border is the track's edge there; left square, the track's clip would cut off the corner of a ring, a focus outline or a slab at an end. */
  .e-seg-opt:first-child .e-seg-text {
    border-start-start-radius: var(--e-radius-md);
    border-end-start-radius: var(--e-radius-md) calc(var(--e-radius-md) + var(--_lift));
  }

  .e-seg-opt:last-child .e-seg-text {
    border-start-end-radius: var(--e-radius-md);
    border-end-end-radius: var(--e-radius-md) calc(var(--e-radius-md) + var(--_lift));
  }

  /* An option that is not chosen answers the pointer as an inactive tab does: ink text, a wash and a darker edge of the same width, darker again when pressed. No ring is added, so the edge never gets thicker. */
  .e-seg-opt:hover .e-seg-input:enabled:not([data-on]) + .e-seg-text {
    --_slab: var(--e-wash-ring);

    color: var(--e-ink);
    background: var(--e-wash-hover);
  }

  .e-seg-opt:active .e-seg-input:enabled:not([data-on]) + .e-seg-text {
    --_slab: var(--e-ink);

    background: var(--e-wash-press);
  }

  .e-seg-input[data-on] + .e-seg-text {
    --_slab: var(--e-primary-slab);
    --_lift: var(--e-depth);

    background-color: var(--e-primary);
    color: var(--e-on-primary);
  }

  .e-seg-opt:hover .e-seg-input:enabled[data-on] + .e-seg-text {
    background-color: var(--e-primary-hover);
  }

  .e-seg-opt:active .e-seg-input:enabled[data-on] + .e-seg-text {
    --_lift: 0px;

    background-color: var(--e-primary-press);
  }

  /* An option that cannot be chosen only dims; a fully disabled track draws the dashed edge. */
  .e-seg-input:disabled + .e-seg-text {
    color: var(--e-disabled-ink);
    cursor: not-allowed;
  }

  .e-seg--disabled .e-seg-text {
    --_slab: transparent;
  }

  .e-seg--disabled {
    --_dash-inset: 0;

    background: var(--e-disabled-fill);
    box-shadow: none;
  }

  /* Chosen but unavailable: a flat, tinted piece with ink text, so it stays readable. It has no edge of its own, only the track's dashed one, so its corners follow the track's. */
  .e-seg-input:disabled[data-on] + .e-seg-text {
    --_slab: transparent;
    --_lift: 0px;

    background-color: var(--e-wash-press);
    color: var(--e-ink);
  }

  /* Invalid: the edge of every option that is not chosen turns danger, and an option under the pointer tints danger-soft. The chosen option is still primary. A fully disabled track stays neutral. */
  .e-seg[aria-invalid="true"]:has(.e-seg-input:enabled) .e-seg-input:not([data-on]) + .e-seg-text {
    --_slab: var(--e-danger);
  }

  .e-seg[aria-invalid="true"] .e-seg-opt:hover .e-seg-input:enabled:not([data-on]) + .e-seg-text {
    background: var(--e-danger-soft);
  }

  /* Fills the container: the track and the options share the width. */
  .e-seg-field--stretch {
    display: grid;
    width: 100%;
  }

  .e-seg--stretch {
    width: 100%;
  }

  .e-seg--stretch .e-seg-opt {
    flex: 1 1 0;
  }

  .e-seg--stretch .e-seg-text {
    flex: 1;
    min-width: 0;
  }

  /* A collapsing control measures its room, so it takes the whole container. The track, when the select stands in for it, stays in the page unseen so its width can still be measured. */
  .e-seg-field--collapse {
    position: relative;
    display: grid;
    width: 100%;
  }

  .e-seg--hidden {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    visibility: hidden;
    pointer-events: none;
  }

  /* One wrapper, with a message or without. It sits inline as the track does, and a message under the track wraps at the width it is given. */
  .e-seg-field {
    display: inline-grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--e-gap-snug);
    max-width: 100%;
    vertical-align: middle;
  }

  @media (forced-colors: active) {
    /* The well is a shadow, which forced colours drop, so the track draws a border. */
    .e-seg {
      border: var(--e-stroke-edge) solid ButtonText;
    }

    .e-seg-input[data-on] + .e-seg-text {
      forced-color-adjust: none;
      background: Highlight;
      color: HighlightText;
    }
  }
}
</style>
