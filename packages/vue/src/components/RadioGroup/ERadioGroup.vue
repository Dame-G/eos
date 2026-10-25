<script lang="ts">
export type { ChoiceOption } from "./options.js";
</script>

<script setup lang="ts" generic="T extends string = string">
import { Comment, computed, Fragment, h, ref, useSlots, type FunctionalComponent, type VNode } from "vue";
import EFieldset from "../Fieldset/EFieldset.vue";
import type { EFieldCommonProps } from "../Field/fieldProps.js";
import { useFormField } from "../../composables/useFormContext.js";
import { normalizeChoices, type ChoiceOption } from "./options.js";
import { keepIfReadonly } from "../Checkbox/useChoiceMessage.js";
import { missingMessage } from "../Form/missing.js";
import { useMessages } from "../../config.js";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";
import "../../styles/controls/choice.css";

const props = defineProps<
  Omit<EFieldCommonProps, "id" | "required"> & {
    /** The question, as the group's legend. */
    label: string;
    /** Five or fewer. A string is both value and label. `ChoiceOption`: `{ value, label, description?, disabled? }`. */
    options: readonly (T | ChoiceOption<T>)[];
    /** Sets `required` on the radios and adds a word beside the legend. */
    required?: boolean;
    /** Shared by the radios, submitted with a form. @default generated */
    name?: string;
    /** The id of the group's `fieldset`, which an `EForm` summary links to. The radios are `{id}-1`, `{id}-2` and so on. @default generated */
    id?: string;
    /** Lays the options out in a row that wraps, or one under another. @default "vertical" */
    orientation?: "vertical" | "horizontal";
  }
>();

defineSlots<{
  /** A control shown under its option while that option is chosen, such as an amount field under "Another amount". An option with no content here shows no extra control. */
  reveal(props: { option: ChoiceOption<T> }): unknown;
}>();

/** The chosen value. */
const model = defineModel<T>();

const t = useMessages();
const name = useUid(() => props.name);
const uid = useUid(() => props.id);
const slots = useSlots();

function hasContent(nodes: VNode[]): boolean {
  return nodes.some((n) =>
    n.type === Comment ? false : n.type === Fragment ? hasContent((n.children as VNode[] | null) ?? []) : true,
  );
}

const rows = computed(() =>
  normalizeChoices<ChoiceOption<T>>(props.options).map((option, i) => {
    const id = `${uid.value}-${i + 1}`;
    return { option, chosen: model.value === option.value, id, descId: option.description ? `${id}-desc` : undefined };
  }),
);

/** The chosen option's reveal content, in a box under it; nothing when the slot gives nothing for it. */
const Reveal: FunctionalComponent<{ option: ChoiceOption<T> }> = (p) => {
  const nodes = slots.reveal?.({ option: p.option }) as VNode[] | undefined;
  return nodes && hasContent(nodes) ? h("div", { class: "e-choice-reveal" }, nodes) : null;
};
Reveal.props = ["option"];

const guard = keepIfReadonly(() => props.readonly);
const root = ref<{ $el: HTMLElement } | null>(null);
// The summary of an EForm lists the group once, by its label: its error, or the browser's message for an empty required group.
useFormField({
  id: () => uid.value,
  label: () => props.label,
  error: () => props.error,
  check: () =>
    props.required && !props.disabled && !rows.value.some((r) => r.chosen)
      ? missingMessage("radio", t("required"))
      : undefined,
});
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
</script>

<template>
  <EFieldset
    :id="uid"
    ref="root"
    class="e-radiogroup"
    :class="{ 'e-radiogroup--row': orientation === 'horizontal' }"
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
    <template v-for="row in rows" :key="row.option.value">
      <label class="e-choice" :class="{ 'e-choice--disabled': row.option.disabled }">
        <input
          :id="row.id"
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
      <Reveal v-if="row.chosen && $slots.reveal" :option="row.option" />
    </template>
  </EFieldset>
</template>

<style>
@layer e.controls {
  .e-choice:has(+ .e-choice-reveal) {
    min-height: 0;
    padding-block-end: var(--e-gap-tight);
  }

  .e-choice-reveal {
    padding-block: var(--e-gap-tight) var(--e-gap-snug);
  }

  /* In a row the options wrap, a loose gap apart, and a revealed control takes a line of its own under them. */
  .e-radiogroup--row > .e-fieldset-body {
    display: flex;
    flex-wrap: wrap;
    column-gap: var(--e-gap-loose);
  }

  .e-radiogroup--row .e-choice-reveal {
    flex-basis: 100%;
  }
}
</style>
