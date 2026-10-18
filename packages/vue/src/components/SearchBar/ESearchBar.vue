<script setup lang="ts">
import EIcon from "../Icon/EIcon.vue";
import EButton from "../Button/EButton.vue";
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
  <form
    class="e-search"
    v-bind="attrs.wrapper()"
    role="search"
    :aria-label="label || t('search')"
    @submit.prevent="emit('submit', model)"
  >
    <span class="e-search-lead"><EIcon name="search" /></span>
    <input
      v-bind="attrs.input()"
      class="e-input"
      :name="name || 'q'"
      :aria-label="label || t('search')"
      :placeholder="placeholder || t('search')"
      :value="model"
      :disabled="disabled"
      @input="model = ($event.target as HTMLInputElement).value"
    />
    <EButton type="submit" :disabled="disabled">{{ action || t("search") }}</EButton>
  </form>
</template>

<style>
@layer e.controls {
  .e-search {
    display: flex;
    align-items: center;
    gap: var(--e-space-1);
    height: var(--e-control-height);
    padding: 0 var(--e-space-1) 0 var(--e-space-2);
    border: var(--e-stroke-edge) solid var(--e-border-strong);
    border-radius: var(--e-radius-md);
    background: var(--e-surface);
    box-shadow: var(--e-well);
    transition: border-color var(--e-duration-tap) var(--e-easing-out);
  }

  .e-search:hover {
    border-color: var(--e-ink);
  }

  .e-search .e-btn {
    position: relative;
    height: calc(var(--e-control-height) - 6px);
    padding: 0 var(--e-space-3);
    font-size: var(--e-text-md);
  }

  .e-search .e-btn::after {
    content: "";
    position: absolute;
    inset: -3px;
  }

  .e-search-lead {
    display: grid;
    place-items: center;
    flex: none;
    width: 28px;
    color: var(--e-muted);
  }

  .e-search .e-input {
    flex: 1;
    text-overflow: ellipsis;
    height: 100%;
    border: 0;
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
    border-color: var(--e-focus-field);
    outline: var(--e-stroke-focus) solid var(--e-focus-field);
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
