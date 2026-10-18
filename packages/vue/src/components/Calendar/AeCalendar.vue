<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, ref, watch } from "vue";
import AeActions from "../Actions/AeActions.vue";
import AeButton from "../Button/AeButton.vue";
import AeIcon from "../Icon/AeIcon.vue";
import AeIconButton from "../IconButton/AeIconButton.vue";
import { useConfig, useMessages } from "../../config.js";
import { useLocale } from "../../composables/useLocale.js";
import { useUid } from "../../composables/useUid.js";
import { addDays, addMonths, compareDays, dayKey, sameDay, startOfDay } from "./dates.js";
import "../../styles/base.css";

export interface CalendarRange {
  start: Date | null;
  end: Date | null;
}

const props = withDefaults(
  defineProps<{
    /** `single` chooses one day (`v-model`); `range` chooses a span (`v-model:start` and `v-model:end`). */
    mode?: "single" | "range";
    /** Days that cannot be chosen or focused, such as days with nothing to book. */
    disabledDate?: (date: Date) => boolean;
    /** Days that get a dot: a list of dates or a function. Screen readers hear `markLabel`. */
    marked?: Date[] | ((date: Date) => boolean);
    /** What screen readers hear on a marked day. Default "times available". */
    markLabel?: string;
    /** The earliest day that can be chosen. */
    min?: Date;
    /** The latest day that can be chosen. */
    max?: Date;
    /** The month to open on, when nothing is chosen. */
    month?: Date;
    /** `false` hides the Today and Clear buttons. */
    footer?: boolean;
  }>(),
  { mode: "single", footer: true },
);

const emit = defineEmits<{
  /** In range mode, after every click that changes the span. */
  rangeChange: [range: CalendarRange];
  /** The Clear button. It is only shown when a `@clear` listener is attached. */
  clear: [];
}>();

/** The chosen day (single mode). */
const value = defineModel<Date | null>({ default: null });
/** The first day of the span (range mode). */
const start = defineModel<Date | null>("start", { default: null });
/** The last day of the span (range mode). */
const end = defineModel<Date | null>("end", { default: null });

type View = "days" | "months" | "years";

const t = useMessages();
const config = useConfig();
const loc = useLocale();
const uid = useUid();
const root = ref<HTMLElement | null>(null);
const range = computed(() => props.mode === "range");
const hasClear = () => !!getCurrentInstance()?.vnode.props?.onClear;

const today = startOfDay(new Date());
const focus = ref(startOfDay((range.value ? start.value : value.value) || props.month || new Date()));
const hover = ref<Date | null>(null);
const view = ref<View>("days");
const pick = ref(0);

const cy = computed(() => focus.value.getFullYear());
const cm = computed(() => focus.value.getMonth());
const yearLow = computed(() => Math.min(cy.value, props.min ? props.min.getFullYear() : today.getFullYear() - 120));
const yearHigh = computed(() => Math.max(cy.value, props.max ? props.max.getFullYear() : today.getFullYear() + 20));
const years = computed(() => Array.from({ length: yearHigh.value - yearLow.value + 1 }, (_, i) => yearLow.value + i));

function off(d: Date): boolean {
  return (
    (!!props.min && compareDays(d, props.min) < 0) ||
    (!!props.max && compareDays(d, props.max) > 0) ||
    !!props.disabledDate?.(d)
  );
}
function isMarked(d: Date): boolean {
  const m = props.marked;
  if (!m) return false;
  return typeof m === "function" ? !!m(d) : m.some((x) => sameDay(x, d));
}
function monthOff(y: number, m: number): boolean {
  return (
    (!!props.min && compareDays(new Date(y, m + 1, 0, 12), props.min) < 0) ||
    (!!props.max && compareDays(new Date(y, m, 1, 12), props.max) > 0)
  );
}
const yearOff = (y: number) =>
  (!!props.min && y < props.min.getFullYear()) || (!!props.max && y > props.max.getFullYear());
