<script setup lang="ts" generic="F extends 'date' | 'iso' = 'date'">
import { computed, nextTick, ref, watch } from "vue";
import { ConfigProvider, PopoverAnchor, PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from "reka-ui";
import EButton from "../Button/EButton.vue";
import ECalendar from "../Calendar/ECalendar.vue";
import type { CalendarRange } from "../Calendar/ECalendar.vue";
import EField from "../Field/EField.vue";
import EIcon from "../Icon/EIcon.vue";
import { addDays, boundsMessage, compareDays, isoDate, parseIso, startOfDay } from "../Calendar/dates.js";
import { useConfig, useMessages, usePortalTarget } from "../../config.js";
import { useDir } from "../../composables/useDir.js";
import { useFieldControl } from "../../composables/useFieldControl.js";
import { useQuietFocus } from "../../composables/useQuietFocus.js";
import { useLocale } from "../../composables/useLocale.js";
import "../../styles/base.css";
import "../TextField/input.css";
import "../Combobox/combo.css";
import "../DatePicker/picker.css";

export interface RangePreset {
  /** The button text, such as "Last 7 days". */
  label: string;
  /** The span the button chooses. */
  get: () => { start: Date; end: Date };
}

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  /** The visible label above the field. It also names the group. */
  label: string;
  /** Keeps the label for screen readers and hides it from the page. */
  hideLabel?: boolean;
  /** Help that stays under the field. */
  hint?: string;
  /** What to fix. Replaces the hint and marks both boxes invalid. A typed span that cannot be used shows its own error. */
  error?: string;
  /** Sets the `required` attribute and adds a word beside the label. */
  required?: boolean;
  /** Adds a word beside the label. Use it when most fields in the form are required. */
  optional?: boolean;
  /** Disables both boxes and the button. A disabled field is not submitted. */
  disabled?: boolean;
  /** Shows the span but blocks editing. The boxes stay focusable and selectable. The calendar button is disabled and the calendar does not open. The dates are still submitted. */
  readonly?: boolean;
  /** The earliest date that can be chosen or typed. */
  min?: Date;
  /** The latest date that can be chosen or typed. */
  max?: Date;
  /** Days that cannot be chosen, in the calendar or by typing. */
  disabledDate?: (date: Date) => boolean;
  /** Days that get a dot in the calendar: a list of dates or a function. */
  marked?: Date[] | ((date: Date) => boolean);
  /** What `v-model:start` and `v-model:end` hold. `date` is a `Date` (a local day at noon). `iso` is a `YYYY-MM-DD` string, or `null` for no date, which has no time zone to shift. @default "date" */
  valueFormat?: F;
  /** Submits the first date as `YYYY-MM-DD` with a form, through a hidden input. */
  startName?: string;
  /** Submits the last date as `YYYY-MM-DD` with a form, through a hidden input. */
  endName?: string;
  /** Buttons under the calendar. Each sets the span and closes the calendar. A span is cut to `min` and `max`, and a button whose whole span lies outside them is disabled. @default Last 7 days, Last 30 days, This month */
  presets?: RangePreset[];
  /** The id of the start box, which the label points at. @default generated */
  id?: string;
}>();

type Value = F extends "iso" ? string | null : Date | null;
/** The first date of the span: a `Date`, or a `YYYY-MM-DD` string with `valueFormat="iso"`. `null` when empty. */
const startModel = defineModel<Value>("start", { default: null as never });
/** The last date of the span, in the same form as `start`. */
const endModel = defineModel<Value>("end", { default: null as never });

const asDate = (v: Date | string | null) => (typeof v === "string" ? parseIso(v) : v);
const start = computed(() => asDate(startModel.value as Date | string | null));
const end = computed(() => asDate(endModel.value as Date | string | null));
const out = (d: Date | null) => (props.valueFormat === "iso" ? (d ? isoDate(d) : null) : d) as Value;

const t = useMessages();
const config = useConfig();
const dir = useDir();
const loc = useLocale();
const portal = usePortalTarget();
const control = useFieldControl(props);
const attrs = control.attrs;

/** Whether the calendar is open. A disabled field never opens. */
const open = defineModel<boolean>("open", { default: false });
const shown = computed(() => open.value && !props.disabled && !props.readonly);
const quiet = useQuietFocus(shown, (el) => !!el.closest(".e-calpanel, .e-combo"));
const trigger = { onClick: quiet.intent, onKeydown: quiet.intent };

