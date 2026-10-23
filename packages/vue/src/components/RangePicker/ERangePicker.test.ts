import { describe, expect, test } from "vitest";
import { defineComponent, h, ref, type Component } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ERangePicker from "./ERangePicker.vue";
import { createEos } from "../../plugin.js";
import { expectNoViolations } from "../../../test/axe.js";

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day, 12);
const plugin = (options: Parameters<typeof createEos>[0]) => ({
  plugins: [createEos({ themeTarget: null, ...options })],
});
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const active = () => document.activeElement as HTMLElement;
const panel = () => document.querySelector<HTMLElement>(".e-calpanel");
const days = () => [...document.querySelectorAll<HTMLButtonElement>(".e-calpanel .e-day:not(.e-day--out)")];
const setText = async (input: HTMLInputElement, value: string) => {
  input.focus();
  await userEvent.clear(input);
  await userEvent.type(input, value);
};

async function bound(
  props: Record<string, unknown>,
  initial: { start: Date | null; end: Date | null } = { start: null, end: null },
  global = {},
) {
  const start = ref<Date | null>(initial.start);
  const end = ref<Date | null>(initial.end);
  const result = await render(
    defineComponent({
      render: () =>
        h(ERangePicker as Component, {
          ...props,
          start: start.value,
          end: end.value,
          "onUpdate:start": (v: Date | null) => (start.value = v),
          "onUpdate:end": (v: Date | null) => (end.value = v),
        }),
    }),
    { global },
  );
  return { start, end, ...result };
}