function clamp(d: Date): Date {
  if (props.min && compareDays(d, props.min) < 0) return startOfDay(props.min);
  if (props.max && compareDays(d, props.max) > 0) return startOfDay(props.max);
  return d;
}
/** The nearest day that can be chosen, walking `step` days at a time. `null` when there is none. */
function settle(d: Date, step: number): Date | null {
  let n = d;
  for (let i = 0; i < 400 && off(n); i++) n = addDays(n, step);
  return off(n) ? null : n;
}
function withMonthYear(y: number, m: number): Date {
  const last = new Date(y, m + 1, 0, 12).getDate();
  return clamp(new Date(y, m, Math.min(focus.value.getDate(), last), 12));
}

// A day that cannot be chosen is never the one the Tab key lands on.
if (off(focus.value)) focus.value = settle(focus.value, 1) ?? settle(focus.value, -1) ?? focus.value;

// Focus moves after the DOM has the element: remember the id, then focus it once rendered.
let want: string | null = null;
async function focusWanted() {
  await nextTick();
  if (!want) return;
  const el = root.value?.querySelector<HTMLElement>(`[id="${want}"]`);
  if (!el) return;
  el.focus();
  if (want.includes("-y-")) el.scrollIntoView?.({ block: "center" });
  want = null;
}
function focusId(id: string) {
  want = id;
  void focusWanted();
}
const dayId = (d: Date) => `${uid.value}-${dayKey(d)}`;

watch(
  () => props.month?.getTime(),
  () => {
    if (props.month) focus.value = clamp(startOfDay(props.month));
  },
);
watch(
  () => (range.value ? start.value : value.value)?.getTime(),
  () => {
    const chosen = range.value ? start.value : value.value;
    if (chosen && !sameDay(chosen, focus.value)) focus.value = startOfDay(chosen);
  },
);

const weeks = computed(() => {
  const first = new Date(cy.value, cm.value, 1, 12);
  const from = addDays(first, -((first.getDay() - loc.weekStart.value + 7) % 7));
  return Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, i) => addDays(from, w * 7 + i)));
});
const columns = computed(() => Array.from({ length: 7 }, (_, k) => (loc.weekStart.value + k) % 7));
const rangeEnd = computed(() => {
  if (!range.value) return null;
  return end.value || (start.value && hover.value && compareDays(hover.value, start.value) >= 0 ? hover.value : null);
});

function isSelected(d: Date): boolean {
  return range.value ? sameDay(d, start.value) || sameDay(d, end.value) : sameDay(d, value.value);
}
function inRange(d: Date): boolean {
  return !!(
    range.value &&
    start.value &&
    rangeEnd.value &&
    compareDays(d, start.value) > 0 &&
    compareDays(d, rangeEnd.value) < 0
  );
}
function dayLabel(d: Date, marked: boolean): string {
  return (
    loc.formatLong(d) +
    (sameDay(d, today) ? ", " + t("todaySuffix") : "") +
    (marked ? ", " + (props.markLabel || t("timesAvailable")) : "")
  );
}

function pickDay(d: Date) {
  if (off(d)) return;
  if (!range.value) {
    value.value = d;
    return;
  }
  const s = start.value;
  if (!s || end.value || compareDays(d, s) < 0) {
    start.value = d;
    end.value = null;
    emit("rangeChange", { start: d, end: null });
  } else {
    end.value = d;
    emit("rangeChange", { start: s, end: d });
  }
}
function clickDay(d: Date) {
  focus.value = d;
  focusId(dayId(d));
  pickDay(d);
}

function openView(v: "months" | "years") {
  view.value = v;
  if (v === "months") {
    pick.value = cm.value;
    focusId(`${uid.value}-m-${cm.value}`);
  } else {
    pick.value = cy.value;
    focusId(`${uid.value}-y-${cy.value}`);
  }
}
function backToDays() {
  view.value = "days";
  focusId(dayId(focus.value));
}
/** One button opens the years, a year opens its months, a month opens its days. Back goes up one step. */
function back() {
  if (view.value === "months") openView("years");
  else backToDays();
}
function chooseMonth(m: number) {
  if (monthOff(cy.value, m)) return;
  const nd = withMonthYear(cy.value, m);
  focus.value = nd;
  view.value = "days";
  focusId(dayId(nd));
}
function chooseYear(y: number) {
  if (yearOff(y)) return;
  const nd = withMonthYear(y, cm.value);
  focus.value = nd;
  view.value = "months";
  pick.value = nd.getMonth();
  focusId(`${uid.value}-m-${nd.getMonth()}`);
}
function step(n: number) {
  focus.value = clamp(addMonths(focus.value, n));
}

