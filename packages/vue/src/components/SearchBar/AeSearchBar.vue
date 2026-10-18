<script setup lang="ts">
import AeIcon from "../Icon/AeIcon.vue";
import AeButton from "../Button/AeButton.vue";
import { useMessages } from "../../config.js";
import { useFieldAttrs } from "../../composables/useFieldAttrs.js";
import "../../styles/base.css";
import "../TextField/input.css";

defineOptions({ inheritAttrs: false });

defineProps<{
  /** What screen readers call the box. Default "Search". */
  label?: string;
  /** Say what can be searched, briefly. Default "Search". */
  placeholder?: string;
  /** The text on the button. Default "Search". */
  action?: string;
  /** The name submitted with a form. Default `q`. */
  name?: string;
  /** Search is unavailable. Say why in a Notice. */
  disabled?: boolean;
}>();

const emit = defineEmits<{
  /** The person pressed Enter or the button. */
  submit: [value: string];
}>();

/** The text in the box. */
const model = defineModel<string>({ default: "" });

const t = useMessages();
const attrs = useFieldAttrs();
</script>

<template>
  <form class="ae-search" v-bind="attrs.wrapper()" role="search" @submit.prevent="emit('submit', model)">
    <span class="ae-search-lead"><AeIcon name="search" /></span>
    <input
      v-bind="attrs.input()"
      class="ae-input"
      :name="name || 'q'"
      :aria-label="label || t('search')"
      :placeholder="placeholder || t('search')"
      :value="model"
      :disabled="disabled"
      @input="model = ($event.target as HTMLInputElement).value"
    />
    <AeButton type="submit" :disabled="disabled">{{ action || t("search") }}</AeButton>
  </form>
</template>

<style>
@layer ae.controls {
  .ae-search {
    display: flex;
    align-items: center;
    gap: var(--ae-space-1);
    height: var(--ae-control-height);
    padding: 0 var(--ae-space-1) 0 var(--ae-space-2);
    border: var(--ae-stroke-edge) solid var(--ae-border-strong);
    border-radius: var(--ae-radius-md);
    background: var(--ae-surface);
    box-shadow: var(--ae-well);
    transition: border-color var(--ae-duration-tap) var(--ae-easing-out);
  }

  .ae-search:hover {
    border-color: var(--ae-ink);
  }

  .ae-search .ae-btn {
    position: relative;
    height: calc(var(--ae-control-height) - 6px);
    padding: 0 var(--ae-space-3);
    font-size: var(--ae-text-md);
  }

  .ae-search .ae-btn::after {
    content: "";
    position: absolute;
    inset: -3px;
  }

  .ae-search-lead {
    display: grid;
    place-items: center;
    flex: none;
    width: 28px;
    color: var(--ae-muted);
  }

  .ae-search .ae-input {
    flex: 1;
    text-overflow: ellipsis;
    height: 100%;
    border: 0;
    background: transparent;
    box-shadow: none;
    font-size: var(--ae-text-md);
    padding-inline: var(--ae-space-2);
  }

  .ae-search .ae-input:hover,
  .ae-search .ae-input:focus {
    border: 0;
    background: transparent;
  }

  .ae-search .ae-input:focus-visible {
    outline: none;
  }

  .ae-search:focus-within {
    border-color: var(--ae-focus-field);
    outline: var(--ae-stroke-focus) solid var(--ae-focus-field);
    outline-offset: var(--ae-focus-gap-field);
  }

  @media (prefers-reduced-motion: reduce) {
    .ae-search {
      transition: none;
    }
  }

  @media print {
    .ae-search {
      display: none;
    }
  }
}
</style>
