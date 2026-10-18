import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AeAutocomplete from "./AeAutocomplete.vue";
import { expectNoViolations } from "../../../test/axe.js";

const STREETS = ["12 Elm Street", "14 Elm Street", "9 Oak Avenue"];
const optionEls = () => Array.from(document.querySelectorAll<HTMLElement>("[role=option]"));
const inputOf = (c: Element) => c.querySelector<HTMLInputElement>("input.ae-combo-input")!;
const box = (name: string) => page.getByRole("combobox", { name });
const expanded = (el: Element, v: "true" | "false") => expect.poll(() => el.getAttribute("aria-expanded")).toBe(v);

describe("AeAutocomplete", () => {
  test("is a labelled combobox input with no toggle button and no native select", async () => {
    const { container } = await render(AeAutocomplete, { props: { label: "Street", options: STREETS } });
    container.classList.add("ae-root");
    await expect.element(box("Street")).toBeVisible();
    expect(container.querySelector("[aria-label='Show options']")).toBeNull();
    expect(container.querySelector(".ae-combo")).not.toBeNull();
    expect(Math.round(container.querySelector(".ae-combo")!.getBoundingClientRect().height)).toBe(48);
    expect(document.querySelector("select")).toBeNull();
  });

  test("suggestions appear as people type, and anything typed is accepted", async () => {
    const got: string[] = [];
    const { container } = await render(AeAutocomplete, {
      props: { label: "Street", options: STREETS, "onUpdate:modelValue": (v: string) => got.push(v) },
    });
    await box("Street").fill("elm");
    await expect.poll(() => optionEls().map((o) => o.textContent?.trim())).toEqual(["12 Elm Street", "14 Elm Street"]);
    expect(got.at(-1)).toBe("elm");
    await box("Street").fill("77 Birch Road");
    await expect.poll(() => optionEls().length).toBe(0);
    await expanded(inputOf(container), "false");
    expect(got.at(-1)).toBe("77 Birch Road");
    await userEvent.tab();
    await userEvent.tab();
    expect(inputOf(container).value).toBe("77 Birch Road");
  });

  test("choosing a suggestion puts its text in the field and the model; the next ArrowDown reopens the list", async () => {
    const got: string[] = [];
    const { container } = await render(AeAutocomplete, {
      props: { label: "Street", options: STREETS, "onUpdate:modelValue": (v: string) => got.push(v) },
    });
    await box("Street").fill("elm");
    await expect.poll(() => optionEls().length).toBe(2);
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => got.at(-1)).toBe("14 Elm Street");
    expect(inputOf(container).value).toBe("14 Elm Street");
    await expanded(inputOf(container), "false");
    expect(document.activeElement).toBe(inputOf(container));
    await userEvent.keyboard("{ArrowDown}");
    await expanded(inputOf(container), "true");
  });

  test("the model is the text, even for object options", async () => {
    const got: string[] = [];
    await render(AeAutocomplete, {
      props: {
        label: "Pharmacy",
        options: [{ value: "p1", label: "Corner Pharmacy" }],
        "onUpdate:modelValue": (v: string) => got.push(v),
      },
    });
    await box("Pharmacy").fill("cor");
    await expect.poll(() => optionEls().length).toBe(1);
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => got.at(-1)).toBe("Corner Pharmacy");
  });

  test("Escape closes the list, then clears the text", async () => {
    const got: string[] = [];
    const { container } = await render(AeAutocomplete, {
      props: { label: "Street", options: STREETS, "onUpdate:modelValue": (v: string) => got.push(v) },
    });
    await box("Street").fill("elm");
    await expanded(inputOf(container), "true");
    await userEvent.keyboard("{Escape}");
    await expanded(inputOf(container), "false");
    expect(inputOf(container).value).toBe("elm");
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => inputOf(container).value).toBe("");
    expect(got.at(-1)).toBe("");
  });

  test("inputChange tells the page what was typed, so it can fetch suggestions; loading shows Searching", async () => {
    const heard: string[] = [];
    await render(AeAutocomplete, {
      props: { label: "Street", options: [], loading: true, onInputChange: (t: string) => heard.push(t) },
    });
    await box("Street").fill("el");
    expect(heard).toEqual(["el"]);
    await expect
      .poll(() => document.querySelector(".ae-opt-status [role=status]")?.textContent?.trim())
      .toBe("Searching");
  });

  test("name submits the text in one hidden input", async () => {
    const { container } = await render(AeAutocomplete, {
      props: { label: "Street", name: "street", options: STREETS, modelValue: "1 Free Text" },
    });
    const hidden = container.querySelectorAll<HTMLInputElement>("input[type=hidden]");
    expect(hidden.length).toBe(1);
    expect(hidden[0]!.name).toBe("street");
    expect(hidden[0]!.value).toBe("1 Free Text");
    expect(inputOf(container).value).toBe("1 Free Text");
  });

  test("v-model round trip: the text comes back first; a new model value shows in the input", async () => {
    const model = ref("");
    const got: string[] = [];
    const { container } = await render(
      defineComponent({
        render: () =>
          h(AeAutocomplete, {
            label: "Street",
            options: STREETS,
            modelValue: model.value,
            "onUpdate:modelValue": (v: string) => {
              got.push(v);
              model.value = v;
            },
          }),
      }),
    );
    await box("Street").fill("oak");
    expect(got.at(-1)).toBe("oak");
    model.value = "Elsewhere";
    await nextTick();
    await expect.poll(() => inputOf(container).value).toBe("Elsewhere");
  });

  test("without v-model it keeps its own text", async () => {
    const { container } = await render(AeAutocomplete, { props: { label: "Street", options: STREETS } });
    await box("Street").fill("something else");
    await userEvent.tab();
    await userEvent.tab();
    expect(inputOf(container).value).toBe("something else");
  });

  test("hint, error, disabled and attribute fall-through behave as in a text field", async () => {
    const { container, rerender } = await render(AeAutocomplete, {
      props: { label: "Street", options: STREETS, hint: "Start typing" },
      attrs: { autocomplete: "street-address", "data-test": "x" },
    });
    const input = inputOf(container);
    expect(input.getAttribute("autocomplete")).toBe("street-address");
    expect(input.dataset["test"]).toBe("x");
    expect(input.getAttribute("aria-describedby")).toBe(container.querySelector(".ae-field-hint")!.id);
    await (rerender as (p: Record<string, unknown>) => Promise<void>)({
      label: "Street",
      options: STREETS,
      error: "Enter an address",
    });
    await expect.poll(() => input.getAttribute("aria-invalid")).toBe("true");
    await (rerender as (p: Record<string, unknown>) => Promise<void>)({
      label: "Street",
      options: STREETS,
      disabled: true,
    });
    await expect.poll(() => input.disabled).toBe(true);
  });

  test("axe: closed, open, loading, invalid, disabled", async () => {
    const a = await render(AeAutocomplete, { props: { label: "Street", options: STREETS, hint: "Start typing" } });
    await expectNoViolations(a.container);
    await box("Street").fill("elm");
    await expect.poll(() => optionEls().length).toBe(2);
    await expectNoViolations(document.body);
    a.unmount();
    const b = await render(AeAutocomplete, { props: { label: "Street", options: [], loading: true } });
    await box("Street").fill("e");
    await expect.poll(() => document.querySelector(".ae-opt-status")).not.toBeNull();
    await expectNoViolations(document.body);
    b.unmount();
    const c = await render(AeAutocomplete, { props: { label: "Street", options: STREETS, error: "Enter an address" } });
    await expectNoViolations(c.container);
    c.unmount();
    const d = await render(AeAutocomplete, { props: { label: "Street", options: STREETS, disabled: true } });
    await expectNoViolations(d.container);
  });
});