describe("ERangePicker", () => {
  test("is a group named by the label with two date boxes and a calendar button", async () => {
    const { container } = await render(ERangePicker, { props: { label: "Stay" } });
    await expect.element(page.getByRole("group", { name: "Stay" })).toBeVisible();
    await expect.element(page.getByRole("textbox", { name: "Start date" })).toBeVisible();
    await expect.element(page.getByRole("textbox", { name: "End date" })).toBeVisible();
    const button = page.getByRole("button", { name: "Choose dates" });
    await expect.element(button).toBeVisible();
    expect(button.element().getAttribute("aria-haspopup")).toBe("dialog");
    expect(container.querySelector(".e-range-sep")!.textContent).toBe("to");
    expect(container.querySelector(".e-input-wrap")!.className).toBe("e-input-wrap e-combo e-rangefield");
    expect(container.querySelector("label")!.getAttribute("for")).toBe(container.querySelector("input")!.id);
  });

  test("two day clicks set the range and close the calendar", async () => {
    const { start, end } = await bound({ label: "Dates" });
    await page.getByRole("button", { name: "Choose dates" }).click();
    await sleep(80);
    days()[4]!.click();
    await sleep(30);
    expect(panel()).not.toBeNull();
    expect(start.value).toBeNull();
    days()[10]!.click();
    await sleep(80);
    expect(start.value).not.toBeNull();
    expect(end.value!.getTime()).toBeGreaterThan(start.value!.getTime());
    expect(panel()).toBeNull();
  });

  test("clicking before the start restarts the range", async () => {
    const { start, end } = await bound({ label: "Dates" });
    await page.getByRole("button", { name: "Choose dates" }).click();
    await sleep(80);
    days()[10]!.click();
    await sleep(30);
    days()[4]!.click();
    await sleep(30);
    expect(panel()).not.toBeNull();
    days()[6]!.click();
    await sleep(80);
    expect(start.value!.getDate()).toBe(5);
    expect(end.value!.getDate()).toBe(7);
  });

  test("the calendar shows what to do next, then the span", async () => {
    await bound({ label: "Dates" });
    await page.getByRole("button", { name: "Choose dates" }).click();
    await sleep(80);
    expect(document.querySelector(".e-cal-help")!.textContent).toBe("Choose a start date");
    days()[4]!.click();
    await sleep(30);
    expect(document.querySelector(".e-cal-help")!.textContent).toMatch(/^Starts .+\. Now choose an end date$/);
  });

  test("it opens on the chosen start with the keyboard and Escape closes it", async () => {
    const { container } = await bound({ label: "Dates" }, { start: d(2026, 10, 10), end: d(2026, 10, 18) });
    container.querySelector("input")!.focus();
    await userEvent.keyboard("{Alt>}{ArrowDown}{/Alt}");
    await sleep(80);
    expect(panel()!.getAttribute("role")).toBe("dialog");
    expect(panel()!.getAttribute("aria-label")).toBe("Choose dates");
    expect(active().getAttribute("aria-label")).toMatch(/October 10, 2026/);
    expect(panel()!.classList.contains("e-root")).toBe(true);
    await userEvent.keyboard("{Escape}");
    await sleep(80);
    expect(panel()).toBeNull();
  });

  test("keyboard: arrows and Enter choose a span", async () => {
    const { start, end, container } = await bound({ label: "Dates" }, { start: d(2026, 10, 10), end: null });
    container.querySelector("input")!.focus();
    await userEvent.keyboard("{Alt>}{ArrowDown}{/Alt}");
    await sleep(80);
    await userEvent.keyboard("{ArrowRight}{ArrowRight}{Enter}");
    await sleep(80);
    expect(start.value).toEqual(d(2026, 10, 10));
    expect(end.value).toEqual(d(2026, 10, 12));
    expect(panel()).toBeNull();
  });

  test("presets choose a span at once; the defaults are last 7 days, last 30 days and this month", async () => {
    const { start, end } = await bound({ label: "Dates" });
    await page.getByRole("button", { name: "Choose dates" }).click();
    await sleep(80);
    const labels = [...document.querySelectorAll(".e-cal-presets .e-btn")].map((b) => b.textContent!.trim());
    expect(labels).toEqual(["Last 7 days", "Last 30 days", "This month"]);
    await page.getByRole("button", { name: "Last 7 days" }).click();
    await sleep(80);
    const today = new Date();
    expect(end.value!.getDate()).toBe(today.getDate());
    expect(Math.round((end.value!.getTime() - start.value!.getTime()) / 864e5)).toBe(6);
    expect(panel()).toBeNull();
  });

  test("custom presets replace the defaults", async () => {
    const { start, end } = await bound({
      label: "Dates",
      presets: [{ label: "Q4", get: () => ({ start: d(2026, 10, 1), end: d(2026, 12, 31) }) }],
    });
    await page.getByRole("button", { name: "Choose dates" }).click();
    await sleep(80);
    expect(document.querySelectorAll(".e-cal-presets .e-btn")).toHaveLength(1);
    await page.getByRole("button", { name: "Q4" }).click();
    await sleep(80);
    expect(start.value).toEqual(d(2026, 10, 1));
    expect(end.value).toEqual(d(2026, 12, 31));
  });

  test("typing in either box works like DatePicker, and the hidden fields submit YYYY-MM-DD", async () => {
    const { start, end, container } = await bound({ label: "Dates", startName: "from", endName: "to" });
    const [a, b] = container.querySelectorAll<HTMLInputElement>(".e-combo-input");
    await setText(a!, "10/04/2026");
    await setText(b!, "10-18-2026");
    b!.blur();
    await sleep(30);
    expect(start.value).toEqual(d(2026, 10, 4));
    expect(end.value).toEqual(d(2026, 10, 18));
    expect(a!.value).toBe("10/04/2026");
    expect(b!.value).toBe("10/18/2026");
    const hidden = container.querySelectorAll<HTMLInputElement>("input[type=hidden]");
    expect([...hidden].map((i) => [i.name, i.value])).toEqual([
      ["from", "2026-10-04"],
      ["to", "2026-10-18"],
    ]);
  });

  test("a bad date or an end before the start shows an error and leaves the value alone", async () => {
    const { start, end, container } = await bound({ label: "Dates" }, { start: d(2026, 10, 4), end: d(2026, 10, 18) });
    const [a, b] = container.querySelectorAll<HTMLInputElement>(".e-combo-input");
    await setText(b!, "99/99/2026");
    b!.blur();
    await sleep(30);
    expect(container.querySelector(".e-field-error")!.textContent).toMatch(/Enter dates as MM\/DD\/YYYY\./);
    expect(a!.getAttribute("aria-invalid")).toBe("true");
    expect(b!.getAttribute("aria-invalid")).toBe("true");
    expect(container.querySelector(".e-input-wrap")!.hasAttribute("data-invalid")).toBe(true);
    await setText(b!, "10/01/2026");
    b!.blur();
    await sleep(30);
    expect(container.querySelector(".e-field-error")!.textContent).toMatch(/The end date is before the start date\./);
    expect(start.value).toEqual(d(2026, 10, 4));
    expect(end.value).toEqual(d(2026, 10, 18));
  });

  test("a typed date outside min and max shows the dateBetween message", async () => {
    const { container } = await bound({ label: "Dates", min: d(2026, 1, 1), max: d(2026, 12, 31) });
    const [a] = container.querySelectorAll<HTMLInputElement>(".e-combo-input");
    await setText(a!, "06/15/2030");
    a!.blur();
    await sleep(30);
    expect(container.querySelector(".e-field-error")!.textContent).toMatch(/Choose a date between 01\/01\/2026/);
  });

  test("min and max reach the calendar", async () => {
    await bound({ label: "Dates", min: d(2026, 10, 10), max: d(2026, 10, 20) }, { start: d(2026, 10, 12), end: null });
    await page.getByRole("button", { name: "Choose dates" }).click();
    await sleep(80);
    expect(days()[0]!.disabled).toBe(true);
    expect(days()[14]!.disabled).toBe(false);
  });

  test("the hint sits 8px under the control", async () => {
    const { container } = await render(ERangePicker, { props: { label: "Dates", hint: "Up to 90 days." } });
    const control = container.querySelector(".e-input-wrap")!.getBoundingClientRect();
    const hint = container.querySelector(".e-field-hint")!.getBoundingClientRect();
    expect(Math.round(hint.top - control.bottom)).toBe(8);
    expect(container.querySelector("input")!.getAttribute("aria-describedby")).toBe(
      container.querySelector(".e-field-hint")!.id,
    );
  });

  test("disabled disables both boxes and the button", async () => {
    const { container } = await render(ERangePicker, { props: { label: "Dates", disabled: true } });
    for (const i of container.querySelectorAll("input")) expect(i.disabled).toBe(true);
    await expect.element(page.getByRole("button", { name: "Choose dates" })).toBeDisabled();
    expect(container.querySelector(".e-input-wrap")!.hasAttribute("data-disabled")).toBe(true);
  });

  test("a disabled field does not submit its hidden inputs", async () => {
    const { container } = await bound(
      { label: "Dates", disabled: true, startName: "from", endName: "to" },
      { start: d(2026, 10, 4), end: d(2026, 10, 18) },
    );
    const form = document.createElement("form");
    for (const i of container.querySelectorAll<HTMLInputElement>("input[type=hidden]")) {
      expect(i.disabled).toBe(true);
      form.append(i);
    }
    expect([...new FormData(form).keys()]).toEqual([]);
  });

  test("readonly shows the span, keeps the boxes focusable, never opens, and still submits", async () => {
    const { container, start } = await bound(
      { label: "Dates", readonly: true, open: true, startName: "from", endName: "to" },
      { start: d(2026, 10, 4), end: d(2026, 10, 18) },
    );
    await sleep(80);
    expect(panel()).toBeNull();
    const [a, b] = container.querySelectorAll<HTMLInputElement>(".e-combo-input");
    expect([a!.readOnly, b!.readOnly, a!.disabled]).toEqual([true, true, false]);
    expect(a!.value).toBe("10/04/2026");
    await expect.element(page.getByRole("button", { name: "Choose dates" })).toBeDisabled();
    expect(container.querySelector(".e-input-wrap")!.hasAttribute("data-readonly")).toBe(true);
    a!.focus();
    expect(active()).toBe(a);
    await userEvent.keyboard("{Alt>}{ArrowDown}{/Alt}");
    await sleep(80);
    expect(panel()).toBeNull();
    const form = document.createElement("form");
    for (const i of container.querySelectorAll<HTMLInputElement>("input[type=hidden]")) form.append(i);
    expect([...new FormData(form).entries()]).toEqual([
      ["from", "2026-10-04"],
      ["to", "2026-10-18"],
    ]);
    expect(start.value).toEqual(d(2026, 10, 4));
  });

  test("a date before only min names just that bound", async () => {
    const { container } = await bound({ label: "Dates", min: d(2026, 1, 1) });
    const [a] = container.querySelectorAll<HTMLInputElement>(".e-combo-input");
    await setText(a!, "06/15/2020");
    a!.blur();
    await sleep(30);
    expect(container.querySelector(".e-field-error")!.textContent).toMatch("Choose a date on or after 01/01/2026.");
  });

  test("valueFormat iso: start and end are YYYY-MM-DD strings or null", async () => {
    const start = ref<string | null>("2026-10-04");
    const end = ref<string | null>(null);
    const { container } = await render(
      defineComponent({
        render: () =>
          h(ERangePicker as Component, {
            label: "Dates",
            valueFormat: "iso",
            startName: "from",
            start: start.value,
            end: end.value,
            "onUpdate:start": (v: string | null) => (start.value = v),
            "onUpdate:end": (v: string | null) => (end.value = v),
          }),
      }),
    );
    const [a, b] = container.querySelectorAll<HTMLInputElement>(".e-combo-input");
    expect(a!.value).toBe("10/04/2026");
    await setText(b!, "10/18/2026");
    b!.blur();
    await expect.poll(() => end.value).toBe("2026-10-18");
    expect(start.value).toBe("2026-10-04");
    start.value = "2026-10-06";
    await expect.poll(() => a!.value).toBe("10/06/2026");
    expect(container.querySelector<HTMLInputElement>("input[type=hidden]")!.value).toBe("2026-10-06");
  });

  test("the popup follows the locale's direction with no dir option", async () => {
    await bound({ label: "Dates", open: true }, { start: null, end: null }, plugin({ locale: "he-IL" }));
    await expect.poll(() => panel()).not.toBeNull();
    expect(panel()!.getAttribute("dir")).toBe("rtl");
  });

  test("class and style land on the wrapper, other attributes on the control", async () => {
    const { container } = await render(ERangePicker, {
      props: { label: "Dates" },
      attrs: { class: "mine", style: "margin-top: 4px", "data-x": "1" },
    });
    expect(container.querySelector(".e-field")!.classList.contains("mine")).toBe(true);
    expect(container.querySelector(".e-input-wrap")!.getAttribute("data-x")).toBe("1");
  });

  test("v-model round trip: outside changes rewrite both boxes", async () => {
    const { start, end, container } = await bound({ label: "Dates" });
    start.value = d(2027, 1, 2);
    end.value = d(2027, 1, 9);
    await sleep(40);
    const [a, b] = container.querySelectorAll<HTMLInputElement>(".e-combo-input");
    expect([a!.value, b!.value]).toEqual(["01/02/2027", "01/09/2027"]);
  });

  test("locale: de-DE writes DD.MM.YYYY and names the months in German in the calendar", async () => {
    const { container } = await bound(
      { label: "Zeitraum" },
      { start: d(2026, 10, 4), end: d(2026, 10, 18) },
      plugin({ locale: "de-DE" }),
    );
    const [a, b] = container.querySelectorAll<HTMLInputElement>(".e-combo-input");
    expect([a!.value, b!.value]).toEqual(["04.10.2026", "18.10.2026"]);
    await page.getByRole("button", { name: "Choose dates" }).click();
    await sleep(80);
    expect(document.querySelector(".e-cal-pick")!.textContent!.trim()).toBe("Oktober 2026");
  });

  test("locale: en-GB reads day first; he-IL (right to left) formats and mirrors", async () => {
    const gb = await bound({ label: "Dates" }, { start: d(2026, 10, 4), end: null }, plugin({ locale: "en-GB" }));
    expect(gb.container.querySelector<HTMLInputElement>(".e-combo-input")!.value).toBe("04/10/2026");
    const he = await bound(
      { label: "טווח" },
      { start: d(2026, 10, 4), end: d(2026, 10, 18) },
      plugin({ locale: "he-IL", dir: "rtl" }),
    );
    const inputs = he.container.querySelectorAll<HTMLInputElement>(".e-combo-input");
    expect(inputs[0]!.value).toBe("04.10.2026");
    const wrap = he.container.querySelector(".e-input-wrap")!;
    expect(wrap.querySelector(".e-range-sep")).not.toBeNull();
  });

  test("has no accessibility violations: closed, invalid, disabled, open", async () => {
    const closed = await render(ERangePicker, {
      props: { label: "Dates", hint: "Any span.", start: d(2026, 10, 4), end: d(2026, 10, 18) },
    });
    await expectNoViolations(closed.container);
    const invalid = await render(ERangePicker, { props: { label: "Dates b", error: "Choose dates." } });
    await expectNoViolations(invalid.container);
    const off = await render(ERangePicker, { props: { label: "Dates c", disabled: true } });
    await expectNoViolations(off.container);
    await render(ERangePicker, { props: { label: "Dates d", start: d(2026, 10, 4), end: d(2026, 10, 18) } });
    await page.getByRole("button", { name: "Choose dates" }).nth(3).click();
    await sleep(80);
    expect(panel()).not.toBeNull();
    await expectNoViolations(document.body);
  });
});
