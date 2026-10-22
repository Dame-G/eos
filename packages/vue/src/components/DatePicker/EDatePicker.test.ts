import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref, type Component } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EDatePicker from "./EDatePicker.vue";
import { createEos } from "../../plugin.js";
import { expectNoViolations } from "../../../test/axe.js";

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day, 12);
const plugin = (options: Parameters<typeof createEos>[0]) => ({
  plugins: [createEos({ themeTarget: null, ...options })],
});
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const active = () => document.activeElement as HTMLElement;
const panel = () => document.querySelector<HTMLElement>(".e-calpanel");
const day = (label: RegExp) =>
  [...document.querySelectorAll<HTMLButtonElement>(".e-calpanel .e-day")].find((b) =>
    label.test(b.getAttribute("aria-label") ?? ""),
  )!;
const setText = async (input: HTMLInputElement, value: string) => {
  input.focus();
  await userEvent.clear(input);
  await userEvent.type(input, value);
};

async function bound(props: Record<string, unknown>, initial: Date | null, global = {}) {
  const model = ref<Date | null>(initial);
  const result = await render(
    defineComponent({
      render: () =>
        h(EDatePicker as Component, {
          ...props,
          modelValue: model.value,
          "onUpdate:modelValue": (v: Date | null) => (model.value = v),
        }),
    }),
    { global },
  );
  return { model, ...result };
}

