<script lang="ts">
export type { RadioOption } from "./options.js";
</script>

<script setup lang="ts" generic="T extends string = string">
import { Comment, Fragment, ref, useSlots, type FunctionalComponent, type VNode } from "vue";
import EFieldset from "../Fieldset/EFieldset.vue";
import { normalizeChoices, type RadioOption } from "./options.js";
import { keepIfReadonly } from "../Checkbox/useChoiceMessage.js";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";
import "../Checkbox/choice.css";

const props = defineProps<{
  /** The question, as the group's legend. */
  label: string;
  /** Keeps the legend for screen readers and hides it from the page. */
  hideLabel?: boolean;
  /** Five or fewer. A string is both value and label. `RadioOption`: `{ value, label, description?, disabled? }`. */
  options: (T | RadioOption<T>)[];
  /** Help that is announced with the group. */
  hint?: string;
  /** What to fix. Replaces the hint and is announced with the group. */
  error?: string;
  /** Sets `required` on the radios and adds a word beside the legend. */
  required?: boolean;
  /** Adds a word beside the legend. Use it when most fields in the form are required. */
  optional?: boolean;
  /** Disables every option. */
  disabled?: boolean;
  /** Shows the choice but blocks changing it. The radios stay focusable and the value is still submitted. */
  readonly?: boolean;
  /** Shared by the radios, submitted with a form. @default generated */
  name?: string;
}>();

defineSlots<{
  /** A control shown under its option while that option is chosen, such as an amount field under "Another amount". An option with no content here shows no extra control. */
  reveal(props: { option: RadioOption<T> }): unknown;
}>();

/** The chosen value. */
const model = defineModel<T>();

const name = useUid(() => props.name);
const uid = useUid();
const slots = useSlots();

function hasContent(nodes: VNode[]): boolean {
  return nodes.some((n) =>
    n.type === Comment ? false : n.type === Fragment ? hasContent((n.children as VNode[] | null) ?? []) : true,
  );
}

function rows() {
  return normalizeChoices<RadioOption<T>>(props.options).map((option, i) => {
    const chosen = model.value === option.value;
    const nodes = chosen ? slots.reveal?.({ option }) : undefined;
    const descId = option.description ? `${uid.value}-d${i}` : undefined;
    return { option, chosen, descId, reveal: nodes && hasContent(nodes) ? nodes : null };
  });
}

const guard = keepIfReadonly(() => props.readonly);
const root = ref<{ $el: HTMLElement } | null>(null);
const firstRadio = () =>
  root.value?.$el.querySelector<HTMLInputElement>(".e-radio:checked") ??
  root.value?.$el.querySelector<HTMLInputElement>(".e-radio") ??
  null;

defineExpose({
  /** The chosen radio, or the first one. */
  get input() {
    return firstRadio();
  },
  focus: () => firstRadio()?.focus(),
});

const Nodes: FunctionalComponent<{ nodes: VNode[] }> = (p) => p.nodes;
Nodes.props = ["nodes"];
</script>

<template>
  <EFieldset
    :id="`${uid}-fs`"
    ref="root"
    class="e-radiogroup"
    legend-class="e-radiogroup-legend"
    bare
    :legend="label"
    :hide-legend="hideLabel"
    :hint="hint"
    :error="error"
    :required="required"
    :optional="optional"
    :disabled="disabled"
    role="radiogroup"
    :aria-readonly="readonly ? 'true' : undefined"
  >
    <template v-for="row in rows()" :key="row.option.value">
      <label class="e-choice" :class="{ 'e-choice--disabled': row.option.disabled, 'e-choice--open': row.reveal }">
        <input
          type="radio"
          class="e-radio"
          :name="name"
          :value="row.option.value"
          :required="required"
          :checked="row.chosen"
          :aria-invalid="error ? 'true' : undefined"
          :aria-describedby="row.descId"
          :disabled="row.option.disabled"
          @click="guard"
          @change="model = row.option.value"
        />
        <span class="e-choice-text">
          <span class="e-choice-label">{{ row.option.label }}</span>
          <!-- Visible under the label, but kept out of its accessible name: the radio points at it with aria-describedby. -->
          <span v-if="row.descId" :id="row.descId" class="e-choice-desc" aria-hidden="true">{{
            row.option.description
          }}</span>
        </span>
      </label>
      <div v-if="row.reveal" class="e-choice-reveal"><Nodes :nodes="row.reveal" /></div>
    </template>
  </EFieldset>
</template>

<style>
@layer e.controls {
  .e-choice--open {
    min-height: 0;
    padding-block-end: var(--e-gap-tight);
  }

  .e-choice-reveal {
    padding-block: var(--e-gap-tight) var(--e-gap-snug);
  }
}
</style>
