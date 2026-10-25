<script setup lang="ts">
import { computed, h, ref, watch, type FunctionalComponent } from "vue";
import {
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectViewport,
} from "reka-ui";
import EIcon from "../Icon/EIcon.vue";
import ESpinner from "../Spinner/ESpinner.vue";
import EHiddenInputs from "../Field/EHiddenInputs.vue";
import EInputClear from "../Field/EInputClear.vue";
import ESelectOption from "./ESelectOption.vue";
import { sectionOptions, type EOption } from "./options.js";
import { sizeAttr, type EFieldSize } from "../Field/fieldProps.js";
import { FIELD_POPPER } from "../Field/popper.js";
import { useMessages, usePortalTarget } from "../../config.js";
import { useDir } from "../../composables/useDir.js";
import { RekaConfig } from "../../composables/useRekaConfig.js";
import { useQuietFocus } from "../../composables/useQuietFocus.js";
import "../../styles/base.css";
import "../../styles/controls/input.css";
import "../../styles/controls/panel.css";

const props = defineProps<{
  /** The normalised options. */
  options: EOption[];
  placeholder?: string | undefined;
  disabled?: boolean | undefined;
  readonly?: boolean | undefined;
  required?: boolean | undefined;
  multiple?: boolean | undefined;
  clearable?: boolean | undefined;
  loading?: boolean | undefined;
  size?: EFieldSize | undefined;
  name?: string | undefined;
  /** The `form` attribute the consumer gave, so the hidden inputs can join a form they are not inside. */
  form?: string | undefined;
  /** Names the list. */
  label?: string | undefined;
  /** Attributes for the button: id, aria-*, data-*, listeners. */
  triggerAttrs: Record<string, unknown>;
}>();

const emit = defineEmits<{
  /** The clear button emptied the value. */
  clear: [];
}>();

/** The chosen `value`, or the array of them with `multiple`. */
const model = defineModel<string | string[]>({ default: "" });

const t = useMessages();
const dir = useDir();
const trigger = ref<{ $el: HTMLElement } | null>(null);
const portal = usePortalTarget();

const sections = computed(() => sectionOptions(props.options));
const values = computed<string[]>(() => (Array.isArray(model.value) ? model.value : model.value ? [model.value] : []));
const chosen = computed(() => props.options.filter((o) => values.value.includes(o.value)));
const selected = computed(() => chosen.value[0]);
const canClear = computed(() => !!props.clearable && values.value.length > 0 && !props.disabled && !props.readonly);

/** Letters typed this close together search as one word. */
const TYPEAHEAD_PAUSE_MS = 700;
let typed = "";
let typedAt = 0;
const open = defineModel<boolean>("open", { default: false });
const isOpen = computed(() => open.value && !props.disabled && !props.readonly);
const quiet = useQuietFocus(isOpen, (el) => !!el.closest("[role=listbox]"));
watch(
  isOpen,
  (now) => {
    if (now && !quiet.personOpened()) quiet.undoFocusSteal();
  },
  { immediate: true, flush: "post" },
);
function closeFocus(e: Event) {
  if (!quiet.returnsFocus()) e.preventDefault();
}
function change(v: unknown) {
  if (!props.readonly) model.value = props.multiple ? (v as string[]) : (v as string);
}
function clear() {
  model.value = props.multiple ? [] : "";
  emit("clear");
  trigger.value?.$el.focus();
}
// A read-only button keeps focus but neither opens nor picks by typing: Reka never sees the key.
function guard(e: KeyboardEvent) {
  if (props.readonly && e.key !== "Tab") e.stopImmediatePropagation();
}
function keydown(e: KeyboardEvent) {
  quiet.intent();
  typeahead(e);
}
function typeahead(e: KeyboardEvent) {
  if (props.disabled || props.readonly || props.multiple || isOpen.value) return;
  if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
  if (e.key === " " && !typed) return;
  const now = Date.now();
  typed = (now - typedAt > TYPEAHEAD_PAUSE_MS ? "" : typed) + e.key.toLowerCase();
  typedAt = now;
  const list = props.options;
  const from = list.findIndex((o) => o.value === model.value);
  for (let j = 0; j < list.length; j++) {
    const o = list[(from + j + (typed.length === 1 ? 1 : 0) + list.length) % list.length];
    if (o && !o.disabled && o.label.toLowerCase().startsWith(typed)) {
      model.value = o.value;
      break;
    }
  }
}
defineExpose({
  trigger: computed(() => trigger.value?.$el ?? null),
});

