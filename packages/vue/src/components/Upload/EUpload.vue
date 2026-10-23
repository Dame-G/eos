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
  /** Allows choosing more than one file. New files are added to the list, and a file already in it (same name, size and date) is not added twice. Without it, a choice replaces the file, and the others of several are rejected with reason `count`. */
  multiple?: boolean;
  /** The largest file allowed, in bytes. A larger one is left out and announced as "1 file is larger than 5 MB". */
  maxSize?: number;
  /** The most files the list can hold with `multiple`. Further files are left out and announced. */
  maxFiles?: number;
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
  /** Disables the control, so it ignores drops and clicks. A disabled control is not submitted. */
  disabled?: boolean;
  /** Shows the files but blocks changes: drops and clicks do nothing and the remove buttons are disabled. The input stays focusable and the files are still submitted. */
  readonly?: boolean;
  /** The id of the file input, which the label points at. @default generated */
  id?: string;
}>();

const emit = defineEmits<{
  /** The chosen or dropped files, the same list as the model. */
  files: [files: File[]];
  /** Files left out, each with why: `type` (not in `accept`), `size` (over `maxSize`) or `count` (over `maxFiles`). A choice that is entirely rejected leaves the list as it was. */
  reject: [rejected: { file: File; reason: "type" | "size" | "count" }[]];
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

const keyOf = (f: File) => `${f.name}|${f.size}|${f.lastModified}`;

function take(list: FileList | null | undefined) {
  const given = Array.from(list ?? []);
  if (!given.length || props.readonly) return;
  const rejected: { file: File; reason: "type" | "size" | "count" }[] = [];
  const fresh: File[] = [];
  const known = new Set((props.multiple ? model.value : []).map(keyOf));
  for (const file of given) {
    if (!accepts(file)) rejected.push({ file, reason: "type" });
    else if (props.maxSize != null && file.size > props.maxSize) rejected.push({ file, reason: "size" });
    else if (known.has(keyOf(file))) continue;
    else {
      known.add(keyOf(file));
      fresh.push(file);
    }
  }
  let files: File[];
  if (props.multiple) {
    const room = props.maxFiles != null ? Math.max(0, props.maxFiles - model.value.length) : fresh.length;
    for (const file of fresh.slice(room)) rejected.push({ file, reason: "count" });
    files = [...model.value, ...fresh.slice(0, room)];
  } else {
    for (const file of fresh.slice(1)) rejected.push({ file, reason: "count" });
    files = fresh.slice(0, 1);
  }
  const added = props.multiple ? files.length - model.value.length : files.length;
  const count = (reason: "type" | "size" | "count") => rejected.filter((r) => r.reason === reason).length;
  const said = [
    added ? t("filesAdded", { n: added }) : "",
    count("type") ? t("filesRejected", { n: count("type") }) : "",
    count("size") ? t("filesTooLarge", { n: count("size"), max: formatSize(props.maxSize ?? 0) }) : "",
    count("count") ? t("filesTooMany", { n: props.multiple ? (props.maxFiles ?? 0) : 1 }) : "",
  ].filter(Boolean);
  if (added) {
    model.value = files;
    emit("files", files);
  }
  // The input holds whatever was just chosen. A choice that was turned away must not replace what the list shows.
  syncInput(added ? files : model.value);
  if (rejected.length) emit("reject", rejected);
  if (said.length) announce(said.join(". "), { assertive: rejected.length > 0 });
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
// Dragging across the zone's children fires dragleave on the zone, so the highlight follows a count of enters.
let depth = 0;
function onDragEnter(e: DragEvent) {
  e.preventDefault();
  if (props.disabled || props.readonly) return;
  depth++;
  over.value = true;
}
function onDragOver(e: DragEvent) {
  e.preventDefault();
  if (!props.disabled && !props.readonly) over.value = true;
}
function onDragLeave() {
  depth = Math.max(0, depth - 1);
  if (depth === 0) over.value = false;
}
function onDrop(e: DragEvent) {
  e.preventDefault();
  depth = 0;
  over.value = false;
  if (!props.disabled) take(e.dataTransfer?.files);
}
/** A read-only input stays in the tab order, but its picker must not open. */
function onPick(e: Event) {
  if (props.readonly) e.preventDefault();
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
      <div class="e-upload">
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
          :aria-readonly="readonly || undefined"
          v-bind="attrs.input(field.ariaDescribedby)"
          @click="onPick"
          @change="take(($event.target as HTMLInputElement).files)"
        />
        <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
        <label
          :for="field.id"
          class="e-drop"
          :class="{ 'e-drop--over': over, 'e-drop--disabled': disabled, 'e-drop--readonly': readonly }"
          :data-invalid="field.ariaInvalid ? '' : undefined"
          @dragenter="onDragEnter"
          @dragover="onDragOver"
          @dragleave="onDragLeave"
          @drop="onDrop"
        >
          <EIcon name="upload" />
          <span class="e-drop-main">
            {{ t("dragHere") }}
            <span class="e-drop-pick">{{ t("chooseOne") }}</span>
          </span>
          <span v-if="acceptHint" class="e-drop-hint">{{ acceptHint }}</span>
        </label>
        <ul v-if="model.length" class="e-files">
          <li v-for="(f, i) in model" :key="keyOf(f) + i">
            <EIcon name="file" />
            <span class="e-file-name">{{ f.name }}</span>
            <span class="e-file-size">{{ formatSize(f.size) }}</span>
            <EIconButton
              icon="x"
              :label="t('removeItem', { label: f.name })"
              :disabled="disabled || readonly"
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
    gap: var(--e-gap-tight);
    padding: var(--e-pad-panel) var(--e-pad-card);
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

  .e-upload {
    display: grid;
    gap: var(--e-gap-snug);
  }

  .e-drop:hover:not(.e-drop--readonly) {
    background: var(--e-wash-hover);
    outline-color: var(--e-ink);
  }

  .e-drop--readonly {
    cursor: default;
  }

  .e-drop--over {
    background: var(--e-success-soft);
    outline-color: var(--e-success);
  }

  .e-drop-main {
    font: var(--e-type-body);
  }

  .e-drop-pick {
    color: var(--e-primary);
    font-weight: var(--e-weight-medium);
    text-decoration: underline;
    text-underline-offset: var(--e-underline-offset);
  }

  .e-drop--disabled {
    background: var(--e-disabled-fill);
    outline-color: var(--e-border-strong);
    color: var(--e-disabled-ink);
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
    font: var(--e-type-meta);
    letter-spacing: var(--e-tracking-wide);
    color: var(--e-muted);
  }

  .e-drop-input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
  }

  .e-drop-input:focus-visible + .e-drop {
    outline: max(var(--e-stroke-focus), calc(2 * var(--e-stroke-edge))) solid var(--e-focus-field);
    outline-offset: var(--e-focus-gap-field);
  }

  .e-files {
    display: grid;
    gap: 0;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .e-files li {
    display: flex;
    align-items: center;
    gap: var(--e-gap-snug);
    padding: var(--e-gap-snug) 0;
    border-top: var(--e-stroke-hair) solid var(--e-border);
    font: var(--e-weight-regular) var(--e-text-md) / var(--e-leading-snug) var(--e-font-sans);
  }

  .e-file-name {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .e-file-size {
    font: var(--e-weight-medium) var(--e-text-xs) / var(--e-leading-none) var(--e-font-mono);
    color: var(--e-muted);
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