describe("EDatePicker", () => {
  test("readonly keeps the date, disables the calendar button and never opens", async () => {
    const { model, container } = await bound({ label: "Date", readonly: true, open: true }, d(2026, 10, 22));
    const input = container.querySelector("input")!;
    expect(input.readOnly).toBe(true);
    expect(container.querySelector(".e-input-wrap")!.hasAttribute("data-readonly")).toBe(true);
    await expect.element(page.getByRole("button", { name: "Choose date" })).toBeDisabled();
    input.focus();
    await userEvent.keyboard("{Alt>}{ArrowDown}{/Alt}");
    await sleep(80);
    expect(panel()).toBeNull();
    expect(model.value).toEqual(d(2026, 10, 22));
  });

  test("is a text box named by its label, with the format as the placeholder and a calendar button", async () => {
    const { container } = await render(EDatePicker, { props: { label: "Date of birth" } });
    const input = page.getByRole("textbox", { name: "Date of birth" });
    await expect.element(input).toBeVisible();
    expect(container.querySelector("input")!.placeholder).toBe("MM/DD/YYYY");
    const button = page.getByRole("button", { name: "Choose date" });
    await expect.element(button).toBeVisible();
    expect(button.element().getAttribute("aria-haspopup")).toBe("dialog");
    expect(button.element().getAttribute("aria-expanded")).toBe("false");
    expect(container.querySelector(".e-input-wrap")!.className).toBe("e-input-wrap e-combo");
    expect(container.querySelector("input")!.className).toBe("e-input e-combo-input");
    expect(container.querySelector("input")!.autocomplete).toBe("off");
  });

  test("a typed date parses to a Date, the form gets YYYY-MM-DD, and the text is rewritten in the standard form", async () => {
    const { model, container } = await bound({ label: "Date of birth", name: "dob" }, null);
    const input = container.querySelector<HTMLInputElement>(".e-combo-input")!;
    await setText(input, "10-22-1981");
    input.blur();
    await sleep(30);
    expect(model.value).toEqual(d(1981, 10, 22));
    expect(input.value).toBe("10/22/1981");
    expect(container.querySelector<HTMLInputElement>("input[type=hidden]")!.name).toBe("dob");
    expect(container.querySelector<HTMLInputElement>("input[type=hidden]")!.value).toBe("1981-10-22");
  });

  test("Enter commits the typed date", async () => {
    const { model, container } = await bound({ label: "Date" }, null);
    await setText(container.querySelector("input")!, "01/02/2030");
    await userEvent.keyboard("{Enter}");
    expect(model.value).toEqual(d(2030, 1, 2));
  });

  test("a bad date shows an error, marks the box invalid and leaves the value alone", async () => {
    const { model, container } = await bound({ label: "Date of birth", hint: "As on your card." }, d(2026, 10, 22));
    const input = container.querySelector<HTMLInputElement>(".e-combo-input")!;
    await setText(input, "13/45/2020");
    input.blur();
    await sleep(30);
    const error = container.querySelector(".e-field-error")!;
    expect(error.textContent).toMatch(/Enter a date as MM\/DD\/YYYY\./);
    expect(error.getAttribute("role")).toBe("alert");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe(error.id);
    expect(container.querySelector(".e-input-wrap")!.hasAttribute("data-invalid")).toBe(true);
    expect(container.querySelector(".e-field-hint")).toBeNull();
    expect(model.value).toEqual(d(2026, 10, 22));
    await userEvent.type(input, "1");
    expect(container.querySelector(".e-field-error")).toBeNull();
    expect(container.querySelector(".e-field-hint")!.textContent).toBe("As on your card.");
  });

  test("a date outside min and max shows the dateBetween message", async () => {
    const { container } = await bound({ label: "Date", min: d(2026, 1, 1), max: d(2026, 12, 31) }, null);
    const input = container.querySelector<HTMLInputElement>(".e-combo-input")!;
    await setText(input, "06/15/2030");
    input.blur();
    await sleep(30);
    expect(container.querySelector(".e-field-error")!.textContent).toMatch(
      /Choose a date between 01\/01\/2026 and 12\/31\/2026\./,
    );
  });

  test("emptying the box clears the value", async () => {
    const { model, container } = await bound({ label: "Date" }, d(2026, 10, 22));
    const input = container.querySelector<HTMLInputElement>(".e-combo-input")!;
    expect(input.value).toBe("10/22/2026");
    input.focus();
    await userEvent.clear(input);
    input.blur();
    await sleep(30);
    expect(model.value).toBeNull();
  });

  test("an error from the consumer wins over a typed one", async () => {
    const { container } = await render(EDatePicker, { props: { label: "Date", error: "Pick a date." } });
    expect(container.querySelector(".e-field-error")!.textContent).toMatch(/Pick a date\./);
    expect(container.querySelector("input")!.getAttribute("aria-invalid")).toBe("true");
  });

  test("v-model: a changed value outside rewrites the text", async () => {
    const { model, container } = await bound({ label: "Date" }, null);
    model.value = d(2027, 3, 5);
    await nextTick();
    await sleep(10);
    expect(container.querySelector<HTMLInputElement>(".e-combo-input")!.value).toBe("03/05/2027");
  });

  test("the button opens a calendar dialog on the selected day; choosing a day closes it and returns focus to the box", async () => {
    const { model, container } = await bound({ label: "Date" }, d(2026, 10, 22));
    await page.getByRole("button", { name: "Choose date" }).click();
    await sleep(80);
    const dialog = panel()!;
    expect(dialog.getAttribute("role")).toBe("dialog");
    expect(dialog.getAttribute("aria-label")).toBe("Choose date");
    expect(dialog.classList.contains("e-root")).toBe(true);
    expect(container.contains(dialog)).toBe(false);
    expect(page.getByRole("button", { name: "Choose date" }).element().getAttribute("aria-expanded")).toBe("true");
    expect(active().getAttribute("aria-label")).toMatch(/October 22, 2026/);
    day(/October 23,/).click();
    await sleep(80);
    expect(model.value).toEqual(d(2026, 10, 23));
    expect(panel()).toBeNull();
    expect(active()).toBe(container.querySelector(".e-combo-input"));
    expect(container.querySelector<HTMLInputElement>(".e-combo-input")!.value).toBe("10/23/2026");
  });

  test("Alt+Down opens the calendar; Escape closes it and focus returns to the text box", async () => {
    const { container } = await bound({ label: "Date" }, d(2026, 10, 22));
    container.querySelector<HTMLInputElement>(".e-combo-input")!.focus();
    await userEvent.keyboard("{Alt>}{ArrowDown}{/Alt}");
    await sleep(80);
    expect(panel()).not.toBeNull();
    expect(active().getAttribute("aria-label")).toMatch(/October 22, 2026/);
    await userEvent.keyboard("{ArrowRight}{Enter}");
    await sleep(80);
    expect(panel()).toBeNull();
    container.querySelector<HTMLInputElement>(".e-combo-input")!.focus();
    await userEvent.keyboard("{Alt>}{ArrowDown}{/Alt}");
    await sleep(80);
    await userEvent.keyboard("{Escape}");
    await sleep(80);
    expect(panel()).toBeNull();
    expect(active()).toBe(container.querySelector(".e-combo-input"));
  });

  test("Escape inside the years goes back to the days first, a second Escape closes", async () => {
    await bound({ label: "Date" }, d(2026, 10, 22));
    await page.getByRole("button", { name: "Choose date" }).click();
    await sleep(80);
    (document.querySelector(".e-cal-pick") as HTMLElement).click();
    await sleep(40);
    expect(document.querySelector(".e-cal-years")).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await sleep(80);
    expect(panel()).not.toBeNull();
    expect(document.querySelector("table")).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await sleep(80);
    expect(panel()).toBeNull();
  });

  test("Clear empties the field and closes; Today chooses today", async () => {
    const { model, container } = await bound({ label: "Date" }, d(2026, 10, 22));
    await page.getByRole("button", { name: "Choose date" }).click();
    await sleep(80);
    await page.getByRole("button", { name: "Clear" }).click();
    await sleep(80);
    expect(model.value).toBeNull();
    expect(container.querySelector<HTMLInputElement>(".e-combo-input")!.value).toBe("");
    await page.getByRole("button", { name: "Choose date" }).click();
    await sleep(80);
    await page.getByRole("button", { name: "Today" }).click();
    await sleep(80);
    const now = new Date();
    expect(model.value!.getFullYear()).toBe(now.getFullYear());
    expect(model.value!.getDate()).toBe(now.getDate());
  });

  test("min and max reach the calendar", async () => {
    await bound({ label: "Date", min: d(2026, 10, 10), max: d(2026, 10, 20) }, d(2026, 10, 12));
    await page.getByRole("button", { name: "Choose date" }).click();
    await sleep(80);
    expect(day(/October 9,/).disabled).toBe(true);
    expect(day(/October 21,/).disabled).toBe(true);
    expect(day(/October 15,/).disabled).toBe(false);
  });

  test("clicking outside closes the calendar", async () => {
    await bound({ label: "Date" }, d(2026, 10, 22));
    await page.getByRole("button", { name: "Choose date" }).click();
    await sleep(80);
    document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    await sleep(80);
    expect(panel()).toBeNull();
  });

  test("the popup renders in the configured portal target, which carries a scoped theme", async () => {
    const host = document.createElement("div");
    host.id = "theme-host";
    document.body.append(host);
    await render(EDatePicker, {
      props: { label: "Date", modelValue: d(2026, 10, 22) },
      global: plugin({ portalTarget: "#theme-host" }),
    });
    await page.getByRole("button", { name: "Choose date" }).click();
    await sleep(80);
    expect(host.contains(panel())).toBe(true);
    host.remove();
  });

  test("disabled: the box and the button are disabled, dashed, and the calendar cannot open", async () => {
    const { container } = await render(EDatePicker, { props: { label: "Date", disabled: true } });
    expect(container.querySelector("input")!.disabled).toBe(true);
    await expect.element(page.getByRole("button", { name: "Choose date" })).toBeDisabled();
    expect(container.querySelector(".e-input-wrap")!.hasAttribute("data-disabled")).toBe(true);
    await userEvent.keyboard("{Alt>}{ArrowDown}{/Alt}");
    expect(panel()).toBeNull();
  });

  test("required adds the word and the attribute; hideLabel keeps the name", async () => {
    const { container } = await render(EDatePicker, { props: { label: "Start", required: true, hideLabel: true } });
    expect(container.querySelector(".e-field-flag")!.textContent).toBe("Required");
    expect(container.querySelector("input")!.required).toBe(true);
    expect(container.querySelector("label")!.classList.contains("e-sr")).toBe(true);
    await expect.element(page.getByRole("textbox", { name: /Start/ })).toBeVisible();
  });

  test("the hint sits 8px under the control, the same gap as the label above", async () => {
    const { container } = await render(EDatePicker, { props: { label: "Date", hint: "Any day this year." } });
    const control = container.querySelector(".e-input-wrap")!.getBoundingClientRect();
    const hint = container.querySelector(".e-field-hint")!.getBoundingClientRect();
    expect(Math.round(hint.top - control.bottom)).toBe(8);
    const label = container.querySelector("label")!.getBoundingClientRect();
    expect(Math.round(control.top - label.bottom)).toBe(8);
  });

  test("attributes fall through: class and style on the wrapper, the rest on the input, listeners too", async () => {
    const seen: string[] = [];
    const { container } = await render(EDatePicker, {
      props: { label: "Date" },
      attrs: { class: "mine", style: "margin-top: 4px", "data-x": "1", onFocus: () => seen.push("focus") },
    });
    expect(container.querySelector(".e-field")!.classList.contains("mine")).toBe(true);
    expect(container.querySelector("input")!.getAttribute("data-x")).toBe("1");
    expect(container.querySelector(".e-field")!.getAttribute("data-x")).toBeNull();
    container.querySelector("input")!.focus();
    expect(seen).toEqual(["focus"]);
  });

  test("an id from the consumer is the text box's id", async () => {
    const { container } = await render(EDatePicker, { props: { label: "Date", id: "mine" } });
    expect(container.querySelector("input")!.id).toBe("mine");
    expect(container.querySelector("label")!.getAttribute("for")).toBe("mine");
  });

  test("locale: de-DE writes and reads 22.10.2026 and shows DD.MM.YYYY", async () => {
    const { model, container } = await bound({ label: "Datum" }, d(2026, 10, 22), plugin({ locale: "de-DE" }));
    const input = container.querySelector<HTMLInputElement>(".e-combo-input")!;
    expect(input.value).toBe("22.10.2026");
    expect(input.placeholder).toBe("DD.MM.YYYY");
    await setText(input, "05.03.2027");
    input.blur();
    await sleep(30);
    expect(model.value).toEqual(d(2027, 3, 5));
    await setText(input, "13.45.2020");
    input.blur();
    await sleep(30);
    expect(container.querySelector(".e-field-error")!.textContent).toMatch(/DD\.MM\.YYYY/);
  });

  test("locale: en-GB is day first, en-US month first", async () => {
    const gb = await render(EDatePicker, {
      props: { label: "Date", modelValue: d(2026, 10, 22) },
      global: plugin({ locale: "en-GB" }),
    });
    expect(gb.container.querySelector("input")!.value).toBe("22/10/2026");
    expect(gb.container.querySelector("input")!.placeholder).toBe("DD/MM/YYYY");
  });

  test("locale: a right-to-left locale (he-IL) formats, parses and mirrors the field", async () => {
    const { model, container } = await bound(
      { label: "תאריך" },
      d(2026, 10, 22),
      plugin({ locale: "he-IL", dir: "rtl" }),
    );
    const input = container.querySelector<HTMLInputElement>(".e-combo-input")!;
    expect(input.value).toBe("22.10.2026");
    await setText(input, "05.03.2027");
    input.blur();
    await sleep(30);
    expect(model.value).toEqual(d(2027, 3, 5));
    await page.getByRole("button", { name: "Choose date" }).click();
    await sleep(80);
    expect(panel()!.getAttribute("dir")).toBe("rtl");
    expect(document.querySelector(".e-cal-pick")!.textContent).toContain("2027");
  });

  test("a locale change re-renders the typed format", async () => {
    const eos = createEos({ themeTarget: null });
    const { container } = await render(EDatePicker, {
      props: { label: "Date", modelValue: d(2026, 10, 22) },
      global: { plugins: [eos] },
    });
    expect(container.querySelector("input")!.value).toBe("10/22/2026");
    eos.config.locale = "de-DE";
    await sleep(30);
    expect(container.querySelector("input")!.value).toBe("22.10.2026");
    expect(container.querySelector("input")!.placeholder).toBe("DD.MM.YYYY");
  });

  test("message overrides reach the error and the button name", async () => {
    const { container } = await bound(
      { label: "Date" },
      null,
      plugin({ messages: { dateError: "Format: {format}", chooseDate: "Ouvrir le calendrier" } }),
    );
    await expect.element(page.getByRole("button", { name: "Ouvrir le calendrier" })).toBeVisible();
    const input = container.querySelector<HTMLInputElement>(".e-combo-input")!;
    await setText(input, "nope");
    input.blur();
    await sleep(30);
    expect(container.querySelector(".e-field-error")!.textContent).toMatch(/Format: MM\/DD\/YYYY/);
  });

  test("has no accessibility violations: closed, hint, invalid, disabled and open", async () => {
    const plain = await render(EDatePicker, {
      props: { label: "Date", hint: "Any day.", modelValue: d(2026, 10, 22) },
    });
    await expectNoViolations(plain.container);
    const invalid = await render(EDatePicker, { props: { label: "Date b", error: "Choose a date." } });
    await expectNoViolations(invalid.container);
    const off = await render(EDatePicker, { props: { label: "Date c", disabled: true } });
    await expectNoViolations(off.container);
    const open = await render(EDatePicker, { props: { label: "Date d", modelValue: d(2026, 10, 22) } });
    await page.getByRole("button", { name: "Choose date" }).nth(3).click();
    await sleep(80);
    expect(panel()).not.toBeNull();
    await expectNoViolations(document.body);
    expect(open.container).toBeTruthy();
  });
});