const startText = ref(loc.formatDate(start.value));
const endText = ref(loc.formatDate(end.value));
const typedError = ref("");
const draft = ref<CalendarRange>({ start: start.value, end: end.value });
const calendar = ref<InstanceType<typeof ECalendar> | null>(null);
const startInput = ref<HTMLInputElement | null>(null);
/** The typed span could not be used. The field then posts nothing rather than the dates it had before. */
const unusable = ref(false);
const startHidden = ref<HTMLInputElement | null>(null);
const endHidden = ref<HTMLInputElement | null>(null);
const posted = computed(() => (unusable.value ? ["", ""] : [isoDate(start.value), isoDate(end.value)]));
/** Enter submits the form before Vue renders, so the posted values are written at once as well. */
function post(values: string[]) {
  if (startHidden.value) startHidden.value.value = values[0]!;
  if (endHidden.value) endHidden.value.value = values[1]!;
}

// A change from outside (the calendar, a preset, the parent) replaces whatever was typed, and so its error.
watch([() => start.value?.getTime(), () => end.value?.getTime(), () => config.locale], () => {
  startText.value = loc.formatDate(start.value);
  endText.value = loc.formatDate(end.value);
  typedError.value = "";
  unusable.value = false;
});
watch(open, (isOpen) => {
  if (isOpen) draft.value = { start: start.value, end: end.value };
});

const shownError = computed(() => props.error || typedError.value);

const defaultPresets = (): RangePreset[] => {
  const today = startOfDay(new Date());
  return [
    { label: t("last7"), get: () => ({ start: addDays(today, -6), end: today }) },
    { label: t("last30"), get: () => ({ start: addDays(today, -29), end: today }) },
    {
      label: t("thisMonth"),
      get: () => ({ start: new Date(today.getFullYear(), today.getMonth(), 1, 12), end: today }),
    },
  ];
};

/** A preset's span cut to `min` and `max`; null when nothing of it is left. Worked out each time the calendar opens. */
function fit(p: RangePreset): { start: Date; end: Date } | null {
  const span = p.get();
  const s = props.min && compareDays(span.start, props.min) < 0 ? startOfDay(props.min) : span.start;
  const e = props.max && compareDays(span.end, props.max) > 0 ? startOfDay(props.max) : span.end;
  return compareDays(e, s) < 0 ? null : { start: s, end: e };
}
const presets = computed(() => {
  void open.value;
  return (props.presets ?? defaultPresets()).map((preset) => ({ preset, span: fit(preset) }));
});

function setRange(r: { start: Date | null; end: Date | null }) {
  startModel.value = out(r.start);
  endModel.value = out(r.end);
  startText.value = loc.formatDate(r.start);
  endText.value = loc.formatDate(r.end);
  typedError.value = "";
  unusable.value = false;
  post([isoDate(r.start), isoDate(r.end)]);
}

const outOfBounds = (d: Date) =>
  (!!props.min && compareDays(d, props.min) < 0) || (!!props.max && compareDays(d, props.max) > 0);

function commitText() {
  if (props.readonly) return;
  const error = check();
  unusable.value = !!error;
  if (error) {
    typedError.value = error;
    post(["", ""]);
  }
}

/** Reads the typed span and sets it. Returns what is wrong with it, or nothing. */
function check(): string | undefined {
  const a = startText.value.trim() ? loc.parseDate(startText.value) : null;
  const b = endText.value.trim() ? loc.parseDate(endText.value) : null;
  if ((startText.value.trim() && !a) || (endText.value.trim() && !b))
    return t("datesError", { format: loc.dateFormatLabel() });
  if ([a, b].some((d) => d && outOfBounds(d))) return boundsMessage(t, loc.formatDate, props.min, props.max);
  if ([a, b].some((d) => d && props.disabledDate?.(d))) return t("dateUnavailable");
  if (a && b && compareDays(b, a) < 0) return t("endBeforeStart");
  setRange({ start: a, end: b });
  return undefined;
}

function onRange(r: CalendarRange) {
  draft.value = r;
  if (r.start && r.end) {
    setRange(r);
    open.value = false;
  }
}
function applyPreset(span: { start: Date; end: Date } | null) {
  if (!span) return;
  setRange(span);
  open.value = false;
}

