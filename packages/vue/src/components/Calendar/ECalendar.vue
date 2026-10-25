<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import EActions from "../Actions/EActions.vue";
import EButton from "../Button/EButton.vue";
import EIcon from "../Icon/EIcon.vue";
import EIconButton from "../IconButton/EIconButton.vue";
import { useMessages } from "../../config.js";
import { useDir } from "../../composables/useDir.js";
import { useLocale } from "../../composables/useLocale.js";
import { useUid } from "../../composables/useUid.js";
import {
  addDays,
  addMonths,
  compareDays,
  dayKey,
  formatMonthDay,
  formatMonthYear,
  sameDay,
  startOfDay,
} from "./dates.js";
import "../../styles/base.css";

export interface CalendarRange {
  start: Date | null;
  end: Date | null;
}

const props = withDefaults(
  defineProps<{
    /** `single` chooses one day (`v-model`). `range` chooses a span (`v-model:start` and `v-model:end`): the first click sets the start, the second the end, and a click before the start restarts. */
    mode?: "single" | "range";
    /** Days that cannot be chosen or focused, such as days with nothing to book. Arrow keys skip them. */
    disabledDate?: (date: Date) => boolean;
    /** Days that get a dot: a list of dates or a function. Screen readers hear `markLabel`. */
    marked?: Date[] | ((date: Date) => boolean);
    /** What screen readers hear on a marked day. @default "times available" */
    markLabel?: string;
    /** The earliest day that can be chosen. Earlier days cannot be focused or chosen, and navigation stops there. */
    min?: Date;
    /** The latest day that can be chosen. Later days cannot be focused or chosen, and navigation stops there. */
    max?: Date;
    /** The month to open on, when nothing is chosen. Changing it moves the view. */
    month?: Date;
    /** Shows the Today button and, with `clearable`, the Clear button. `false` hides both. */
    footer?: boolean;
    /** Shows the Clear button in the footer. It emits `clear`. */
    clearable?: boolean;
  }>(),
  { mode: "single", footer: true, clearable: false },
);

const emit = defineEmits<{
  /** In range mode, after every click that changes the span. */
  rangeChange: [range: CalendarRange];
  /** The Clear button was pressed. */
  clear: [];
  /** The visible month changed (arrows, keys, the month and year pickers, or the `month` prop). The payload is the first day of that month: load `marked` or `disabledDate` data for it here. */
  "update:month": [month: Date];
}>();

/** The chosen day (`single` mode). */
const value = defineModel<Date | null>({ default: null });
/** The first day of the span (`range` mode). */
const start = defineModel<Date | null>("start", { default: null });
/** The last day of the span (`range` mode). */
const end = defineModel<Date | null>("end", { default: null });

type View = "days" | "months" | "years";

const t = useMessages();
const dir = useDir();
const loc = useLocale();
const uid = useUid();
const root = ref<HTMLElement | null>(null);
const range = computed(() => props.mode === "range");

// Set again on mount (a server render may be a day off) and at midnight, so "today" never goes stale.
const today = ref(startOfDay(new Date()));
let midnight: ReturnType<typeof setTimeout> | undefined;
function refreshToday() {
  today.value = startOfDay(new Date());
  const next = new Date();
  next.setHours(24, 0, 5, 0);
  midnight = setTimeout(refreshToday, Math.max(1000, next.getTime() - Date.now()));
}
onMounted(() => {
  clearTimeout(midnight);
  refreshToday();
});
onBeforeUnmount(() => clearTimeout(midnight));

const focus = ref(startOfDay((range.value ? start.value : value.value) || props.month || new Date()));
const hover = ref<Date | null>(null);
const view = ref<View>("days");
const pick = ref(0);

const cy = computed(() => focus.value.getFullYear());
const cm = computed(() => focus.value.getMonth());
const yearLow = computed(() =>
  Math.min(cy.value, props.min ? props.min.getFullYear() : today.value.getFullYear() - 120),
);
const yearHigh = computed(() =>
  Math.max(cy.value, props.max ? props.max.getFullYear() : today.value.getFullYear() + 20),
);
const years = computed(() => Array.from({ length: yearHigh.value - yearLow.value + 1 }, (_, i) => yearLow.value + i));