/** A run of options: under its heading in a group when it has one, else as they are. One path for both. */
const Section: FunctionalComponent<{ group?: string | undefined }> = (p, { slots }) =>
  p.group
    ? h(SelectGroup, { class: "e-opt-set" }, () => [
        h(SelectLabel, { class: "e-opt-group" }, () => p.group),
        slots.default?.(),
      ])
    : slots.default?.();
Section.props = ["group"];
</script>

<template>
  <!-- The size is set on the wrapper, so the trigger and the clear button over it share the height. -->
  <div class="e-sel" :class="{ 'e-sel--clear': canClear }" :data-size="sizeAttr(size)">
    <RekaConfig>
      <SelectRoot
        :model-value="model"
        :multiple="multiple"
        :open="isOpen"
        :disabled="disabled"
        :required="required"
        :dir="dir"
        @update:model-value="change"
        @update:open="!readonly && (open = $event)"
      >
        <SelectTrigger
          ref="trigger"
          class="e-input e-sel-trigger"
          :tabindex="isOpen ? -1 : undefined"
          :aria-readonly="readonly ? 'true' : undefined"
          :aria-busy="loading ? 'true' : undefined"
          v-bind="triggerAttrs"
          @pointerdown="quiet.intent"
          @keydown.capture="guard"
          @keydown="keydown"
        >
          <span v-if="multiple && chosen.length > 1" class="e-sel-value">
            {{ t("selected", { n: chosen.length }) }}
          </span>
          <span v-else-if="selected" class="e-sel-value">
            <EIcon v-if="selected.icon" :name="selected.icon" />{{ selected.label }}
          </span>
          <span v-else class="e-sel-placeholder">{{ placeholder || t("select") }}</span>
          <ESpinner v-if="loading" :label="t('loading')" />
          <!-- A list that cannot open shows no arrow, as in ECombobox. -->
          <EIcon v-else-if="!disabled && !readonly" name="chevron-down" bold />
        </SelectTrigger>
        <SelectPortal :to="portal">
          <SelectContent
            position="popper"
            align="start"
            v-bind="FIELD_POPPER"
            :body-lock="false"
            class="e-popover e-listpanel e-root"
            :aria-label="label"
            @close-auto-focus="closeFocus"
          >
            <SelectViewport>
              <Section v-for="(section, i) in sections" :key="i" :group="section.group">
                <ESelectOption
                  v-for="o in section.options"
                  :key="o.value"
                  :option="o"
                  :selected="values.includes(o.value)"
                />
              </Section>
            </SelectViewport>
          </SelectContent>
        </SelectPortal>
      </SelectRoot>
    </RekaConfig>
    <EInputClear v-if="canClear" class="e-sel-clear" @click="clear" />
    <EHiddenInputs :name="name" :values="multiple ? values : [values[0]]" :disabled="disabled" :form="form" />
  </div>
</template>

<style>
@layer e.controls {
  .e-sel {
    position: relative;
  }

  .e-sel-trigger {
    --_clear: calc(var(--e-pad-control-sm) + var(--e-icon-size-md) + var(--e-gap-tight));

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--e-gap-snug);
    padding-inline-end: calc(var(--e-pad-control-sm) - var(--e-stroke-edge));
    text-align: start;
    cursor: pointer;
  }

  /* The clear button sits over the trigger, just inside its arrow, so the trigger leaves room for it. */
  .e-sel > .e-sel-clear {
    position: absolute;
    margin: 0;
    inset-block-start: 50%;
    inset-inline-end: var(--_clear);
    translate: 0 -50%;
  }

  .e-sel--clear .e-sel-trigger {
    padding-inline-end: calc(
      var(--_clear) + var(--_h, var(--e-control-height)) - 2 * (var(--e-stroke-edge) + var(--e-gap-tight))
    );
  }

  /* Open, the trigger looks focused: focus moves into the list, so the field's own :focus no longer applies. */
  .e-sel-trigger[aria-expanded="true"] {
    --_ring: var(--e-focus-field);

    background-color: var(--e-surface);
    outline: max(var(--e-stroke-focus), calc(2 * var(--e-stroke-edge))) solid var(--e-focus-field);
    outline-offset: var(--e-stroke-focus-gap-field);
  }

  .e-sel-trigger[aria-expanded="true"][aria-invalid="true"] {
    --_ring: var(--e-danger);

    outline-color: var(--e-danger);
  }

  .e-sel-value {
    display: inline-flex;
    align-items: center;
    gap: var(--e-gap-snug);
    min-width: 0;
    overflow: hidden;
    line-height: var(--e-leading-normal);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .e-sel-placeholder {
    color: var(--e-muted);
  }

  .e-sel-trigger > .e-icon {
    flex: none;
  }
}
</style>
