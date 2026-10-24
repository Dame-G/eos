<script setup lang="ts">
import EIcon from "../Icon/EIcon.vue";
import EButton from "../Button/EButton.vue";
import EInputClear from "../Field/EInputClear.vue";
import EInputShell from "../Field/EInputShell.vue";
import type { EFieldBoxProps } from "../Field/fieldProps.js";
import { useMessages } from "../../config.js";
import { useFieldControl } from "../../composables/useFieldControl.js";
import "../../styles/base.css";
import "../TextField/input.css";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    EFieldBoxProps & {
      /** Names the box and the search landmark. It is not shown on the page. @default "Search" */
      label?: string;
      /** Hint text in the empty box that says what can be searched. @default "Search" */
      placeholder?: string;
      /** The text on the button. @default "Search" */
      action?: string;
      /** Leaves out the button, for a box that filters or searches as you type. Enter still submits. */
      hideAction?: boolean;
      /** Shows a button that empties the box while it has text. */
      clearable?: boolean;
      /** The name the text is posted under when the bar sits inside a form of your own. There is no default: the bar is not a form. */
      name?: string;
      /** Disables the box and button. Pair it with an `ENotice` that says why. */
      disabled?: boolean;
    }
  >(),
  { clearable: false },
);

const emit = defineEmits<{
  /** The person pressed Enter or the button. */
  submit: [value: string];
  /** The person pressed the clear button. The model is already empty. */
  clear: [];
}>();

/** The text. */
const model = defineModel<string>({ default: "" });

const t = useMessages();
const control = useFieldControl(props);

const box = control.input;

function clear() {
  model.value = "";
  emit("clear");
  box.value?.focus();
}
/** Enter submits the search, never an enclosing form. */
function onEnter(e: KeyboardEvent) {
  if (e.isComposing) return;
  e.preventDefault();
  if (!props.disabled) emit("submit", model.value);
}

defineExpose(control.exposed);
</script>

<template>
  <EInputShell
    v-bind="{ ...control.attrs.wrapper(), ...control.shell(), loading: loading && hideAction }"
    class="e-search"
    role="search"
    :aria-label="label || t('search')"
  >
    <span class="e-search-lead"><EIcon name="search" /></span>
    <input
      ref="box"
      enterkeyhint="search"
      v-bind="control.attrs.input()"
      class="e-input"
      :name="name"
      :aria-label="label || t('search')"
      :aria-busy="loading || undefined"
      :placeholder="placeholder || t('search')"
      :value="model"
      :disabled="disabled"
      :data-size="size && size !== 'md' ? size : undefined"
      @input="model = ($event.target as HTMLInputElement).value"
      @keydown.enter="onEnter"
    />
    <EInputClear v-if="clearable && model && !disabled" @click="clear" />
    <EButton v-if="!hideAction" :disabled="disabled" :loading="loading" @click="emit('submit', model)">
      {{ action || t("search") }}
    </EButton>
  </EInputShell>
</template>

<style>
@layer e.controls {
  .e-search {
    align-items: center;
    gap: var(--e-gap-tight);
    padding-inline-end: var(--e-gap-tight);
  }

  .e-search .e-btn {
    position: relative;
    height: calc(var(--_h, var(--e-control-height)) - 2 * (var(--e-stroke-edge) + var(--e-gap-tight)));
    padding: 0 calc(var(--e-pad-control-sm) - var(--e-stroke-edge));

    /* Inset by the field's edge and a tight gap, like the clear button. */
    border-radius: max(0px, calc(var(--e-radius-md) - var(--e-stroke-edge) - var(--e-gap-tight)));
    font: var(--e-type-button);
  }

  /* A larger touch target than the button. */
  .e-search .e-btn::after {
    content: "";
    position: absolute;
    inset: calc(-1 * var(--e-gap-tight));
  }

  .e-search-lead {
    display: grid;
    place-items: center;
    flex: none;
    padding-inline: var(--e-pad-control-sm) 0;
    color: var(--e-muted);
  }

  .e-search .e-input {
    text-overflow: ellipsis;
    padding-inline: var(--e-gap-snug);
  }

  @media print {
    .e-search {
      display: none;
    }
  }
}
</style>
