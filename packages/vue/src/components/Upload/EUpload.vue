<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import EIcon from "../Icon/EIcon.vue";
import EField from "../Field/EField.vue";
import type { EFieldCommonProps } from "../Field/fieldProps.js";
import EIconButton from "../IconButton/EIconButton.vue";
import { useMessages } from "../../config.js";
import { useFieldAttrs } from "../../composables/useFieldAttrs.js";
import { useAnnouncer } from "../../composables/useAnnouncer.js";
import { useLocale } from "../../composables/useLocale.js";
import "../../styles/base.css";

type Reason = "type" | "size" | "count";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    EFieldCommonProps & {
      /** The visible label above the dropzone. */
      label: string;
      /** Accepted types, separated by commas: extensions such as `.pdf`, MIME types such as `image/png` and wildcards such as `image/*`. Passed to the input, shown under the prompt ("PDF, PNG, image/*") and also applied to dropped files. */
      accept?: string;
      /** Allows choosing more than one file. New files are added to the list, and a file already in it (same name, size and date) is not added twice. Without it, a choice replaces the file, and the others of several are rejected with reason `count`. */
      multiple?: boolean;
      /** The largest file allowed, in bytes. Shown under the prompt ("Up to 5 MB"); a larger one is left out and announced as "1 file is larger than 5 MB". */
      maxSize?: number;
      /** The most files the list can hold with `multiple`. Shown under the prompt; further files are left out and announced. */
      maxFiles?: number;
      /** The name submitted with a form. */
      name?: string;
      /** Shows an image file as itself in place of its icon: a small thumbnail in the list, large in a single upload. Set it to `false` where images should not show on screen. */
      preview?: boolean;
    }
  >(),
  { preview: true },
);

const emit = defineEmits<{
  /** Files left out, each with why: `type` (not in `accept`), `size` (over `maxSize`) or `count` (over `maxFiles`). A choice that is entirely rejected leaves the list as it was. */
  reject: [rejected: { file: File; reason: Reason }[]];
}>();

/** The chosen files. */
const model = defineModel<File[]>({ default: () => [] });

const t = useMessages();
const attrs = useFieldAttrs();

/** The prompt as one sentence, with the "choose one" words where the translation puts them. */
const prompt = computed(() => {
  const [before = "", after = ""] = t("dropFile").split("{choose}");
  return [before, after];
});
const over = ref(false);
const input = ref<HTMLInputElement | null>(null);
/** An accepted type as people read it: an extension or an exact MIME type as its upper-case name (`.pdf`, `image/png`: PDF, PNG); a wildcard as written. */
function typeName(rule: string): string {
  const r = rule.trim().toLowerCase();
  if (r.startsWith(".")) return r.slice(1).toUpperCase();
  const [, sub] = r.split("/");
  return sub && sub !== "*" ? (sub.split("+")[0] ?? sub).toUpperCase() : r;
}
/** The limits under the prompt: the types, the largest size and the most files. */
const limits = computed(() =>
  [
    props.accept
      ?.split(",")
      .filter((r) => r.trim())
      .map(typeName)
      .join(", "),
    props.maxSize != null ? t("fileSizeLimit", { max: formatSize(props.maxSize) }) : "",
    props.multiple && props.maxFiles != null ? t("fileCountLimit", { n: props.maxFiles }) : "",
  ]
    .filter(Boolean)
    .join(" · "),
);

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
  const rejected: { file: File; reason: Reason }[] = [];
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
  const count = (reason: Reason) => rejected.filter((r) => r.reason === reason).length;
  const said = [
    added ? t("filesAdded", { n: added }) : "",
    count("type") ? t("filesRejected", { n: count("type") }) : "",
    count("size") ? t("filesTooLarge", { n: count("size"), max: formatSize(props.maxSize ?? 0) }) : "",
    count("count") ? t("filesTooMany", { n: props.multiple ? (props.maxFiles ?? 0) : 1 }) : "",
  ].filter(Boolean);
  if (added) {
    model.value = files;
  }
  // The input holds whatever was just chosen. A choice that was turned away must not replace what the list shows.
  syncInput(added ? files : model.value);
  // Each choice shows its own left-out files, so an old one does not linger beside a new choice.
  turnedAway.value = rejected;
  if (rejected.length) emit("reject", rejected);
  if (said.length) announce(said.join(". "), { assertive: rejected.length > 0 });
}

