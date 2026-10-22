<script setup lang="ts">
import { computed, ref } from "vue";
import EIcon from "../Icon/EIcon.vue";
import EField from "../Field/EField.vue";
import EIconButton from "../IconButton/EIconButton.vue";
import { useMessages } from "../../config.js";
import { useFieldAttrs } from "../../composables/useFieldAttrs.js";
import { useAnnouncer } from "../../composables/useAnnouncer.js";
import { useLocale } from "../../composables/useLocale.js";
import "../../styles/base.css";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  /** The visible label above the dropzone. */
  label: string;
  /** Keeps the label for screen readers and hides it from the page. */
  hideLabel?: boolean;
  /** Accepted types, separated by commas: extensions such as `.pdf`, MIME types such as `image/png` and wildcards such as `image/*`. Passed to the input, shown under the prompt as "PDF, JPG" and also applied to dropped files. */
  accept?: string;
  /** Allows choosing more than one file. Without it only the first file of a choice or drop is kept. */
  multiple?: boolean;
  /** The name submitted with a form. */
  name?: string;
  /** Help that says which files are accepted and how large, shown before the person tries. */
  hint?: string;
  /** What to fix. Replaces the hint, marks the input invalid and is announced. */
  error?: string;
  /** Sets the `required` attribute and adds a word beside the label. */
  required?: boolean;
  /** Adds a word beside the label. Use it when most fields in the form are required. */
  optional?: boolean;
  /** Disables the control, so it ignores drops and clicks. */
  disabled?: boolean;
  /** The id of the file input, which the label points at. @default generated */
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

const { announce } = useAnnouncer();
const { locale } = useLocale();

function accepts(file: File): boolean {
  const rules = (props.accept ?? "")
    .split(",")
    .map((r) => r.trim().toLowerCase())
    .filter(Boolean);
  if (!rules.length) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return rules.some((r) =>
    r.startsWith(".") ? name.endsWith(r) : r.endsWith("/*") ? type.startsWith(r.slice(0, -1)) : type === r,
  );
}

/** Keeps the input's own file list in step with the model, so a form posts what the list shows. */
function syncInput(files: File[]) {
  if (!input.value) return;
  try {
    const data = new DataTransfer();
    files.forEach((f) => data.items.add(f));
    input.value.files = data.files;
  } catch {
    // A browser that cannot set the list keeps the model correct.
  }
}

function take(list: FileList | null | undefined) {
  const given = Array.from(list ?? []);
  if (!given.length) return;
  const fits = given.filter(accepts);
  const files = props.multiple ? fits : fits.slice(0, 1);
  const rejected = given.length - files.length;
  model.value = files;
  syncInput(files);
  emit("files", files);
  const said = [
    files.length ? t(files.length === 1 ? "filesAddedOne" : "filesAddedOther", { n: files.length }) : "",
    rejected ? t(rejected === 1 ? "filesRejectedOne" : "filesRejectedOther", { n: rejected }) : "",
  ].filter(Boolean);
  announce(said.join(". "), { assertive: rejected > 0 });
}

function removeAt(index: number) {
  const gone = model.value[index];
  if (!gone) return;
  const files = model.value.filter((_, i) => i !== index);
  model.value = files;
  syncInput(files);
  emit("files", files);
  announce(t("removedItem", { label: gone.name }));
  input.value?.focus();
}

const sizeFormats = new Map<string, Intl.NumberFormat>();
/** Bytes, kilobytes or megabytes, whichever reads shortest, in the library's locale. */
function formatSize(bytes: number): string {
  const unit = bytes < 1024 ? "byte" : bytes < 1024 * 1024 ? "kilobyte" : "megabyte";
  const divisor = unit === "byte" ? 1 : unit === "kilobyte" ? 1024 : 1024 * 1024;
  const key = `${locale.value}|${unit}`;
  let format = sizeFormats.get(key);
  if (!format) {
    const options: Intl.NumberFormatOptions = {
      style: "unit",
      unit,
      unitDisplay: "short",
      maximumFractionDigits: unit === "megabyte" ? 1 : 0,
    };
    try {
      format = new Intl.NumberFormat(locale.value, options);
    } catch {
      format = new Intl.NumberFormat("en", options);
    }
    sizeFormats.set(key, format);
  }
  return format.format(bytes / divisor);
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
          :data-invalid="field.ariaInvalid ? '' : undefined"
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
          <li v-for="(f, i) in model" :key="i + f.name">
            <EIcon name="file" />
            <span class="e-file-name">{{ f.name }}</span>
            <span class="e-file-size">{{ formatSize(f.size) }}</span>
            <EIconButton
              icon="x"
              :label="t('removeItem', { label: f.name })"
              :disabled="disabled"
              @click="removeAt(i)"
            />
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

  .e-drop[data-invalid]:not(.e-drop--disabled, .e-drop--over) {
    outline-color: var(--e-danger);
  }

  .e-drop[data-invalid]:not(.e-drop--disabled, .e-drop--over):hover {
    background: var(--e-danger-soft);
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
