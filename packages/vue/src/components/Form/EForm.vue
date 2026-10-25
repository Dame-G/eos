<script lang="ts">
export interface FormIssue {
  /** The id of the invalid control, which the summary links to. */
  id: string;
  /** The field's label. */
  label: string;
  /** What is wrong: the field's `error`, or the browser's message for a failed `required`, `pattern` or range. */
  message: string;
}
</script>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, provide, ref, shallowReactive, watch } from "vue";
import ENotice from "../Notice/ENotice.vue";
import { useMessages } from "../../config.js";
import { useAnnouncer } from "../../composables/useAnnouncer.js";
import { FORM_KEY, type FormFieldEntry } from "../../composables/useFormContext.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** The form is being sent. Sets `aria-busy` and ignores a second submit until it clears. When it clears with errors on the fields, the summary shows. */
    submitting?: boolean;
    /** Lists the invalid fields in a notice above the form after a submit that failed. */
    summary?: boolean;
    /** Where focus goes after a failed submit: the summary, or the first invalid field (use it with `summary` off). @default "summary" */
    focusTarget?: "summary" | "field";
  }>(),
  { summary: true, focusTarget: "summary" },
);

const emit = defineEmits<{
  /** The form passed every check. Call `preventDefault()` (`@submit.prevent`) to send it yourself instead of the browser. */
  submit: [event: SubmitEvent];
  /** The submit was stopped because fields are invalid. */
  invalid: [issues: FormIssue[]];
  /** The form was reset. Values bound with `v-model` are yours to reset. */
  reset: [event: Event];
}>();

defineSlots<{
  /** The fields and the buttons. */
  default(): unknown;
}>();

const t = useMessages();
const { announce: say } = useAnnouncer();
const form = ref<HTMLFormElement | null>(null);
const notice = ref<{ $el: HTMLElement } | null>(null);
const fields = shallowReactive(new Set<FormFieldEntry>());
const issues = ref<FormIssue[]>([]);

/**
 * The fields' errors that appear in one turn are said together, once the turn is over. A failed submit that shows the
 * summary says nothing more: the summary is an alert and takes focus, so it is the one announcement.
 */
let heard: string[] = [];
let summarySpoke = false;
let turn: ReturnType<typeof setTimeout> | undefined;
function endTurn() {
  turn ??= setTimeout(() => {
    turn = undefined;
    const words = summarySpoke ? [] : heard;
    heard = [];
    summarySpoke = false;
    if (words.length) say(words.join(". "), { assertive: true });
  }, 0);
}
onBeforeUnmount(() => clearTimeout(turn));

provide(FORM_KEY, {
  register(entry) {
    fields.add(entry);
    return () => fields.delete(entry);
  },
  announce(message) {
    heard.push(message);
    endTurn();
  },
});

type Found = FormIssue & { el: HTMLElement };
type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
const checkable = (el: Element | null): el is Control & HTMLElement =>
  !!el && "validity" in el && (el as Control).willValidate && !(el as Control).validity.valid;

/**
 * The registered fields with an `error`, a failed check of their own or a failed native check, then any other control
 * that fails a native check, in page order. A group of radios is listed once.
 */
function collect(): Found[] {
  const root = form.value;
  if (!root) return [];
  const found = new Map<string, Found>();
  const radios = new Set<string>();
  // A group listed once: its radios, which fail the same required check, are not listed again.
  const add = (entry: Found) => {
    found.set(entry.id, entry);
    const own = entry.el.matches("input[type=radio]") ? [entry.el] : entry.el.querySelectorAll("input[type=radio]");
    for (const r of own) if ((r as HTMLInputElement).name) radios.add((r as HTMLInputElement).name);
  };
  for (const f of fields) {
    const id = f.id();
    if (!id || found.has(id)) continue;
    const el = root.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
    const message = f.error() || f.check?.() || (checkable(el) ? el.validationMessage : undefined);
    if (el && message) add({ id, label: f.label(), message, el });
  }
  for (const el of root.elements) {
    if (!checkable(el) || !el.id || found.has(el.id)) continue;
    if (el instanceof HTMLInputElement && el.type === "radio" && radios.has(el.name)) continue;
    const label = el.labels?.[0]?.textContent?.trim() || el.getAttribute("aria-label") || el.name;
    add({ id: el.id, label, message: el.validationMessage, el });
  }
  return [...found.values()].sort((a, b) =>
    a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
  );
}
const strip = ({ id, label, message }: Found): FormIssue => ({ id, label, message });

