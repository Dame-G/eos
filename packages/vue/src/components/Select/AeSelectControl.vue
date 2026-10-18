<script setup lang="ts">
import { computed, ref } from "vue";
import {
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectViewport,
} from "reka-ui";
import AeIcon from "../Icon/AeIcon.vue";
import AeSelectOption from "./AeSelectOption.vue";
import { sectionOptions, type AeOption } from "./options.js";
import { useMessages, usePortalTarget } from "../../config.js";
import "../../styles/base.css";
import "../TextField/input.css";
import "./panel.css";

// The button, the list and the hidden input of AeSelect. Internal: AeSelect adds the label, hint and error around it.
const props = defineProps<{
  /** The normalised options. */
  options: AeOption[];
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
const portal = usePortalTarget();

const sections = computed(() => sectionOptions(props.options));
const selected = computed(() => props.options.find((o) => o.value === model.value));

// A closed button answers typing like a native select: the matching option is chosen without opening the list.
let typed = "";
let typedAt = 0;
const isOpen = ref(false);
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
</script>

<template>
  <div class="ae-sel">
    <SelectRoot v-model="model" :disabled="disabled" :required="required" @update:open="isOpen = $event">
      <SelectTrigger
        class="ae-input ae-sel-trigger"
        :tabindex="isOpen ? -1 : undefined"
        v-bind="triggerAttrs"
        @keydown="typeahead"
      >
        <span v-if="selected" class="ae-sel-value">
          <AeIcon v-if="selected.icon" :name="selected.icon" />{{ selected.label }}
        </span>
        <span v-else class="ae-sel-placeholder">{{ placeholder || t("select") }}</span>
        <AeIcon name="chevron-down" bold />
      </SelectTrigger>
      <SelectPortal :to="portal">
        <SelectContent
          position="popper"
          align="start"
          :side-offset="6"
          :collision-padding="8"
          :body-lock="false"
          class="ae-popover ae-listpanel ae-root"
          :aria-label="label"
        >
          <SelectViewport>
            <template v-for="(section, i) in sections" :key="i">
              <SelectGroup v-if="section.group" class="ae-opt-set">
                <SelectLabel class="ae-opt-group">{{ section.group }}</SelectLabel>
                <AeSelectOption v-for="o in section.options" :key="o.value" :option="o" :selected="o.value === model" />
              </SelectGroup>
              <template v-else>
                <AeSelectOption v-for="o in section.options" :key="o.value" :option="o" :selected="o.value === model" />
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
@layer ae.controls {
  .ae-sel {
    position: relative;
  }

  .ae-sel-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ae-space-2);
    padding-inline-end: var(--ae-space-3);
    text-align: start;
    cursor: pointer;
  }

  .ae-sel-trigger[aria-expanded="true"] {
    border-color: var(--ae-ink);
    background-color: var(--ae-surface);
  }

  .ae-sel-value {
    display: inline-flex;
    align-items: center;
    gap: var(--ae-space-2);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ae-sel-placeholder {
    color: var(--ae-muted);
  }

  .ae-sel-trigger > .ae-icon {
    flex: none;
  }
}
</style>