function onOpenFocus(e: Event) {
  e.preventDefault();
  if (!quiet.personOpened()) return;
  void nextTick(() => calendar.value?.focusDay());
}
function onCloseFocus(e: Event) {
  if (!quiet.returnsFocus()) e.preventDefault();
}
function onEscape(e: KeyboardEvent) {
  if (calendar.value && calendar.value.view !== "days") e.preventDefault();
}
function onKey(e: KeyboardEvent) {
  if (e.key === "Enter") commitText();
  else if (e.key === "ArrowDown" && e.altKey && !props.disabled && !props.readonly) {
    e.preventDefault();
    quiet.intent();
    open.value = true;
  }
}

defineExpose({
  input: startInput,
  focus: () => startInput.value?.focus(),
});
</script>

<template>
  <EField
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
      <ConfigProvider :dir="dir">
        <PopoverRoot :open="shown" @update:open="open = $event">
          <PopoverAnchor as-child>
            <div
              v-bind="attrs.group()"
              class="e-input-wrap e-combo e-rangefield"
              role="group"
              :aria-labelledby="`${field.id}-label`"
              :data-invalid="shownError ? '' : undefined"
              :data-disabled="disabled ? '' : undefined"
              :data-readonly="readonly ? '' : undefined"
            >
              <input
                :id="field.id"
                ref="startInput"
                v-model="startText"
                class="e-input e-combo-input"
                type="text"
                autocomplete="off"
                :placeholder="t('startDate')"
                :aria-label="t('startDate')"
                :disabled="disabled"
                :readonly="readonly"
                :required="required"
                :aria-invalid="field.ariaInvalid"
                :aria-describedby="field.ariaDescribedby"
                @input="typedError = ''"
                @blur="commitText"
                @keydown="onKey"
              />
              <span class="e-range-sep" aria-hidden="true">{{ t("to") }}</span>
              <input
                v-model="endText"
                class="e-input e-combo-input"
                type="text"
                autocomplete="off"
                :placeholder="t('endDate')"
                :aria-label="t('endDate')"
                :disabled="disabled"
                :readonly="readonly"
                :required="required"
                :aria-invalid="field.ariaInvalid"
                :aria-describedby="field.ariaDescribedby"
                @input="typedError = ''"
                @blur="commitText"
                @keydown="onKey"
              />
              <input
                v-if="startName"
                ref="startHidden"
                type="hidden"
                v-bind="control.hidden(startName, posted[0])"
              />
              <input v-if="endName" ref="endHidden" type="hidden" v-bind="control.hidden(endName, posted[1])" />
              <PopoverTrigger as-child v-bind="trigger">
                <button
                  type="button"
                  class="e-combo-btn"
                  :aria-label="t('chooseDates')"
                  :disabled="disabled || readonly"
                >
                  <EIcon name="calendar" />
                </button>
              </PopoverTrigger>
            </div>
          </PopoverAnchor>
          <PopoverPortal :to="portal">
            <PopoverContent
              class="e-calpanel e-root"
              :aria-label="t('chooseDates')"
              :dir="dir"
              side="bottom"
              align="start"
              :side-offset="6"
              :collision-padding="8"
              @open-auto-focus="onOpenFocus"
              @close-auto-focus="onCloseFocus"
              @escape-key-down="onEscape"
            >
              <ECalendar
                ref="calendar"
                mode="range"
                :start="draft.start"
                :end="draft.end"
                :min="min"
                :max="max"
                :disabled-date="disabledDate"
                :marked="marked"
                :footer="false"
                @range-change="onRange"
              />
              <div class="e-cal-presets">
                <EButton
                  v-for="{ preset, span } in presets"
                  :key="preset.label"
                  variant="outline"
                  :disabled="!span"
                  @click="applyPreset(span)"
                >
                  {{ preset.label }}
                </EButton>
              </div>
            </PopoverContent>
          </PopoverPortal>
        </PopoverRoot>
      </ConfigProvider>
    </template>
  </EField>
</template>

<style>
@layer e.composites {
  .e-cal-presets {
    display: flex;
    flex-wrap: wrap;
    gap: var(--e-gap-snug);
    padding-top: var(--e-gap-base);
    border-top: var(--e-stroke-hair) solid var(--e-border);
  }

  .e-rangefield .e-input {
    flex: 1 1 5rem;
  }

  .e-range-sep {
    flex: none;
    font: var(--e-weight-medium) var(--e-text-sm) / var(--e-leading-none) var(--e-font-sans);
    color: var(--e-muted);
  }
}
</style>
