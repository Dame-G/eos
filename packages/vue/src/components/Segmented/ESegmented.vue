<script lang="ts">
export type { SegmentedOption } from "../RadioGroup/options.js";
</script>

<script setup lang="ts" generic="T extends string = string">
import { computed, h, nextTick, onMounted, ref, watch, type FunctionalComponent } from "vue";
import EIcon from "../Icon/EIcon.vue";
import EFieldMessage from "../Field/EFieldMessage.vue";
import { useMessages } from "../../config.js";
import { normalizeChoices } from "../RadioGroup/options.js";
import type { SegmentedOption } from "../RadioGroup/options.js";
import { keepIfReadonly, useChoiceMessage } from "../Checkbox/useChoiceMessage.js";
import { useFieldAttrs } from "../../composables/useFieldAttrs.js";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  /** Read by screen readers as the name of the group. */
  label: string;
  /** Two to five. A string is both value and label. `SegmentedOption` is `{ value, label, icon?, disabled? }`. */
  options: (T | SegmentedOption<T>)[];
  /** Help under the control, linked with `aria-describedby`. */
  hint?: string;
  /** What to fix. Replaces the hint and is announced. */
  error?: string;
  /** Adds the word "Optional" to the group's accessible name and shows nothing. Use it when most fields in the form are required. */
  optional?: boolean;
  /** Marks the group `aria-required` and adds the word "Required" to its accessible name. */
  required?: boolean;
  /** Disables every option. */
  disabled?: boolean;
  /** Shows the choice but blocks changing it. The options stay focusable and the value is still submitted. */
  readonly?: boolean;
  /** The name the radios share, submitted with a form. @default generated */
  name?: string;
}>();

/** The active value. Left unset, the first option that can be chosen is shown as active and `v-model` is not told until the person chooses. @default first option */
const model = defineModel<T>();

const t = useMessages();
const name = useUid(() => props.name);
const message = computed(() => ({ hint: props.hint, error: props.error }));
const { messageId: hintId, describedBy } = useChoiceMessage(name, message);
const guard = keepIfReadonly(() => props.readonly);
const options = computed(() => normalizeChoices<SegmentedOption<T>>(props.options));
/** What is shown as chosen while the model has no value: the first option that can be chosen. */
const fallback = computed(() => options.value.find((o) => !o.disabled && !props.disabled) ?? options.value[0]);
const current = computed(() => model.value ?? fallback.value?.value);
const attrs = useFieldAttrs();

const track = ref<HTMLElement | null>(null);

/** In a space too narrow for every option the track scrolls, and the chosen option is brought into view. */
async function reveal(smooth: boolean) {
  await nextTick();
  const el = track.value;
  const opt = el?.querySelector<HTMLElement>(".e-seg-input:checked")?.parentElement;
  if (!el || !opt || el.scrollWidth <= el.clientWidth) return;
  const a = opt.getBoundingClientRect();
  const b = el.getBoundingClientRect();
  el.scrollBy({ left: a.left + a.width / 2 - (b.left + b.width / 2), behavior: smooth ? "smooth" : "auto" });
}

onMounted(() => reveal(false));
watch(current, () => reveal(true));
const pick = () =>
  track.value?.querySelector<HTMLInputElement>(".e-seg-input:checked") ??
  track.value?.querySelector<HTMLInputElement>(".e-seg-input") ??
  null;

defineExpose({
  /** The chosen radio, or the first one. */
  get input() {
    return pick();
  },
  focus: () => pick()?.focus(),
});

/** The radios, once for both layouts (with and without a message under the track). */
const Choices: FunctionalComponent<
  {
    options: SegmentedOption<T>[];
    name: string;
    current?: T;
    disabled?: boolean;
    required?: boolean;
    guard: (e: Event) => void;
  },
  { pick: [value: T] }
> = (p, { emit }) =>
  p.options.map((o) =>
    h("label", { key: o.value, class: "e-seg-opt" }, [
      h("input", {
        type: "radio",
        class: "e-seg-input",
        name: p.name,
        value: o.value,
        checked: p.current === o.value,
        disabled: o.disabled || p.disabled,
        required: p.required,
        onClick: p.guard,
        onChange: () => emit("pick", o.value),
      }),
      h("span", { class: "e-seg-text" }, [o.icon ? h(EIcon, { name: o.icon }) : null, o.label]),
    ]),
  );
Choices.props = ["options", "name", "current", "disabled", "required", "guard"];
Choices.emits = ["pick"];

const groupAttrs = () => ({
  role: "radiogroup",
  "aria-label": props.required
    ? `${props.label}, ${t("required")}`
    : props.optional
      ? `${props.label}, ${t("optional")}`
      : props.label,
  "aria-required": props.required ? ("true" as const) : undefined,
  "aria-readonly": props.readonly ? ("true" as const) : undefined,
  "aria-invalid": props.error ? ("true" as const) : undefined,
  ...attrs.input(describedBy()),
});
</script>