/** Updates the list while the summary is up, so a fixed field drops out of it: once a frame however many keys or checks change. */
let frame = 0;
function refresh() {
  if (!issues.value.length || frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    if (issues.value.length) issues.value = collect().map(strip);
  });
}
onBeforeUnmount(() => cancelAnimationFrame(frame));
// A Select or a group changes no native input the form hears, so the list also follows the fields' own checks, which
// read reactive state. They are read only while the summary is up.
watch(
  () => (issues.value.length ? [...fields].map((f) => [f.error(), f.check?.()].join("\t")).join("\n") : ""),
  refresh,
);
// A server's answer: the form stops submitting and the fields now carry errors.
watch(
  () => props.submitting,
  (on, was) => {
    if (was && !on) void show(collect());
  },
  { flush: "post" },
);

/**
 * Focuses a field. A group (a fieldset) passes focus to its chosen option or its first control. One that cannot take
 * focus (a signature pad) is brought into view.
 */
function focusEl(el: HTMLElement) {
  const target =
    el instanceof HTMLFieldSetElement
      ? (el.querySelector<HTMLElement>("input:checked:not(:disabled)") ??
        el.querySelector<HTMLElement>("input:not([type=hidden], :disabled), select, textarea, button:not(:disabled)") ??
        el)
      : el;
  target.focus();
  if (document.activeElement !== target) target.scrollIntoView({ block: "center" });
}
function focusField(id: string) {
  const el = form.value?.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
  if (el) focusEl(el);
}
async function show(found: Found[]) {
  issues.value = found.map(strip);
  if (!found.length) return;
  if (props.summary) {
    summarySpoke = true;
    endTurn();
  }
  await nextTick();
  if (props.focusTarget === "field" || !props.summary) focusEl(found[0]!.el);
  else notice.value?.$el.focus();
}

/** Runs the checks of a submit: shows the summary and moves focus when a field is invalid. Returns whether the form is valid. */
function validate(): boolean {
  const found = collect();
  void show(found);
  return !found.length;
}
function onSubmit(e: SubmitEvent) {
  if (props.submitting) return e.preventDefault();
  if (e.submitter?.hasAttribute("formnovalidate")) return emit("submit", e);
  if (validate()) return emit("submit", e);
  e.preventDefault();
  emit("invalid", issues.value);
}
function onReset(e: Event) {
  issues.value = [];
  emit("reset", e);
}

defineExpose({
  /** Runs the checks of a submit and returns whether the form is valid. */
  validate,
  /** Resets the native values, clears the summary and emits `reset`. */
  reset: () => form.value?.reset(),
  /** Moves focus to the first invalid field. */
  focusFirstInvalid: () => {
    const el = collect()[0]?.el;
    if (el) focusEl(el);
  },
  /** The problems listed in the summary. */
  issues,
  form,
});
</script>

<template>
  <form
    ref="form"
    class="e-form"
    novalidate
    :aria-busy="submitting ? 'true' : undefined"
    @submit="onSubmit"
    @reset="onReset"
    @input.passive="refresh"
    @change.passive="refresh"
  >
    <ENotice v-if="summary && issues.length" ref="notice" tone="danger" :title="t('errorSummary')" tabindex="-1">
      <ul class="e-form-issues">
        <li v-for="issue in issues" :key="issue.id">
          <a :href="`#${issue.id}`" @click.prevent="focusField(issue.id)">{{
            t("formIssue", { label: issue.label, message: issue.message })
          }}</a>
        </li>
      </ul>
    </ENotice>
    <slot />
  </form>
</template>

<style>
@layer e.containers {
  .e-form {
    display: grid;
    gap: var(--e-gap-loose);
  }

  .e-form > .e-notice:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: var(--e-stroke-focus);
  }

  .e-form-issues {
    display: grid;
    gap: var(--e-gap-tight);
    margin: 0;
    padding: 0;
    list-style: none;
  }
}
</style>
