<script setup lang="ts">
import { computed, ref, watch } from "vue";
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
import ESelectOption from "./ESelectOption.vue";
import { sectionOptions, type EOption } from "./options.js";
import { useMessages, usePortalTarget } from "../../config.js";
import { useQuietFocus } from "./quietFocus.js";
import "../../styles/base.css";
import "../TextField/input.css";
import "./panel.css";

const props = defineProps<{
  /** The normalised options. */
  options: EOption[];
  placeholder?: string | undefined;
  disabled?: boolean | undefined;
  required?: boolean | undefined;
  name?: string | undefined;
  /** Names the list. */
  label?: string | undefined;
  /** Attributes for the button: id, aria-*, data-*, listeners. */
  triggerAttrs: Record<string, unknown>;
}>();

const model = defineModel<string>({ default: "" });

const t = useMessages();
const trigger = ref<{ $el: HTMLElement } | null>(null);
const portal = usePortalTarget();

const sections = computed(() => sectionOptions(props.options));
const selected = computed(() => props.options.find((o) => o.value === model.value));

let typed = "";
let typedAt = 0;
const open = defineModel<boolean>("open", { default: false });
const isOpen = computed(() => open.value && !props.disabled);
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
function keydown(e: KeyboardEvent) {
  quiet.intent();
  typeahead(e);
}
function typeahead(e: KeyboardEvent) {
  if (props.disabled || isOpen.value || e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
  if (e.key === " " && !typed) return;
  const now = Date.now();
  typed = (now - typedAt > 700 ? "" : typed) + e.key.toLowerCase();
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
</script>

<template>
  <div class="e-sel">
    <SelectRoot v-model="model" :open="isOpen" :disabled="disabled" :required="required" @update:open="open = $event">
      <SelectTrigger
        ref="trigger"
        class="e-input e-sel-trigger"
        :tabindex="isOpen ? -1 : undefined"
        v-bind="triggerAttrs"
        @pointerdown="quiet.intent"
        @keydown="keydown"
      >
        <span v-if="selected" class="e-sel-value">
          <EIcon v-if="selected.icon" :name="selected.icon" />{{ selected.label }}
        </span>
        <span v-else class="e-sel-placeholder">{{ placeholder || t("select") }}</span>
        <EIcon v-if="!disabled" name="chevron-down" bold />
      </SelectTrigger>
      <SelectPortal :to="portal">
        <SelectContent
          position="popper"
          align="start"
          :side-offset="6"
          :collision-padding="8"
          :body-lock="false"
          class="e-popover e-listpanel e-root"
          :aria-label="label"
          @close-auto-focus="closeFocus"
        >
          <SelectViewport>
            <template v-for="(section, i) in sections" :key="i">
              <SelectGroup v-if="section.group" class="e-opt-set">
                <SelectLabel class="e-opt-group">{{ section.group }}</SelectLabel>
                <ESelectOption v-for="o in section.options" :key="o.value" :option="o" :selected="o.value === model" />
              </SelectGroup>
              <template v-else>
                <ESelectOption v-for="o in section.options" :key="o.value" :option="o" :selected="o.value === model" />
              </template>
            </template>
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </SelectRoot>
    <input v-if="name" type="hidden" :name="name" :value="model" />
  </div>
</template>

<style>
@layer e.controls {
  .e-sel {
    position: relative;
  }

  .e-sel-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--e-space-2);
    padding-inline-end: calc(var(--e-space-3) - var(--e-stroke-edge));
    text-align: start;
    cursor: pointer;
  }

  /* Open, the trigger looks focused: focus moves into the list, so the field's own :focus no longer applies. */
  .e-sel-trigger[aria-expanded="true"] {
    --e-ring: var(--e-focus-field);

    background-color: var(--e-surface);
    outline: max(var(--e-stroke-focus), calc(2 * var(--e-stroke-edge))) solid var(--e-focus-field);
    outline-offset: var(--e-focus-gap-field);
  }

  .e-sel-trigger[aria-expanded="true"][aria-invalid="true"] {
    --e-ring: var(--e-danger);

    outline-color: var(--e-danger);
  }

  .e-sel-value {
    display: inline-flex;
    align-items: center;
    gap: var(--e-space-2);
    min-width: 0;
    overflow: hidden;
    line-height: 1.4;
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
