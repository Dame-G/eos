<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { PopoverAnchor, PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from "reka-ui";
import AeCalendar from "../Calendar/AeCalendar.vue";
import AeField from "../Field/AeField.vue";
import AeIcon from "../Icon/AeIcon.vue";
import { compareDays, isoDate, sameDay } from "../Calendar/dates.js";
import { useConfig, useMessages, usePortalTarget } from "../../config.js";
import { useFieldAttrs } from "../../composables/useFieldAttrs.js";
import { useLocale } from "../../composables/useLocale.js";
import "../../styles/base.css";
import "../TextField/input.css";
import "./picker.css";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  /** The visible label, a mono kicker above the field. */
  label: string;
  /** Keep the label for screen readers and remove it from the page. */
  hideLabel?: boolean;
  /** Help that stays under the field. */
  hint?: string;
  /** What to fix. Replaces the hint and marks the field invalid. A typed date that cannot be used shows its own error. */
  error?: string;
  /** A word beside the label. */
  required?: boolean;
  /** A word beside the label. Flag whichever is rarer. */
  optional?: boolean;
  disabled?: boolean;
  /** The earliest date that can be chosen or typed. */
  min?: Date;
  /** The latest date that can be chosen or typed. */
  max?: Date;
  /** Submits the date as `YYYY-MM-DD` with a form. */
  name?: string;
  /** The id of the text box; the label points at it. Generated when left out. */
  id?: string;
}>();

/** The chosen date, or `null`. */
const model = defineModel<Date | null>({ default: null });

const t = useMessages();
const config = useConfig();
const loc = useLocale();
const portal = usePortalTarget();
const attrs = useFieldAttrs();

const input = ref<HTMLInputElement | null>(null);
const calendar = ref<InstanceType<typeof AeCalendar> | null>(null);
const open = ref(false);
const text = ref(loc.formatDate(model.value));
const typedError = ref("");
let outside = false;

watch([() => model.value?.getTime(), () => config.locale], () => {
  text.value = loc.formatDate(model.value);
});
watch(open, (isOpen) => {
  if (isOpen) outside = false;
});

const shownError = computed(() => props.error || typedError.value);

function set(d: Date | null) {
  model.value = d;
  text.value = loc.formatDate(d);
  typedError.value = "";
}

/** Reads the text box: a good date becomes the value, a bad one shows an error and leaves the value alone. */
function commit() {
  const raw = text.value.trim();
  if (!raw) {
    typedError.value = "";
    if (model.value) model.value = null;
    return;
  }
  const d = loc.parseDate(raw);
  if (!d || (props.min && compareDays(d, props.min) < 0) || (props.max && compareDays(d, props.max) > 0)) {
    typedError.value = d
      ? t("dateBetween", { min: loc.formatDate(props.min || d), max: loc.formatDate(props.max || d) })
      : t("dateError", { format: loc.dateFormatLabel() });
    return;
  }
  typedError.value = "";
  text.value = loc.formatDate(d);
  if (!sameDay(d, model.value)) model.value = d;
}

function onKey(e: KeyboardEvent) {
  if (e.key === "Enter") commit();
  else if (e.key === "ArrowDown" && e.altKey && !props.disabled) {
    e.preventDefault();
    open.value = true;
  }
}

function choose(d: Date | null) {
  if (!d) return;
  set(d);
  open.value = false;
}
function clear() {
  set(null);
  open.value = false;
}

function onOpenFocus(e: Event) {
  e.preventDefault();
  void nextTick(() => calendar.value?.focusDay());
}
function onCloseFocus(e: Event) {
  e.preventDefault();
  if (!outside) input.value?.focus();
}
function onEscape(e: KeyboardEvent) {
  // Escape inside the months or years goes back to the days first; the calendar handles that itself.
  if (calendar.value && calendar.value.view !== "days") e.preventDefault();
}

function inputBind(field: { id: string; ariaInvalid: "true" | undefined; ariaDescribedby: string | undefined }) {
  return {
    id: field.id,
    class: "ae-input ae-combo-input",
    type: "text",
    inputmode: "numeric" as const,
    autocomplete: "off",
    placeholder: loc.dateFormatLabel(),
    value: text.value,
    disabled: props.disabled,
    required: props.required,
    "aria-invalid": field.ariaInvalid,
    ...attrs.input(field.ariaDescribedby),
  };
}

defineExpose({
  /** The text box. */
  input,
  /** Puts the cursor in the text box. */
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
    :error="shownError"
    :required="required"
    :optional="optional"
  >
    <template #default="field">
      <PopoverRoot v-model:open="open">
        <PopoverAnchor as-child>
          <div
            class="ae-input-wrap ae-combo"
            :data-invalid="shownError ? '' : undefined"
            :data-disabled="disabled ? '' : undefined"
          >
            <input
              ref="input"
              v-bind="inputBind(field)"
              @input="
                text = ($event.target as HTMLInputElement).value;
                typedError = '';
              "
              @blur="commit"
              @keydown="onKey"
            />
            <input v-if="name" type="hidden" :name="name" :value="isoDate(model)" />
            <PopoverTrigger as-child>
              <button type="button" class="ae-combo-btn" :aria-label="t('chooseDate')" :disabled="disabled">
                <AeIcon name="calendar" />
              </button>
            </PopoverTrigger>
          </div>
        </PopoverAnchor>
        <PopoverPortal :to="portal">
          <PopoverContent
            class="ae-calpanel ae-root"
            :aria-label="t('chooseDate')"
            :dir="config.dir ?? undefined"
            side="bottom"
            align="start"
            :side-offset="6"
            :collision-padding="8"
            @open-auto-focus="onOpenFocus"
            @close-auto-focus="onCloseFocus"
            @interact-outside="outside = true"
            @escape-key-down="onEscape"
          >
            <AeCalendar
              ref="calendar"
              :model-value="model"
              :min="min"
              :max="max"
              @update:model-value="choose"
              @clear="clear"
            />
          </PopoverContent>
        </PopoverPortal>
      </PopoverRoot>
    </template>
  </AeField>
</template>

<style>
@layer ae.composites {
  .ae-calpanel .ae-cal {
    margin-inline: auto;
  }
}
</style>
