<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { PopoverAnchor, PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from "reka-ui";
import EButton from "../Button/EButton.vue";
import ECalendar from "../Calendar/ECalendar.vue";
import type { CalendarRange } from "../Calendar/ECalendar.vue";
import EField from "../Field/EField.vue";
import EIcon from "../Icon/EIcon.vue";
import { addDays, compareDays, isoDate, startOfDay } from "../Calendar/dates.js";
import { useConfig, useMessages, usePortalTarget } from "../../config.js";
import { useFieldAttrs } from "../../composables/useFieldAttrs.js";
import { useQuietFocus } from "../Select/quietFocus.js";
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
  /** The visible label, a mono kicker above the field. */
  label: string;
  /** Keep the label for screen readers and remove it from the page. */
  hideLabel?: boolean;
  /** Help that stays under the field. */
  hint?: string;
  /** What to fix. Replaces the hint and marks both boxes invalid. A typed span that cannot be used shows its own error. */
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
  /** Submits the first date as `YYYY-MM-DD` with a form. */
  startName?: string;
  /** Submits the last date as `YYYY-MM-DD` with a form. */
  endName?: string;
  /** Buttons under the calendar that choose a span at once. Default: Last 7 days, Last 30 days, This month. */
  presets?: RangePreset[];
  /** The id of the start box; the label points at it. Generated when left out. */
  id?: string;
}>();

const start = defineModel<Date | null>("start", { default: null });
const end = defineModel<Date | null>("end", { default: null });

const t = useMessages();
const config = useConfig();
const loc = useLocale();
const portal = usePortalTarget();
const attrs = useFieldAttrs();

const open = defineModel<boolean>("open", { default: false });
const shown = computed(() => open.value && !props.disabled);
const quiet = useQuietFocus(shown, (el) => !!el.closest(".e-calpanel, .e-combo"));
const trigger = { onClick: quiet.intent, onKeydown: quiet.intent };

const startText = ref(loc.formatDate(start.value));
const endText = ref(loc.formatDate(end.value));
const typedError = ref("");
const draft = ref<CalendarRange>({ start: start.value, end: end.value });
const calendar = ref<InstanceType<typeof ECalendar> | null>(null);
const startInput = ref<HTMLInputElement | null>(null);

watch([() => start.value?.getTime(), () => end.value?.getTime(), () => config.locale], () => {
  startText.value = loc.formatDate(start.value);
  endText.value = loc.formatDate(end.value);
});
watch(open, (isOpen) => {
  if (isOpen) draft.value = { start: start.value, end: end.value };
});

const shownError = computed(() => props.error || typedError.value);

const presets = computed<RangePreset[]>(() => {
  if (props.presets) return props.presets;
  const today = startOfDay(new Date());
  return [
    { label: t("last7"), get: () => ({ start: addDays(today, -6), end: today }) },
    { label: t("last30"), get: () => ({ start: addDays(today, -29), end: today }) },
    {
      label: t("thisMonth"),
      get: () => ({ start: new Date(today.getFullYear(), today.getMonth(), 1, 12), end: today }),
    },
  ];
});

function setRange(r: { start: Date | null; end: Date | null }) {
  start.value = r.start;
  end.value = r.end;
  startText.value = loc.formatDate(r.start);
  endText.value = loc.formatDate(r.end);
  typedError.value = "";
}

const outOfBounds = (d: Date) =>
  (!!props.min && compareDays(d, props.min) < 0) || (!!props.max && compareDays(d, props.max) > 0);

function commitText() {
  const a = startText.value.trim() ? loc.parseDate(startText.value) : null;
  const b = endText.value.trim() ? loc.parseDate(endText.value) : null;
  if ((startText.value.trim() && !a) || (endText.value.trim() && !b)) {
    typedError.value = t("datesError", { format: loc.dateFormatLabel() });
    return;
  }
  const bad = [a, b].find((d) => d && outOfBounds(d));
  if (bad) {
    typedError.value = t("dateBetween", {
      min: loc.formatDate(props.min || bad),
      max: loc.formatDate(props.max || bad),
    });
    return;
  }
  if (a && b && compareDays(b, a) < 0) {
    typedError.value = t("endBeforeStart");
    return;
  }
  setRange({ start: a, end: b });
}

function onRange(r: CalendarRange) {
  draft.value = r;
  if (r.start && r.end) {
    setRange(r);
    open.value = false;
  }
}
function applyPreset(p: RangePreset) {
  setRange(p.get());
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
  else if (e.key === "ArrowDown" && e.altKey && !props.disabled) {
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
      <PopoverRoot :open="shown" @update:open="open = $event">
        <PopoverAnchor as-child>
          <div
            v-bind="attrs.input()"
            class="e-input-wrap e-combo e-rangefield"
            role="group"
            :aria-labelledby="`${field.id}-label`"
            :data-invalid="shownError ? '' : undefined"
            :data-disabled="disabled ? '' : undefined"
          >
            <input
              :id="field.id"
              ref="startInput"
              v-model="startText"
              class="e-input e-combo-input"
              type="text"
              inputmode="numeric"
              autocomplete="off"
              :placeholder="t('startDate')"
              :aria-label="t('startDate')"
              :disabled="disabled"
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
              inputmode="numeric"
              autocomplete="off"
              :placeholder="t('endDate')"
              :aria-label="t('endDate')"
              :disabled="disabled"
              :required="required"
              :aria-invalid="field.ariaInvalid"
              :aria-describedby="field.ariaDescribedby"
              @input="typedError = ''"
              @blur="commitText"
              @keydown="onKey"
            />
            <input v-if="startName" type="hidden" :name="startName" :value="isoDate(start)" />
            <input v-if="endName" type="hidden" :name="endName" :value="isoDate(end)" />
            <PopoverTrigger as-child v-bind="trigger">
              <button type="button" class="e-combo-btn" :aria-label="t('chooseDates')" :disabled="disabled">
                <EIcon name="calendar" />
              </button>
            </PopoverTrigger>
          </div>
        </PopoverAnchor>
        <PopoverPortal :to="portal">
          <PopoverContent
            class="e-calpanel e-root"
            :aria-label="t('chooseDates')"
            :dir="config.dir ?? undefined"
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
              :footer="false"
              @range-change="onRange"
            />
            <div class="e-cal-presets">
              <EButton v-for="p in presets" :key="p.label" variant="outline" @click="applyPreset(p)">
                {{ p.label }}
              </EButton>
            </div>
          </PopoverContent>
        </PopoverPortal>
      </PopoverRoot>
    </template>
  </EField>
</template>

<style>
@layer e.composites {
  .e-cal-presets {
    display: flex;
    flex-wrap: wrap;
    gap: var(--e-space-2);
    margin-top: var(--e-space-3);
    padding-top: var(--e-space-3);
    border-top: var(--e-stroke-hair) solid var(--e-border);
  }

  .e-rangefield .e-input {
    flex: 1 1 5rem;
  }

  .e-range-sep {
    flex: none;
    font: 500 var(--e-text-sm) / 1 var(--e-font-sans);
    color: var(--e-muted);
  }
}
</style>