function off(d: Date): boolean {
  return (
    (!!props.min && compareDays(d, props.min) < 0) ||
    (!!props.max && compareDays(d, props.max) > 0) ||
    !!props.disabledDate?.(d)
  );
}
/** The marked days of a list, by key, so a month of cells costs one pass instead of one scan each. */
const markedKeys = computed(() => {
  const m = props.marked;
  return Array.isArray(m) ? new Set(m.map((x) => dayKey(x))) : null;
});
function isMarked(d: Date): boolean {
  const m = props.marked;
  if (!m) return false;
  return typeof m === "function" ? !!m(d) : !!markedKeys.value?.has(dayKey(d));
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
function settle(d: Date, step: number): Date | null {
  let n = d;
  for (let i = 0; i < 400 && off(n); i++) n = addDays(n, step);
  return off(n) ? null : n;
}
/** The nearest enabled day at or after `d`, else before it, within `d`'s month. `d` itself when the month has none. */
function enabledNear(d: Date, dir = 1): Date {
  const sameMonth = (x: Date | null): x is Date =>
    !!x && x.getMonth() === d.getMonth() && x.getFullYear() === d.getFullYear();
  const forward = settle(d, dir);
  if (sameMonth(forward)) return forward;
  const backward = settle(d, -dir);
  return sameMonth(backward) ? backward : d;
}
function withMonthYear(y: number, m: number): Date {
  const last = new Date(y, m + 1, 0, 12).getDate();
  return enabledNear(clamp(new Date(y, m, Math.min(focus.value.getDate(), last), 12)));
}

if (off(focus.value)) {
  const near = enabledNear(focus.value);
  focus.value = !off(near) ? near : (settle(near, 1) ?? settle(near, -1) ?? near);
}

let want: string | null = null;
async function focusWanted() {
  // The target may render a tick later (the year list after the view changes), so look twice, then give up.
  for (let tries = 0; tries < 2 && want; tries++) {
    await nextTick();
    const id = want;
    const el = id ? root.value?.querySelector<HTMLElement>(`[id="${id}"]`) : null;
    if (!el || !id) continue;
    el.focus();
    if (id.includes("-y-")) el.scrollIntoView?.({ block: "center" });
    break;
  }
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
    if (!props.month) return;
    const next = clamp(startOfDay(props.month));
    // A parent that echoes `update:month` back would otherwise reset the focused day to the 1st.
    if (next.getFullYear() === cy.value && next.getMonth() === cm.value) return;
    focus.value = enabledNear(next);
  },
);
// The roving tab stop must never sit on a disabled day, whatever moved it or changed the rules.
watch([() => props.min?.getTime(), () => props.max?.getTime(), () => props.disabledDate], () => {
  if (off(focus.value)) focus.value = enabledNear(clamp(focus.value));
});
watch(
  () => cy.value * 12 + cm.value,
  () => emit("update:month", new Date(cy.value, cm.value, 1, 12)),
);
watch(
  () => (range.value ? start.value : value.value)?.getTime(),
  () => {
    const chosen = range.value ? start.value : value.value;
    if (chosen && !sameDay(chosen, focus.value)) focus.value = startOfDay(chosen);
  },
);

interface Cell {
  d: Date;
  key: string;
  off: boolean;
  marked: boolean;
}
// Disabled and marked are worked out once per visible day, not once per render of each cell.
const weeks = computed<Cell[][]>(() => {
  const first = new Date(cy.value, cm.value, 1, 12);
  const from = addDays(first, -((first.getDay() - loc.weekStart.value + 7) % 7));
  return Array.from({ length: 6 }, (_, w) =>
    Array.from({ length: 7 }, (_, i) => {
      const d = addDays(from, w * 7 + i);
      const disabled = off(d);
      return { d, key: dayKey(d), off: disabled, marked: !disabled && isMarked(d) };
    }),
  );
});
const monthName = (y: number, m: number) =>
  formatMonthYear(loc.locale.value, new Date(y, m, 1, 12), `${loc.months.value[m]} ${y}`);
