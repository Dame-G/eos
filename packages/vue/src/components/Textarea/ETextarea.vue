<script setup lang="ts">
import { nextTick, onMounted, watch } from "vue";
import EField from "../Field/EField.vue";
import EFieldCount from "../Field/EFieldCount.vue";
import { sizeAttr, type EFieldBoxProps, type EFieldCommonProps } from "../Field/fieldProps.js";
import { useFieldControl, type FieldSlot } from "../../composables/useFieldControl.js";
import "../../styles/base.css";
import "../../styles/controls/input.css";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    EFieldCommonProps &
      Pick<EFieldBoxProps, "size"> & {
        /** The visible label above the textarea. */
        label: string;
        /** An example, never the label. */
        placeholder?: string;
        /** Visible lines. The height follows it, down to one. With `autoGrow` it is the least height. @default 4 */
        rows?: number;
        /** The name submitted with a form. */
        name?: string;
        /** What the browser may fill in. */
        autocomplete?: string;
        /** The most characters the textarea takes. */
        maxlength?: number;
        /** Shows how many characters there are, out of `maxlength` when it is set. */
        counter?: boolean;
        /** Grows with the text instead of scrolling, and drops the resize handle. */
        autoGrow?: boolean;
      }
  >(),
  { rows: 4 },
);

/** The text. */
const model = defineModel<string>({ default: "" });

const control = useFieldControl<HTMLTextAreaElement>(props);
const input = control.input;

function inputBind(field: FieldSlot) {
  return {
    class: "e-input e-textarea",
    rows: props.rows,
    placeholder: props.placeholder,
    name: props.name,
    value: model.value,
    autocomplete: props.autocomplete,
    maxlength: props.maxlength,
    "data-autogrow": props.autoGrow ? "" : undefined,
    "data-size": sizeAttr(props.size),
    ...control.bind(field, [props.counter && `${field.id}-count`]),
  };
}

/** Sizes the box to its text: the content height plus the border the scroll height leaves out. */
function grow() {
  const el = input.value;
  if (!el || !props.autoGrow) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight + el.offsetHeight - el.clientHeight}px`;
}
watch([model, () => props.autoGrow, () => props.rows], async () => {
  await nextTick();
  grow();
});
onMounted(grow);
defineExpose(control.exposed);
</script>

<template>
  <EField
    v-bind="control.attrs.wrapper()"
    :id="id"
    :label="label"
    :hide-label="hideLabel"
    :hint="hint"
    :error="error"
    :required="required"
    :optional="optional"
  >
    <template #default="field">
      <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
      <textarea ref="input" v-bind="inputBind(field)" @input="model = ($event.target as HTMLTextAreaElement).value" />
    </template>
    <template v-if="counter" #aside="{ id: fieldId }">
      <EFieldCount :id="`${fieldId}-count`" :count="model.length" :max="maxlength" />
    </template>
  </EField>
</template>

<style>
@layer e.controls {
  /* The height comes from `rows`, so 2 rows is shorter than 4. The block padding is what centres one line in a text field of the same `size`, so a one-row textarea is exactly as tall as that field and its text sits on the same line. */
  .e-textarea {
    height: auto;
    padding: calc((var(--_h, var(--e-control-height)) - 1lh) / 2 - var(--e-stroke-edge))
      calc(var(--e-pad-control) - var(--e-stroke-edge));
    resize: vertical;
  }

  .e-textarea[data-autogrow] {
    overflow-y: hidden;
    resize: none;
  }
}
</style>
