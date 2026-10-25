<script setup lang="ts" generic="F extends 'date' | 'iso' = 'date'">
import { computed, ref, watch } from "vue";
import { PopoverAnchor, PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from "reka-ui";
import ECalendar from "../Calendar/ECalendar.vue";
import EField from "../Field/EField.vue";
import EInputShell from "../Field/EInputShell.vue";
import type { EFieldBoxProps, EFieldCommonProps } from "../Field/fieldProps.js";
import EIcon from "../Icon/EIcon.vue";
import { boundsMessage, compareDays, isoDate, parseIso, sameDay } from "../Calendar/dates.js";
import { toBound, useDatePopover, type DateBound } from "./useDatePopover.js";
import { useConfig, useMessages, usePortalTarget } from "../../config.js";
import { FIELD_POPPER, useDir } from "../../composables/useDir.js";
import { RekaConfig } from "../../composables/useRekaConfig.js";
import { useFieldControl, type FieldSlot } from "../../composables/useFieldControl.js";
import { useLocale } from "../../composables/useLocale.js";
import "../../styles/base.css";
import "../../styles/controls/input.css";
import "../../styles/controls/combo.css";
import "../../styles/controls/picker.css";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    EFieldCommonProps &
      Pick<EFieldBoxProps, "size"> & {
        /** The visible label. */
        label: string;
        /** The earliest date that can be chosen or typed: a `Date` or a `YYYY-MM-DD` string. */
        min?: DateBound;
        /** The latest date that can be chosen or typed: a `Date` or a `YYYY-MM-DD` string. */
        max?: DateBound;
        /** Days that cannot be chosen, in the calendar or by typing, such as days with nothing to book. */
        disabledDate?: (date: Date) => boolean;
        /** Days that get a dot in the calendar: a list of dates or a function. */
        marked?: Date[] | ((date: Date) => boolean);
        /** Shows the calendar's Today and Clear buttons. */
        footer?: boolean;
        /** What `v-model` holds. `date` is a `Date` (a local day at noon). `iso` is a `YYYY-MM-DD` string, or `null` for no date, which has no time zone to shift. @default "date" */
        valueFormat?: F;
        /** Submits the date as `YYYY-MM-DD` with a form, through a hidden input. A disabled field is not submitted. */
        name?: string;
      }
  >(),
  { footer: true },
);

const emit = defineEmits<{
  /** The typed text is not a date that can be chosen. The field shows `message`, keeps the model as it was and posts nothing until the text is fixed. */
  invalid: [text: string, message: string];
}>();

/** The chosen date: a `Date`, or a `YYYY-MM-DD` string with `valueFormat="iso"`. `null` when empty. */
const model = defineModel<F extends "iso" ? string | null : Date | null>({ default: null as never });

/** Whether the calendar is open. Setting it moves no focus, and a disabled field never opens. */
const open = defineModel<boolean>("open", { default: false });

const t = useMessages();
const config = useConfig();
const dir = useDir();
const loc = useLocale();
const portal = usePortalTarget();
const control = useFieldControl(props);
const attrs = control.attrs;
const input = control.input;
const hidden = ref<HTMLInputElement | null>(null);
const minDate = computed(() => toBound(props.min));
const maxDate = computed(() => toBound(props.max));

const picker = useDatePopover(props, open, {
  returnFocus: () => input.value?.focus(),
  commit,
  onInvalid: (text, message) => emit("invalid", text, message),
});
const calendar = picker.calendar;

/** The chosen day, whichever form the model is in. */
const current = computed<Date | null>(() => {
  const v = model.value as Date | string | null;
  return typeof v === "string" ? parseIso(v) : v;
});
function write(d: Date | null) {
  model.value = (props.valueFormat === "iso" ? (d ? isoDate(d) : null) : d) as typeof model.value;
}

const text = ref(loc.formatDate(current.value));
const posted = computed(() => (picker.unusable.value ? "" : isoDate(current.value)));
/** Enter submits the form before Vue renders, so the posted value is written at once as well. */
function post(value: string) {
  if (hidden.value) hidden.value.value = value;
}

// A change from outside (the calendar, the parent) replaces whatever was typed, and so its error.
watch([() => current.value?.getTime(), () => config.locale], () => {
  text.value = loc.formatDate(current.value);
  picker.accept();
});

function set(d: Date | null) {
  write(d);
  text.value = loc.formatDate(d);
  picker.accept();
}

function commit() {
  if (props.readonly) return;
  const raw = text.value.trim();
  picker.accept();
  if (!raw) {
    if (current.value) write(null);
    post("");
    return;
  }
  const d = loc.parseDate(raw);
  const outOfRange =
    !!d &&
    ((minDate.value && compareDays(d, minDate.value) < 0) || (maxDate.value && compareDays(d, maxDate.value) > 0));
  if (!d || outOfRange || props.disabledDate?.(d)) {
    picker.reject(
      raw,
      !d
        ? t("dateError", { format: loc.dateFormatLabel() })
        : outOfRange
          ? boundsMessage(t, loc.formatDate, minDate.value, maxDate.value)
          : t("dateUnavailable"),
    );
    post("");
    return;
  }
  text.value = loc.formatDate(d);
  if (!sameDay(d, current.value)) write(d);
  post(isoDate(d));
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

function inputBind(field: FieldSlot) {
  return {
    class: "e-input e-combo-input",
    type: "text",
    autocomplete: "off",
    placeholder: loc.dateFormatLabel(),
    value: text.value,
    ...control.bind(field),
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
            <EInputShell v-bind="control.shell(picker.shownError.value)" class="e-combo">
              <input
                ref="input"
                v-bind="inputBind(field)"
                @input="
                  text = ($event.target as HTMLInputElement).value;
                  picker.typedError.value = '';
                "
                @blur="commit"
                @keydown="picker.onKey"
              />
              <input v-if="name" ref="hidden" type="hidden" v-bind="control.hidden(name, posted)" />
              <PopoverTrigger as-child v-bind="picker.trigger">
                <button
                  type="button"
                  class="e-input-btn e-interact e-interact--inset"
                  :aria-label="t('chooseDate')"
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
              :aria-label="t('chooseDate')"
              :dir="dir"
              side="bottom"
              align="start"
              v-bind="{ ...FIELD_POPPER, ...picker.popup }"
            >
              <ECalendar
                ref="calendar"
                :model-value="current"
                :min="minDate"
                :max="maxDate"
                :disabled-date="disabledDate"
                :marked="marked"
                :footer="footer"
                clearable
                @update:model-value="choose"
                @clear="clear"
              />
            </PopoverContent>
          </PopoverPortal>
        </PopoverRoot>
      </RekaConfig>
    </template>
  </EField>
</template>