const monthTitle = computed(() => monthName(cy.value, cm.value));
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
/** Which end of a span of more than one day this is, so the end meets the band flush: `from` the first day, `to` the last (or the day hovered as the last). */
function spanEnd(d: Date): "from" | "to" | null {
  if (!range.value || !start.value || !rangeEnd.value || compareDays(rangeEnd.value, start.value) <= 0) return null;
  if (sameDay(d, start.value)) return "from";
  return sameDay(d, rangeEnd.value) ? "to" : null;
}
/** A day that is lit: in the span (its ends included) in range mode, the chosen day in single mode. */
function lit(x: Date): boolean {
  if (!range.value) return sameDay(x, value.value);
  if (!start.value) return false;
  if (!rangeEnd.value) return sameDay(x, start.value);
  return compareDays(x, start.value) >= 0 && compareDays(x, rangeEnd.value) <= 0;
}
/**
 * How a day meets its neighbours in the grid (the day before or after in its row, the same weekday a row above or
 * below), as classes on its cell. Neighbours that join it are lit days and today; off the grid nothing joins.
 * - The band (`e-cal-in`): the days inside the span, and the day hovered as its end while choosing. Each rounds the
 *   band's outer corners where neither neighbour beside the corner joins it (`e-cal-round-*`).
 * - A filled end of the span runs the band under the half that faces the rest of it (`e-cal-band-*`, with `e-cal-end`).
 * - A chosen day, today and the hovered end square the corners of their button toward a joining neighbour
 *   (`e-cal-flat-*`), so a face, today's ring and the hover meet the band and each other flush.
 */
function joins(d: Date, col: number, row: number): string[] {
  const chosen = isSelected(d);
  const now = sameDay(d, today.value);
  const hovered = !chosen && spanEnd(d) === "to";
  const band = inRange(d) || hovered;
  const end = chosen && !!spanEnd(d);
  const last = weeks.value.length - 1;
  const sides = [
    ["s", -1, col > 0],
    ["e", 1, col < 6],
    ["t", -7, row > 0],
    ["b", 7, row < last],
  ] as const;
  const out: string[] = band ? ["e-cal-in"] : [];
  const joined: Record<string, boolean> = {};
  for (const [side, n, onGrid] of sides) {
    const x = onGrid ? addDays(d, n) : null;
    const isLit = !!x && lit(x);
    joined[side] = isLit || (!!x && sameDay(x, today.value));
    if (end && isLit) out.push(`e-cal-band-${side}`);
    if ((chosen || now || hovered) && joined[side]) out.push(`e-cal-flat-${side}`);
  }
  if (band) {
    if (!joined.t && !joined.s) out.push("e-cal-round-ts");
    if (!joined.t && !joined.e) out.push("e-cal-round-te");
    if (!joined.b && !joined.s) out.push("e-cal-round-bs");
    if (!joined.b && !joined.e) out.push("e-cal-round-be");
  }
  return out.some((c) => c.startsWith("e-cal-band")) ? ["e-cal-end", ...out] : out;
}
function dayLabel(d: Date, marked: boolean): string {
  const date = loc.formatLong(d);
  const mark = props.markLabel || t("timesAvailable");
  if (sameDay(d, today.value)) return t(marked ? "dayTodayMarked" : "dayToday", { date, mark });
  return marked ? t("dayMarked", { date, mark }) : date;
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
  focus.value = enabledNear(clamp(addMonths(focus.value, n)), n);
}

