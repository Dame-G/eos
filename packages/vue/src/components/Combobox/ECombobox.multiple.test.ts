import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ECombobox from "./ECombobox.vue";
import ETextField from "../TextField/ETextField.vue";
import ESelect from "../Select/ESelect.vue";
import { expectNoViolations } from "../../../test/axe.js";

const WAYS = ["Text", "Email", "Call"];
const optionEls = () => Array.from(document.querySelectorAll<HTMLElement>("[role=option]"));
const inputOf = (c: Element) => c.querySelector<HTMLInputElement>("input.e-combo-input")!;
const tags = (c: Element) => Array.from(c.querySelectorAll(".e-tag")).map((t) => t.textContent?.trim());
const spoken = () => document.querySelector("[data-e-announcer=polite]")?.textContent?.replace(/\u00a0/g, "");
const box = (name: string) => page.getByRole("combobox", { name });
const expanded = (el: Element, v: "true" | "false") => expect.poll(() => el.getAttribute("aria-expanded")).toBe(v);

/** The top-left corner radius in px. */
const corner = (el: Element) => parseFloat(getComputedStyle(el).borderTopLeftRadius);

describe("ECombobox multiple", () => {
  test("shows chosen options as tags in the field, each with its own labelled Remove button", async () => {
    const { container } = await render(ECombobox, {
      props: { multiple: true, label: "Remind me by", options: WAYS, modelValue: ["Text", "Email"] },
    });
    expect(tags(container)).toEqual(["Text", "Email"]);
    await expect.element(page.getByRole("button", { name: "Remove Text" })).toBeVisible();
    await expect.element(page.getByRole("button", { name: "Remove Email" })).toBeVisible();
    expect(container.querySelector(".e-combo")!.classList.contains("e-combo--multi")).toBe(true);
    expect(inputOf(container).placeholder).toBe("");
  });

  test("the tags are the library's own ETag, and sit in the middle of a field that keeps its height", async () => {
    const empty = await render(ECombobox, { props: { multiple: true, label: "Empty", options: WAYS } });
    empty.container.classList.add("e-root");
    const emptyHeight = empty.container.querySelector(".e-input-wrap")!.getBoundingClientRect().height;
    const { container } = await render(ECombobox, {
      props: { multiple: true, label: "Remind me by", options: WAYS, modelValue: ["Text", "Email"] },
    });
    container.classList.add("e-root");
    const wrap = container.querySelector(".e-input-wrap")!.getBoundingClientRect();
    expect(wrap.height).toBe(emptyHeight);
    for (const tag of container.querySelectorAll(".e-tag")) {
      const box = tag.getBoundingClientRect();
      expect(Math.abs(box.top - wrap.top - (wrap.bottom - box.bottom))).toBeLessThanOrEqual(1.5);
    }
  });

  test("bare: just the field, named by ariaLabel", async () => {
    const { container } = await render(ECombobox, {
      props: { multiple: true, bare: true, ariaLabel: "Channels", options: WAYS, modelValue: ["Text"] },
    });
    expect(container.querySelector("label")).toBeNull();
    expect(container.querySelector(".e-field")).toBeNull();
    expect(tags(container)).toEqual(["Text"]);
    await expect.element(box("Channels")).toBeVisible();
  });

  test("a one-row multi-select is the same height as a text field and a Select", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(ETextField, { label: "A" }),
            h(ESelect, { label: "B", options: ["x"] }),
            h(ECombobox, { multiple: true, label: "C", options: WAYS, modelValue: ["Text"] }),
          ]),
      }),
    );
    container.classList.add("e-root");
    const heights = [
      container.querySelector(".e-input:not(.e-combo-input):not(.e-sel-trigger)")!,
      container.querySelector(".e-sel-trigger")!,
      container.querySelector(".e-combo--multi")!,
    ].map((el) => Math.round(el.getBoundingClientRect().height));
    expect(heights).toEqual([48, 48, 48]);
  });

  test("picking toggles an option, keeps the list open, shows a check, and the model is the array in order chosen", async () => {
    const got: string[][] = [];
    const { container } = await render(ECombobox, {
      props: {
        multiple: true,
        label: "Remind me by",
        options: WAYS,
        "onUpdate:modelValue": (v?: string | string[]) => got.push(v as string[]),
      },
    });
    await page.getByRole("button", { name: "Show options" }).click();
    await expanded(inputOf(container), "true");
    expect(document.querySelector("[role=listbox]")!.getAttribute("aria-multiselectable")).toBe("true");
    await page.getByRole("option", { name: "Email" }).click();
    await page.getByRole("option", { name: "Text" }).click();
    expect(got).toEqual([["Email"], ["Email", "Text"]]);
    expect(inputOf(container).getAttribute("aria-expanded")).toBe("true");
    expect(tags(container)).toEqual(["Email", "Text"]);
    const email = optionEls().find((o) => o.textContent?.includes("Email"))!;
    expect(email.getAttribute("aria-selected")).toBe("true");
    expect(email.querySelector(".e-icon")).not.toBeNull();
    await page.getByRole("option", { name: "Email" }).click();
    expect(got.at(-1)).toEqual(["Text"]);
    expect(document.activeElement).toBe(inputOf(container));
  });

  test("keyboard: arrows move, Enter picks and the list stays open, Escape closes", async () => {
    const got: string[][] = [];
    const { container } = await render(ECombobox, {
      props: {
        multiple: true,
        label: "Remind me by",
        options: WAYS,
        "onUpdate:modelValue": (v?: string | string[]) => got.push(v as string[]),
      },
    });
    const input = inputOf(container);
    input.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expanded(input, "true");
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => got).toEqual([["Email"]]);
    expect(input.getAttribute("aria-expanded")).toBe("true");
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => got.at(-1)).toEqual(["Email", "Call"]);
    await userEvent.keyboard("{Escape}");
    await expanded(input, "false");
    expect(document.activeElement).toBe(input);
  });

  test("typing filters; choosing clears the text", async () => {
    const got: string[][] = [];
    const { container } = await render(ECombobox, {
      props: {
        multiple: true,
        label: "Remind me by",
        options: WAYS,
        "onUpdate:modelValue": (v?: string | string[]) => got.push(v as string[]),
      },
    });
    await box("Remind me by").fill("ma");
    await expect.poll(() => optionEls().map((o) => o.textContent?.trim())).toEqual(["Email"]);
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => got).toEqual([["Email"]]);
    expect(inputOf(container).value).toBe("");
  });

  test("Backspace in an empty field removes the last tag", async () => {
    const got: string[][] = [];
    const { container } = await render(ECombobox, {
      props: {
        multiple: true,
        label: "Remind me by",
        options: WAYS,
        defaultValue: undefined,
        modelValue: ["Text", "Email"],
        "onUpdate:modelValue": (v?: string | string[]) => got.push(v as string[]),
      },
    });
    inputOf(container).focus();
    await userEvent.keyboard("{Backspace}");
    expect(got).toEqual([["Text"]]);
  });

  test("Backspace with text in the field edits the text instead", async () => {
    const got: string[][] = [];
    const { container } = await render(ECombobox, {
      props: {
        multiple: true,
        label: "Remind me by",
        options: WAYS,
        modelValue: ["Text"],
        "onUpdate:modelValue": (v?: string | string[]) => got.push(v as string[]),
      },
    });
    await box("Remind me by").fill("ca");
    await userEvent.keyboard("{Backspace}");
    expect(got).toEqual([]);
    expect(inputOf(container).value).toBe("c");
  });

  test("a tag's Remove button removes just that value", async () => {
    const got: string[][] = [];
    await render(ECombobox, {
      props: {
        multiple: true,
        label: "Remind me by",
        options: WAYS,
        modelValue: ["Text", "Email", "Call"],
        "onUpdate:modelValue": (v?: string | string[]) => got.push(v as string[]),
      },
    });
    await page.getByRole("button", { name: "Remove Email" }).click();
    expect(got).toEqual([["Text", "Call"]]);
  });

  test("the clear button empties all of them", async () => {
    const got: string[][] = [];
    await render(ECombobox, {
      props: {
        multiple: true,
        label: "Remind me by",
        options: WAYS,
        modelValue: ["Text", "Email"],
        "onUpdate:modelValue": (v?: string | string[]) => got.push(v as string[]),
      },
    });
    await page.getByRole("button", { name: "Clear" }).click();
    expect(got).toEqual([[]]);
  });

  test("name submits one hidden input per chosen value", async () => {
    const { container } = await render(ECombobox, {
      props: { multiple: true, label: "Remind me by", name: "remind", options: WAYS, modelValue: ["Text", "Call"] },
    });
    const hidden = Array.from(container.querySelectorAll<HTMLInputElement>("input[type=hidden]"));
    expect(hidden.map((i) => [i.name, i.value])).toEqual([
      ["remind", "Text"],
      ["remind", "Call"],
    ]);
  });

  test("none chosen submits nothing; required is satisfied by a chosen value", async () => {
    const empty = await render(ECombobox, {
      props: { multiple: true, label: "Remind me by", name: "remind", options: WAYS, required: true },
    });
    expect(empty.container.querySelectorAll("input[type=hidden]").length).toBe(0);
    expect(inputOf(empty.container).required).toBe(true);
    empty.unmount();
    const full = await render(ECombobox, {
      props: { multiple: true, label: "Remind me by", options: WAYS, required: true, modelValue: ["Text"] },
    });
    expect(inputOf(full.container).required).toBe(false);
  });

  test("v-model round trip: the array comes back first, and a new array shows as tags", async () => {
    const model = ref<string[]>(["Text"]);
    const got: string[][] = [];
    const { container } = await render(
      defineComponent({
        render: () =>
          h(ECombobox, {
            multiple: true,
            label: "Remind me by",
            options: WAYS,
            modelValue: model.value,
            "onUpdate:modelValue": (v?: string | string[]) => {
              got.push(v as string[]);
              model.value = v as string[];
            },
          }),
      }),
    );
    await page.getByRole("button", { name: "Show options" }).click();
    await page.getByRole("option", { name: "Call" }).click();
    expect(got).toEqual([["Text", "Call"]]);
    expect(Array.isArray(got[0])).toBe(true);
    model.value = ["Email"];
    await nextTick();
    await expect.poll(() => tags(container)).toEqual(["Email"]);
  });

  test("without v-model it keeps its own choices", async () => {
    const { container } = await render(ECombobox, { props: { multiple: true, label: "Remind me by", options: WAYS } });
    await page.getByRole("button", { name: "Show options" }).click();
    await page.getByRole("option", { name: "Call" }).click();
    await expect.poll(() => tags(container)).toEqual(["Call"]);
  });

  test("many tags wrap inside the field; hint and error come from the field", async () => {
    const many = Array.from({ length: 12 }, (_, i) => `Option number ${i + 1}`);
    const { container, rerender } = await render(ECombobox, {
      props: { multiple: true, label: "Pick", options: many, modelValue: many, hint: "As many as you like" },
    });
    container.classList.add("e-root");
    expect(container.querySelector(".e-combo")!.getBoundingClientRect().height).toBeGreaterThan(96);
    expect(inputOf(container).getAttribute("aria-describedby")).toBe(container.querySelector(".e-field-hint")!.id);
    await (rerender as (p: Record<string, unknown>) => Promise<void>)({
      label: "Pick",
      options: many,
      modelValue: many,
      error: "Too many",
    });
    await expect.poll(() => inputOf(container).getAttribute("aria-invalid")).toBe("true");
  });

  test("removing a tag with its button moves focus to the input and announces it", async () => {
    const got: string[][] = [];
    const { container } = await render(ECombobox, {
      props: {
        multiple: true,
        label: "Remind me by",
        options: WAYS,
        modelValue: ["Text", "Email"],
        "onUpdate:modelValue": (v?: string | string[]) => got.push(v as string[]),
      },
    });
    await page.getByRole("button", { name: "Remove Text" }).click();
    expect(got).toEqual([["Email"]]);
    expect(document.activeElement).toBe(inputOf(container));
    await expect.poll(() => spoken()).toBe("Removed Text");
  });

  test("removing the last tag with Backspace announces it", async () => {
    const { container } = await render(ECombobox, {
      props: { multiple: true, label: "Remind me by", options: WAYS, modelValue: ["Email", "Call"] },
    });
    inputOf(container).focus();
    await userEvent.keyboard("{Backspace}");
    await expect.poll(() => spoken()).toBe("Removed Call");
  });

  test("disabled: tags cannot be removed and the field never opens", async () => {
    const { container } = await render(ECombobox, {
      props: { multiple: true, label: "Remind me by", options: WAYS, modelValue: ["Text"], disabled: true },
    });
    expect(inputOf(container).disabled).toBe(true);
    expect(container.querySelector(".e-tag")!.textContent).toContain("Text");
    expect(container.querySelector(".e-tag-remove")).toBeNull();
    expect(container.querySelector("[aria-label=Clear]")).toBeNull();
    expect(container.querySelector(".e-combo-btn")).toBeNull();
  });

  test("passes aria-*, data-* and listeners to the input; class and style stay on the wrapper", async () => {
    let focused = 0;
    const { container } = await render(ECombobox, {
      props: { multiple: true, label: "Remind me by", options: WAYS },
      attrs: { "data-test": "x", class: "mine", onFocus: () => focused++ },
    });
    expect(inputOf(container).dataset["test"]).toBe("x");
    expect(container.firstElementChild!.classList.contains("mine")).toBe(true);
    inputOf(container).focus();
    expect(focused).toBe(1);
  });

  test("axe: empty, with tags, open, invalid, disabled", async () => {
    const a = await render(ECombobox, {
      props: { multiple: true, label: "Remind me by", options: WAYS, hint: "Pick any" },
    });
    await expectNoViolations(a.container);
    a.unmount();
    const b = await render(ECombobox, {
      props: { multiple: true, label: "Remind me by", options: WAYS, modelValue: ["Text", "Email"] },
    });
    await expectNoViolations(b.container);
    await page.getByRole("button", { name: "Show options" }).click();
    await expanded(inputOf(b.container), "true");
    await expectNoViolations(document.body);
    b.unmount();
    const c = await render(ECombobox, {
      props: { multiple: true, label: "Remind me by", options: WAYS, error: "Pick one" },
    });
    await expectNoViolations(c.container);
    c.unmount();
    const d = await render(ECombobox, {
      props: { multiple: true, label: "Remind me by", options: WAYS, disabled: true, modelValue: ["Text"] },
    });
    await expectNoViolations(d.container);
  });

  test("corners are concentric: chosen tags (a tight gap) and the buttons ((snug + edge) / 2) follow the wrap's radius at any theme", async () => {
    const { container } = await render(ECombobox, {
      props: { multiple: true, label: "Remind me by", options: WAYS, modelValue: ["Text", "Email"], clearable: true },
    });
    const root = container as HTMLElement;
    root.classList.add("e-root");
    const wrap = root.querySelector(".e-input-wrap")!;
    const tag = wrap.querySelector(".e-tag")!;
    const btn = wrap.querySelector(".e-combo-btn")!;

    for (const md of [null, "14px", "2px"]) {
      if (md) root.style.setProperty("--e-radius-md", md);
      const outer = corner(wrap);
      expect(corner(tag)).toBeCloseTo(Math.max(0, outer - 4), 0);
      expect(corner(btn)).toBeCloseTo(Math.max(0, outer - 4.5), 0);
    }
  });
});
