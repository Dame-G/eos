<script setup lang="ts" generic="F extends 'date' | 'iso' = 'date'">
import { computed, ref, watch } from "vue";
import { PopoverAnchor, PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from "reka-ui";
import EButton from "../Button/EButton.vue";
import ECalendar from "../Calendar/ECalendar.vue";
import type { CalendarRange } from "../Calendar/ECalendar.vue";
import EField from "../Field/EField.vue";
import EInputShell from "../Field/EInputShell.vue";
import type { EFieldBoxProps, EFieldCommonProps } from "../Field/fieldProps.js";
import { FIELD_POPPER } from "../Field/popper.js";
import EIcon from "../Icon/EIcon.vue";
import { addDays, boundsMessage, compareDays, isoDate, parseIso, startOfDay } from "../Calendar/dates.js";
import { toBound, useDatePopover, type DateBound } from "../DatePicker/useDatePopover.js";
import { useConfig, useMessages, usePortalTarget } from "../../config.js";
import { useDir } from "../../composables/useDir.js";
import { RekaConfig } from "../../composables/useRekaConfig.js";
import { useFieldControl, type FieldSlot } from "../../composables/useFieldControl.js";
import { useLocale } from "../../composables/useLocale.js";
import "../../styles/base.css";
import "../../styles/controls/input.css";
import "../../styles/controls/combo.css";
import "../../styles/controls/picker.css";

export interface RangePreset {
  /** The button text, such as "Last 7 days". */
  label: string;
  /** The span the button chooses. */
  get: () => { start: Date; end: Date };
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    EFieldCommonProps &
      Pick<EFieldBoxProps, "size"> & {
        /** The visible label above the field. It also names the group. */
        label: string;
        /** The earliest date that can be chosen or typed: a `Date` or a `YYYY-MM-DD` string. */
        min?: DateBound;
        /** The latest date that can be chosen or typed: a `Date` or a `YYYY-MM-DD` string. */
        max?: DateBound;
        /** Days that cannot be chosen, in the calendar or by typing. */
        disabledDate?: (date: Date) => boolean;
        /** Days that get a dot in the calendar: a list of dates or a function. */
        marked?: Date[] | ((date: Date) => boolean);
        /** Shows the calendar's Today and Clear buttons. Clear empties both dates. */
        footer?: boolean;
        /** What `v-model:start` and `v-model:end` hold. `date` is a `Date` (a local day at noon). `iso` is a `YYYY-MM-DD` string, or `null` for no date, which has no time zone to shift. @default "date" */
        valueFormat?: F;
        /** Submits the first date as `YYYY-MM-DD` with a form, through a hidden input. */
        startName?: string;
        /** Submits the last date as `YYYY-MM-DD` with a form, through a hidden input. */
        endName?: string;
        /** Buttons under the calendar. Each sets the span and closes the calendar. A span is cut to `min` and `max`, and a button whose whole span lies outside them is disabled. An empty list shows none. @default Last 7 days, Last 30 days, This month */
        presets?: readonly RangePreset[];
      }
  >(),
  { footer: true },
);

const emit = defineEmits<{
  /** The typed dates cannot be used. The field shows `message`, keeps both models as they were and posts nothing until the text is fixed. `text` is both boxes, joined by " – ". */
  invalid: [text: string, message: string];
}>();

type Value = F extends "iso" ? string | null : Date | null;
/** The first date of the span: a `Date`, or a `YYYY-MM-DD` string with `valueFormat="iso"`. `null` when empty. */
const startModel = defineModel<Value>("start", { default: null as never });
/** The last date of the span, in the same form as `start`. */
const endModel = defineModel<Value>("end", { default: null as never });
/** Whether the calendar is open. A disabled field never opens. */
const open = defineModel<boolean>("open", { default: false });

const asDate = (v: Date | string | null) => (typeof v === "string" ? parseIso(v) : v);
const start = computed(() => asDate(startModel.value as Date | string | null));
const end = computed(() => asDate(endModel.value as Date | string | null));
const out = (d: Date | null) => (props.valueFormat === "iso" ? (d ? isoDate(d) : null) : d) as Value;
const minDate = computed(() => toBound(props.min));
const maxDate = computed(() => toBound(props.max));

const t = useMessages();
const config = useConfig();
const dir = useDir();
const loc = useLocale();
const portal = usePortalTarget();
const control = useFieldControl(props);
const attrs = control.attrs;
const startInput = control.input;

const picker = useDatePopover(props, open, {
  returnFocus: () => startInput.value?.focus(),
  commit: commitText,
  onInvalid: (text, message) => emit("invalid", text, message),
});
const calendar = picker.calendar;

const startText = ref(loc.formatDate(start.value));
const endText = ref(loc.formatDate(end.value));
const draft = ref<CalendarRange>({ start: start.value, end: end.value });
const startHidden = ref<HTMLInputElement | null>(null);
const endHidden = ref<HTMLInputElement | null>(null);
const posted = computed(() => (picker.unusable.value ? ["", ""] : [isoDate(start.value), isoDate(end.value)]));
/** Enter submits the form before Vue renders, so the posted values are written at once as well. */
function post(values: string[]) {
  if (startHidden.value) startHidden.value.value = values[0]!;
  if (endHidden.value) endHidden.value.value = values[1]!;
}

// A change from outside (the calendar, a preset, the parent) replaces whatever was typed, and so its error.
watch([() => start.value?.getTime(), () => end.value?.getTime(), () => config.locale], () => {
  startText.value = loc.formatDate(start.value);
  endText.value = loc.formatDate(end.value);
  picker.accept();
});
watch(open, (isOpen) => {
  if (isOpen) draft.value = { start: start.value, end: end.value };
});

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
  const lo = minDate.value;
  const hi = maxDate.value;
  const s = lo && compareDays(span.start, lo) < 0 ? startOfDay(lo) : span.start;
  const e = hi && compareDays(span.end, hi) > 0 ? startOfDay(hi) : span.end;
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
  picker.accept();
  post([isoDate(r.start), isoDate(r.end)]);
}