/** The files the last choice left out, listed under the zone with why until dismissed. */
const turnedAway = ref<{ file: File; reason: Reason }[]>([]);
function why(reason: Reason): string {
  if (reason === "type") return t("fileRejectedType");
  if (reason === "size") return t("fileRejectedSize", { max: formatSize(props.maxSize ?? 0) });
  return t("filesTooMany", { n: props.multiple ? (props.maxFiles ?? 0) : 1 });
}
function dismissAt(index: number) {
  turnedAway.value = turnedAway.value.filter((_, i) => i !== index);
  input.value?.focus();
}

/** Without `multiple` the chosen file takes the prompt's place inside the zone. */
const single = computed(() => (props.multiple ? undefined : model.value[0]));
/** How full the list is, in the zone's corner, with `multiple` and `maxFiles`. */
const fullness = computed(() =>
  props.multiple && props.maxFiles != null ? t("fileCount", { n: model.value.length, max: props.maxFiles }) : "",
);

/** The icon of a file's kind: an image, a PDF, or any other document. */
function iconOf(f: File): string {
  if (f.type.startsWith("image/")) return "file-image";
  return f.type === "application/pdf" || /\.pdf$/i.test(f.name) ? "file-pdf" : "file";
}

/* With `preview`, an image file shows as itself. Each thumbnail is an object URL, made once and let go when its file leaves the list. */
const thumbs = new Map<File, string>();
function thumbOf(f: File): string | undefined {
  if (!props.preview || !f.type.startsWith("image/") || typeof document === "undefined") return undefined;
  let url = thumbs.get(f);
  if (!url) thumbs.set(f, (url = URL.createObjectURL(f)));
  return url;
}
function release(keep: File[]) {
  for (const [f, url] of thumbs) {
    if (keep.includes(f)) continue;
    URL.revokeObjectURL(url);
    thumbs.delete(f);
  }
}
watch(model, release);

/* A file dragged anywhere over the page marks the zone with a dashed edge, so it can be found before it is reached. */
const armed = ref(false);
let pageDepth = 0;
const carriesFiles = (e: DragEvent) => !!e.dataTransfer?.types.includes("Files");
function onPageEnter(e: DragEvent) {
  if (!carriesFiles(e) || props.disabled || props.readonly) return;
  pageDepth++;
  armed.value = true;
}
function onPageLeave(e: DragEvent) {
  if (!carriesFiles(e)) return;
  pageDepth = Math.max(0, pageDepth - 1);
  if (pageDepth === 0) armed.value = false;
}
function onPageEnd() {
  pageDepth = 0;
  armed.value = false;
}
const pageEvents = [
  ["dragenter", onPageEnter],
  ["dragleave", onPageLeave],
  ["drop", onPageEnd],
  ["dragend", onPageEnd],
] as const;
onMounted(() => pageEvents.forEach(([type, fn]) => document.addEventListener(type, fn)));
onBeforeUnmount(() => {
  pageEvents.forEach(([type, fn]) => document.removeEventListener(type, fn));
  release([]);
});

