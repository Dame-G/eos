<script setup lang="ts">
import { computed, ref } from "vue";
import EIcon from "../Icon/EIcon.vue";
import EField from "../Field/EField.vue";
import { useMessages } from "../../config.js";
import { useFieldAttrs } from "../../composables/useFieldAttrs.js";
import "../../styles/base.css";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  /** The visible label, a mono kicker above the dropzone. */
  label: string;
  /** Keep the label for screen readers and remove it from the page. */
  hideLabel?: boolean;
  /** Accepted extensions, such as `.pdf,.jpg`. Passed to the input and shown under the prompt as "PDF, JPG". */
  accept?: string;
  /** Allows choosing more than one file. */
  multiple?: boolean;
  /** The name submitted with a form. */
  name?: string;
  /** Say what is accepted and how large before the person tries. */
  hint?: string;
  /** What to fix. Replaces the hint, marks the input invalid and is announced. */
  error?: string;
  /** The `required` attribute and a word beside the label. */
  required?: boolean;
  /** A word beside the label. Flag whichever is rarer. */
  optional?: boolean;
  /** Ignores drops and clicks and dims the edge. */
  disabled?: boolean;
  /** The id of the file input; the label points at it. @default generated */
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
  input,
  focus: () => input.value?.focus(),
});
</script>

<template>
  <EField
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
          class="e-drop"
          :class="{ 'e-drop--over': over, 'e-drop--disabled': disabled }"
          @dragover="onDragOver"
          @dragleave="over = false"
          @drop="onDrop"
        >
          <EIcon name="upload" />
          <span class="e-drop-main">
            {{ t("dragHere") }}
            <span class="e-drop-pick">{{ t("chooseOne") }}</span>
          </span>
          <span v-if="acceptHint" class="e-drop-hint">{{ acceptHint }}</span>
        </label>
        <input
          :id="field.id"
          ref="input"
          type="file"
          class="e-drop-input"
          :name="name"
          :accept="accept"
          :multiple="multiple"
          :disabled="disabled"
          :required="required"
          :aria-invalid="field.ariaInvalid"
          v-bind="attrs.input(field.ariaDescribedby)"
          @change="take(($event.target as HTMLInputElement).files)"
        />
        <ul v-if="model.length" class="e-files">
          <li v-for="f in model" :key="f.name">
            <EIcon name="file" />
            <span class="e-file-name">{{ f.name }}</span>
            <span class="e-file-size">{{ Math.max(1, Math.round(f.size / 1024)) }} KB</span>
          </li>
        </ul>
      </div>
    </template>
  </EField>
</template>

<style>
@layer e.controls {
  .e-drop {
    display: grid;
    justify-items: center;
    gap: var(--e-space-1);
    padding: var(--e-space-6) var(--e-space-4);
    outline: var(--e-stroke-edge) dashed var(--e-border-strong);
    outline-offset: calc(-1 * var(--e-stroke-edge));
    border-radius: var(--e-radius-md);
    background: var(--e-surface);
    text-align: center;
    cursor: pointer;
    transition:
      background-color var(--e-duration-tap) var(--e-easing-out),
      outline-color var(--e-duration-tap) var(--e-easing-out);
  }

  .e-drop:hover {
    background: var(--e-surface-hover);
    outline-color: var(--e-ink);
  }

  .e-drop--over {
    background: var(--e-secondary-soft);
    outline-color: var(--e-secondary);
  }

  .e-drop-main {
    font: 400 var(--e-text-md)/1.4 var(--e-font-sans);
  }

  .e-drop-pick {
    color: var(--e-primary);
    font-weight: 500;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .e-drop--disabled {
    background: var(--e-surface-tint);
    outline-color: var(--e-border-strong);
    color: var(--e-muted);
    cursor: not-allowed;
  }

  .e-drop--disabled .e-drop-pick {
    color: inherit;
  }

  .e-drop-hint {
    font: 500 var(--e-text-xs)/1.2 var(--e-font-mono);
    letter-spacing: 0.06em;
    color: var(--e-muted);
  }

  .e-drop-input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
  }

  .e-drop-input:focus-visible + .e-files,
  .e-field:focus-within .e-drop {
    outline: max(var(--e-stroke-focus), calc(2 * var(--e-stroke-edge))) solid var(--e-focus-field);
    outline-offset: var(--e-focus-gap-field);
  }

  .e-files {
    display: grid;
    gap: 0;
    margin: var(--e-space-2) 0 0;
    padding: 0;
    list-style: none;
  }

  .e-files li {
    display: flex;
    align-items: center;
    gap: var(--e-space-2);
    padding: var(--e-space-2) 0;
    border-top: var(--e-stroke-hair) solid var(--e-border);
    font: 400 var(--e-text-md)/1.3 var(--e-font-sans);
  }

  .e-file-name {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .e-file-size {
    font: 500 var(--e-text-xs)/1 var(--e-font-mono);
    color: var(--e-muted);
  }

  @media (prefers-reduced-motion: reduce) {
    .e-drop {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    .e-drop:hover,
    .e-drop--over {
      outline-style: solid;
      outline-color: Highlight;
    }
  }
}
</style>