/** -1 when the grid runs right to left, so ArrowRight still means "to the right". */
function sign(): number {
  if (config.dir) return config.dir === "rtl" ? -1 : 1;
  return root.value && getComputedStyle(root.value).direction === "rtl" ? -1 : 1;
}

function onDayKey(e: KeyboardEvent) {
  const f = focus.value;
  const dow = (f.getDay() - loc.weekStart.value + 7) % 7;
  const s = sign();
  let next: Date;
  let walk: number;
  switch (e.key) {
    case "ArrowLeft":
      walk = -s;
      next = addDays(f, walk);
      break;
    case "ArrowRight":
      walk = s;
      next = addDays(f, walk);
      break;
    case "ArrowUp":
      walk = -7;
      next = addDays(f, walk);
      break;
    case "ArrowDown":
      walk = 7;
      next = addDays(f, walk);
      break;
    case "Home":
      walk = 1;
      next = addDays(f, -dow);
      break;
    case "End":
      walk = -1;
      next = addDays(f, 6 - dow);
      break;
    case "PageUp":
      walk = -1;
      next = addMonths(f, e.shiftKey ? -12 : -1);
      break;
    case "PageDown":
      walk = 1;
      next = addMonths(f, e.shiftKey ? 12 : 1);
      break;
    default:
      return;
  }
  e.preventDefault();
  const target = settle(next, walk);
  if (!target) return;
  focus.value = target;
  focusId(dayId(target));
  if (range.value && start.value && !end.value) hover.value = target;
}

function onPickKey(e: KeyboardEvent) {
  const months = view.value === "months";
  const lo = months ? 0 : yearLow.value;
  const hi = months ? 11 : yearHigh.value;
  const s = sign();
  let next: number | null = null;
  switch (e.key) {
    case "ArrowLeft":
      next = pick.value - s;
      break;
    case "ArrowRight":
      next = pick.value + s;
      break;
    case "ArrowUp":
      next = pick.value - 3;
      break;
    case "ArrowDown":
      next = pick.value + 3;
      break;
    case "Home":
      next = lo;
      break;
    case "End":
      next = hi;
      break;
    case "PageUp":
      if (!months) next = pick.value - 12;
      break;
    case "PageDown":
      if (!months) next = pick.value + 12;
      break;
  }
  if (next === null) return;
  e.preventDefault();
  next = Math.max(lo, Math.min(hi, next));
  pick.value = next;
  focusId(`${uid.value}-${months ? "m" : "y"}-${next}`);
}

/** Escape goes up one level; from the days it is left to whoever holds the calendar (a popup closes). */
function onRootKey(e: KeyboardEvent) {
  if (e.key !== "Escape" || view.value === "days") return;
  e.preventDefault();
  e.stopPropagation();
  backToDays();
}

function goToday() {
  const tc = clamp(today);
  focus.value = tc;
  focusId(dayId(tc));
  if (!range.value && !off(today)) pickDay(today);
}

const shortDate = (d: Date) => `${loc.monthsShort.value[d.getMonth()]} ${d.getDate()}`;
const help = computed(() => {
  if (!range.value || view.value !== "days") return "";
  if (!start.value) return t("rangeStart");
  if (!end.value) return t("rangeEnd", { start: shortDate(start.value) });
  return t("rangeDone", {
    start: shortDate(start.value),
    end: shortDate(end.value),
    days: Math.round(compareDays(end.value, start.value) / 864e5) + 1,
  });
});