function removeAt(index: number) {
  const gone = model.value[index];
  if (!gone) return;
  const files = model.value.filter((_, i) => i !== index);
  model.value = files;
  syncInput(files);
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
      <div class="e-upload" :class="{ 'e-upload--disabled': disabled }">
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
          v-bind="attrs.input([field.ariaDescribedby, readonly && `${field.id}-ro`])"
          @click="onPick"
          @change="take(($event.target as HTMLInputElement).files)"
        />
        <!-- A disabled upload that holds files shows only the files: there is nothing to drop on. -->
        <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
        <div
          v-if="!(disabled && multiple && model.length)"
          class="e-drop"
          :class="{
            'e-drop--armed': armed,
            'e-drop--over': over,
            'e-drop--filled': single,
            'e-drop--disabled': disabled,
            'e-drop--readonly': readonly,
          }"
          :data-invalid="field.ariaInvalid ? '' : undefined"
          @dragenter="onDragEnter"
          @dragover="onDragOver"
          @dragleave="onDragLeave"
          @drop="onDrop"
        >
          <!-- The file takes the zone's place and stays its label: choosing or dropping again replaces it. -->
          <div v-if="single" class="e-file e-file--single">
            <label :for="field.id" class="e-file-main">
              <img v-if="thumbOf(single)" class="e-file-preview" :src="thumbOf(single)" alt="" />
              <EIcon v-else :name="iconOf(single)" />
              <span class="e-file-row">
                <span class="e-file-name">{{ single.name }}</span>
                <span class="e-file-size">{{ formatSize(single.size) }}</span>
              </span>
            </label>
            <EIconButton
              v-if="!disabled && !readonly"
              class="e-file-remove"
              icon="x"
              :label="t('removeItem', { label: single.name })"
              @click="removeAt(0)"
            />
          </div>
          <label v-else :for="field.id" class="e-drop-zone">
            <EIcon name="upload" />
            <span class="e-drop-main"
              >{{ prompt[0] }}<span class="e-drop-pick">{{ t("chooseOne") }}</span
              >{{ prompt[1] }}</span
            >
            <span v-if="limits" class="e-drop-hint">{{ limits }}</span>
          </label>
          <!-- The list says how many files it holds; the corner is for the eye. -->
          <span v-if="fullness" class="e-drop-count" aria-hidden="true">{{ fullness }}</span>
        </div>
        <!-- A file input has no readonly of its own, and aria-readonly is not allowed on it: the state is described. -->
        <span v-if="readonly" :id="`${field.id}-ro`" class="e-sr">{{ t("readOnly") }}</span>
        <ul v-if="multiple && model.length" class="e-files">
          <li v-for="(f, i) in model" :key="keyOf(f) + i" class="e-file">
            <span class="e-file-main">
              <img v-if="thumbOf(f)" class="e-file-thumb" :src="thumbOf(f)" alt="" />
              <EIcon v-else :name="iconOf(f)" />
              <span class="e-file-name">{{ f.name }}</span>
              <span class="e-file-size">{{ formatSize(f.size) }}</span>
            </span>
            <EIconButton
              v-if="!disabled && !readonly"
              icon="x"
              :label="t('removeItem', { label: f.name })"
              @click="removeAt(i)"
            />
          </li>
        </ul>
        <ul v-if="turnedAway.length" class="e-rejects">
          <li v-for="(r, i) in turnedAway" :key="keyOf(r.file) + i" class="e-file e-file--rejected">
            <span class="e-file-main">
              <EIcon name="alert" />
              <span class="e-file-name">{{ r.file.name }}</span>
              <span class="e-file-why">{{ why(r.reason) }}</span>
            </span>
            <EIconButton icon="x" :label="t('dismiss')" @click="dismissAt(i)" />
          </li>
        </ul>
      </div>
    </template>
  </EField>
</template>