<template>
  <div v-if="hint || error" class="e-seg-field" :class="attrs.wrapper().class" :style="attrs.wrapper().style">
    <div ref="track" class="e-seg" :class="{ 'e-seg--disabled': disabled }" v-bind="groupAttrs()">
      <Choices
        :options="options"
        :name="name"
        :current="current"
        :disabled="disabled"
        :required="required"
        :guard="guard"
        @pick="model = $event"
      />
    </div>
    <EFieldMessage :id="hintId" :error="error" :hint="hint" />
  </div>
  <div
    v-else
    ref="track"
    class="e-seg"
    :class="[{ 'e-seg--disabled': disabled }, attrs.wrapper().class]"
    :style="attrs.wrapper().style"
    v-bind="groupAttrs()"
  >
    <Choices
      :options="options"
      :name="name"
      :current="current"
      :disabled="disabled"
      :required="required"
      :guard="guard"
      @pick="model = $event"
    />
  </div>
</template>

<style>
@layer e.controls {
  /* A pressed-in track. The chosen option fills its cell edge to edge in the primary colour, covering the track's outline there so the outline turns primary where it is chosen, and the track clips it, so only the pieces at either end take the track's rounded corners: a value you set, not a place you go (that is Tabs). With too many options for the space the track scrolls sideways, with no bar, while its outline stays put. */
  .e-seg {
    display: inline-flex;
    box-sizing: border-box;
    height: var(--e-control-height);
    position: relative;
    border-radius: var(--e-radius-md);
    background: var(--e-surface-tint);
    box-shadow:
      inset 0 0 0 var(--e-stroke-edge) var(--e-border-strong),
      var(--e-well);
    /* stylelint-disable-next-line declaration-block-no-redundant-longhand-properties -- the two axes are set apart: sideways scrolls, the rest is clipped */
    overflow-x: auto;
    overflow-y: hidden;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
    max-width: 100%;
    width: fit-content;
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

  .e-seg-input {
    position: absolute;
    inset: 0;
    opacity: 0;
    margin: 0;
    cursor: pointer;
  }

  /* The piece carries the slab contract: a transparent border that the chosen piece paints, with the edge at the bottom. */
  .e-seg-text {
    --_slab: transparent;
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
    font: var(--e-weight-medium) var(--e-text-md) / 1 var(--e-font-sans);
    white-space: nowrap;
    transition: var(--e-transition-state);
  }

  /* The hover and press ring is the piece's own border, not an inset shadow: a shadow draws inside the border, which leaves a strip of bare wash between the ring and the next piece. */
  .e-seg-opt:hover .e-seg-input:enabled:not(:checked) + .e-seg-text {
    --_slab: var(--e-wash-ring);

    background: var(--e-wash-hover);
  }

  .e-seg-opt:active .e-seg-input:enabled:not(:checked) + .e-seg-text {
    --_slab: var(--e-ink);

    background: var(--e-wash-press);
  }

  .e-seg-input:checked + .e-seg-text {
    --_slab: var(--e-primary-slab);
    --_lift: var(--e-slab);

    background-color: var(--e-primary);
    color: var(--e-on-primary);
    font-weight: var(--e-weight-strong);
  }

  .e-seg-opt:hover .e-seg-input:enabled:checked + .e-seg-text {
    background-color: var(--e-primary-hover);
  }

  .e-seg-opt:active .e-seg-input:enabled:checked + .e-seg-text {
    --_lift: 0px;

    background-color: var(--e-primary-press);
  }

  .e-seg-input:focus-visible + .e-seg-text {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: calc(-1 * var(--e-stroke-focus));
  }

  /* An option that cannot be chosen only dims; a fully disabled track draws the dashed edge. */
  .e-seg-input:disabled + .e-seg-text {
    color: var(--e-disabled-ink);
    cursor: not-allowed;
  }

  .e-seg--disabled {
    background: var(--e-disabled-fill);
    box-shadow: none;
    outline: var(--e-stroke-edge) dashed var(--e-border-strong);
    outline-offset: calc(-1 * var(--e-stroke-edge));
  }

  /* Chosen but unavailable: a flat, tinted piece with ink text, so it stays readable. It has no edge of its own, only the track's dashed one, so its corners follow the track's. */
  .e-seg-input:disabled:checked + .e-seg-text {
    --_slab: transparent;
    --_lift: 0px;

    background-color: var(--e-wash-press);
    color: var(--e-ink);
  }

  /* Invalid: the track's edge turns danger and an option under the pointer tints danger-soft. The chosen cell still covers the edge in primary. A fully disabled track stays neutral. */
  .e-seg[aria-invalid="true"]:has(.e-seg-input:enabled) {
    box-shadow:
      inset 0 0 0 var(--e-stroke-edge) var(--e-danger),
      var(--e-well);
  }

  .e-seg[aria-invalid="true"] .e-seg-opt:hover .e-seg-input:enabled:not(:checked) + .e-seg-text {
    background: var(--e-danger-soft);
  }

  .e-seg-field {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--e-gap-snug);
  }

  @media (forced-colors: active) {
    .e-seg-input:checked + .e-seg-text {
      forced-color-adjust: none;
      background: Highlight;
      color: HighlightText;
    }
  }
}
</style>
