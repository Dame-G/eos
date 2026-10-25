<script lang="ts">
import type { EOption } from "../Select/options.js";

/** One choice in an `ECheckboxGroup`. */
export type CheckboxOption<T extends string = string> = Pick<EOption, "label" | "description" | "disabled"> & {
  value: T;
};
</script>

<script setup lang="ts" generic="T extends string = string">
import { computed, ref } from "vue";
import ECheckbox from "../Checkbox/ECheckbox.vue";
import EFieldset from "../Fieldset/EFieldset.vue";
import type { EFieldCommonProps } from "../Field/fieldProps.js";
import { normalizeChoices } from "../RadioGroup/options.js";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";
import "../../styles/controls/choice.css";

const props = defineProps<
  Omit<EFieldCommonProps, "id" | "required" | "error"> & {
    /** The question, as the group's legend. */
    label: string;
    /** A string is both value and label. `CheckboxOption`: `{ value, label, description?, disabled? }`. */
    options: (T | CheckboxOption<T>)[];
    /** What to fix. Replaces the hint, marks every box invalid and is announced with the group. */
    error?: string;
    /** Adds the word "Required" beside the legend. The group does not validate itself: the form decides how many boxes are enough. */
    required?: boolean;
    /** Shared by the boxes, submitted with a form: one entry per checked box. */
    name?: string;
    /** The id of the group's `fieldset`, which an `EForm` summary links to. The boxes are `{id}-1`, `{id}-2` and so on. @default generated */
    id?: string;
    /** Lays the options out in a row that wraps, or one under another. @default "vertical" */
    orientation?: "vertical" | "horizontal";
  }
>();

/** The values that are checked, in the order they were chosen. */
const model = defineModel<T[]>({ default: () => [] });

const id = useUid(() => props.id);
const items = computed(() => normalizeChoices<CheckboxOption<T>>(props.options));
const root = ref<{ $el: HTMLElement } | null>(null);
const first = () => root.value?.$el.querySelector<HTMLInputElement>(".e-check") ?? null;

function toggle(value: T, on: boolean) {
  const rest = model.value.filter((v) => v !== value);
  model.value = on ? [...rest, value] : rest;
}

defineExpose({
  /** The first checkbox. */
  get input() {
    return first();
  },
  focus: () => first()?.focus(),
});
</script>

<template>
  <EFieldset
    :id="id"
    ref="root"
    class="e-checkgroup"
    legend-class="e-checkgroup-legend"
    bare
    :legend="label"
    :hide-legend="hideLabel"
    :hint="hint"
    :error="error"
    :required="required"
    :optional="optional"
    :disabled="disabled"
  >
    <div class="e-checkgroup-items" :class="{ 'e-checkgroup-items--row': orientation === 'horizontal' }">
      <ECheckbox
        v-for="(item, i) in items"
        :id="`${id}-${i + 1}`"
        :key="item.value"
        :label="item.label"
        :description="item.description"
        :disabled="item.disabled"
        :readonly="readonly"
        :name="name"
        :value="item.value"
        :model-value="model.includes(item.value)"
        :aria-invalid="error ? 'true' : undefined"
        @update:model-value="toggle(item.value, $event)"
      />
    </div>
  </EFieldset>
</template>

<style>
@layer e.controls {
  .e-checkgroup-items {
    display: flex;
    flex-direction: column;
  }

  .e-checkgroup-items--row {
    flex-flow: row wrap;
    column-gap: var(--e-gap-loose);
  }
}
</style>
