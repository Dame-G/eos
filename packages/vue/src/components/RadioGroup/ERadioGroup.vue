<script lang="ts">
export interface RadioOption {
  value: string;
  label: string;
  /** A line of detail under the label. */
  description?: string;
  disabled?: boolean;
}
</script>

<script setup lang="ts">
import { Comment, Fragment, useSlots, type FunctionalComponent, type VNode } from "vue";
import EFieldset from "../Fieldset/EFieldset.vue";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";
import "../Checkbox/choice.css";

const props = defineProps<{
  /** The question, as the group's legend. */
  label: string;
  /** Keep the legend for screen readers and remove it from the page. */
  hideLabel?: boolean;
  /** Five or fewer. A string is both value and label. `RadioOption`: `{ value, label, description?, disabled? }`. */
  options: (string | RadioOption)[];
  /** Help that is announced with the group. */
  hint?: string;
  /** What to fix. Replaces the hint and is announced with the group. */
  error?: string;
  /** A word beside the legend, and `required` on the radios. */
  required?: boolean;
  /** A word beside the legend. Flag whichever is rarer. */
  optional?: boolean;
  /** Disables every option. */
  disabled?: boolean;
  /** Shared by the radios, submitted with a form. @default generated */
  name?: string;
}>();

defineSlots<{
  /** A control shown under its option while that option is chosen, such as an amount field under "Another amount". Render nothing for an option that has none. */
  reveal(props: { option: RadioOption }): unknown;
}>();

/** The chosen value. */
const model = defineModel<string>();

const name = useUid(() => props.name);
const slots = useSlots();

const normalised = (): RadioOption[] => props.options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));

function hasContent(nodes: VNode[]): boolean {
  return nodes.some((n) =>
    n.type === Comment ? false : n.type === Fragment ? hasContent((n.children as VNode[] | null) ?? []) : true,
  );
}

function rows() {
  return normalised().map((option) => {
    const chosen = model.value === option.value;
    const nodes = chosen ? slots.reveal?.({ option }) : undefined;
    return { option, chosen, reveal: nodes && hasContent(nodes) ? nodes : null };
  });
}

const Nodes: FunctionalComponent<{ nodes: VNode[] }> = (p) => p.nodes;
Nodes.props = ["nodes"];
</script>

<template>
  <EFieldset
    :id="`${name}-fs`"
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
          :disabled="row.option.disabled"
          @change="model = row.option.value"
        />
        <span class="e-choice-text">
          {{ row.option.label }}
          <span v-if="row.option.description" class="e-choice-desc">{{ row.option.description }}</span>
        </span>
      </label>
      <div v-if="row.reveal" class="e-choice-reveal"><Nodes :nodes="row.reveal" /></div>
    </template>
  </EFieldset>
</template>

<style>
@layer e.controls {
  .e-radiogroup {
    display: grid;
    gap: 0;
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }

  .e-radiogroup-legend {
    padding: 0;
  }

  .e-radiogroup > .e-field-hint,
  .e-radiogroup > .e-field-error {
    margin-top: calc(var(--e-space-1) - var(--e-space-2) - var(--e-focus-gap));
  }

  .e-choice--open {
    min-height: 0;
    padding-bottom: var(--e-space-1);
  }

  .e-choice-reveal {
    padding: var(--e-space-1) 0 var(--e-space-2);
  }
}
</style>
