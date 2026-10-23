import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ESelect from "./ESelect.vue";
import ETextField from "../TextField/ETextField.vue";
import ECombobox from "../Combobox/ECombobox.vue";
import EDatePicker from "../DatePicker/EDatePicker.vue";
import ERangePicker from "../RangePicker/ERangePicker.vue";
import { createEos } from "../../plugin.js";
import { expectNoViolations } from "../../../test/axe.js";

const OPTIONS = ["Visa", "Bank", "Cash"];

const list = () => document.querySelector<HTMLElement>("[role=listbox]");
const optionEls = () => Array.from(document.querySelectorAll<HTMLElement>("[role=option]"));
const buttonOf = (c: Element) => c.querySelector("button")!;
const opened = (b: Element) => expect.poll(() => b.getAttribute("aria-expanded")).toBe("true");
const closed = (b: Element) => expect.poll(() => b.getAttribute("aria-expanded")).toBe("false");

describe("ESelect", () => {
  test("is a labelled combobox button: the label names it, and no native select is in the page", async () => {
    const { container } = await render(ESelect, { props: { label: "Pay with", options: OPTIONS } });
    await expect.element(page.getByRole("combobox", { name: "Pay with" })).toBeVisible();
    const button = buttonOf(container);
    expect(button.className).toContain("e-input");
    expect(button.className).toContain("e-sel-trigger");
    expect(container.querySelector("label")!.getAttribute("for")).toBe(button.id);
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(document.querySelector("select")).toBeNull();
    expect(button.textContent).toContain("Select");
    expect(container.querySelector(".e-sel-placeholder")).not.toBeNull();
  });

  test("an open trigger shows its focus outline even though focus has moved into the list", async () => {
    const { container } = await render(ESelect, { props: { label: "Pay with", options: OPTIONS } });
    container.classList.add("e-root");
    const button = buttonOf(container);
    expect(getComputedStyle(button).outlineStyle).toBe("none");
    await userEvent.click(button);
    await opened(button);
    expect(getComputedStyle(button).outlineStyle).toBe("solid");
    expect(parseFloat(getComputedStyle(button).outlineWidth)).toBeGreaterThan(0);
    await userEvent.keyboard("{Escape}");
    await closed(button);
  });

  test("keyboard: ArrowDown opens, arrows move, Enter chooses and closes, name is submitted", async () => {
    const got: string[] = [];
    const { container } = await render(ESelect, {
      props: {
        label: "Pay with",
        name: "method",
        options: OPTIONS,
        "onUpdate:modelValue": (v: unknown) => got.push(v as string),
      },
    });
    const button = buttonOf(container);
    button.focus();
    await userEvent.keyboard("{ArrowDown}");
    await opened(button);
    expect(list()).not.toBeNull();
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");
    await closed(button);
    expect(got).toEqual(["Bank"]);
    const hidden = container.querySelector<HTMLInputElement>("input[type=hidden]")!;
    expect(hidden.value).toBe("Bank");
    expect(hidden.name).toBe("method");
    expect(document.activeElement).toBe(button);
  });

  test("Space and Enter open it; Space chooses", async () => {
    const got: string[] = [];
    const { container } = await render(ESelect, {
      props: { label: "Pay with", options: OPTIONS, "onUpdate:modelValue": (v: unknown) => got.push(v as string) },
    });
    const button = buttonOf(container);
    await userEvent.tab();
    expect(document.activeElement).toBe(button);
    await userEvent.keyboard("{Enter}");
    await opened(button);
    await userEvent.keyboard("{Escape}");
    await closed(button);
    await userEvent.keyboard(" ");
    await opened(button);
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard(" ");
    await closed(button);
    expect(got).toEqual(["Bank"]);
  });

  test("Home and End jump to the first and last option", async () => {
    const got: string[] = [];
    const { container } = await render(ESelect, {
      props: { label: "Pay with", options: OPTIONS, "onUpdate:modelValue": (v: unknown) => got.push(v as string) },
    });
    const button = buttonOf(container);
    button.focus();
    await userEvent.keyboard("{ArrowDown}");
    await opened(button);
    await userEvent.keyboard("{End}");
    expect(document.activeElement?.textContent).toContain("Cash");
    await userEvent.keyboard("{Home}");
    expect(document.activeElement?.textContent).toContain("Visa");
    await userEvent.keyboard("{End}");
    await userEvent.keyboard("{Enter}");
    await closed(button);
    expect(got).toEqual(["Cash"]);
  });

  test("Escape closes the list and returns focus to the button without choosing", async () => {
    const got: string[] = [];
    const { container } = await render(ESelect, {
      props: { label: "Pay with", options: OPTIONS, "onUpdate:modelValue": (v: unknown) => got.push(v as string) },
    });
    const button = buttonOf(container);
    button.focus();
    await userEvent.keyboard("{ArrowDown}");
    await opened(button);
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Escape}");
    await closed(button);
    await expect.poll(() => list()).toBeNull();
    expect(document.activeElement).toBe(button);
    expect(got).toEqual([]);
  });

  test("typing on the open list jumps to the matching option", async () => {
    const got: string[] = [];
    const { container } = await render(ESelect, {
      props: { label: "Pay with", options: OPTIONS, "onUpdate:modelValue": (v: unknown) => got.push(v as string) },
    });
    const button = buttonOf(container);
    button.focus();
    await userEvent.keyboard("{ArrowDown}");
    await opened(button);
    await userEvent.keyboard("c");
    expect(document.activeElement?.textContent).toContain("Cash");
    await userEvent.keyboard("{Enter}");
    await closed(button);
    expect(got).toEqual(["Cash"]);
  });

  test("typing on the closed button chooses the matching option, like a native select", async () => {
    const got: string[] = [];
    const { container } = await render(ESelect, {
      props: { label: "Pay with", options: OPTIONS, "onUpdate:modelValue": (v: unknown) => got.push(v as string) },
    });
    buttonOf(container).focus();
    await userEvent.keyboard("c");
    expect(got).toEqual(["Cash"]);
    await expect.element(page.getByRole("combobox", { name: "Pay with" })).toHaveTextContent("Cash");
  });

  test("clicking opens the list, a click on an option chooses it, an outside press closes it", async () => {
    const got: string[] = [];
    const { container } = await render(ESelect, {
      props: { label: "Pay with", options: OPTIONS, "onUpdate:modelValue": (v: unknown) => got.push(v as string) },
    });
    const button = buttonOf(container);
    await page.getByRole("combobox", { name: "Pay with" }).click();
    await opened(button);
    expect(optionEls().map((o) => o.textContent?.trim())).toEqual(["Visa", "Bank", "Cash"]);
    await page.getByRole("option", { name: "Cash" }).click();
    await closed(button);
    expect(got).toEqual(["Cash"]);
    await page.getByRole("combobox", { name: "Pay with" }).click();
    await opened(button);
    document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    await closed(button);
  });

  test("the chosen option is bold with a check, and the list is as wide as the button", async () => {
    const { container } = await render(ESelect, {
      props: { label: "Pay with", options: OPTIONS, modelValue: "Bank" },
    });
    const button = buttonOf(container);
    await page.getByRole("combobox", { name: "Pay with" }).click();
    await opened(button);
    const bank = optionEls().find((o) => o.textContent?.includes("Bank"))!;
    expect(bank.getAttribute("aria-selected")).toBe("true");
    expect(bank.classList.contains("e-opt--selected")).toBe(true);
    expect(bank.querySelector(".e-icon")).not.toBeNull();
    expect(getComputedStyle(bank.querySelector(".e-opt-label")!).fontWeight).toBe("600");
    expect(
      optionEls()
        .find((o) => o.textContent?.includes("Visa"))!
        .getAttribute("aria-selected"),
    ).toBe("false");
    await expect
      .poll(() => Math.round(list()!.getBoundingClientRect().width))
      .toBe(Math.round(button.getBoundingClientRect().width));
  });

  test("v-model round trip: a choice emits the value first, and the model shows in the button", async () => {
    const model = ref("Visa");
    const got: string[] = [];
    const { container } = await render(
      defineComponent({
        render: () =>
          h(ESelect, {
            label: "Pay with",
            options: OPTIONS,
            modelValue: model.value,
            "onUpdate:modelValue": (v: unknown) => {
              got.push(v as string);
              model.value = v as string;
            },
          }),
      }),
    );
    const button = buttonOf(container);
    expect(button.textContent).toContain("Visa");
    await page.getByRole("combobox", { name: "Pay with" }).click();
    await page.getByRole("option", { name: "Cash" }).click();
    expect(got).toEqual(["Cash"]);
    expect(typeof got[0]).toBe("string");
    await expect.poll(() => button.textContent).toContain("Cash");
    model.value = "Bank";
    await nextTick();
    await expect.poll(() => button.textContent).toContain("Bank");
  });

  test("without v-model it keeps its own value", async () => {
    const { container } = await render(ESelect, { props: { label: "Pay with", options: OPTIONS, name: "m" } });
    await page.getByRole("combobox", { name: "Pay with" }).click();
    await page.getByRole("option", { name: "Bank" }).click();
    await expect.poll(() => buttonOf(container).textContent).toContain("Bank");
    expect(container.querySelector<HTMLInputElement>("input[type=hidden]")!.value).toBe("Bank");
  });

  test("options are strings or objects with a description, an icon and disabled; a disabled option cannot be chosen", async () => {
    const got: string[] = [];
    const { container } = await render(ESelect, {
      props: {
        label: "Plan",
        options: [
          { value: "a", label: "Basic", description: "Free, forever" },
          { value: "b", label: "Plus", icon: "info", disabled: true },
          "Pro",
        ],
        "onUpdate:modelValue": (v: unknown) => got.push(v as string),
      },
    });
    const button = buttonOf(container);
    await page.getByRole("combobox", { name: "Plan" }).click();
    await opened(button);
    const basic = optionEls()[0]!;
    expect(basic.querySelector(".e-opt-desc")!.textContent).toBe("Free, forever");
    const plus = optionEls()[1]!;
    expect(plus.getAttribute("aria-disabled")).toBe("true");
    expect(plus.classList.contains("e-opt--disabled")).toBe(true);
    expect(plus.querySelector(".e-icon")).not.toBeNull();
    plus.click();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(document.activeElement?.textContent).toContain("Pro");
    await userEvent.keyboard("{Enter}");
    await closed(button);
    expect(got).toEqual(["Pro"]);
  });

  test("groups: a heading names each run of options, with a rule between runs", async () => {
    const { container } = await render(ESelect, {
      props: {
        label: "City",
        options: [
          { value: "1", label: "Lyon", group: "France" },
          { value: "2", label: "Nice", group: "France" },
          { value: "3", label: "Turin", group: "Italy" },
        ],
      },
    });
    await page.getByRole("combobox", { name: "City" }).click();
    await opened(buttonOf(container));
    const headings = Array.from(document.querySelectorAll(".e-opt-group"));
    expect(headings.map((h) => h.textContent)).toEqual(["France", "Italy"]);
    const groups = document.querySelectorAll("[role=group]");
    expect(groups.length).toBe(2);
    expect(groups[0]!.getAttribute("aria-labelledby")).toBe(headings[0]!.id);
    expect(getComputedStyle(headings[0]!).borderTopWidth).toBe("0px");
    expect(getComputedStyle(headings[1]!).borderTopWidth).toBe("1px");
  });

  test("hint, error, required and optional come from the field; the error marks the button invalid", async () => {
    const { container, rerender } = await render(ESelect, {
      props: { label: "Pay with", options: OPTIONS, hint: "Pick one", required: true },
    });
    const button = buttonOf(container);
    expect(container.querySelector(".e-field-hint")!.textContent).toBe("Pick one");
    expect(button.getAttribute("aria-describedby")).toBe(container.querySelector(".e-field-hint")!.id);
    expect(container.querySelector(".e-field-flag")!.textContent).toBe("Required");
    expect(button.getAttribute("aria-invalid")).toBeNull();
    await (rerender as (p: Record<string, unknown>) => Promise<void>)({
      label: "Pay with",
      options: OPTIONS,
      hint: "Pick one",
      error: "Choose a method",
    });
    await expect.poll(() => button.getAttribute("aria-invalid")).toBe("true");
    expect(container.querySelector(".e-field-error")!.getAttribute("role")).toBe("alert");
    expect(container.querySelector(".e-field-hint")).toBeNull();
    expect(button.getAttribute("aria-describedby")).toBe(container.querySelector(".e-field-error")!.id);
  });

  test("the hint sits 8px under the control, the same gap as the label above", async () => {
    const { container } = await render(ESelect, { props: { label: "Pay with", options: OPTIONS, hint: "Pick one" } });
    const sel = container.querySelector(".e-sel")!.getBoundingClientRect();
    const hint = container.querySelector(".e-field-hint")!.getBoundingClientRect();
    const label = container.querySelector("label")!.getBoundingClientRect();
    expect(Math.round(hint.top - sel.bottom)).toBe(8);
    expect(Math.round(sel.top - label.bottom)).toBe(8);
  });

  test("the button is 48px tall, like a text field", async () => {
    const { container } = await render(ESelect, { props: { label: "Pay with", options: OPTIONS } });
    expect(Math.round(buttonOf(container).getBoundingClientRect().height)).toBe(48);
  });

  test("disabled: not focusable by click, never opens, dashed edge", async () => {
    const { container } = await render(ESelect, { props: { label: "Pay with", options: OPTIONS, disabled: true } });
    const button = buttonOf(container);
    expect(button.disabled).toBe(true);
    button.click();
    await nextTick();
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(getComputedStyle(button).outlineStyle).toBe("dashed");
    expect(button.querySelector(".e-icon")).toBeNull();
  });

  test("passes aria-*, data-* and listeners to the button; class and style stay on the wrapper", async () => {
    let focused = 0;
    const { container } = await render(ESelect, {
      props: { label: "Pay with", options: OPTIONS, hint: "h" },
      attrs: {
        "data-test": "x",
        "aria-describedby": "extra",
        class: "mine",
        style: "margin: 3px",
        onFocus: () => focused++,
      },
    });
    const button = buttonOf(container);
    expect(button.dataset["test"]).toBe("x");
    expect(button.getAttribute("aria-describedby")).toContain("extra");
    expect(button.getAttribute("aria-describedby")).toContain(container.querySelector(".e-field-hint")!.id);
    const wrapper = container.firstElementChild!;
    expect(wrapper.classList.contains("mine")).toBe(true);
    expect(wrapper.classList.contains("e-field")).toBe(true);
    expect((wrapper as HTMLElement).style.margin).toBe("3px");
    expect(button.classList.contains("mine")).toBe(false);
    button.focus();
    expect(focused).toBe(1);
  });

  test("id: the label points at it", async () => {
    const { container } = await render(ESelect, { props: { label: "Pay with", options: OPTIONS, id: "pay" } });
    expect(buttonOf(container).id).toBe("pay");
    expect(container.querySelector("label")!.getAttribute("for")).toBe("pay");
  });

  test("bare with only a label still names the button", async () => {
    await render(ESelect, { props: { bare: true, label: "Status", options: OPTIONS } });
    await expect.element(page.getByRole("combobox", { name: "Status" })).toBeVisible();
  });

  test("bare: just the control, named by ariaLabel", async () => {
    const { container } = await render(ESelect, { props: { bare: true, ariaLabel: "Status", options: OPTIONS } });
    expect(container.querySelector("label")).toBeNull();
    expect(container.querySelector(".e-field")).toBeNull();
    await expect.element(page.getByRole("combobox", { name: "Status" })).toBeVisible();
    await page.getByRole("combobox", { name: "Status" }).click();
    await expect.poll(() => list()?.getAttribute("aria-label")).toBe("Status");
  });

  test("hideLabel keeps the name for screen readers", async () => {
    const { container } = await render(ESelect, { props: { label: "Pay with", hideLabel: true, options: OPTIONS } });
    await expect.element(page.getByRole("combobox", { name: "Pay with" })).toBeInTheDocument();
    expect(container.querySelector("label")!.classList.contains("e-sr")).toBe(true);
  });

  test("the list renders in the configured portal target and is an e-root, so a scoped theme reaches it", async () => {
    const target = document.createElement("div");
    target.id = "themed";
    document.body.appendChild(target);
    const eos = createEos({ portalTarget: "#themed" });
    const { container } = await render(ESelect, {
      props: { label: "Pay with", options: OPTIONS },
      global: { plugins: [eos] },
    });
    await page.getByRole("combobox", { name: "Pay with" }).click();
    await opened(buttonOf(container));
    const listbox = list()!;
    expect(target.contains(listbox)).toBe(true);
    expect(listbox.classList.contains("e-root")).toBe(true);
    await userEvent.keyboard("{Escape}");
    target.remove();
  });

  test("messages can be reworded: the placeholder comes from useMessages", async () => {
    const eos = createEos({ messages: { select: "Choisir" } });
    const { container } = await render(ESelect, {
      props: { label: "Pay with", options: OPTIONS },
      global: { plugins: [eos] },
    });
    expect(buttonOf(container).textContent).toContain("Choisir");
  });

  test("a placeholder prop replaces the default word", async () => {
    const { container } = await render(ESelect, {
      props: { label: "Pay with", options: OPTIONS, placeholder: "Pick a method" },
    });
    expect(buttonOf(container).textContent).toContain("Pick a method");
  });

  test("axe: closed, open, invalid, disabled, with a value and grouped", async () => {
    const closedOne = await render(ESelect, { props: { label: "Pay with", options: OPTIONS, hint: "Pick one" } });
    await expectNoViolations(closedOne.container);
    await page.getByRole("combobox", { name: "Pay with" }).click();
    await opened(buttonOf(closedOne.container));
    await expectNoViolations(document.body);
    await userEvent.keyboard("{Escape}");
    await closed(buttonOf(closedOne.container));
    closedOne.unmount();
    const invalid = await render(ESelect, {
      props: { label: "Pay with", options: OPTIONS, error: "Choose a method", modelValue: "Bank" },
    });
    await expectNoViolations(invalid.container);
    invalid.unmount();
    const disabled = await render(ESelect, { props: { label: "Pay with", options: OPTIONS, disabled: true } });
    await expectNoViolations(disabled.container);
    disabled.unmount();
    const grouped = await render(ESelect, {
      props: {
        label: "City",
        options: [
          { value: "1", label: "Lyon", group: "France", description: "East" },
          { value: "3", label: "Turin", group: "Italy", icon: "info" },
        ],
      },
    });
    await page.getByRole("combobox", { name: "City" }).click();
    await opened(buttonOf(grouped.container));
    await expectNoViolations(document.body);
  });

  test("the trigger rests on the same white as a text input (a button is not read-only)", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(ESelect, { label: "Pay with", options: OPTIONS }),
            h("input", { class: "e-input", "aria-label": "Plain" }),
          ]),
      }),
    );
    const trigger = container.querySelector<HTMLElement>("button.e-sel-trigger")!;
    const plain = container.querySelector<HTMLElement>("input.e-input")!;
    expect(getComputedStyle(trigger).backgroundColor).toBe(getComputedStyle(plain).backgroundColor);
  });
  test("exposes focus() and the trigger as input", async () => {
    let api: { input: HTMLElement | null; focus: () => void } | null = null;
    const { container } = await render(
      defineComponent({
        render: () =>
          h(ESelect, { label: "Card", options: ["Visa", "Mastercard"], ref: (r: unknown) => (api = r as typeof api) }),
      }),
    );
    const trigger = container.querySelector("button.e-sel-trigger");
    expect(trigger).not.toBeNull();
    expect(api!.input).toBe(trigger);
    api!.focus();
    expect(document.activeElement).toBe(trigger);
  });

  test("a disabled select posts nothing through its hidden input", async () => {
    const { container } = await render(ESelect, {
      props: { label: "Pay", name: "m", options: OPTIONS, modelValue: "Bank", disabled: true },
    });
    const form = document.createElement("form");
    form.append(container.firstElementChild!);
    document.body.append(form);
    expect(new FormData(form).getAll("m")).toEqual([]);
    form.remove();
  });

  test("readonly looks read-only: the tinted face of a read-only text field, and no arrow", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { class: "e-root" }, [
            h(ESelect, { label: "Plan", options: ["Basic", "Pro"], modelValue: "Pro", readonly: true }),
            h(ESelect, { label: "Plan 2", options: ["Basic", "Pro"], modelValue: "Pro" }),
            h(ETextField, { label: "Name", modelValue: "Ada", readonly: true }),
          ]),
      }),
    );
    const [ro, plain] = [...container.querySelectorAll(".e-sel-trigger")];
    const text = container.querySelector("input.e-input")!;
    expect(getComputedStyle(ro!).backgroundColor).toBe(getComputedStyle(text).backgroundColor);
    expect(getComputedStyle(ro!).backgroundColor).not.toBe(getComputedStyle(plain!).backgroundColor);
    expect(ro!.querySelector(".e-icon")).toBeNull();
    expect(plain!.querySelector(".e-icon")).not.toBeNull();
  });

  test("size gives a row of fields one height: Select, Combobox, DatePicker and RangePicker follow a text field", async () => {
    for (const size of ["sm", "md", "lg"] as const) {
      const { container, unmount } = await render(
        defineComponent({
          render: () =>
            h("div", { class: "e-root" }, [
              h(ETextField, { label: "Name", size }),
              h(ESelect, { label: "Plan", options: ["Basic"], size }),
              h(ECombobox, { label: "City", options: ["Lyon"], size }),
              h(EDatePicker, { label: "Date", size }),
              h(ERangePicker, { label: "Stay", size }),
            ]),
        }),
      );
      const boxes = [
        ".e-input:not(.e-sel-trigger, .e-combo-input)",
        ".e-sel-trigger",
        ".e-combo:not(.e-rangefield)",
        ".e-rangefield",
      ];
      const heights = boxes.map((q) =>
        [...container.querySelectorAll(q)].map((el) => el.getBoundingClientRect().height),
      );
      const text = heights[0]![0]!;
      expect(text, size).toBe(size === "sm" ? 40 : size === "lg" ? 56 : 48);
      expect(
        heights.flat().every((h) => h === text),
        `${size}: ${JSON.stringify(heights)}`,
      ).toBe(true);
      unmount();
    }
  });

  test("readonly keeps focus and the value but never opens or picks", async () => {
    const got: string[] = [];
    const { container } = await render(ESelect, {
      props: {
        label: "Pay",
        options: OPTIONS,
        modelValue: "Bank",
        readonly: true,
        "onUpdate:modelValue": (v: unknown) => got.push(v as string),
      },
    });
    const button = buttonOf(container);
    expect(button.getAttribute("aria-readonly")).toBe("true");
    button.focus();
    await userEvent.keyboard("{ArrowDown}c");
    await userEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(list()).toBeNull();
    expect(got).toEqual([]);
    expect(document.activeElement).toBe(button);
  });

  test("multiple chooses several, stays open, says how many and posts one value each", async () => {
    const got: string[][] = [];
    const { container } = await render(ESelect, {
      props: {
        label: "Pay",
        name: "m",
        options: OPTIONS,
        multiple: true,
        modelValue: [],
        "onUpdate:modelValue": (v: unknown) => got.push(v as string[]),
      },
    });
    const button = buttonOf(container);
    await userEvent.click(button);
    await opened(button);
    await userEvent.click(optionEls()[0]!);
    expect(got.at(-1)).toEqual(["Visa"]);
    expect(list()).not.toBeNull();
  });

  test("multiple shows a count and a hidden input per value", async () => {
    const { container } = await render(ESelect, {
      props: { label: "Pay", name: "m", options: OPTIONS, multiple: true, modelValue: ["Visa", "Cash"] },
    });
    expect(buttonOf(container).textContent).toContain("2 selected");
    expect(Array.from(container.querySelectorAll<HTMLInputElement>("input[type=hidden]")).map((i) => i.value)).toEqual([
      "Visa",
      "Cash",
    ]);
  });

  test("clearable shows a clear button that empties the value and keeps focus on the button", async () => {
    const got: string[] = [];
    const { container } = await render(ESelect, {
      props: {
        label: "Pay",
        options: OPTIONS,
        modelValue: "Bank",
        clearable: true,
        "onUpdate:modelValue": (v: unknown) => got.push(v as string),
      },
    });
    await page.getByRole("button", { name: "Clear" }).click();
    expect(got).toEqual([""]);
    expect(document.activeElement).toBe(buttonOf(container));
  });

  test("loading shows a spinner and sets aria-busy", async () => {
    const { container } = await render(ESelect, { props: { label: "Pay", options: OPTIONS, loading: true } });
    expect(buttonOf(container).getAttribute("aria-busy")).toBe("true");
    expect(container.querySelector(".e-spinner, [role=status]")).not.toBeNull();
  });

  test("an option answers hover with a wash and a ring, and a disabled option does not", async () => {
    const { container } = await render(ESelect, {
      props: { label: "Pay", options: ["A", { value: "b", label: "B", disabled: true }] },
    });
    await userEvent.click(buttonOf(container));
    const [a, b] = optionEls();
    await userEvent.hover(a!);
    await expect.poll(() => getComputedStyle(a!).boxShadow).not.toBe("none");
    await userEvent.hover(b!);
    expect(getComputedStyle(b!).boxShadow).toBe("none");
  });
});
