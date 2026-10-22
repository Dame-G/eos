import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ECombobox from "./ECombobox.vue";
import { createEos } from "../../plugin.js";
import { expectNoViolations } from "../../../test/axe.js";

const PEOPLE = ["Amara Singh", "Marcus Webb", "Priya Nair"];
const optionEls = () => Array.from(document.querySelectorAll<HTMLElement>("[role=option]"));
const listbox = () => document.querySelector<HTMLElement>("[role=listbox]");
const inputOf = (c: Element) => c.querySelector<HTMLInputElement>("input.e-combo-input")!;
const box = (name: string) => page.getByRole("combobox", { name });
const expanded = (el: Element, v: "true" | "false") => expect.poll(() => el.getAttribute("aria-expanded")).toBe(v);
const active = (el: Element) =>
  document.getElementById(el.getAttribute("aria-activedescendant") ?? "")?.textContent ?? "";

describe("ECombobox", () => {
  test("is a labelled combobox input in a 48px outlined field, with no native select", async () => {
    const { container } = await render(ECombobox, { props: { label: "Practitioner", options: PEOPLE } });
    container.classList.add("e-root");
    await expect.element(box("Practitioner")).toBeVisible();
    const input = inputOf(container);
    expect(input.getAttribute("role")).toBe("combobox");
    expect(input.getAttribute("aria-autocomplete")).toBe("list");
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(container.querySelector("label")!.getAttribute("for")).toBe(input.id);
    expect(container.querySelector(".e-input-wrap.e-combo")).not.toBeNull();
    expect(Math.round(container.querySelector(".e-combo")!.getBoundingClientRect().height)).toBe(48);
    expect(document.querySelector("select")).toBeNull();
  });

  test("bare: just the input, named by ariaLabel, with the list named the same", async () => {
    const { container } = await render(ECombobox, { props: { bare: true, ariaLabel: "Filter", options: PEOPLE } });
    expect(container.querySelector("label")).toBeNull();
    expect(container.querySelector(".e-field")).toBeNull();
    await expect.element(box("Filter")).toBeVisible();
    await box("Filter").fill("a");
    await expect.poll(() => listbox()?.getAttribute("aria-label")).toBe("Filter");
  });

  test("bare with only a label still names the input", async () => {
    const { container } = await render(ECombobox, { props: { bare: true, label: "Practitioner", options: PEOPLE } });
    expect(container.querySelector("label")).toBeNull();
    await expect.element(box("Practitioner")).toBeVisible();
  });

  test("typing filters the list, marks the match, and Enter picks the first match", async () => {
    const got: string[] = [];
    const { container } = await render(ECombobox, {
      props: {
        label: "Practitioner",
        options: PEOPLE,
        "onUpdate:modelValue": (v?: string | string[]) => got.push(v as string),
      },
    });
    await box("Practitioner").fill("ma");
    await expect.poll(() => optionEls().length).toBe(2);
    expect(optionEls().map((o) => o.textContent?.trim())).toEqual(["Amara Singh", "Marcus Webb"]);
    expect(document.querySelector(".e-opt mark")!.textContent).toBe("ma");
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => got).toEqual(["Amara Singh"]);
    expect(inputOf(container).value).toBe("Amara Singh");
    await expanded(inputOf(container), "false");
    expect(document.activeElement).toBe(inputOf(container));
  });

  test("an object option's value is not its label, and its description is searched", async () => {
    const got: string[] = [];
    const { container } = await render(ECombobox, {
      props: {
        label: "Clinic",
        options: [
          { value: "c1", label: "North Clinic", description: "Elm Street" },
          { value: "c2", label: "South Clinic" },
        ],
        "onUpdate:modelValue": (v?: string | string[]) => got.push(v as string),
      },
    });
    await box("Clinic").fill("elm");
    await expect.poll(() => optionEls().length).toBe(1);
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => got).toEqual(["c1"]);
    expect(inputOf(container).value).toBe("North Clinic");
  });

  test("arrows open and move; the highlighted option is the active descendant; Enter chooses", async () => {
    const got: string[] = [];
    const { container } = await render(ECombobox, {
      props: {
        label: "Practitioner",
        options: PEOPLE,
        "onUpdate:modelValue": (v?: string | string[]) => got.push(v as string),
      },
    });
    const input = inputOf(container);
    input.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expanded(input, "true");
    expect(optionEls().length).toBe(3);
    await expect.poll(() => active(input)).toContain("Amara");
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(() => active(input)).toContain("Marcus");
    await userEvent.keyboard("{ArrowUp}");
    await expect.poll(() => active(input)).toContain("Amara");
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => got).toEqual(["Marcus Webb"]);
  });

  test("a mouse click on an option chooses it and keeps the focus in the input", async () => {
    const got: string[] = [];
    const { container } = await render(ECombobox, {
      props: {
        label: "Practitioner",
        options: PEOPLE,
        "onUpdate:modelValue": (v?: string | string[]) => got.push(v as string),
      },
    });
    await page.getByRole("button", { name: "Show options" }).click();
    await expanded(inputOf(container), "true");
    await page.getByRole("option", { name: "Priya Nair" }).click();
    await expect.poll(() => got).toEqual(["Priya Nair"]);
    await expanded(inputOf(container), "false");
    expect(document.activeElement).toBe(inputOf(container));
  });

  test("Home and End move the cursor in the text, they do not leave the field", async () => {
    const { container } = await render(ECombobox, { props: { label: "Practitioner", options: PEOPLE } });
    const input = inputOf(container);
    await box("Practitioner").fill("ma");
    await userEvent.keyboard("{Home}");
    expect(input.selectionStart).toBe(0);
    await userEvent.keyboard("{End}");
    expect(input.selectionStart).toBe(2);
  });

  test("Escape closes the list first, then clears the text", async () => {
    const got: string[] = [];
    const { container } = await render(ECombobox, {
      props: {
        label: "Practitioner",
        options: PEOPLE,
        modelValue: "Priya Nair",
        "onUpdate:modelValue": (v?: string | string[]) => got.push(v as string),
      },
    });
    const input = inputOf(container);
    input.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expanded(input, "true");
    await userEvent.keyboard("{Escape}");
    await expanded(input, "false");
    expect(input.value).toBe("Priya Nair");
    expect(document.activeElement).toBe(input);
    expect(got).toEqual([]);
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => got).toEqual([""]);
    expect(input.value).toBe("");
  });

  test("when focus leaves, the text snaps back to the chosen option", async () => {
    const { container } = await render(ECombobox, {
      props: { label: "Practitioner", options: PEOPLE, modelValue: "Marcus Webb" },
    });
    const input = inputOf(container);
    await box("Practitioner").fill("zzz");
    expect(input.value).toBe("zzz");
    await userEvent.tab();
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Clear");
    expect(input.value).toBe("zzz");
    await userEvent.tab();
    await expect.poll(() => input.value).toBe("Marcus Webb");
    await expanded(input, "false");
  });

  test("shows No matches, or your own words, when nothing matches", async () => {
    const { rerender } = await render(ECombobox, { props: { label: "Practitioner", options: PEOPLE } });
    await box("Practitioner").fill("zzz");
    await expect.poll(() => document.querySelector(".e-opt-status")?.textContent?.trim()).toBe("No matches");
    expect(optionEls().filter((o) => !o.classList.contains("e-opt-status")).length).toBe(0);
    expect(document.querySelector(".e-opt-status")!.getAttribute("aria-disabled")).toBe("true");
    expect(document.querySelector("[role=status].e-sr")!.textContent).toBe("No matches");
    await (rerender as (p: Record<string, unknown>) => Promise<void>)({
      label: "Practitioner",
      options: PEOPLE,
      emptyText: "Nobody by that name",
    });
    await expect.poll(() => document.querySelector(".e-opt-status")?.textContent?.trim()).toBe("Nobody by that name");
  });

  test("loading shows a Searching spinner in the list; inputChange lets a server answer", async () => {
    const heard: string[] = [];
    const { container, rerender } = await render(ECombobox, {
      props: { label: "Practitioner", options: [], loading: true, onInputChange: (t: string) => heard.push(t) },
    });
    await box("Practitioner").fill("pr");
    await expect
      .poll(() => document.querySelector(".e-opt-status [role=status]")?.textContent?.trim())
      .toBe("Searching");
    expect(heard).toEqual(["pr"]);
    expect(listbox()!.getAttribute("aria-busy")).toBe("true");
    await (rerender as (p: Record<string, unknown>) => Promise<void>)({
      label: "Practitioner",
      options: ["Priya Nair"],
      loading: false,
      filter: () => true,
    });
    await expect.poll(() => optionEls().map((o) => o.textContent?.trim())).toEqual(["Priya Nair"]);
    expect(inputOf(container).value).toBe("pr");
  });

  test("a custom filter replaces the default match", async () => {
    await render(ECombobox, {
      props: {
        label: "Practitioner",
        options: PEOPLE,
        filter: (o: { label: string }, q: string) => o.label.toLowerCase().endsWith(q),
      },
    });
    await box("Practitioner").fill("nair");
    await expect.poll(() => optionEls().map((o) => o.textContent?.trim())).toEqual(["Priya Nair"]);
  });

  test("the clear button empties the field, tells the model, and keeps the focus", async () => {
    const got: string[] = [];
    const heard: string[] = [];
    const { container } = await render(ECombobox, {
      props: {
        label: "Practitioner",
        options: PEOPLE,
        modelValue: "Priya Nair",
        "onUpdate:modelValue": (v?: string | string[]) => got.push(v as string),
        onInputChange: (t: string) => heard.push(t),
      },
    });
    await page.getByRole("button", { name: "Clear" }).click();
    expect(got).toEqual([""]);
    expect(heard).toEqual([""]);
    expect(inputOf(container).value).toBe("");
    expect(document.activeElement).toBe(inputOf(container));
  });

  test("clearable=false removes the clear button; it is also absent when empty or disabled", async () => {
    const a = await render(ECombobox, {
      props: { label: "A", options: PEOPLE, modelValue: "Priya Nair", clearable: false },
    });
    expect(a.container.querySelector("[aria-label=Clear]")).toBeNull();
    a.unmount();
    const b = await render(ECombobox, { props: { label: "B", options: PEOPLE } });
    expect(b.container.querySelector("[aria-label=Clear]")).toBeNull();
    b.unmount();
    const c = await render(ECombobox, {
      props: { label: "C", options: PEOPLE, modelValue: "Priya Nair", disabled: true },
    });
    expect(c.container.querySelector("[aria-label=Clear]")).toBeNull();
  });

  test("the toggle button opens and closes the list and is out of the tab order", async () => {
    const { container } = await render(ECombobox, { props: { label: "Practitioner", options: PEOPLE } });
    const toggle = page.getByRole("button", { name: "Show options" });
    expect(container.querySelector<HTMLElement>("[aria-label='Show options']")!.tabIndex).toBe(-1);
    await toggle.click();
    await expanded(inputOf(container), "true");
    await toggle.click();
    await expanded(inputOf(container), "false");
  });

  test("an outside press closes the list", async () => {
    const { container } = await render(ECombobox, { props: { label: "Practitioner", options: PEOPLE } });
    await page.getByRole("button", { name: "Show options" }).click();
    await expanded(inputOf(container), "true");
    document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    await expanded(inputOf(container), "false");
  });

  test("name submits the value; an object option submits its value, not its label", async () => {
    const { container } = await render(ECombobox, {
      props: { label: "Clinic", name: "clinic", options: [{ value: "c1", label: "North Clinic" }], modelValue: "c1" },
    });
    const hidden = container.querySelectorAll<HTMLInputElement>("input[type=hidden]");
    expect(hidden.length).toBe(1);
    expect(hidden[0]!.name).toBe("clinic");
    expect(hidden[0]!.value).toBe("c1");
    expect(inputOf(container).value).toBe("North Clinic");
  });

  test("required puts the word and the attribute on the field", async () => {
    const { container } = await render(ECombobox, {
      props: { label: "Practitioner", options: PEOPLE, required: true },
    });
    expect(container.querySelector(".e-field-flag")!.textContent).toBe("Required");
    expect(inputOf(container).required).toBe(true);
  });

  test("v-model round trip: choosing emits the value first; a new model value shows in the input", async () => {
    const model = ref("Priya Nair");
    const got: string[] = [];
    const { container } = await render(
      defineComponent({
        render: () =>
          h(ECombobox, {
            label: "Practitioner",
            options: PEOPLE,
            modelValue: model.value,
            "onUpdate:modelValue": (v?: string | string[]) => {
              got.push(v as string);
              model.value = v as string;
            },
          }),
      }),
    );
    const input = inputOf(container);
    expect(input.value).toBe("Priya Nair");
    await box("Practitioner").fill("webb");
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => got).toEqual(["Marcus Webb"]);
    expect(typeof got[0]).toBe("string");
    model.value = "Amara Singh";
    await nextTick();
    await expect.poll(() => input.value).toBe("Amara Singh");
  });

  test("without v-model it keeps its own value", async () => {
    const { container } = await render(ECombobox, { props: { label: "Practitioner", options: PEOPLE } });
    await box("Practitioner").fill("pri");
    await userEvent.keyboard("{Enter}");
    await userEvent.tab();
    await expect.poll(() => inputOf(container).value).toBe("Priya Nair");
  });

  test("a label that arrives later (options fetched after the value) still shows", async () => {
    const { container, rerender } = await render(ECombobox, {
      props: { label: "Clinic", options: [], modelValue: "c1" },
    });
    expect(inputOf(container).value).toBe("");
    await (rerender as (p: Record<string, unknown>) => Promise<void>)({
      label: "Clinic",
      options: [{ value: "c1", label: "North Clinic" }],
      modelValue: "c1",
    });
    await expect.poll(() => inputOf(container).value).toBe("North Clinic");
  });

  test("groups and disabled options: headings between runs, a disabled option cannot be chosen", async () => {
    const got: string[] = [];
    const { container } = await render(ECombobox, {
      props: {
        label: "City",
        options: [
          { value: "1", label: "Lyon", group: "France" },
          { value: "2", label: "Nice", group: "France", disabled: true },
          { value: "3", label: "Turin", group: "Italy" },
        ],
        "onUpdate:modelValue": (v?: string | string[]) => got.push(v as string),
      },
    });
    await page.getByRole("button", { name: "Show options" }).click();
    await expanded(inputOf(container), "true");
    const headings = Array.from(document.querySelectorAll(".e-opt-group"));
    expect(headings.map((g) => g.textContent)).toEqual(["France", "Italy"]);
    expect(document.querySelectorAll("[role=group]")[0]!.getAttribute("aria-labelledby")).toBe(headings[0]!.id);
    const nice = optionEls()[1]!;
    expect(nice.hasAttribute("data-disabled")).toBe(true);
    expect(nice.classList.contains("e-opt--disabled")).toBe(true);
    nice.click();
    expect(got).toEqual([]);
  });

  test("the chosen option shows bold with a check when the list opens", async () => {
    const { container } = await render(ECombobox, {
      props: { label: "Practitioner", options: PEOPLE, modelValue: "Priya Nair" },
    });
    await page.getByRole("button", { name: "Show options" }).click();
    await expanded(inputOf(container), "true");
    const priya = optionEls().find((o) => o.textContent?.includes("Priya"))!;
    expect(priya.getAttribute("aria-selected")).toBe("true");
    expect(priya.querySelector(".e-icon")).not.toBeNull();
    expect(getComputedStyle(priya.querySelector(".e-opt-label")!).fontWeight).toBe("600");
    expect(optionEls().length).toBe(3);
  });

  test("hint and error come from the field; the hint sits 8px under the control", async () => {
    const { container, rerender } = await render(ECombobox, {
      props: { label: "Practitioner", options: PEOPLE, hint: "Search by name" },
    });
    const input = inputOf(container);
    expect(input.getAttribute("aria-describedby")).toBe(container.querySelector(".e-field-hint")!.id);
    const control = container.querySelector(".e-combo-root")!.getBoundingClientRect();
    const hint = container.querySelector(".e-field-hint")!.getBoundingClientRect();
    expect(Math.round(hint.top - control.bottom)).toBe(8);
    await (rerender as (p: Record<string, unknown>) => Promise<void>)({
      label: "Practitioner",
      options: PEOPLE,
      hint: "Search by name",
      error: "Choose a practitioner",
    });
    await expect.poll(() => input.getAttribute("aria-invalid")).toBe("true");
    expect(container.querySelector(".e-input-wrap")!.hasAttribute("data-invalid")).toBe(true);
    expect(container.querySelector(".e-field-error")!.getAttribute("role")).toBe("alert");
  });

  test("disabled: the input is disabled, the field is dashed, the list never opens", async () => {
    const { container } = await render(ECombobox, {
      props: { label: "Practitioner", options: PEOPLE, disabled: true },
    });
    expect(inputOf(container).disabled).toBe(true);
    const wrap = container.querySelector(".e-input-wrap")!;
    expect(wrap.hasAttribute("data-disabled")).toBe(true);
    expect(getComputedStyle(wrap).outlineStyle).toBe("dashed");
    expect(container.querySelector("[aria-label='Show options']")).toBeNull();
    expect(listbox()).toBeNull();
  });

  test("passes autocomplete, aria-*, data-* and listeners to the input; class and style stay on the wrapper", async () => {
    let focused = 0;
    let blurred = 0;
    const { container } = await render(ECombobox, {
      props: { label: "Practitioner", options: PEOPLE, hint: "h" },
      attrs: {
        autocomplete: "name",
        "data-test": "x",
        "aria-describedby": "extra",
        class: "mine",
        style: "margin: 2px",
        onFocus: () => focused++,
        onBlur: () => blurred++,
      },
    });
    const input = inputOf(container);
    expect(input.getAttribute("autocomplete")).toBe("name");
    expect(input.dataset["test"]).toBe("x");
    expect(input.getAttribute("aria-describedby")).toContain("extra");
    expect(input.getAttribute("aria-describedby")).toContain(container.querySelector(".e-field-hint")!.id);
    expect(container.firstElementChild!.classList.contains("mine")).toBe(true);
    expect((container.firstElementChild as HTMLElement).style.margin).toBe("2px");
    input.focus();
    expect(focused).toBe(1);
    input.blur();
    expect(blurred).toBe(1);
  });

  test("exposes the input and focus()", async () => {
    let api: { input: HTMLInputElement | null; focus: () => void } | null = null;
    const { container } = await render(
      defineComponent({
        render: () =>
          h(ECombobox, { label: "Practitioner", options: PEOPLE, ref: (r: unknown) => (api = r as typeof api) }),
      }),
    );
    expect(api!.input).toBe(inputOf(container));
    api!.focus();
    expect(document.activeElement).toBe(inputOf(container));
  });

  test("the list renders in the configured portal target and is an e-root", async () => {
    const target = document.createElement("div");
    target.id = "themed-combo";
    document.body.appendChild(target);
    const { container } = await render(ECombobox, {
      props: { label: "Practitioner", options: PEOPLE },
      global: { plugins: [createEos({ portalTarget: "#themed-combo" })] },
    });
    await page.getByRole("button", { name: "Show options" }).click();
    await expanded(inputOf(container), "true");
    expect(target.contains(listbox())).toBe(true);
    expect(listbox()!.classList.contains("e-root")).toBe(true);
    target.remove();
  });

  test("words come from useMessages", async () => {
    const { container } = await render(ECombobox, {
      props: { label: "Praticien", options: PEOPLE, modelValue: "Priya Nair" },
      global: { plugins: [createEos({ messages: { clear: "Effacer", showOptions: "Afficher les options" } })] },
    });
    expect(container.querySelector("[aria-label='Effacer']")).not.toBeNull();
    expect(container.querySelector("[aria-label='Afficher les options']")).not.toBeNull();
  });

  test("axe: closed, open, filtered, no matches, loading, invalid, disabled, grouped", async () => {
    const a = await render(ECombobox, { props: { label: "Practitioner", options: PEOPLE, hint: "Search by name" } });
    await expectNoViolations(a.container);
    await page.getByRole("button", { name: "Show options" }).click();
    await expanded(inputOf(a.container), "true");
    await expectNoViolations(document.body);
    await box("Practitioner").fill("ma");
    await expect.poll(() => optionEls().length).toBe(2);
    await expectNoViolations(document.body);
    await box("Practitioner").fill("zzz");
    await expect.poll(() => document.querySelector(".e-opt-status")).not.toBeNull();
    await expectNoViolations(document.body);
    a.unmount();
    const b = await render(ECombobox, { props: { label: "Practitioner", options: [], loading: true } });
    await box("Practitioner").fill("x");
    await expect.poll(() => document.querySelector(".e-opt-status [role=status]")).not.toBeNull();
    await expectNoViolations(document.body);
    b.unmount();
    const c = await render(ECombobox, {
      props: { label: "Practitioner", options: PEOPLE, error: "Choose one", modelValue: "Priya Nair" },
    });
    await expectNoViolations(c.container);
    c.unmount();
    const d = await render(ECombobox, { props: { label: "Practitioner", options: PEOPLE, disabled: true } });
    await expectNoViolations(d.container);
    d.unmount();
    const e = await render(ECombobox, {
      props: {
        label: "City",
        options: [
          { value: "1", label: "Lyon", group: "France", description: "East", icon: "info" },
          { value: "3", label: "Turin", group: "Italy" },
        ],
      },
    });
    await page.getByRole("button", { name: "Show options" }).click();
    await expect.poll(() => optionEls().length).toBe(2);
    await expectNoViolations(document.body);
    e.unmount();
  });
});
