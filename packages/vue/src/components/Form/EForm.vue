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
import { nextTick, provide, ref, shallowReactive, watch } from "vue";
import ENotice from "../Notice/ENotice.vue";
import { useMessages } from "../../config.js";
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
const form = ref<HTMLFormElement | null>(null);
const notice = ref<{ $el: HTMLElement } | null>(null);
const fields = shallowReactive(new Set<FormFieldEntry>());
const issues = ref<FormIssue[]>([]);

provide(FORM_KEY, {
  register(entry) {
    fields.add(entry);
    return () => fields.delete(entry);
  },
});

type Found = FormIssue & { el: HTMLElement };
type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
const checkable = (el: Element | null): el is Control & HTMLElement =>
  !!el && "validity" in el && (el as Control).willValidate && !(el as Control).validity.valid;

/** The registered fields with an `error` or a failed native check, then any other control that fails one, in page order. */
function collect(): Found[] {
  const root = form.value;
  if (!root) return [];
  const found = new Map<string, Found>();
  for (const f of fields) {
    const id = f.id();
    const el = root.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
    const message = f.error() || (checkable(el) ? el.validationMessage : undefined);
    if (el && message) found.set(id, { id, label: f.label(), message, el });
  }
  for (const el of root.elements) {
    if (!checkable(el) || !el.id || found.has(el.id)) continue;
    const label = el.labels?.[0]?.textContent?.trim() || el.getAttribute("aria-label") || el.name;
    found.set(el.id, { id: el.id, label, message: el.validationMessage, el });
  }
  return [...found.values()].sort((a, b) =>
    a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
  );
}
const strip = ({ id, label, message }: Found): FormIssue => ({ id, label, message });

/** Updates the list while the summary is up, so a fixed field drops out of it. */
function refresh() {
  if (issues.value.length) issues.value = collect().map(strip);
}
watch(() => [...fields].map((f) => f.error()).join("\n"), refresh);
// A server's answer: the form stops submitting and the fields now carry errors.
watch(
  () => props.submitting,
  (on, was) => {
    if (was && !on) void show(collect());
  },
  { flush: "post" },
);

function focusField(id: string) {
  form.value?.querySelector<HTMLElement>(`#${CSS.escape(id)}`)?.focus();
}
async function show(found: Found[]) {
  issues.value = found.map(strip);
  if (!found.length) return;
  await nextTick();
  if (props.focusTarget === "field" || !props.summary) found[0]!.el.focus();
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
    if (el instanceof HTMLElement) el.focus();
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