const picking = computed(() => view.value !== "days");
const prevOff = computed(() => !!props.min && compareDays(new Date(cy.value, cm.value, 0, 12), props.min) < 0);
const nextOff = computed(() => !!props.max && compareDays(new Date(cy.value, cm.value + 1, 1, 12), props.max) > 0);
const nowYear = today.getFullYear();
const nowMonth = today.getMonth();

defineExpose({
  /** Which step is showing: the days, the months of a year, or the years. */
  view,
  /** Focuses the day the keyboard is on. */
  focusDay: () => focusId(dayId(focus.value)),
});
</script>

<template>
  <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
  <div ref="root" class="ae-cal" :dir="config.dir ?? undefined" @keydown="onRootKey">
    <div class="ae-cal-head">
      <AeIconButton
        v-if="picking"
        icon="chevron-left"
        :label="t(view === 'months' ? 'backToYears' : 'backToDays')"
        @click="back"
      />
      <AeIconButton v-else icon="chevron-left" :label="t('prevMonth')" :disabled="prevOff" @click="step(-1)" />
      <div class="ae-cal-title" aria-live="polite">
        <span v-if="picking" class="ae-cal-range">{{
          t(view === "months" ? "chooseAMonth" : "chooseAYear", { year: cy })
        }}</span>
        <button
          v-else
          type="button"
          class="ae-cal-pick"
          aria-expanded="false"
          :aria-label="t('chooseDateNow', { month: loc.months.value[cm] ?? '', year: cy })"
          @click="openView('years')"
        >
          {{ loc.months.value[cm] }} {{ cy }}
          <AeIcon name="chevron-down" small />
        </button>
      </div>
      <span v-if="picking" class="ae-cal-gap" />
      <AeIconButton v-else icon="chevron-right" :label="t('nextMonth')" :disabled="nextOff" @click="step(1)" />
    </div>

    <!-- eslint-disable-next-line vuejs-accessibility/interactive-supports-focus -- the day buttons carry the roving tabindex -->
    <table
      v-if="view === 'days'"
      class="ae-cal-grid"
      role="grid"
      :aria-label="`${loc.months.value[cm]} ${cy}`"
      @keydown="onDayKey"
    >
      <thead>
        <tr>
          <th v-for="ix in columns" :key="ix" scope="col" :abbr="loc.weekdays.value[ix]">
            {{ loc.weekdaysShort.value[ix] }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, w) in weeks" :key="w">
          <td
            v-for="d in row"
            :key="dayKey(d)"
            role="gridcell"
            :aria-selected="isSelected(d) || inRange(d) ? 'true' : 'false'"
            :class="inRange(d) && 'ae-cal-in'"
          >
            <button
              :id="dayId(d)"
              type="button"
              class="ae-day"
              :class="[
                d.getMonth() !== cm && 'ae-day--out',
                sameDay(d, today) && 'ae-day--today',
                isSelected(d) && 'ae-day--sel',
                !off(d) && isMarked(d) && 'ae-day--mark',
              ]"
              :tabindex="sameDay(d, focus) ? 0 : -1"
              :disabled="off(d)"
              :aria-label="dayLabel(d, !off(d) && isMarked(d))"
              @click="clickDay(d)"
              @mouseenter="range && start && !end && (hover = d)"
              @focus="range && start && !end && (hover = d)"
            >
              {{ d.getDate() }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
    <div
      v-else-if="view === 'months'"
      class="ae-cal-cells"
      role="group"
      :aria-label="t('monthsOf', { year: cy })"
      @keydown="onPickKey"
    >
      <button
        v-for="(name, m) in loc.months.value"
        :id="`${uid}-m-${m}`"
        :key="m"
        type="button"
        class="ae-cal-cell"
        :class="[m === cm && 'ae-day--sel', cy === nowYear && m === nowMonth && 'ae-day--today']"
        :tabindex="m === pick ? 0 : -1"
        :disabled="monthOff(cy, m)"
        :aria-pressed="m === cm ? 'true' : 'false'"
        :aria-current="cy === nowYear && m === nowMonth ? 'date' : undefined"
        @click="chooseMonth(m)"
      >
        <span aria-hidden="true">{{ loc.monthsShort.value[m] }}</span>
        <span class="ae-sr">{{ name }} {{ cy }}</span>
      </button>
    </div>

    <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
    <div
      v-else
      class="ae-cal-cells ae-cal-years"
      role="group"
      :aria-label="t('yearsRange', { from: yearLow, to: yearHigh })"
      @keydown="onPickKey"
    >
      <button
        v-for="y in years"
        :id="`${uid}-y-${y}`"
        :key="y"
        type="button"
        class="ae-cal-cell"
        :class="[y === cy && 'ae-day--sel', y === nowYear && 'ae-day--today']"
        :tabindex="y === pick ? 0 : -1"
        :disabled="yearOff(y)"
        :aria-pressed="y === cy ? 'true' : 'false'"
        :aria-current="y === nowYear ? 'date' : undefined"
        @click="chooseYear(y)"
      >
        {{ y }}
      </button>
    </div>

    <p v-if="help" class="ae-cal-help" aria-live="polite">{{ help }}</p>

    <AeActions v-if="footer && view === 'days'" class="ae-cal-foot">
      <AeButton variant="quiet" @click="goToday">{{ t("today") }}</AeButton>
      <AeButton v-if="hasClear()" variant="quiet" @click="emit('clear')">{{ t("clear") }}</AeButton>
    </AeActions>
  </div>
</template>

<style>
@layer ae.composites {
  .ae-cal {
    width: 20.5rem;
    max-width: 100%;
    font-family: var(--ae-font-sans);
  }

  .ae-cal-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ae-space-2);
    margin-bottom: var(--ae-space-2);
    padding-bottom: var(--ae-space-2);
    border-bottom: var(--ae-stroke-hair) solid var(--ae-border);
  }

  .ae-cal-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--ae-space-1);
    flex: 1;
    min-width: 0;
    margin: 0;
    font: 600 var(--ae-text-lg) / 1.2 var(--ae-font-sans);
    text-align: center;
  }

  .ae-cal-pick {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: var(--ae-control-height);
    padding: 0 var(--ae-space-2);
    border: var(--ae-stroke-edge) solid transparent;
    border-radius: var(--ae-radius-md);
    background: transparent;
    color: var(--ae-ink);
    font: 600 var(--ae-text-lg) / 1 var(--ae-font-sans);
    cursor: pointer;
    transition: background-color var(--ae-duration-tap) var(--ae-easing-out);
  }

  .ae-cal-pick:hover {
    background: var(--ae-surface-tint);
    border-color: var(--ae-border-strong);
  }

  .ae-cal-pick:focus-visible {
    outline: var(--ae-stroke-focus) solid var(--ae-focus-ring);
    outline-offset: 1px;
  }

  .ae-cal-pick .ae-icon {
    transition: transform var(--ae-duration-tap) var(--ae-easing-out);
  }

  .ae-cal-pick[aria-expanded="true"] .ae-icon {
    transform: rotate(180deg);
  }

  .ae-cal-range {
    font: 600 var(--ae-text-lg) / 1.2 var(--ae-font-sans);
    font-variant-numeric: tabular-nums;
  }

  .ae-cal-gap {
    display: block;
    width: 44px;
    height: 44px;
  }

  .ae-cal-head .ae-icon-btn:disabled {
    color: var(--ae-muted);
    cursor: not-allowed;
  }

  .ae-cal-head .ae-icon-btn:disabled:hover {
    background: transparent;
    box-shadow: none;
  }

  .ae-cal-grid {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .ae-cal-grid th {
    height: 32px;
    font: 600 var(--ae-text-sm) / 1 var(--ae-font-sans);
    color: var(--ae-muted);
    text-align: center;
  }

  .ae-cal-grid td {
    padding: 1px 0;
    text-align: center;
  }

  .ae-cal-in {
    background: var(--ae-surface-tint);
  }

  .ae-day {
    position: relative;
    width: 100%;
    height: 44px;
    padding: 0;
    border: var(--ae-stroke-edge) solid transparent;
    border-radius: var(--ae-radius-md);
    background: transparent;
    color: var(--ae-ink);
    font: 500 var(--ae-text-sm) / 1 var(--ae-font-mono);
    font-variant-numeric: tabular-nums;
    cursor: pointer;
    transition: background-color var(--ae-duration-tap) var(--ae-easing-out);
  }

  /* stylelint-disable-next-line selector-not-notation -- the reference selector, kept for parity */
  .ae-day:hover:not(:disabled):not(.ae-day--sel) {
    background: var(--ae-surface-tint);
    border-color: var(--ae-border-strong);
  }

  .ae-day:focus-visible {
    outline: var(--ae-stroke-focus) solid var(--ae-focus-ring);
    outline-offset: -2px;
  }

  .ae-day--out {
    color: var(--ae-muted);
    font-weight: 400;
  }

  .ae-day--today {
    box-shadow: inset 0 0 0 1.5px var(--ae-ink);
  }

  .ae-day--sel {
    background: var(--ae-primary);
    border-color: var(--ae-primary);
    font-weight: 700;
    color: var(--ae-on-primary);
  }

  .ae-day:disabled {
    color: var(--ae-border-strong);
    font-weight: 400;
    cursor: not-allowed;
    opacity: 1;
  }

  .ae-day--mark::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: 5px;
    width: 5px;
    height: 5px;
    margin-inline-start: -2.5px;
    border-radius: 50%;
    background: var(--ae-primary);
  }

  .ae-day--sel.ae-day--mark::after {
    background: var(--ae-on-primary);
  }

  .ae-cal-cells {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 1fr;
    gap: 6px;
    min-height: 312px;
    padding-top: 4px;
  }

  .ae-cal-years {
    max-height: 312px;
    overflow-y: auto;
    grid-auto-rows: 44px;
    padding-inline-end: 2px;
    align-content: start;
  }

  .ae-cal-cell {
    width: 100%;
    height: 100%;
    min-height: 44px;
    padding: 0;
    border: var(--ae-stroke-edge) solid transparent;
    border-radius: var(--ae-radius-md);
    background: transparent;
    color: var(--ae-ink);
    font: 500 var(--ae-text-md) / 1 var(--ae-font-mono);
    font-variant-numeric: tabular-nums;
    cursor: pointer;
    transition: background-color var(--ae-duration-tap) var(--ae-easing-out);
  }

  .ae-cal-years .ae-cal-cell {
    height: 44px;
  }

  /* stylelint-disable-next-line selector-not-notation -- the reference selector, kept for parity */
  .ae-cal-cell:hover:not(:disabled):not(.ae-day--sel) {
    background: var(--ae-surface-tint);
    border-color: var(--ae-border-strong);
  }

  .ae-cal-cell:focus-visible {
    outline: var(--ae-stroke-focus) solid var(--ae-focus-ring);
    outline-offset: -2px;
  }

  .ae-cal-cell:disabled {
    color: var(--ae-border-strong);
    font-weight: 400;
    cursor: not-allowed;
  }

  .ae-cal-cell.ae-day--sel {
    background: var(--ae-primary);
    border-color: var(--ae-primary);
    font-weight: 700;
    color: var(--ae-on-primary);
  }

  .ae-cal-help {
    margin: var(--ae-space-2) 0 0;
    font: 500 var(--ae-text-sm) / 1.4 var(--ae-font-sans);
    color: var(--ae-muted);
    text-align: center;
  }

  .ae-cal-foot {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: var(--ae-space-2);
    margin-top: var(--ae-space-2);
    padding-top: var(--ae-space-2);
    border-top: var(--ae-stroke-hair) solid var(--ae-border);
  }

  @media (prefers-reduced-motion: reduce) {
    .ae-day,
    .ae-cal-pick,
    .ae-cal-cell,
    .ae-cal-pick .ae-icon {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    .ae-day--sel,
    .ae-cal-cell.ae-day--sel {
      forced-color-adjust: none;
      background: Highlight;
      color: HighlightText;
    }

    .ae-day--mark::after {
      background: CanvasText;
    }

    .ae-day--sel.ae-day--mark::after {
      background: HighlightText;
    }
  }
}
</style>
