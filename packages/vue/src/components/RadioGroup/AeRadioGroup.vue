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
import AeFieldset from "../Fieldset/AeFieldset.vue";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";
import "../Checkbox/choice.css";

const props = defineProps<{
  /** The question, as the group's legend. */
  label: string;
  /** Five or fewer. A string is both value and label. */
  options: (string | RadioOption)[];
  /** Help that is announced with the group. */
  hint?: string;
  /** What to fix. Replaces the hint and is announced with the group. */
  error?: string;
  required?: boolean;
  /** A word beside the legend. Flag whichever is rarer. */
  optional?: boolean;
  /** Disables every option. */
  disabled?: boolean;
  /** The name the radios share, submitted with a form. Generated when left out. */
  name?: string;
}>();

defineSlots<{
  /** A control shown under its option while that option is chosen, such as an amount field under "Another amount". Render nothing for an option that has none. */
  reveal(props: { option: RadioOption }): unknown;
}>();

/** The chosen option's value. */
const model = defineModel<string>();

const name = useUid(() => props.name);
const slots = useSlots();

const normalised = (): RadioOption[] => props.options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));

function hasContent(nodes: VNode[]): boolean {
  return nodes.some((n) =>
    n.type === Comment ? false : n.type === Fragment ? hasContent((n.children as VNode[] | null) ?? []) : true,
  );
}

/** One row per option, with the revealed nodes of the chosen option when the slot gives it any. */
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
  <AeFieldset
    :id="`${name}-fs`"
    class="ae-radiogroup"
    legend-class-name="ae-radiogroup-legend"
    bare
    :legend="label"
    :hint="hint"
    :error="error"
    :required="required"
    :optional="optional"
    :disabled="disabled"
  >
    <template v-for="row in rows()" :key="row.option.value">
      <label class="ae-choice" :class="{ 'ae-choice--disabled': row.option.disabled, 'ae-choice--open': row.reveal }">
        <input
          type="radio"
          class="ae-radio"
          :name="name"
          :value="row.option.value"
          :required="required"
          :checked="row.chosen"
          :disabled="row.option.disabled"
          @change="model = row.option.value"
        />
        <span class="ae-choice-text">
          {{ row.option.label }}
          <span v-if="row.option.description" class="ae-choice-desc">{{ row.option.description }}</span>
        </span>
      </label>
      <div v-if="row.reveal" class="ae-choice-reveal"><Nodes :nodes="row.reveal" /></div>
    </template>
  </AeFieldset>
</template>

<style>
@layer ae.controls {
  .ae-radiogroup {
    display: grid;
    gap: 0;
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }

  .ae-radiogroup-legend {
    padding: 0;
  }

  .ae-radiogroup > .ae-field-hint,
  .ae-radiogroup > .ae-field-error {
    margin-top: -6px;
  }

  .ae-choice--open {
    min-height: 0;
    padding-bottom: var(--ae-space-1);
  }

  .ae-choice-reveal {
    padding: var(--ae-space-1) 0 var(--ae-space-2);
  }
}
</style>
