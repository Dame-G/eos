import { describe, expect, test } from "vitest";
import { defineComponent, h, ref, type Component } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import * as Vue from "vue";
import ECalendar from "./ECalendar.vue";
import { createEos } from "../../plugin.js";
import { expectNoViolations } from "../../../test/axe.js";

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day, 12);
const plugin = (options: Parameters<typeof createEos>[0]) => ({
  plugins: [createEos({ themeTarget: null, ...options })],
});
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const active = () => document.activeElement as HTMLElement;
const grid = (c: Element) => c.querySelector<HTMLElement>("table")!;
const dayButton = (c: Element, label: RegExp) =>
  [...c.querySelectorAll<HTMLButtonElement>(".e-day")].find((b) => label.test(b.getAttribute("aria-label") ?? ""))!;

async function bound(props: Record<string, unknown>, initial: Date | null, global = {}) {
  const model = ref<Date | null>(initial);
  const result = await render(
    defineComponent({
      render: () =>
        h(ECalendar as Component, {
          ...props,
          modelValue: model.value,
          "onUpdate:modelValue": (v: Date | null) => (model.value = v),
        }),
    }),
    { global },
  );
  return { model, ...result };
}

describe("ECalendar", () => {
  test("shows one month as a grid with the month and year in one button, Sunday first in en-US", async () => {
    const { container } = await render(ECalendar, { props: { modelValue: d(2026, 10, 22) } });
    expect(container.querySelectorAll(".e-cal-pick")).toHaveLength(1);
    expect(container.querySelector(".e-cal-pick")!.textContent!.trim()).toBe("October 2026");
    expect(container.querySelectorAll("tbody tr")).toHaveLength(6);
    expect(container.querySelectorAll(".e-day")).toHaveLength(42);
    expect([...container.querySelectorAll("th")].map((th) => th.textContent!.trim())).toEqual([
      "Su",
      "Mo",
      "Tu",
      "We",
      "Th",
      "Fr",
      "Sa",
    ]);
    expect(container.querySelector("th")!.getAttribute("abbr")).toBe("Sunday");
    await expect.element(page.getByRole("grid", { name: "October 2026" })).toBeVisible();
  });

  test("days are 44px square targets, the chosen day is selected and exposed to screen readers", async () => {
    const { container } = await render(ECalendar, { props: { modelValue: d(2026, 10, 22) } });
    const day = dayButton(container, /October 22/);
    expect(day.getBoundingClientRect().height).toBe(44);
    expect(day.classList.contains("e-day--sel")).toBe(true);
    expect(day.closest("td")!.getAttribute("aria-selected")).toBe("true");
    // The label gains ", today" when the real date is the chosen one.
    expect(day.getAttribute("aria-label")).toMatch(/^Thursday, October 22, 2026(, today)?$/);
    expect(day.tabIndex).toBe(0);
    expect(dayButton(container, /October 21/).tabIndex).toBe(-1);
  });

  test("today is announced as today", async () => {
    const { container } = await render(ECalendar);
    const today = container.querySelector<HTMLElement>(".e-day--today")!;
    expect(today.getAttribute("aria-label")).toMatch(/, today$/);
  });

  test("arrows move by day and week, Page Down by month, disabled days cannot be chosen, marked days get a dot", async () => {
    const { container } = await render(ECalendar, {
      props: {
        modelValue: d(2026, 10, 22),
        month: d(2026, 10, 22),
        footer: false,
        disabledDate: (x: Date) => x.getDay() === 0,
        marked: (x: Date) => x.getDate() === 23,
      },
    });
    expect(container.querySelector(".e-day--mark")).not.toBeNull();
    expect(dayButton(container, /October 23/).getAttribute("aria-label")).toMatch(/times available/);
    active().blur();
    container.querySelector<HTMLElement>('.e-day[tabindex="0"]')!.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(active().getAttribute("aria-label")).toMatch(/October 23/);
    await userEvent.keyboard("{ArrowDown}");
    expect(active().getAttribute("aria-label")).toMatch(/Friday, October 30/);
    await userEvent.keyboard("{ArrowUp}{ArrowLeft}");
    expect(active().getAttribute("aria-label")).toMatch(/October 22/);
    await userEvent.keyboard("{PageDown}");
    expect(active().getAttribute("aria-label")).toMatch(/November 23/);
    expect(container.querySelectorAll(".e-day:disabled").length).toBeGreaterThan(0);
    await userEvent.keyboard("{PageUp}");
    expect(active().getAttribute("aria-label")).toMatch(/October 23/);
    await userEvent.keyboard("{Shift>}{PageDown}{/Shift}");
    expect(active().getAttribute("aria-label")).toMatch(/October 23, 2027/);
  });

  test("Home and End go to the edges of the week", async () => {
    const { container } = await render(ECalendar, { props: { modelValue: d(2026, 10, 22), footer: false } });
    container.querySelector<HTMLElement>('.e-day[tabindex="0"]')!.focus();
    await userEvent.keyboard("{Home}");
    expect(active().getAttribute("aria-label")).toMatch(/Sunday, October 18/);
    await userEvent.keyboard("{End}");
    expect(active().getAttribute("aria-label")).toMatch(/Saturday, October 24/);
  });

  test("arrows step over days that cannot be chosen", async () => {
    const { container } = await render(ECalendar, {
      props: {
        modelValue: d(2026, 10, 23),
        footer: false,
        disabledDate: (x: Date) => x.getDay() === 0 || x.getDay() === 6,
      },
    });
    container.querySelector<HTMLElement>('.e-day[tabindex="0"]')!.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(active().getAttribute("aria-label")).toMatch(/Monday, October 26/);
  });

  test("Enter and Space choose the focused day and the model follows (v-model round trip)", async () => {
    const { model, container } = await bound({ footer: false, month: d(2026, 10, 1) }, d(2026, 10, 22));
    container.querySelector<HTMLElement>('.e-day[tabindex="0"]')!.focus();
    await userEvent.keyboard("{ArrowRight}{Enter}");
    expect(model.value!.getDate()).toBe(23);
    await userEvent.keyboard("{ArrowRight} ");
    expect(model.value!.getDate()).toBe(24);
    expect(dayButton(container, /October 24/).classList.contains("e-day--sel")).toBe(true);
    expect(dayButton(container, /October 23/).classList.contains("e-day--sel")).toBe(false);
  });

  test("a click chooses a day, and a day of the next month in the grid moves the view", async () => {
    const { model, container } = await bound({ footer: false }, d(2026, 10, 22));
    dayButton(container, /October 3,/).click();
    expect(model.value!.getDate()).toBe(3);
    dayButton(container, /November 1,/).click();
    await sleep(30);
    expect(model.value!.getMonth()).toBe(10);
    expect(container.querySelector(".e-cal-pick")!.textContent!.trim()).toBe("November 2026");
  });

  test("min and max fade days, stop the month arrows and are not chosen", async () => {
    const { model, container } = await bound({ min: d(2026, 10, 10), max: d(2026, 10, 20), footer: false }, null);
    expect(dayButton(container, /October 9,/).disabled).toBe(true);
    expect(dayButton(container, /October 10,/).disabled).toBe(false);
    expect(dayButton(container, /October 21,/).disabled).toBe(true);
    await expect.element(page.getByRole("button", { name: "Previous month" })).toBeDisabled();
    await expect.element(page.getByRole("button", { name: "Next month" })).toBeDisabled();
    dayButton(container, /October 9,/).click();
    expect(model.value).toBeNull();
  });

  test("the month arrows page through months", async () => {
    const { container } = await render(ECalendar, { props: { modelValue: d(2026, 10, 22), footer: false } });
    await page.getByRole("button", { name: "Next month" }).click();
    expect(container.querySelector(".e-cal-pick")!.textContent!.trim()).toBe("November 2026");
    await page.getByRole("button", { name: "Previous month" }).click();
    await page.getByRole("button", { name: "Previous month" }).click();
    expect(container.querySelector(".e-cal-pick")!.textContent!.trim()).toBe("September 2026");
  });

  test("one title button opens years, a year opens its months, a month opens its days", async () => {
    const { container } = await render(ECalendar, {
      props: { modelValue: d(2026, 10, 22), month: d(2026, 10, 22), footer: false },
    });
    expect(container.querySelector(".e-cal-pick")!.getAttribute("aria-label")).toBe(
      "Change month or year, currently October 2026",
    );
    container.querySelector<HTMLElement>(".e-cal-pick")!.click();
    await sleep(30);
    expect(container.querySelector(".e-cal-years")).not.toBeNull();
    expect(container.querySelector(".e-cal-title")!.textContent).toMatch(/Choose a year/);
    expect(container.querySelector(".e-cal-head button")!.getAttribute("aria-label")).toBe("Back to the days");
    expect(active().id).toMatch(/-y-2026$/);
    container.querySelector<HTMLElement>('[id$="-y-2027"]')!.click();
    await sleep(30);
    expect(container.querySelector(".e-cal-cells")).not.toBeNull();
    expect(container.querySelector(".e-cal-years")).toBeNull();
    expect(container.querySelector(".e-cal-title")!.textContent).toMatch(/Choose a month in 2027/);
    expect(container.querySelector(".e-cal-head button")!.getAttribute("aria-label")).toBe("Back to the years");
    expect(active().id).toMatch(/-m-9$/);
    container.querySelector<HTMLElement>(".e-cal-head button")!.click();
    await sleep(30);
    expect(container.querySelector(".e-cal-years")).not.toBeNull();
    container.querySelector<HTMLElement>('[id$="-y-2027"]')!.click();
    await sleep(30);
    container.querySelectorAll<HTMLElement>(".e-cal-cell")[2]!.click();
    await sleep(30);
    expect(grid(container)).not.toBeNull();
    expect(container.querySelector(".e-cal-pick")!.textContent!.trim()).toBe("March 2027");
    expect(active().getAttribute("aria-label")).toMatch(/March 22, 2027/);
  });

  test("the month is never set before the year: a date of birth is year, month, day", async () => {
    const { model, container } = await bound({ footer: false, min: d(1900, 1, 1), max: d(2026, 12, 31) }, null);
    container.querySelector<HTMLElement>(".e-cal-pick")!.click();
    await sleep(30);
    container.querySelector<HTMLElement>('[id$="-y-1981"]')!.click();
    await sleep(30);
    container.querySelectorAll<HTMLElement>(".e-cal-cell")[9]!.click();
    await sleep(30);
    dayButton(container, /October 22,/).click();
    expect(model.value).toEqual(d(1981, 10, 22));
  });

  test("years and months outside min and max are disabled", async () => {
    const { container } = await render(ECalendar, {
      props: { modelValue: d(2026, 10, 22), min: d(2025, 3, 1), max: d(2027, 6, 30), footer: false },
    });
    container.querySelector<HTMLElement>(".e-cal-pick")!.click();
    await sleep(30);
    expect(container.querySelector<HTMLButtonElement>('[id$="-y-2024"]')).toBeNull();
    expect(container.querySelector<HTMLButtonElement>('[id$="-y-2025"]')!.disabled).toBe(false);
    container.querySelector<HTMLElement>('[id$="-y-2025"]')!.click();
    await sleep(30);
    const cells = container.querySelectorAll<HTMLButtonElement>(".e-cal-cell");
    expect(cells[1]!.disabled).toBe(true);
    expect(cells[2]!.disabled).toBe(false);
  });

  test("years and months move with the arrows, Home, End and Page keys; Enter chooses", async () => {
    const { container } = await render(ECalendar, { props: { modelValue: d(2026, 10, 22), footer: false } });
    container.querySelector<HTMLElement>(".e-cal-pick")!.click();
    await sleep(30);
    await userEvent.keyboard("{ArrowRight}");
    expect(active().id).toMatch(/-y-2027$/);
    await userEvent.keyboard("{ArrowDown}");
    expect(active().id).toMatch(/-y-2030$/);
    await userEvent.keyboard("{PageUp}");
    expect(active().id).toMatch(/-y-2018$/);
    await userEvent.keyboard("{Home}");
    expect(Number(active().textContent)).toBe(new Date().getFullYear() - 120);
    await userEvent.keyboard("{End}");
    expect(Number(active().textContent)).toBe(new Date().getFullYear() + 20);
    container.querySelector<HTMLElement>('[id$="-y-2026"]')!.focus();
    await userEvent.keyboard("{Enter}");
    await sleep(30);
    expect(active().id).toMatch(/-m-9$/);
    await userEvent.keyboard("{ArrowLeft}{ArrowUp}");
    expect(active().id).toMatch(/-m-5$/);
    await userEvent.keyboard("{End}");
    expect(active().id).toMatch(/-m-11$/);
    await userEvent.keyboard("{Home}");
    expect(active().id).toMatch(/-m-0$/);
  });

  test("Escape returns up to the days and puts focus back on the day", async () => {
    const { container } = await render(ECalendar, { props: { modelValue: d(2026, 10, 22), footer: false } });
    container.querySelector<HTMLElement>(".e-cal-pick")!.click();
    await sleep(30);
    await userEvent.keyboard("{Escape}");
    await sleep(30);
    expect(grid(container)).not.toBeNull();
    expect(active().getAttribute("aria-label")).toMatch(/October 22, 2026/);
  });

  test("Escape on the days is left alone so a popup can close", async () => {
    const { container } = await render(ECalendar, { props: { modelValue: d(2026, 10, 22), footer: false } });
    const seen: boolean[] = [];
    document.addEventListener("keydown", (e) => seen.push(e.defaultPrevented), { once: true });
    container.querySelector<HTMLElement>('.e-day[tabindex="0"]')!.focus();
    await userEvent.keyboard("{Escape}");
    expect(seen).toEqual([false]);
  });

  test("a changed month is announced politely, from a region that holds no button", async () => {
    const { container } = await render(ECalendar, { props: { modelValue: d(2026, 10, 22) } });
    const live = container.querySelector(".e-cal-title [aria-live]")!;
    expect(live.getAttribute("aria-live")).toBe("polite");
    expect(live.textContent!.trim()).toBe("October 2026");
    expect(live.querySelector("button")).toBeNull();
    expect(container.querySelector(".e-cal-title")!.hasAttribute("aria-live")).toBe(false);
    expect(container.querySelector(".e-cal-pick")!.hasAttribute("aria-expanded")).toBe(false);
  });

  test("today's day button carries aria-current=date", async () => {
    const { container } = await render(ECalendar);
    const current = container.querySelectorAll('.e-day[aria-current="date"]');
    expect(current).toHaveLength(1);
    expect(current[0]!.classList.contains("e-day--today")).toBe(true);
  });

  test("Today moves to and chooses today; Clear shows only when clearable", async () => {
    const { model, container } = await bound({}, d(2020, 1, 15));
    expect(container.querySelector(".e-cal-foot")!.textContent).toMatch(/Today/);
    expect(container.querySelector(".e-cal-foot")!.textContent).not.toMatch(/Clear/);
    await page.getByRole("button", { name: "Today" }).click();
    const now = new Date();
    expect(model.value!.getFullYear()).toBe(now.getFullYear());
    expect(model.value!.getDate()).toBe(now.getDate());

    let cleared = 0;
    await render(ECalendar, { props: { modelValue: d(2026, 10, 22), clearable: true, onClear: () => cleared++ } });
    await page.getByRole("button", { name: "Clear" }).click();
    expect(cleared).toBe(1);
  });

  test("footer false hides Today and Clear", async () => {
    const { container } = await render(ECalendar, { props: { footer: false, clearable: true } });
    expect(container.querySelector(".e-cal-foot")).toBeNull();
  });

  test("range mode: the first click sets the start, the second the end, clicking before the start restarts", async () => {
    const start = ref<Date | null>(null);
    const end = ref<Date | null>(null);
    const spans: unknown[] = [];
    const { container } = await render(
      defineComponent({
        render: () =>
          h(ECalendar as Component, {
            mode: "range",
            month: d(2026, 10, 1),
            footer: false,
            start: start.value,
            end: end.value,
            "onUpdate:start": (v: Date | null) => (start.value = v),
            "onUpdate:end": (v: Date | null) => (end.value = v),
            onRangeChange: (r: unknown) => spans.push(r),
          }),
      }),
    );
    const help = () => container.querySelector(".e-cal-help")!.textContent;
    expect(help()).toBe("Choose a start date");
    dayButton(container, /October 14,/).click();
    await sleep(30);
    expect(help()).toBe("Starts Oct 14. Now choose an end date");
    dayButton(container, /October 10,/).click();
    await sleep(30);
    expect(start.value!.getDate()).toBe(10);
    expect(end.value).toBeNull();
    dayButton(container, /October 18,/).click();
    await sleep(30);
    expect(end.value!.getDate()).toBe(18);
    expect(help()).toBe("Oct 10 to Oct 18 (9 days)");
    expect(spans).toHaveLength(3);
    expect(container.querySelectorAll(".e-cal-in")).toHaveLength(7);
    expect(dayButton(container, /October 10,/).classList.contains("e-day--sel")).toBe(true);
    expect(dayButton(container, /October 18,/).classList.contains("e-day--sel")).toBe(true);
    dayButton(container, /October 25,/).click();
    await sleep(30);
    expect(start.value!.getDate()).toBe(25);
    expect(end.value).toBeNull();
  });

  test("range mode previews the span while the pointer moves over days", async () => {
    const { container } = await render(ECalendar, {
      props: { mode: "range", start: d(2026, 10, 10), end: null, month: d(2026, 10, 1), footer: false },
    });
    dayButton(container, /October 14,/).dispatchEvent(new MouseEvent("mouseenter"));
    await sleep(30);
    expect(container.querySelectorAll(".e-cal-in")).toHaveLength(3);
  });

  test("locale: de-DE starts on Monday and names the month in German", async () => {
    const { container } = await render(ECalendar, {
      props: { modelValue: d(2026, 10, 22), footer: false },
      global: plugin({ locale: "de-DE" }),
    });
    expect(container.querySelector("th")!.textContent!.trim()).toBe("Mo");
    expect(container.querySelector(".e-cal-pick")!.textContent!.trim()).toBe("Oktober 2026");
    expect(dayButton(container, /22/).getAttribute("aria-label")).toMatch(/Donnerstag/);
  });

  test("locale: en-GB starts on Monday and writes the day first", async () => {
    const { container } = await render(ECalendar, {
      props: { modelValue: d(2026, 10, 22), footer: false },
      global: plugin({ locale: "en-GB" }),
    });
    expect(container.querySelector("th")!.textContent!.trim()).toBe("Mo");
    expect(container.querySelector("th:last-child")!.textContent!.trim()).toBe("Su");
    expect(container.querySelector(".e-day")!.getAttribute("aria-label")).toMatch(/^Monday,? 28 September 2026$/);
  });

  test("a locale change re-renders names and week start without remounting", async () => {
    const eos = createEos({ themeTarget: null });
    const { container } = await render(ECalendar, {
      props: { modelValue: d(2026, 10, 22), footer: false },
      global: { plugins: [eos] },
    });
    expect(container.querySelector("th")!.textContent!.trim()).toBe("Su");
    eos.config.locale = "fr-FR";
    await sleep(30);
    expect(container.querySelector("th")!.textContent!.trim()).toMatch(/^lu/);
    expect(container.querySelector(".e-cal-pick")!.textContent!.trim()).toBe("octobre 2026");
  });

  test("right to left (Hebrew): the grid mirrors and ArrowRight goes to the previous day", async () => {
    const { container } = await render(ECalendar, {
      props: { modelValue: d(2026, 10, 22), footer: false },
      global: plugin({ locale: "he-IL", dir: "rtl" }),
    });
    const root = container.querySelector<HTMLElement>(".e-cal")!;
    expect(root.getAttribute("dir")).toBe("rtl");
    expect(getComputedStyle(root).direction).toBe("rtl");
    const first = container.querySelector("th")!.getBoundingClientRect();
    const last = container.querySelector("th:last-child")!.getBoundingClientRect();
    expect(first.left).toBeGreaterThan(last.left);
    container.querySelector<HTMLElement>('.e-day[tabindex="0"]')!.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(active().textContent!.trim()).toBe("21");
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(active().textContent!.trim()).toBe("23");
  });

  test("a Hebrew locale alone mirrors the grid and the arrow keys", async () => {
    const { container } = await render(ECalendar, {
      props: { modelValue: d(2026, 10, 22), footer: false },
      global: plugin({ locale: "he-IL" }),
    });
    expect(container.querySelector(".e-cal")!.getAttribute("dir")).toBe("rtl");
    container.querySelector<HTMLElement>('.e-day[tabindex="0"]')!.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(active().textContent!.trim()).toBe("21");
  });

  test("day names say marked days through the translated sentence, and the plain date otherwise", async () => {
    const { container } = await render(ECalendar, {
      props: { modelValue: d(2026, 10, 22), marked: [d(2026, 10, 22)], markLabel: "open", month: d(2026, 10, 1) },
      global: plugin({ messages: { dayMarked: "{date} ({mark})" } }),
    });
    expect(dayButton(container, /^Thursday, October 22, 2026 \(open\)$/)).toBeTruthy();
    expect(dayButton(container, /^Saturday, October 24, 2026$/)).toBeTruthy();
  });

  test("works without the plugin, and class and style land on the root", async () => {
    const { container } = await render(ECalendar, {
      props: { modelValue: d(2026, 10, 22) },
      attrs: { class: "mine", style: "margin-top: 4px", "data-x": "1" },
    });
    const root = container.querySelector(".e-cal")!;
    expect(root.classList.contains("mine")).toBe(true);
    expect(root.getAttribute("data-x")).toBe("1");
    expect(root.getAttribute("style")).toContain("margin-top");
  });

  test("message overrides reach the labels", async () => {
    await render(ECalendar, {
      props: { modelValue: d(2026, 10, 22) },
      global: plugin({ messages: { prevMonth: "Mois precedent", today: "Aujourd'hui" } }),
    });
    await expect.element(page.getByRole("button", { name: "Mois precedent" })).toBeVisible();
    await expect.element(page.getByRole("button", { name: "Aujourd'hui" })).toBeVisible();
  });

  test("has no accessibility violations in any view or mode", async () => {
    const days = await render(ECalendar, {
      props: { modelValue: d(2026, 10, 22), marked: [d(2026, 10, 23)], disabledDate: (x: Date) => x.getDay() === 0 },
    });
    await expectNoViolations(days.container);
    const limits = await render(ECalendar, {
      props: { min: d(2026, 10, 10), max: d(2026, 10, 20), month: d(2026, 10, 1) },
    });
    await expectNoViolations(limits.container);
    const spanned = await render(ECalendar, {
      props: { mode: "range", start: d(2026, 10, 10), end: d(2026, 10, 18), footer: false },
    });
    await expectNoViolations(spanned.container);
    const years = await render(ECalendar, { props: { modelValue: d(2026, 10, 22) } });
    years.container.querySelector<HTMLElement>(".e-cal-pick")!.click();
    await sleep(30);
    await expectNoViolations(years.container);
    years.container.querySelector<HTMLElement>('[id$="-y-2027"]')!.click();
    await sleep(30);
    await expectNoViolations(years.container);
  });

  test("Clear follows the clearable prop, not a listener", async () => {
    const clearable = Vue.ref(false);
    const { container } = await render(
      Vue.defineComponent({
        render: () => Vue.h(ECalendar, { clearable: clearable.value, onClear: () => {} }),
      }),
    );
    expect(container.querySelector(".e-cal-foot .e-btn:nth-of-type(2)")).toBeNull();
    clearable.value = true;
    await expect.poll(() => container.querySelector(".e-cal-foot .e-btn:nth-of-type(2)")).not.toBeNull();
  });

  test("the tab stop never lands on a disabled day after a month step, Today or a year change", async () => {
    // Weekends are off, and the 31st of a month is a Saturday here: stepping from Jan 30 to Feb lands on a weekday.
    const { container } = await render(ECalendar, {
      props: {
        modelValue: d(2026, 1, 31),
        month: d(2026, 1, 31),
        disabledDate: (x: Date) => x.getDay() === 0 || x.getDay() === 6,
      },
    });
    const stop = () => container.querySelector<HTMLButtonElement>('.e-day[tabindex="0"]')!;
    expect(stop().disabled).toBe(false);
    await page.getByRole("button", { name: /Next month/ }).click();
    expect(stop().disabled).toBe(false);
    expect(stop().getAttribute("aria-label")).toMatch(/February/);
    await page.getByRole("button", { name: /Previous month/ }).click();
    expect(stop().disabled).toBe(false);
    container.querySelector<HTMLElement>(".e-cal-pick")!.click();
    await sleep(30);
    container.querySelector<HTMLElement>('[id$="-y-2027"]')!.click();
    await sleep(30);
    container.querySelector<HTMLElement>('[id$="-m-5"]')!.click();
    await sleep(30);
    expect(stop().disabled).toBe(false);
    await page.getByRole("button", { name: "Today" }).click();
    expect(stop().disabled).toBe(false);
  });

  test("the tab stop moves off a day that becomes disabled", async () => {
    const off = Vue.ref<(x: Date) => boolean>(() => false);
    const { container } = await render(
      Vue.defineComponent({
        render: () => Vue.h(ECalendar, { modelValue: d(2026, 10, 22), disabledDate: off.value }),
      }),
    );
    off.value = (x) => x.getDate() === 22;
    await expect.poll(() => container.querySelector<HTMLButtonElement>('.e-day[tabindex="0"]')!.disabled).toBe(false);
    expect(container.querySelector('.e-day[tabindex="0"]')!.getAttribute("aria-label")).not.toMatch(/October 22/);
  });

  test("month and date order follow the locale, not English", async () => {
    const { container } = await render(ECalendar, {
      props: { mode: "range", start: d(2026, 10, 10), end: d(2026, 10, 18), footer: false },
      global: plugin({ locale: "ja-JP" }),
    });
    expect(container.querySelector(".e-cal-pick")!.textContent!.trim()).toBe("2026年10月");
    expect(container.querySelector(".e-cal-help")!.textContent).toMatch(/10月10日/);
    expect(container.querySelector("table")!.getAttribute("aria-label")).toBe("2026年10月");
  });

  test("update:month fires on every visible month change, with the first day of the month", async () => {
    const seen: Date[] = [];
    const { container } = await render(ECalendar, {
      props: { modelValue: d(2026, 10, 22), "onUpdate:month": (m: Date) => seen.push(m) },
    });
    await page.getByRole("button", { name: /Next month/ }).click();
    await page.getByRole("button", { name: /Previous month/ }).click();
    await page.getByRole("button", { name: /Previous month/ }).click();
    expect(seen.map((m) => [m.getFullYear(), m.getMonth() + 1, m.getDate()])).toEqual([
      [2026, 11, 1],
      [2026, 10, 1],
      [2026, 9, 1],
    ]);
    // Moving within the month is silent.
    container.querySelector<HTMLElement>('.e-day[tabindex="0"]')!.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(seen).toHaveLength(3);
  });

  test("a parent that echoes update:month keeps the focused day", async () => {
    const month = Vue.ref<Date>(d(2026, 10, 1));
    const { container } = await render(
      Vue.defineComponent({
        render: () =>
          Vue.h(ECalendar, {
            modelValue: null,
            month: month.value,
            "onUpdate:month": (m: Date) => (month.value = m),
          }),
      }),
    );
    container.querySelector<HTMLElement>('.e-day[tabindex="0"]')!.focus();
    await userEvent.keyboard("{PageDown}");
    await sleep(30);
    expect(container.querySelector('.e-day[tabindex="0"]')!.getAttribute("aria-label")).toMatch(/November \d+/);
    expect(month.value.getMonth()).toBe(10);
  });

  test("a day list passed to marked is matched by day, whatever the time of day", async () => {
    const { container } = await render(ECalendar, {
      props: { modelValue: d(2026, 10, 22), marked: [new Date(2026, 9, 5, 3, 30), d(2026, 10, 6)], footer: false },
    });
    expect(container.querySelectorAll(".e-day--mark")).toHaveLength(2);
  });

  test("today and the range band stay visible in forced colours (outlines, not shadows)", async () => {
    const { container } = await render(ECalendar, {
      props: { mode: "range", start: d(2026, 10, 10), end: d(2026, 10, 18), footer: false },
    });
    const sheets = [...document.styleSheets].flatMap((sheet) => {
      try {
        return [...sheet.cssRules];
      } catch {
        return [];
      }
    });
    const forced = sheets.flatMap((r) => {
      const found: string[] = [];
      const walk = (rule: CSSRule) => {
        if (rule instanceof CSSMediaRule && rule.conditionText.includes("forced-colors")) found.push(rule.cssText);
        else if ("cssRules" in rule) [...(rule as CSSGroupingRule).cssRules].forEach(walk);
      };
      walk(r);
      return found;
    });
    const css = forced.join("\n");
    expect(css).toMatch(/\.e-day--today[^}]*outline/);
    expect(css).toMatch(/\.e-cal-in[^}]*outline/);
    expect(container.querySelector(".e-cal-in")).not.toBeNull();
  });

  test("the chosen day is a slab face like a checked box", async () => {
    const { container } = await render(ECalendar, { props: { modelValue: d(2026, 10, 22), footer: false } });
    const style = getComputedStyle(container.querySelector(".e-day--sel")!);
    expect(parseFloat(style.borderBottomWidth)).toBeGreaterThan(0);
    expect(style.boxShadow).toBe("none");
  });
});
