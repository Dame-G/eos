import { describe, expect, test } from "vitest";
import { defineComponent, h, ref, type Component } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AeCalendar from "./AeCalendar.vue";
import { createAegis } from "../../plugin.js";
import { expectNoViolations } from "../../../test/axe.js";

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day, 12);
const plugin = (options: Parameters<typeof createAegis>[0]) => ({
  plugins: [createAegis({ themeTarget: null, ...options })],
});
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const active = () => document.activeElement as HTMLElement;
const grid = (c: Element) => c.querySelector<HTMLElement>("table")!;
const dayButton = (c: Element, label: RegExp) =>
  [...c.querySelectorAll<HTMLButtonElement>(".ae-day")].find((b) => label.test(b.getAttribute("aria-label") ?? ""))!;

/** A calendar bound to a model, so v-model round trips are real. */
async function bound(props: Record<string, unknown>, initial: Date | null, global = {}) {
  const model = ref<Date | null>(initial);
  const result = await render(
    defineComponent({
      render: () =>
        h(AeCalendar as Component, {
          ...props,
          modelValue: model.value,
          "onUpdate:modelValue": (v: Date | null) => (model.value = v),
        }),
    }),
    { global },
  );
  return { model, ...result };
}

describe("AeCalendar", () => {
  test("shows one month as a grid with the month and year in one button, Sunday first in en-US", async () => {
    const { container } = await render(AeCalendar, { props: { modelValue: d(2026, 10, 22) } });
    expect(container.querySelectorAll(".ae-cal-pick")).toHaveLength(1);
    expect(container.querySelector(".ae-cal-pick")!.textContent!.trim()).toBe("October 2026");
    expect(container.querySelectorAll("tbody tr")).toHaveLength(6);
    expect(container.querySelectorAll(".ae-day")).toHaveLength(42);
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
    const { container } = await render(AeCalendar, { props: { modelValue: d(2026, 10, 22) } });
    const day = dayButton(container, /October 22/);
    expect(day.getBoundingClientRect().height).toBe(44);
    expect(day.classList.contains("ae-day--sel")).toBe(true);
    expect(day.closest("td")!.getAttribute("aria-selected")).toBe("true");
    expect(day.getAttribute("aria-label")).toBe("Thursday, October 22, 2026");
    expect(day.tabIndex).toBe(0);
    expect(dayButton(container, /October 21/).tabIndex).toBe(-1);
  });

  test("today is announced as today", async () => {
    const { container } = await render(AeCalendar);
    const today = container.querySelector<HTMLElement>(".ae-day--today")!;
    expect(today.getAttribute("aria-label")).toMatch(/, today$/);
  });

  test("arrows move by day and week, Page Down by month, disabled days cannot be chosen, marked days get a dot", async () => {
    const { container } = await render(AeCalendar, {
      props: {
        modelValue: d(2026, 10, 22),
        month: d(2026, 10, 22),
        footer: false,
        disabledDate: (x: Date) => x.getDay() === 0,
        marked: (x: Date) => x.getDate() === 23,
      },
    });
    expect(container.querySelector(".ae-day--mark")).not.toBeNull();
    expect(dayButton(container, /October 23/).getAttribute("aria-label")).toMatch(/times available/);
    active().blur();
    container.querySelector<HTMLElement>('.ae-day[tabindex="0"]')!.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(active().getAttribute("aria-label")).toMatch(/October 23/);
    await userEvent.keyboard("{ArrowDown}");
    expect(active().getAttribute("aria-label")).toMatch(/Friday, October 30/);
    await userEvent.keyboard("{ArrowUp}{ArrowLeft}");
    expect(active().getAttribute("aria-label")).toMatch(/October 22/);
    await userEvent.keyboard("{PageDown}");
    expect(active().getAttribute("aria-label")).toMatch(/November 23/);
    expect(container.querySelectorAll(".ae-day:disabled").length).toBeGreaterThan(0);
    await userEvent.keyboard("{PageUp}");
    expect(active().getAttribute("aria-label")).toMatch(/October 23/);
    await userEvent.keyboard("{Shift>}{PageDown}{/Shift}");
    expect(active().getAttribute("aria-label")).toMatch(/October 23, 2027/);
  });

  test("Home and End go to the edges of the week", async () => {
    const { container } = await render(AeCalendar, { props: { modelValue: d(2026, 10, 22), footer: false } });
    container.querySelector<HTMLElement>('.ae-day[tabindex="0"]')!.focus();
    await userEvent.keyboard("{Home}");
    expect(active().getAttribute("aria-label")).toMatch(/Sunday, October 18/);
    await userEvent.keyboard("{End}");
    expect(active().getAttribute("aria-label")).toMatch(/Saturday, October 24/);
  });

  test("arrows step over days that cannot be chosen", async () => {
    const { container } = await render(AeCalendar, {
      props: {
        modelValue: d(2026, 10, 23),
        footer: false,
        disabledDate: (x: Date) => x.getDay() === 0 || x.getDay() === 6,
      },
    });
    container.querySelector<HTMLElement>('.ae-day[tabindex="0"]')!.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(active().getAttribute("aria-label")).toMatch(/Monday, October 26/);
  });

  test("Enter and Space choose the focused day and the model follows (v-model round trip)", async () => {
    const { model, container } = await bound({ footer: false, month: d(2026, 10, 1) }, d(2026, 10, 22));
    container.querySelector<HTMLElement>('.ae-day[tabindex="0"]')!.focus();
    await userEvent.keyboard("{ArrowRight}{Enter}");
    expect(model.value!.getDate()).toBe(23);
    await userEvent.keyboard("{ArrowRight} ");
    expect(model.value!.getDate()).toBe(24);
    expect(dayButton(container, /October 24/).classList.contains("ae-day--sel")).toBe(true);
    expect(dayButton(container, /October 23/).classList.contains("ae-day--sel")).toBe(false);
  });

  test("a click chooses a day, and a day of the next month in the grid moves the view", async () => {
    const { model, container } = await bound({ footer: false }, d(2026, 10, 22));
    dayButton(container, /October 3,/).click();
    expect(model.value!.getDate()).toBe(3);
    dayButton(container, /November 1,/).click();
    await sleep(30);
    expect(model.value!.getMonth()).toBe(10);
    expect(container.querySelector(".ae-cal-pick")!.textContent!.trim()).toBe("November 2026");
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
    const { container } = await render(AeCalendar, { props: { modelValue: d(2026, 10, 22), footer: false } });
    await page.getByRole("button", { name: "Next month" }).click();
    expect(container.querySelector(".ae-cal-pick")!.textContent!.trim()).toBe("November 2026");
    await page.getByRole("button", { name: "Previous month" }).click();
    await page.getByRole("button", { name: "Previous month" }).click();
    expect(container.querySelector(".ae-cal-pick")!.textContent!.trim()).toBe("September 2026");
  });

  test("one title button opens years, a year opens its months, a month opens its days", async () => {
    const { container } = await render(AeCalendar, {
      props: { modelValue: d(2026, 10, 22), month: d(2026, 10, 22), footer: false },
    });
    expect(container.querySelector(".ae-cal-pick")!.getAttribute("aria-label")).toBe(
      "Choose year and month, now October 2026",
    );
    container.querySelector<HTMLElement>(".ae-cal-pick")!.click();
    await sleep(30);
    expect(container.querySelector(".ae-cal-years")).not.toBeNull();
    expect(container.querySelector(".ae-cal-title")!.textContent).toMatch(/Choose a year/);
    expect(container.querySelector(".ae-cal-head button")!.getAttribute("aria-label")).toBe("Back to the days");
    expect(active().id).toMatch(/-y-2026$/);
    container.querySelector<HTMLElement>('[id$="-y-2027"]')!.click();
    await sleep(30);
    expect(container.querySelector(".ae-cal-cells")).not.toBeNull();
    expect(container.querySelector(".ae-cal-years")).toBeNull();
    expect(container.querySelector(".ae-cal-title")!.textContent).toMatch(/Choose a month in 2027/);
    expect(container.querySelector(".ae-cal-head button")!.getAttribute("aria-label")).toBe("Back to the years");
    expect(active().id).toMatch(/-m-9$/);
    container.querySelector<HTMLElement>(".ae-cal-head button")!.click();
    await sleep(30);
    expect(container.querySelector(".ae-cal-years")).not.toBeNull();
    container.querySelector<HTMLElement>('[id$="-y-2027"]')!.click();
    await sleep(30);
    container.querySelectorAll<HTMLElement>(".ae-cal-cell")[2]!.click();
    await sleep(30);
    expect(grid(container)).not.toBeNull();
    expect(container.querySelector(".ae-cal-pick")!.textContent!.trim()).toBe("March 2027");
    expect(active().getAttribute("aria-label")).toMatch(/March 22, 2027/);
  });

  test("the month is never set before the year: a date of birth is year, month, day", async () => {
    const { model, container } = await bound({ footer: false, min: d(1900, 1, 1), max: d(2026, 12, 31) }, null);
    container.querySelector<HTMLElement>(".ae-cal-pick")!.click();
    await sleep(30);
    container.querySelector<HTMLElement>('[id$="-y-1981"]')!.click();
    await sleep(30);
    container.querySelectorAll<HTMLElement>(".ae-cal-cell")[9]!.click();
    await sleep(30);
    dayButton(container, /October 22,/).click();
    expect(model.value).toEqual(d(1981, 10, 22));
  });

  test("years and months outside min and max are disabled", async () => {
    const { container } = await render(AeCalendar, {
      props: { modelValue: d(2026, 10, 22), min: d(2025, 3, 1), max: d(2027, 6, 30), footer: false },
    });
    container.querySelector<HTMLElement>(".ae-cal-pick")!.click();
    await sleep(30);
    expect(container.querySelector<HTMLButtonElement>('[id$="-y-2024"]')).toBeNull();
    expect(container.querySelector<HTMLButtonElement>('[id$="-y-2025"]')!.disabled).toBe(false);
    container.querySelector<HTMLElement>('[id$="-y-2025"]')!.click();
    await sleep(30);
    const cells = container.querySelectorAll<HTMLButtonElement>(".ae-cal-cell");
    expect(cells[1]!.disabled).toBe(true);
    expect(cells[2]!.disabled).toBe(false);
  });

  test("years and months move with the arrows, Home, End and Page keys; Enter chooses", async () => {
    const { container } = await render(AeCalendar, { props: { modelValue: d(2026, 10, 22), footer: false } });
    container.querySelector<HTMLElement>(".ae-cal-pick")!.click();
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
    const { container } = await render(AeCalendar, { props: { modelValue: d(2026, 10, 22), footer: false } });
    container.querySelector<HTMLElement>(".ae-cal-pick")!.click();
    await sleep(30);
    await userEvent.keyboard("{Escape}");
    await sleep(30);
    expect(grid(container)).not.toBeNull();
    expect(active().getAttribute("aria-label")).toMatch(/October 22, 2026/);
  });

  test("Escape on the days is left alone so a popup can close", async () => {
    const { container } = await render(AeCalendar, { props: { modelValue: d(2026, 10, 22), footer: false } });
    const seen: boolean[] = [];
    document.addEventListener("keydown", (e) => seen.push(e.defaultPrevented), { once: true });
    container.querySelector<HTMLElement>('.ae-day[tabindex="0"]')!.focus();
    await userEvent.keyboard("{Escape}");
    expect(seen).toEqual([false]);
  });

  test("the title announces politely, so a changed month is heard", async () => {
    const { container } = await render(AeCalendar, { props: { modelValue: d(2026, 10, 22) } });
    expect(container.querySelector(".ae-cal-title")!.getAttribute("aria-live")).toBe("polite");
  });

  test("Today moves to and chooses today; Clear shows only with a listener", async () => {
    const { model, container } = await bound({}, d(2020, 1, 15));
    expect(container.querySelector(".ae-cal-foot")!.textContent).toMatch(/Today/);
    expect(container.querySelector(".ae-cal-foot")!.textContent).not.toMatch(/Clear/);
    await page.getByRole("button", { name: "Today" }).click();
    const now = new Date();
    expect(model.value!.getFullYear()).toBe(now.getFullYear());
    expect(model.value!.getDate()).toBe(now.getDate());

    let cleared = 0;
    await render(AeCalendar, { props: { modelValue: d(2026, 10, 22), onClear: () => cleared++ } });
    await page.getByRole("button", { name: "Clear" }).click();
    expect(cleared).toBe(1);
  });

  test("footer false hides Today and Clear", async () => {
    const { container } = await render(AeCalendar, { props: { footer: false, onClear: () => {} } });
    expect(container.querySelector(".ae-cal-foot")).toBeNull();
  });

  test("range mode: the first click sets the start, the second the end, clicking before the start restarts", async () => {
    const start = ref<Date | null>(null);
    const end = ref<Date | null>(null);
    const spans: unknown[] = [];
    const { container } = await render(
      defineComponent({
        render: () =>
          h(AeCalendar as Component, {
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
    const help = () => container.querySelector(".ae-cal-help")!.textContent;
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
    expect(container.querySelectorAll(".ae-cal-in")).toHaveLength(7);
    expect(dayButton(container, /October 10,/).classList.contains("ae-day--sel")).toBe(true);
    expect(dayButton(container, /October 18,/).classList.contains("ae-day--sel")).toBe(true);
    dayButton(container, /October 25,/).click();
    await sleep(30);
    expect(start.value!.getDate()).toBe(25);
    expect(end.value).toBeNull();
  });

  test("range mode previews the span while the pointer moves over days", async () => {
    const { container } = await render(AeCalendar, {
      props: { mode: "range", start: d(2026, 10, 10), end: null, month: d(2026, 10, 1), footer: false },
    });
    dayButton(container, /October 14,/).dispatchEvent(new MouseEvent("mouseenter"));
    await sleep(30);
    expect(container.querySelectorAll(".ae-cal-in")).toHaveLength(3);
  });

  test("locale: de-DE starts on Monday and names the month in German", async () => {
    const { container } = await render(AeCalendar, {
      props: { modelValue: d(2026, 10, 22), footer: false },
      global: plugin({ locale: "de-DE" }),
    });
    expect(container.querySelector("th")!.textContent!.trim()).toBe("Mo");
    expect(container.querySelector(".ae-cal-pick")!.textContent!.trim()).toBe("Oktober 2026");
    expect(dayButton(container, /22/).getAttribute("aria-label")).toMatch(/Donnerstag/);
  });

  test("locale: en-GB starts on Monday and writes the day first", async () => {
    const { container } = await render(AeCalendar, {
      props: { modelValue: d(2026, 10, 22), footer: false },
      global: plugin({ locale: "en-GB" }),
    });
    expect(container.querySelector("th")!.textContent!.trim()).toBe("Mo");
    expect(container.querySelector("th:last-child")!.textContent!.trim()).toBe("Su");
    expect(container.querySelector(".ae-day")!.getAttribute("aria-label")).toMatch(/^Monday,? 28 September 2026$/);
  });

  test("a locale change re-renders names and week start without remounting", async () => {
    const aegis = createAegis({ themeTarget: null });
    const { container } = await render(AeCalendar, {
      props: { modelValue: d(2026, 10, 22), footer: false },
      global: { plugins: [aegis] },
    });
    expect(container.querySelector("th")!.textContent!.trim()).toBe("Su");
    aegis.config.locale = "fr-FR";
    await sleep(30);
    expect(container.querySelector("th")!.textContent!.trim()).toMatch(/^lu/);
    expect(container.querySelector(".ae-cal-pick")!.textContent!.trim()).toBe("octobre 2026");
  });

  test("right to left (Hebrew): the grid mirrors and ArrowRight goes to the previous day", async () => {
    const { container } = await render(AeCalendar, {
      props: { modelValue: d(2026, 10, 22), footer: false },
      global: plugin({ locale: "he-IL", dir: "rtl" }),
    });
    const root = container.querySelector<HTMLElement>(".ae-cal")!;
    expect(root.getAttribute("dir")).toBe("rtl");
    expect(getComputedStyle(root).direction).toBe("rtl");
    const first = container.querySelector("th")!.getBoundingClientRect();
    const last = container.querySelector("th:last-child")!.getBoundingClientRect();
    expect(first.left).toBeGreaterThan(last.left);
    container.querySelector<HTMLElement>('.ae-day[tabindex="0"]')!.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(active().textContent!.trim()).toBe("21");
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(active().textContent!.trim()).toBe("23");
  });

  test("works without the plugin, and class and style land on the root", async () => {
    const { container } = await render(AeCalendar, {
      props: { modelValue: d(2026, 10, 22) },
      attrs: { class: "mine", style: "margin-top: 4px", "data-x": "1" },
    });
    const root = container.querySelector(".ae-cal")!;
    expect(root.classList.contains("mine")).toBe(true);
    expect(root.getAttribute("data-x")).toBe("1");
    expect(root.getAttribute("style")).toContain("margin-top");
  });

  test("message overrides reach the labels", async () => {
    await render(AeCalendar, {
      props: { modelValue: d(2026, 10, 22) },
      global: plugin({ messages: { prevMonth: "Mois precedent", today: "Aujourd'hui" } }),
    });
    await expect.element(page.getByRole("button", { name: "Mois precedent" })).toBeVisible();
    await expect.element(page.getByRole("button", { name: "Aujourd'hui" })).toBeVisible();
  });

  test("has no accessibility violations in any view or mode", async () => {
    const days = await render(AeCalendar, {
      props: { modelValue: d(2026, 10, 22), marked: [d(2026, 10, 23)], disabledDate: (x: Date) => x.getDay() === 0 },
    });
    await expectNoViolations(days.container);
    const limits = await render(AeCalendar, {
      props: { min: d(2026, 10, 10), max: d(2026, 10, 20), month: d(2026, 10, 1) },
    });
    await expectNoViolations(limits.container);
    const spanned = await render(AeCalendar, {
      props: { mode: "range", start: d(2026, 10, 10), end: d(2026, 10, 18), footer: false },
    });
    await expectNoViolations(spanned.container);
    const years = await render(AeCalendar, { props: { modelValue: d(2026, 10, 22) } });
    years.container.querySelector<HTMLElement>(".ae-cal-pick")!.click();
    await sleep(30);
    await expectNoViolations(years.container);
    years.container.querySelector<HTMLElement>('[id$="-y-2027"]')!.click();
    await sleep(30);
    await expectNoViolations(years.container);
  });
});
