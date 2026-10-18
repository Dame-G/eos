<script setup lang="ts">
import { computed, ref } from "vue";
import AeIcon from "../Icon/AeIcon.vue";
import AeField from "../Field/AeField.vue";
import { useMessages } from "../../config.js";
import { useFieldAttrs } from "../../composables/useFieldAttrs.js";
import "../../styles/base.css";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  /** The visible label, a mono kicker above the dropzone. */
  label: string;
  /** Keep the label for screen readers and remove it from the page. */
  hideLabel?: boolean;
  /** Accepted extensions, such as `.pdf,.jpg`. Shown under the prompt. */
  accept?: string;
  multiple?: boolean;
  /** The name submitted with a form. */
  name?: string;
  /** Say what is accepted and how large before the person tries. */
  hint?: string;
  /** What to fix. Replaces the hint, marks the input invalid and is announced. */
  error?: string;
  /** A word beside the label. */
  required?: boolean;
  /** A word beside the label. Flag whichever is rarer. */
  optional?: boolean;
  /** Ignores drops and clicks and dims the edge. */
  disabled?: boolean;
  /** The id of the file input; the label points at it. Generated when left out. */
  id?: string;
}>();

const emit = defineEmits<{
  /** The chosen or dropped files, the same list as the model. */
  files: [files: File[]];
}>();

/** The chosen files. */
const model = defineModel<File[]>({ default: () => [] });

const t = useMessages();
const attrs = useFieldAttrs();
const over = ref(false);
const input = ref<HTMLInputElement | null>(null);
const acceptHint = computed(() => props.accept?.replace(/\./g, "").replace(/,/g, ", ").toUpperCase());

function take(list: FileList | null | undefined) {
  const files = Array.from(list ?? []);
  model.value = files;
  emit("files", files);
}
function onDragOver(e: DragEvent) {
  e.preventDefault();
  if (!props.disabled) over.value = true;
}
function onDrop(e: DragEvent) {
  e.preventDefault();
  over.value = false;
  if (!props.disabled) take(e.dataTransfer?.files);
}

defineExpose({
  /** The `<input type="file">` element. */
  input,
  /** Moves focus to the file input. */
  focus: () => input.value?.focus(),
});
</script>

<template>
  <AeField
    v-bind="attrs.wrapper()"
    :id="id"
    :label="label"
    :hide-label="hideLabel"
    :hint="hint"
    :error="error"
    :required="required"
    :optional="optional"
  >
    <template #default="field">
      <div>
        <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
        <label
          :for="field.id"
          class="ae-drop"
          :class="{ 'ae-drop--over': over, 'ae-drop--disabled': disabled }"
          @dragover="onDragOver"
          @dragleave="over = false"
          @drop="onDrop"
        >
          <AeIcon name="upload" />
          <span class="ae-drop-main">
            {{ t("dragHere") }}
            <span class="ae-drop-pick">{{ t("chooseOne") }}</span>
          </span>
          <span v-if="acceptHint" class="ae-drop-hint">{{ acceptHint }}</span>
        </label>
        <input
          :id="field.id"
          ref="input"
          type="file"
          class="ae-drop-input"
          :name="name"
          :accept="accept"
          :multiple="multiple"
          :disabled="disabled"
          :required="required"
          :aria-invalid="field.ariaInvalid"
          v-bind="attrs.input(field.ariaDescribedby)"
          @change="take(($event.target as HTMLInputElement).files)"
        />
        <ul v-if="model.length" class="ae-files">
          <li v-for="f in model" :key="f.name">
            <AeIcon name="file" />
            <span class="ae-file-name">{{ f.name }}</span>
            <span class="ae-file-size">{{ Math.max(1, Math.round(f.size / 1024)) }} KB</span>
          </li>
        </ul>
      </div>
    </template>
  </AeField>
</template>

<style>
@layer ae.controls {
  .ae-drop {
    display: grid;
    justify-items: center;
    gap: var(--ae-space-1);
    padding: var(--ae-space-6) var(--ae-space-4);
    border: var(--ae-stroke-edge) dashed var(--ae-border-strong);
    border-radius: var(--ae-radius-md);
    background: var(--ae-surface);
    text-align: center;
    cursor: pointer;
    transition:
      background-color var(--ae-duration-tap) var(--ae-easing-out),
      border-color var(--ae-duration-tap) var(--ae-easing-out);
  }

  .ae-drop:hover,
  .ae-drop--over {
    background: var(--ae-surface-tint);
    border-color: var(--ae-ink);
  }

  .ae-drop-main {
    font: 400 var(--ae-text-md)/1.4 var(--ae-font-sans);
  }

  .ae-drop-pick {
    color: var(--ae-primary);
    font-weight: 500;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .ae-drop-hint {
    font: 500 var(--ae-text-xs)/1.2 var(--ae-font-mono);
    letter-spacing: 0.06em;
    color: var(--ae-muted);
  }

  .ae-drop-input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
  }

  .ae-drop-input:focus-visible + .ae-files,
  .ae-field:focus-within .ae-drop {
    outline: var(--ae-stroke-focus) solid var(--ae-focus-field);
    outline-offset: var(--ae-focus-gap-field);
  }

  .ae-files {
    display: grid;
    gap: 0;
    margin: var(--ae-space-2) 0 0;
    padding: 0;
    list-style: none;
  }

  .ae-files li {
    display: flex;
    align-items: center;
    gap: var(--ae-space-2);
    padding: var(--ae-space-2) 0;
    border-top: var(--ae-stroke-hair) solid var(--ae-border);
    font: 400 var(--ae-text-md)/1.3 var(--ae-font-sans);
  }

  .ae-file-name {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .ae-file-size {
    font: 500 var(--ae-text-xs)/1 var(--ae-font-mono);
    color: var(--ae-muted);
  }

  @media (prefers-reduced-motion: reduce) {
    .ae-drop {
      transition: none;
    }
  }
}
</style>