<style>
@layer e.controls {
  .e-upload {
    display: grid;
    gap: var(--e-gap-snug);
  }

  /* Sunk: a well pressed into the page, where files are put. Its edge turns dashed while a file is dragged anywhere over the page, and it takes the brand tint and sinks a step deeper while one is over it: where the file will land. */
  .e-drop {
    --_veil: transparent;

    position: relative;
    display: grid;
    border: var(--e-stroke-edge) solid var(--e-border-strong);
    border-radius: var(--e-radius-md);
    background-color: var(--e-surface-tint);
    background-clip: padding-box;

    /* The hover fill is a full-size inset over the well, always there and transparent at rest, so a hover fades its colour and never sweeps in from the edges; a file over the zone sinks the well a step deeper in the same two layers. */
    box-shadow:
      inset 0 0 0 100vmax var(--_veil),
      var(--_well, var(--e-shadow-well));
    transition: var(--e-transition-state);
  }

  .e-drop-zone {
    display: grid;
    justify-items: center;
    gap: var(--e-gap-tight);
    padding: var(--e-pad-panel) var(--e-pad-card);
    text-align: center;
    cursor: pointer;
  }

  /* The hover fill is laid over the well, as on a field. */
  .e-drop:hover:not(.e-drop--readonly, .e-drop--disabled) {
    --_veil: var(--e-wash-hover);
  }

  .e-drop--armed {
    border-style: dashed;
    border-color: var(--e-primary);
  }

  .e-drop.e-drop--over {
    border-style: solid;
    border-color: var(--e-primary);

    --_veil: transparent;
    --_well: inset 0 var(--e-depth) 0 0 var(--e-primary-slab);

    background-color: var(--e-primary-soft);
  }

  .e-drop-main {
    font: var(--e-type-body);
  }

  .e-drop-pick {
    color: var(--e-primary);
    font-weight: var(--e-weight-medium);
    text-decoration: underline;
    text-underline-offset: var(--e-stroke-underline-offset);
  }

  .e-drop--readonly :is(.e-drop-zone, .e-file-main) {
    cursor: default;
  }

  /* Disabled as every control is: no lift or well, the disabled fill and ink, and a dashed edge so colour is not the only cue. The zone and each file tile alike. */
  .e-drop--disabled,
  .e-upload--disabled .e-file {
    border: var(--e-stroke-edge) dashed var(--e-border-strong);
    border-radius: var(--e-radius-md);
    background-color: var(--e-disabled-fill);
    box-shadow: none;
    color: var(--e-disabled-ink);
  }

  .e-drop--disabled :is(.e-drop-zone, .e-file-main) {
    cursor: not-allowed;
  }

  .e-drop--disabled .e-drop-pick {
    color: inherit;
  }

  /* Invalid as a field is: the danger edge, the danger tint for the hover fill, and the focus ring in danger. */
  .e-drop[data-invalid]:not(.e-drop--disabled, .e-drop--over, .e-drop--armed) {
    border-color: var(--e-danger);
  }

  .e-drop[data-invalid]:not(.e-drop--disabled, .e-drop--over, .e-drop--armed):hover {
    --_veil: var(--e-danger-soft);
  }

  /* Filled, the file is the whole control: the well gives way to the file's own tile, which takes the zone's states (the hover fill, a file dragged over the page or over it, the danger edge). */
  .e-drop.e-drop--filled {
    padding: 0;
    border: 0;
    background: none;
    box-shadow: none;
  }

  .e-drop--filled > .e-file--single {
    background-clip: padding-box;
    box-shadow: inset 0 0 0 100vmax var(--_veil);
    transition: var(--e-transition-state);
  }

  .e-drop--armed > .e-file--single {
    border-style: dashed;
    border-color: var(--e-primary);
  }

  .e-drop--over > .e-file--single {
    border-style: solid;
    border-color: var(--e-primary);
    background-color: var(--e-primary-soft);
  }

  .e-drop[data-invalid]:not(.e-drop--disabled, .e-drop--over, .e-drop--armed) > .e-file--single {
    border-color: var(--e-danger);
  }

  .e-drop-hint {
    font: var(--e-type-meta);
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
    outline-offset: var(--e-stroke-focus-gap-field);
  }

  .e-drop-input:focus-visible + .e-drop[data-invalid] {
    outline-color: var(--e-danger);
  }

  .e-files,
  .e-rejects {
    display: grid;
    gap: var(--e-gap-snug);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  /* Raised: a chosen file is a tile on its slab, set down on the page, with the neutral face and edge of an outline button. */
  .e-file {
    --_r: var(--e-radius-md);

    display: flex;
    align-items: center;
    gap: var(--e-gap-tight);
    min-width: 0;

    /* The same small gap round the Remove button on every side, so it never meets the tile's edge. */
    padding: var(--e-gap-tight);
    padding-inline-start: 0;
    border: var(--e-stroke-edge) solid var(--e-slab-ink);
    border-bottom-width: calc(var(--e-stroke-edge) + var(--e-depth));
    border-radius: var(--_r) / var(--_r) var(--_r) calc(var(--_r) + var(--e-depth)) calc(var(--_r) + var(--e-depth));
    background: var(--e-surface);
    font: var(--e-weight-regular) var(--e-text-md) / var(--e-leading-snug) var(--e-font-sans);
  }

  .e-file-main {
    display: flex;
    flex: 1;
    align-items: center;
    align-self: stretch;
    gap: var(--e-gap-snug);
    min-width: 0;
    padding-inline-start: var(--e-pad-control);
  }

  /* A tile keeps its height without its Remove button (a disabled or read-only file), and its text keeps the usual inset from the end. */
  .e-file:not(.e-file--single) > .e-file-main {
    min-height: var(--e-control-height);
  }

  .e-file > .e-file-main:last-child {
    padding-inline-end: calc(var(--e-pad-control) - var(--e-gap-tight));
  }

  label.e-file-main {
    cursor: pointer;
  }

  /* A file left out: flat, since it was never set down, and edged in danger like a Notice: the tone all round, its start side thick. The icon takes the tone; the dismiss button stays neutral, as on a Notice. */
  .e-file--rejected {
    border-color: var(--e-danger);
    border-bottom-width: var(--e-stroke-edge);
    border-inline-start-width: calc(var(--e-stroke-edge) + var(--e-depth-bold));
    border-radius: var(--_r);
    border-start-start-radius: calc(var(--_r) + var(--e-depth-bold)) var(--_r);
    border-end-start-radius: calc(var(--_r) + var(--e-depth-bold)) var(--_r);
  }

  .e-file--rejected .e-file-main > .e-icon,
  .e-file-why {
    color: var(--e-danger);
  }

  .e-file-why {
    font: var(--e-type-meta);
  }

  /* The image at its own proportions, up to twice as wide as tall, so a card or a page is not cropped to a square. */
  .e-file-thumb {
    width: auto;
    max-width: calc(2 * var(--e-icon-size-xl));
    height: var(--e-icon-size-xl);
    border-radius: var(--e-radius-sm);
    object-fit: cover;
  }

  /* The one file of a single upload, large: the image itself or the icon of its kind, then its name and size, the Remove button in the corner. */
  .e-file--single {
    position: relative;
  }

  .e-file--single .e-file-main {
    flex-direction: column;
    justify-content: center;
    padding: var(--e-pad-card);
    text-align: center;
  }

  .e-file--single .e-file-main > .e-icon {
    width: calc(2 * var(--e-icon-size-xl));
    height: calc(2 * var(--e-icon-size-xl));
  }

  /* Every image at one generous height, at its own proportions, narrower only where the zone is. */
  .e-file-preview {
    width: auto;
    max-width: 100%;
    height: calc(6 * var(--e-icon-size-xl));
    border-radius: var(--e-radius-sm);
    object-fit: contain;
  }

  .e-file-row {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: var(--e-gap-snug);
    max-width: 100%;
  }

  .e-file--single .e-file-name {
    flex: 0 1 auto;
  }

  .e-file-remove {
    position: absolute;
    inset-block-start: var(--e-gap-tight);
    inset-inline-end: var(--e-gap-tight);
  }

  .e-file-name {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .e-file-size,
  .e-drop-count {
    font: var(--e-weight-medium) var(--e-text-xs) / var(--e-leading-none) var(--e-font-mono);
    color: var(--e-muted);
  }

  .e-drop-count {
    position: absolute;
    inset-block-start: var(--e-gap-snug);
    inset-inline-end: var(--e-gap-snug);
  }

  /* Nothing can be dropped on paper: an empty zone, the count and the files turned away are left out, and the chosen files print as they show. */
  @media print {
    .e-drop:has(.e-drop-zone),
    .e-drop-count,
    .e-rejects {
      display: none;
    }
  }

  @media (forced-colors: active) {
    .e-drop:hover,
    .e-drop--armed,
    .e-drop.e-drop--over {
      border-color: Highlight;
    }
  }
}
</style>