function sign(): number {
  return dir.value === "rtl" ? -1 : 1;
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

function onRootKey(e: KeyboardEvent) {
  if (e.key !== "Escape" || view.value === "days") return;
  e.preventDefault();
  e.stopPropagation();
  backToDays();
}

function goToday() {
  const now = today.value;
  const tc = enabledNear(clamp(now));
  focus.value = tc;
  focusId(dayId(tc));
  if (!range.value && !off(now)) pickDay(now);
}

const shortDate = (d: Date) =>
  formatMonthDay(loc.locale.value, d, `${loc.monthsShort.value[d.getMonth()]} ${d.getDate()}`);
const help = computed(() => {
  if (!range.value || view.value !== "days") return "";
  if (!start.value) return t("rangeStart");
  if (!end.value) return t("rangeEnd", { start: shortDate(start.value) });
  const days = Math.round(compareDays(end.value, start.value) / 864e5) + 1;
  // `days` stays for overrides written before the message became a plural.
  return t("rangeDone", {
    start: shortDate(start.value),
    end: shortDate(end.value),
    n: days,
    days,
  });
});

const picking = computed(() => view.value !== "days");
const prevOff = computed(() => !!props.min && compareDays(new Date(cy.value, cm.value, 0, 12), props.min) < 0);
const nextOff = computed(() => !!props.max && compareDays(new Date(cy.value, cm.value + 1, 1, 12), props.max) > 0);
const monthIndexes = Array.from({ length: 12 }, (_, i) => i);
const nowYear = computed(() => today.value.getFullYear());
const nowMonth = computed(() => today.value.getMonth());

defineExpose({
  view,
  focusDay: () => focusId(dayId(focus.value)),
});
</script>

<template>
  <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
  <div ref="root" class="e-cal" :dir="dir" @keydown="onRootKey">
    <div class="e-cal-head">
      <EIconButton
        v-if="picking"
        icon="chevron-left"
        :label="t(view === 'months' ? 'backToYears' : 'backToDays')"
        @click="back"
      />
      <EIconButton v-else icon="chevron-left" :label="t('prevMonth')" :disabled="prevOff" @click="step(-1)" />
      <div class="e-cal-title">
        <span class="e-sr" aria-live="polite" aria-atomic="true">{{
          picking ? t(view === "months" ? "chooseAMonth" : "chooseAYear", { year: cy }) : monthTitle
        }}</span>
        <span v-if="picking" class="e-cal-range" aria-hidden="true">{{
          t(view === "months" ? "chooseAMonth" : "chooseAYear", { year: cy })
        }}</span>
        <button
          v-else
          type="button"
          class="e-cal-pick e-interact"
          :aria-label="t('chooseDateNow', { month: loc.months.value[cm] ?? '', year: cy })"
          @click="openView('years')"
        >
          {{ monthTitle }}
          <EIcon name="chevron-down" size="sm" />
        </button>
      </div>
      <span v-if="picking" class="e-cal-gap" />
      <EIconButton v-else icon="chevron-right" :label="t('nextMonth')" :disabled="nextOff" @click="step(1)" />
    </div>

    <!-- eslint-disable-next-line vuejs-accessibility/interactive-supports-focus -- the day buttons carry the roving tabindex -->
    <table v-if="view === 'days'" class="e-cal-grid" role="grid" :aria-label="monthTitle" @keydown="onDayKey">
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
            v-for="(cell, c) in row"
            :key="cell.key"
            role="gridcell"
            :aria-selected="isSelected(cell.d) || inRange(cell.d) ? 'true' : 'false'"
            :class="joins(cell.d, c, w)"
          >
            <button
              :id="dayId(cell.d)"
              type="button"
              class="e-day e-interact e-interact--inset"
              :class="[
                cell.d.getMonth() !== cm && 'e-day--out',
                sameDay(cell.d, today) && 'e-day--today',
                isSelected(cell.d) && 'e-day--sel',
                cell.marked && 'e-day--mark',
              ]"
              :tabindex="sameDay(cell.d, focus) ? 0 : -1"
              :disabled="cell.off"
              :aria-current="sameDay(cell.d, today) ? 'date' : undefined"
              :aria-label="dayLabel(cell.d, cell.marked)"
              @click="clickDay(cell.d)"
              @mouseenter="range && start && !end && (hover = cell.d)"
              @focus="range && start && !end && (hover = cell.d)"
            >
              {{ cell.d.getDate() }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
    <div
      v-else-if="view === 'months'"
      class="e-cal-cells"
      role="group"
      :aria-label="t('monthsOf', { year: cy })"
      @keydown="onPickKey"
    >
      <button
        v-for="m in monthIndexes"
        :id="`${uid}-m-${m}`"
        :key="m"
        type="button"
        class="e-cal-cell e-interact e-interact--inset"
        :class="[m === cm && 'e-day--sel', cy === nowYear && m === nowMonth && 'e-day--today']"
        :tabindex="m === pick ? 0 : -1"
        :disabled="monthOff(cy, m)"
        :aria-pressed="m === cm ? 'true' : 'false'"
        :aria-current="cy === nowYear && m === nowMonth ? 'date' : undefined"
        @click="chooseMonth(m)"
      >
        <span aria-hidden="true">{{ loc.monthsShort.value[m] }}</span>
        <span class="e-sr">{{ monthName(cy, m) }}</span>
      </button>
    </div>

    <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
    <div
      v-else
      class="e-cal-cells e-cal-years"
      role="group"
      :aria-label="t('yearsRange', { from: yearLow, to: yearHigh })"
      @keydown="onPickKey"
    >
      <button
        v-for="y in years"
        :id="`${uid}-y-${y}`"
        :key="y"
        type="button"
        class="e-cal-cell e-interact e-interact--inset"
        :class="[y === cy && 'e-day--sel', y === nowYear && 'e-day--today']"
        :tabindex="y === pick ? 0 : -1"
        :disabled="yearOff(y)"
        :aria-pressed="y === cy ? 'true' : 'false'"
        :aria-current="y === nowYear ? 'date' : undefined"
        @click="chooseYear(y)"
      >
        {{ y }}
      </button>
    </div>

    <p v-if="range" class="e-cal-help" aria-live="polite">{{ help }}</p>

    <EActions v-if="footer" class="e-cal-foot" :class="view !== 'days' && 'e-cal-foot--idle'" :inert="view !== 'days'">
      <EButton variant="quiet" @click="goToday">{{ t("today") }}</EButton>
      <EButton v-if="clearable" variant="quiet" @click="emit('clear')">{{ t("clear") }}</EButton>
    </EActions>
  </div>
</template>

<style>
@layer e.composites {
  /* --_w fits seven day buttons and their gaps across. */
  .e-cal {
    --_w: 20.5rem;

    display: flex;
    flex-direction: column;
    gap: var(--e-gap-snug);
    width: var(--_w);
    max-width: 100%;
    font-family: var(--e-font-sans);
  }

  .e-cal-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--e-gap-snug);
    padding-bottom: var(--e-gap-snug);
    border-bottom: var(--e-stroke-hair) solid var(--e-border);
  }

  .e-cal-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--e-gap-tight);
    flex: 1;
    min-width: 0;
    margin: 0;
    font: var(--e-type-h4);
    text-align: center;
  }

  .e-cal-pick {
    display: inline-flex;
    align-items: center;
    gap: var(--e-gap-tight);
    height: var(--e-control-height);
    padding: 0 var(--e-gap-snug);
    border: 0;
    border-radius: var(--e-radius-md);
    background: transparent;
    color: var(--e-ink);
    font: var(--e-weight-strong) var(--e-text-lg) / var(--e-leading-none) var(--e-font-sans);
    cursor: pointer;
    transition: var(--e-transition-state);
  }

  .e-cal-range {
    font: var(--e-type-h4);
    font-variant-numeric: tabular-nums;
  }

  .e-cal-gap {
    display: block;
    width: var(--e-tap);
    height: var(--e-tap);
  }

  .e-cal-head .e-icon-btn:disabled {
    color: var(--e-disabled-ink);
    cursor: not-allowed;
  }

  .e-cal-grid {
    --_body-h: calc(6 * var(--e-tap) + var(--e-space-8) + var(--e-space-4));

    width: 100%;
    height: var(--_body-h);

    /* Separate with no spacing looks the same as collapsed, and lets a band cell round its corners. */
    border-collapse: separate;
    border-spacing: 0;
    table-layout: fixed;
  }

  /* The weekday row takes what the grid's fixed height leaves over, so the day rows are exactly a tap tall and touch. */
  .e-cal-grid th {
    height: calc(var(--e-space-8) + var(--e-space-4));
    font: var(--e-weight-strong) var(--e-text-sm) / var(--e-leading-none) var(--e-font-sans);
    color: var(--e-muted);
    text-align: center;
  }

  /* The days sit side by side and row on row with no gap, so a range reads as one band and its two ends can meet at a corner. */
  .e-cal-grid td {
    --_to-end: to right;

    padding: 0;
    text-align: center;
  }

  .e-cal-grid td:dir(rtl) {
    --_to-end: to left;
  }

  .e-cal-in {
    background: var(--e-primary-soft);
  }

  /* The ends of a span meet the band flush on every side where the span goes on (beside it in the row, or above or below it across a week): the band runs under the half of the end day that faces it, and that day's corners on that side are square. */
  .e-cal-end {
    background-image: var(--_js, none), var(--_je, none), var(--_jt, none), var(--_jb, none);
  }

  .e-cal-band-s {
    --_js: linear-gradient(var(--_to-end), var(--e-primary-soft) 50%, transparent 50%);
  }

  .e-cal-band-e {
    --_je: linear-gradient(var(--_to-end), transparent 50%, var(--e-primary-soft) 50%);
  }

  .e-cal-band-t {
    --_jt: linear-gradient(var(--e-primary-soft) 50%, transparent 50%);
  }

  .e-cal-band-b {
    --_jb: linear-gradient(transparent 50%, var(--e-primary-soft) 50%);
  }

  .e-cal-round-ts {
    border-start-start-radius: var(--e-radius-md);
  }

  .e-cal-round-te {
    border-start-end-radius: var(--e-radius-md);
  }

  .e-cal-round-bs {
    border-end-start-radius: var(--e-radius-md);
  }

  .e-cal-round-be {
    border-end-end-radius: var(--e-radius-md);
  }

  /* A day inside the band takes the band's corners, so its hover, its press and today's ring follow the band's shape. */
  .e-cal-in > .e-day {
    border-radius: inherit;
  }

  .e-cal-flat-s > .e-day {
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }

  .e-cal-flat-e > .e-day {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }

  .e-cal-flat-t > .e-day {
    border-start-start-radius: 0;
    border-start-end-radius: 0;
  }

  .e-cal-flat-b > .e-day {
    border-end-start-radius: 0;
    border-end-end-radius: 0;
  }

  .e-day {
    position: relative;
    width: 100%;
    height: var(--e-tap);
    padding: 0;
    border: 0;
    border-radius: var(--e-radius-md);
    background: transparent;
    color: var(--e-ink);
    font: var(--e-weight-medium) var(--e-text-sm) / var(--e-leading-none) var(--e-font-mono);
    font-variant-numeric: tabular-nums;
    cursor: pointer;
    transition: var(--e-transition-state);
  }

  /* A named exception to the state transition: the band under the days follows the pointer at once, so the days answer at once too. A fade would trail behind the pointer across the packed grid and linger on a day the band has just left. */
  .e-cal-grid .e-day {
    transition: none;
  }

  .e-day--out {
    color: var(--e-muted);
    font-weight: var(--e-weight-regular);
  }

  .e-day--today {
    box-shadow: inset 0 0 0 var(--e-stroke-edge) var(--e-primary);
  }

  /* The chosen day is a small button face, like a checked box: the primary colour on the standard slab (an edge on every side in the slab colour, the bottom one thicker by --_lift), which sinks when pressed. */
  .e-day--sel,
  .e-cal-cell.e-day--sel {
    --_lift: var(--e-depth);

    border: var(--e-stroke-edge) solid var(--e-primary-slab);
    border-bottom-width: calc(var(--e-stroke-edge) + var(--_lift));
    border-radius: var(--e-radius-md) / var(--e-radius-md) var(--e-radius-md) calc(var(--e-radius-md) + var(--_lift))
      calc(var(--e-radius-md) + var(--_lift));
    background: var(--e-primary);
    box-shadow: none;
    font-weight: var(--e-weight-strong);
    color: var(--e-on-primary);
  }

  .e-day--sel:hover,
  .e-cal-cell.e-day--sel:hover {
    background: var(--e-primary-hover);
  }

  .e-day--sel:active,
  .e-cal-cell.e-day--sel:active {
    --_lift: 0px;

    background: var(--e-primary-press);
  }

  .e-day:disabled,
  .e-cal-cell:disabled {
    background: var(--e-disabled-fill);
    color: var(--e-disabled-ink);
    font-weight: var(--e-weight-regular);
    cursor: not-allowed;
    opacity: 1;
  }

  .e-day--mark::after {
    content: "";
    position: absolute;
    inset-inline-start: 50%;
    bottom: var(--e-space-1);
    width: var(--e-space-1);
    height: var(--e-space-1);
    margin-inline-start: calc(var(--e-space-1) / -2);
    border-radius: var(--e-radius-round);
    background: var(--e-primary);
  }

  .e-day--sel.e-day--mark::after {
    background: var(--e-on-primary);
  }

  .e-cal-cells {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 1fr;
    gap: var(--e-gap-tight);
    height: calc(6 * var(--e-tap) + var(--e-space-8) + var(--e-space-4));
    padding-top: var(--e-space-1);
  }

  .e-cal-years {
    overflow-y: auto;
    overscroll-behavior: contain;
    grid-auto-rows: var(--e-tap);
    padding-inline-end: var(--e-space-1);
    align-content: start;
  }

  .e-cal-cell {
    width: 100%;
    height: 100%;
    min-height: var(--e-tap);
    padding: 0;
    border: 0;
    border-radius: var(--e-radius-md);
    background: transparent;
    color: var(--e-ink);
    font: var(--e-weight-medium) var(--e-text-md) / var(--e-leading-none) var(--e-font-mono);
    font-variant-numeric: tabular-nums;
    cursor: pointer;
    transition: var(--e-transition-state);
  }

  .e-cal-years .e-cal-cell {
    height: var(--e-tap);
  }

  .e-cal-help {
    min-height: calc(var(--e-text-sm) * var(--e-leading-normal));
    font: var(--e-type-small);
    color: var(--e-muted);
    text-align: center;
  }

  .e-cal-foot {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: var(--e-gap-snug);
    padding-top: var(--e-gap-snug);
    border-top: var(--e-stroke-hair) solid var(--e-border);
  }

  .e-cal-foot--idle {
    visibility: hidden;
  }

  /* Box-shadows are removed in forced colours, so the today ring and the range band are drawn with outlines. */
  @media (forced-colors: active) {
    .e-day--sel,
    .e-cal-cell.e-day--sel {
      forced-color-adjust: none;
      border-bottom-color: ButtonText;
      background: Highlight;
      color: HighlightText;
    }

    .e-day--today {
      outline: var(--e-stroke-edge) solid CanvasText;
      outline-offset: calc(-1 * var(--e-stroke-edge));
    }

    .e-cal-in {
      outline: var(--e-stroke-edge) dashed Highlight;
      outline-offset: calc(-1 * var(--e-stroke-edge));
    }

    .e-day--mark::after {
      background: CanvasText;
    }

    .e-day--sel.e-day--mark::after {
      background: HighlightText;
    }

    .e-day:disabled,
    .e-cal-cell:disabled {
      color: GrayText;
    }
  }
}
</style>