const outOfBounds = (d: Date) =>
  (!!minDate.value && compareDays(d, minDate.value) < 0) || (!!maxDate.value && compareDays(d, maxDate.value) > 0);

/** Reads the typed span and sets it, or shows what is wrong with it. Runs when focus leaves both boxes, and on Enter. */
function commitText() {
  if (props.readonly) return;
  const error = check();
  if (!error) return;
  picker.reject([startText.value.trim(), endText.value.trim()].join(" – "), error);
  post(["", ""]);
}

/** Reads the typed span and sets it. Returns what is wrong with it, or nothing. */
function check(): string | undefined {
  const a = startText.value.trim() ? loc.parseDate(startText.value) : null;
  const b = endText.value.trim() ? loc.parseDate(endText.value) : null;
  if ((startText.value.trim() && !a) || (endText.value.trim() && !b))
    return t("datesError", { format: loc.dateFormatLabel() });
  if ([a, b].some((d) => d && outOfBounds(d))) return boundsMessage(t, loc.formatDate, minDate.value, maxDate.value);
  if ([a, b].some((d) => d && props.disabledDate?.(d))) return t("dateUnavailable");
  if (a && b && compareDays(b, a) < 0) return t("endBeforeStart");
  setRange({ start: a, end: b });
  return undefined;
}

/** Moving from one box to the other is part of typing the span: it is read once focus leaves the group. */
function onGroupLeave(e: FocusEvent) {
  const next = e.relatedTarget as Node | null;
  if (next && (e.currentTarget as Element).contains(next)) return;
  commitText();
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
function clear() {
  draft.value = { start: null, end: null };
  setRange({ start: null, end: null });
  open.value = false;
}

/** A text box. The consumer's attributes are on the group, so a box takes only the field's own; the label's id is the start box's. */
function boxBind(field: FieldSlot, which: "start" | "end") {
  return {
    ...control.own(field),
    id: which === "start" ? field.id : undefined,
    class: "e-input e-combo-input",
    type: "text",
    autocomplete: "off",
    placeholder: loc.dateFormatLabel(),
    "aria-label": t(which === "start" ? "startDate" : "endDate"),
  };
}

defineExpose(control.exposed);
</script>

<template>
  <EField
    v-bind="attrs.wrapper()"
    :id="id"
    :label="label"
    :hide-label="hideLabel"
    :hint="hint"
    :error="picker.shownError.value"
    :required="required"
    :optional="optional"
  >
    <template #default="field">
      <RekaConfig>
        <PopoverRoot :open="picker.shown.value" @update:open="open = $event">
          <PopoverAnchor as-child>
            <EInputShell
              v-bind="{ ...attrs.group(), ...control.shell(picker.shownError.value) }"
              class="e-combo e-rangefield"
              role="group"
              :aria-labelledby="`${field.id}-label`"
              @focusout="onGroupLeave"
            >
              <input
                ref="startInput"
                v-model="startText"
                v-bind="boxBind(field, 'start')"
                @input="picker.typedError.value = ''"
                @keydown="picker.onKey"
              />
              <span class="e-range-sep" aria-hidden="true">{{ t("to") }}</span>
              <input
                v-model="endText"
                v-bind="boxBind(field, 'end')"
                @input="picker.typedError.value = ''"
                @keydown="picker.onKey"
              />
              <input v-if="startName" ref="startHidden" type="hidden" v-bind="control.hidden(startName, posted[0])" />
              <input v-if="endName" ref="endHidden" type="hidden" v-bind="control.hidden(endName, posted[1])" />
              <PopoverTrigger as-child v-bind="picker.trigger">
                <button
                  type="button"
                  class="e-input-btn e-interact e-interact--inset"
                  :aria-label="t('chooseDates')"
                  :disabled="disabled || readonly"
                >
                  <EIcon name="calendar" />
                </button>
              </PopoverTrigger>
            </EInputShell>
          </PopoverAnchor>
          <PopoverPortal :to="portal">
            <PopoverContent
              class="e-calpanel e-root"
              :aria-label="t('chooseDates')"
              :dir="dir"
              side="bottom"
              align="start"
              v-bind="{ ...FIELD_POPPER, ...picker.popup }"
            >
              <ECalendar
                ref="calendar"
                mode="range"
                :start="draft.start"
                :end="draft.end"
                :min="minDate"
                :max="maxDate"
                :disabled-date="disabledDate"
                :marked="marked"
                :footer="footer"
                clearable
                @range-change="onRange"
                @clear="clear"
              />
              <div v-if="presets.length" class="e-cal-presets">
                <EButton
                  v-for="({ preset, span }, i) in presets"
                  :key="`${i}-${preset.label}`"
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
      </RekaConfig>
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
