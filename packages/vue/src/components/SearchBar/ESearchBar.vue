<script setup lang="ts">
import EIcon from "../Icon/EIcon.vue";
import EButton from "../Button/EButton.vue";
import { ref } from "vue";
import { useMessages } from "../../config.js";
import { useFieldAttrs } from "../../composables/useFieldAttrs.js";
import "../../styles/base.css";
import "../TextField/input.css";

defineOptions({ inheritAttrs: false });

withDefaults(
  defineProps<{
    /** Names the box and the search landmark; there is no visible label. @default "Search" */
    label?: string;
    /** Say what can be searched, briefly. @default "Search" */
    placeholder?: string;
    /** The text on the button. @default "Search" */
    action?: string;
    /** Leaves out the button, for a box that filters or searches as you type. Enter still submits. */
    hideAction?: boolean;
    /** The clear button, shown when there is text. */
    clearable?: boolean;
    /** The name submitted with a form. @default "q" */
    name?: string;
    /** Disables the box and button. Say why in an `ENotice`. */
    disabled?: boolean;
  }>(),
  { clearable: true },
);

const emit = defineEmits<{
  /** The person pressed Enter or the button. */
  submit: [value: string];
}>();

/** The text. */
const model = defineModel<string>({ default: "" });

const t = useMessages();
const attrs = useFieldAttrs();
const box = ref<HTMLInputElement | null>(null);

function clear() {
  model.value = "";
  box.value?.focus();
}

defineExpose({
  input: box,
  focus: () => box.value?.focus(),
});
</script>

<template>
  <form
    class="e-search"
    v-bind="attrs.wrapper()"
    role="search"
    :aria-label="label || t('search')"
    @submit.prevent="emit('submit', model)"
  >
    <span class="e-search-lead"><EIcon name="search" /></span>
    <input
      ref="box"
      v-bind="attrs.input()"
      class="e-input"
      :name="name || 'q'"
      :aria-label="label || t('search')"
      :placeholder="placeholder || t('search')"
      :value="model"
      :disabled="disabled"
      @input="model = ($event.target as HTMLInputElement).value"
    />
    <button
      v-if="clearable && model && !disabled"
      type="button"
      class="e-search-clear"
      :aria-label="t('clear')"
      @mousedown.prevent
      @click="clear"
    >
      <EIcon name="x" />
    </button>
    <EButton v-if="!hideAction" type="submit" :disabled="disabled">{{ action || t("search") }}</EButton>
  </form>
</template>

<style>
@layer e.controls {
  .e-search {
    --e-ring: var(--e-border-strong);

    display: flex;
    align-items: center;
    gap: var(--e-space-1);
    height: var(--e-control-height);
    padding: 0 calc(var(--e-space-1) - var(--e-stroke-edge)) 0 calc(var(--e-space-2) - var(--e-stroke-edge));
    box-sizing: border-box;
    border: var(--e-stroke-edge) solid var(--e-ring);
    border-radius: var(--e-radius-md);
    background: var(--e-surface);
    background-clip: padding-box;
    box-shadow: var(--e-well);
    transition:
      border-color var(--e-duration-tap) var(--e-easing-out),
      box-shadow var(--e-duration-tap) var(--e-easing-out);
  }

  .e-search:hover {
    background: var(--e-surface-hover);
  }

  .e-search .e-btn {
    position: relative;
    height: calc(var(--e-control-height) - 6px);
    padding: 0 calc(var(--e-space-3) - var(--e-stroke-edge));
    font-size: var(--e-text-md);
  }

  .e-search .e-btn::after {
    content: "";
    position: absolute;
    inset: -3px;
  }

  .e-search-clear {
    display: inline-grid;
    place-items: center;
    position: relative;
    flex: none;
    width: calc(var(--e-control-height) - 9px);
    height: calc(var(--e-control-height) - 9px);
    padding: 0;
    border: 0;
    border-radius: var(--e-radius-sm);
    background: transparent;
    color: var(--e-ink);
    cursor: pointer;
    transition: background-color var(--e-duration-tap) var(--e-easing-out);
  }

  .e-search-clear::after {
    content: "";
    position: absolute;
    inset: -5px;
  }

  .e-search-clear:hover {
    background: var(--e-wash-hover);
    box-shadow: inset 0 0 0 var(--e-stroke-hair) var(--e-wash-ring);
  }

  .e-search-clear:active {
    background: var(--e-wash-press);
    box-shadow: inset 0 0 0 var(--e-stroke-edge) var(--e-ink);
  }

  .e-search-clear:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: calc(-1 * var(--e-stroke-focus));
  }

  .e-search-lead {
    display: grid;
    place-items: center;
    flex: none;
    width: var(--e-space-8);
    color: var(--e-muted);
  }

  .e-search .e-input {
    flex: 1;
    text-overflow: ellipsis;
    height: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    box-shadow: none;
    font-size: var(--e-text-md);
    padding-inline: var(--e-space-2);
  }

  .e-search .e-input:hover,
  .e-search .e-input:focus {
    border: 0;
    background: transparent;
  }

  .e-search .e-input:focus-visible {
    outline: none;
  }

  .e-search:focus-within {
    --e-ring: var(--e-focus-field);

    background: var(--e-surface);
    outline: max(var(--e-stroke-focus), calc(2 * var(--e-stroke-edge))) solid var(--e-focus-field);
    outline-offset: var(--e-focus-gap-field);
  }

  @media (prefers-reduced-motion: reduce) {
    .e-search {
      transition: none;
    }
  }

  @media print {
    .e-search {
      display: none;
    }
  }
}
</style>
