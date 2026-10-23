<script setup lang="ts" generic="F extends 'date' | 'iso' = 'date'">
import { computed, nextTick, ref, watch } from "vue";
import { ConfigProvider, PopoverAnchor, PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from "reka-ui";
import ECalendar from "../Calendar/ECalendar.vue";
import EField from "../Field/EField.vue";
import type { EFieldBoxProps, EFieldCommonProps } from "../Field/fieldProps.js";
import EIcon from "../Icon/EIcon.vue";
import { boundsMessage, compareDays, isoDate, parseIso, sameDay } from "../Calendar/dates.js";
import { useConfig, useMessages, usePortalTarget } from "../../config.js";
import { useDir } from "../../composables/useDir.js";
import { useFieldControl, type FieldSlot } from "../../composables/useFieldControl.js";
import { useQuietFocus } from "../../composables/useQuietFocus.js";
import { useLocale } from "../../composables/useLocale.js";
import "../../styles/base.css";
import "../TextField/input.css";
import "../Combobox/combo.css";
import "./picker.css";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    EFieldCommonProps &
      Pick<EFieldBoxProps, "size"> & {
        /** The visible label. */
        label: string;
        /** The earliest date that can be chosen or typed. */
        min?: Date;
        /** The latest date that can be chosen or typed. */
        max?: Date;
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

/** The chosen date: a `Date`, or a `YYYY-MM-DD` string with `valueFormat="iso"`. `null` when empty. */
const model = defineModel<F extends "iso" ? string | null : Date | null>({ default: null as never });

const t = useMessages();
const config = useConfig();
const dir = useDir();
const loc = useLocale();
const portal = usePortalTarget();
const control = useFieldControl(props);
const attrs = control.attrs;

const input = control.input;
const hidden = ref<HTMLInputElement | null>(null);
const calendar = ref<InstanceType<typeof ECalendar> | null>(null);
/** Whether the calendar is open. Setting it moves no focus, and a disabled field never opens. */
const open = defineModel<boolean>("open", { default: false });
const shown = computed(() => open.value && !props.disabled && !props.readonly);
const quiet = useQuietFocus(shown, (el) => !!el.closest(".e-calpanel, .e-combo"));
const trigger = { onClick: quiet.intent, onKeydown: quiet.intent };

/** The chosen day, whichever form the model is in. */
const current = computed<Date | null>(() => {
  const v = model.value as Date | string | null;
  return typeof v === "string" ? parseIso(v) : v;
});
function write(d: Date | null) {
  model.value = (props.valueFormat === "iso" ? (d ? isoDate(d) : null) : d) as typeof model.value;
}

const text = ref(loc.formatDate(current.value));
const typedError = ref("");
/** The typed text could not be used. The field then posts nothing rather than the date it had before. */
const unusable = ref(false);
const posted = computed(() => (unusable.value ? "" : isoDate(current.value)));
/** Enter submits the form before Vue renders, so the posted value is written at once as well. */
function post() {
  if (hidden.value) hidden.value.value = posted.value;
}
let clickedOutside = false;

// A change from outside (the calendar, the parent) replaces whatever was typed, and so its error.
watch([() => current.value?.getTime(), () => config.locale], () => {
  text.value = loc.formatDate(current.value);
  typedError.value = "";
  unusable.value = false;
});
watch(open, (isOpen) => {
  if (isOpen) clickedOutside = false;
});

const shownError = computed(() => props.error || typedError.value);

function set(d: Date | null) {
  write(d);
  text.value = loc.formatDate(d);
  typedError.value = "";
  unusable.value = false;
}

function commit() {
  if (props.readonly) return;
  const raw = text.value.trim();
  unusable.value = false;
  if (!raw) {
    typedError.value = "";
    if (current.value) write(null);
    if (hidden.value) hidden.value.value = "";
    return;
  }
  const d = loc.parseDate(raw);
  const outOfRange =
    !!d && ((props.min && compareDays(d, props.min) < 0) || (props.max && compareDays(d, props.max) > 0));
  if (!d || outOfRange || props.disabledDate?.(d)) {
    typedError.value = !d
      ? t("dateError", { format: loc.dateFormatLabel() })
      : outOfRange
        ? boundsMessage(t, loc.formatDate, props.min, props.max)
        : t("dateUnavailable");
    unusable.value = true;
    post();
    return;
  }
  typedError.value = "";
  text.value = loc.formatDate(d);
  if (!sameDay(d, current.value)) write(d);
  if (hidden.value) hidden.value.value = isoDate(d);
}

function onKey(e: KeyboardEvent) {
  if (e.key === "Enter") commit();
  else if (e.key === "ArrowDown" && e.altKey && !props.disabled && !props.readonly) {
    e.preventDefault();
    quiet.intent();
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
  if (!quiet.personOpened()) return;
  void nextTick(() => calendar.value?.focusDay());
}
function onCloseFocus(e: Event) {
  e.preventDefault();
  if (!quiet.returnsFocus()) return;
  if (!clickedOutside) input.value?.focus();
}
function onEscape(e: KeyboardEvent) {
  if (calendar.value && calendar.value.view !== "days") e.preventDefault();
}

function inputBind(field: FieldSlot) {
  return {
    id: field.id,
    class: "e-input e-combo-input",
    type: "text",
    autocomplete: "off",
    placeholder: loc.dateFormatLabel(),
    value: text.value,
    disabled: props.disabled,
    readonly: props.readonly,
    required: props.required,
    "aria-invalid": field.ariaInvalid,
    ...attrs.input(field.ariaDescribedby),
  };
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
    :error="shownError"
    :required="required"
    :optional="optional"
  >
    <template #default="field">
      <ConfigProvider :dir="dir">
        <PopoverRoot :open="shown" @update:open="open = $event">
          <PopoverAnchor as-child>
            <div
              class="e-input-wrap e-combo"
              :data-invalid="shownError ? '' : undefined"
              :data-disabled="disabled ? '' : undefined"
              :data-readonly="readonly ? '' : undefined"
              :data-size="size && size !== 'md' ? size : undefined"
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
              <input v-if="name" ref="hidden" type="hidden" v-bind="control.hidden(name, posted)" />
              <PopoverTrigger as-child v-bind="trigger">
                <button
                  type="button"
                  class="e-combo-btn"
                  :aria-label="t('chooseDate')"
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
              :aria-label="t('chooseDate')"
              :dir="dir"
              side="bottom"
              align="start"
              :side-offset="6"
              :collision-padding="8"
              @open-auto-focus="onOpenFocus"
              @close-auto-focus="onCloseFocus"
              @interact-outside="clickedOutside = true"
              @escape-key-down="onEscape"
            >
              <ECalendar
                ref="calendar"
                :model-value="current"
                :min="min"
                :max="max"
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
      </ConfigProvider>
    </template>
  </EField>
</template>
