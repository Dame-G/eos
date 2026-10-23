import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref, type Component } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EForm from "./EForm.vue";
import ETextField from "../TextField/ETextField.vue";
import ESelectGeneric from "../Select/ESelect.vue";
import ECheckbox from "../Checkbox/ECheckbox.vue";
import ESwitch from "../Switch/ESwitch.vue";
import ESegmentedGeneric from "../Segmented/ESegmented.vue";
import ECheckboxGroupGeneric from "../CheckboxGroup/ECheckboxGroup.vue";
import ERadioGroupGeneric from "../RadioGroup/ERadioGroup.vue";
import ESignaturePad from "../SignaturePad/ESignaturePad.vue";
import EFieldset from "../Fieldset/EFieldset.vue";
import { expectNoViolations } from "../../../test/axe.js";

const ESelect = ESelectGeneric as unknown as Component;
const ESegmented = ESegmentedGeneric as unknown as Component;
const ECheckboxGroup = ECheckboxGroupGeneric as unknown as Component;
const ERadioGroup = ERadioGroupGeneric as unknown as Component;

type FormApi = { validate(): boolean; reset(): void; focusFirstInvalid(): void; issues: { id: string }[] };

function setup(opts: { formProps?: Record<string, unknown>; nameError?: string; extra?: () => unknown[] } = {}) {
  const events = { submit: 0, invalid: 0, reset: 0 };
  const api = ref<FormApi | null>(null);
  const name = ref("");
  const nameError = ref(opts.nameError);
  const view = render(
    defineComponent({
      render: () =>
        h(
          EForm,
          {
            ref: (r: unknown) => (api.value = r as FormApi),
            ...opts.formProps,
            onSubmit: (e: Event) => {
              e.preventDefault();
              events.submit++;
            },
            onInvalid: () => events.invalid++,
            onReset: () => events.reset++,
          },
          () => [
            h(ETextField, {
              label: "Name",
              required: true,
              error: nameError.value,
              modelValue: name.value,
              "onUpdate:modelValue": (v: string) => (name.value = v),
            }),
            h(ETextField, { label: "Email", type: "email", modelValue: "", error: undefined }),
            ...(opts.extra?.() ?? []),
            h("button", { type: "submit" }, "Save"),
          ],
        ),
    }),
  );
  return { events, api, name, nameError, view };
}

describe("EForm", () => {
  test("is a native form that turns the browser's own bubbles off", async () => {
    const { view } = setup();
    const form = (await view).container.querySelector("form")!;
    expect(form.noValidate).toBe(true);
    expect(form.className).toBe("e-form");
  });

  test("a valid form emits submit with the event, and shows no summary", async () => {
    const { events, name, view } = setup();
    const { container } = await view;
    name.value = "Ana";
    await nextTick();
    await page.getByRole("button", { name: "Save" }).click();
    expect(events.submit).toBe(1);
    expect(events.invalid).toBe(0);
    expect(container.querySelector(".e-notice")).toBeNull();
  });

  test("an empty required field stops the submit and the summary lists it with a link", async () => {
    const { events, view } = setup();
    const { container } = await view;
    await page.getByRole("button", { name: "Save" }).click();
    expect(events.submit).toBe(0);
    expect(events.invalid).toBe(1);
    const summary = container.querySelector<HTMLElement>(".e-notice")!;
    expect(summary.getAttribute("role")).toBe("alert");
    expect(summary.textContent).toContain("There is a problem");
    const link = summary.querySelector("a")!;
    expect(link.textContent).toContain("Name");
    expect(link.getAttribute("href")).toBe(`#${container.querySelector("input")!.id}`);
  });

  test("focus moves to the summary, and its link moves it to the field", async () => {
    const { view } = setup();
    const { container } = await view;
    await page.getByRole("button", { name: "Save" }).click();
    await expect.poll(() => document.activeElement).toBe(container.querySelector(".e-notice"));
    container.querySelector<HTMLElement>(".e-notice a")!.click();
    expect(document.activeElement).toBe(container.querySelector("input"));
  });

  test("focusTarget field moves focus to the first invalid field instead", async () => {
    const { view } = setup({ formProps: { focusTarget: "field" } });
    const { container } = await view;
    await page.getByRole("button", { name: "Save" }).click();
    await expect.poll(() => document.activeElement).toBe(container.querySelector("input"));
  });

  test("the error prop of a field is listed even when the browser finds nothing wrong", async () => {
    const { events, name, view } = setup({ nameError: "Already taken" });
    const { container } = await view;
    name.value = "Ana";
    await nextTick();
    await page.getByRole("button", { name: "Save" }).click();
    expect(events.submit).toBe(0);
    expect(container.querySelector(".e-notice a")!.textContent).toContain("Name: Already taken");
  });

  test("the list follows the fields while it is up: a fixed field drops out", async () => {
    const { name, view } = setup();
    const { container } = await view;
    await page.getByRole("button", { name: "Save" }).click();
    expect(container.querySelector(".e-notice")).not.toBeNull();
    await page.getByRole("textbox", { name: /^Name/ }).fill("Ana");
    expect(name.value).toBe("Ana");
    await expect.poll(() => container.querySelector(".e-notice")).toBeNull();
  });

  test("errors set after a submit finishes (a server's answer) bring the summary up", async () => {
    const submitting = ref(true);
    const error = ref<string | undefined>();
    const { container } = await render(
      defineComponent({
        render: () =>
          h(EForm, { submitting: submitting.value }, () => [
            h(ETextField, { label: "Code", modelValue: "x", error: error.value }),
          ]),
      }),
    );
    expect(container.querySelector(".e-notice")).toBeNull();
    error.value = "Code not found";
    submitting.value = false;
    await expect
      .poll(() => container.querySelector(".e-notice a")?.textContent ?? "")
      .toContain("Code: Code not found");
  });

  test("submitting sets aria-busy and ignores a second submit", async () => {
    const { events, name, view } = setup({ formProps: { submitting: true } });
    const { container } = await view;
    name.value = "Ana";
    await nextTick();
    expect(container.querySelector("form")!.getAttribute("aria-busy")).toBe("true");
    await page.getByRole("button", { name: "Save" }).click();
    expect(events.submit).toBe(0);
  });

  test("validate() runs the checks and returns the answer; reset() clears the summary and emits reset", async () => {
    const { api, events, view } = setup();
    const { container } = await view;
    expect(api.value!.validate()).toBe(false);
    await expect.poll(() => container.querySelector(".e-notice")).not.toBeNull();
    expect(api.value!.issues).toHaveLength(1);
    api.value!.reset();
    await expect.poll(() => container.querySelector(".e-notice")).toBeNull();
    expect(events.reset).toBe(1);
  });

  test("a submit button with formnovalidate skips the checks", async () => {
    const { events, view } = setup({
      extra: () => [h("button", { type: "submit", formnovalidate: true }, "Save draft")],
    });
    await view;
    await page.getByRole("button", { name: "Save draft" }).click();
    expect(events.submit).toBe(1);
  });

  test("a native control outside any field is listed by its label", async () => {
    const { view } = setup({
      extra: () => [
        h("label", { for: "terms" }, "Terms"),
        h("input", { id: "terms", type: "checkbox", required: true }),
      ],
    });
    const { container } = await view;
    await userEvent.type(page.getByRole("textbox", { name: /^Name/ }).element(), "Ana");
    await page.getByRole("button", { name: "Save" }).click();
    expect(container.querySelector(".e-notice a")!.textContent).toContain("Terms");
  });

  /** A bare form around the given fields. */
  async function only(fields: () => unknown[]) {
    const api = ref<FormApi | null>(null);
    const view = await render(
      defineComponent({
        render: () => h(EForm, { ref: (r: unknown) => (api.value = r as FormApi) }, () => fields()),
      }),
    );
    const links = () => [...view.container.querySelectorAll(".e-notice a")].map((a) => a.textContent!.trim());
    return { api, links, ...view };
  }

  test("an empty required ESelect stops the submit and is listed; a choice clears it", async () => {
    const plan = ref("");
    const { api, links, container } = await only(() => [
      h(ESelect, {
        label: "Plan",
        options: ["Basic", "Pro"],
        required: true,
        modelValue: plan.value,
        "onUpdate:modelValue": (v: string) => (plan.value = v),
      }),
    ]);
    expect(api.value!.validate()).toBe(false);
    await expect.poll(links).toHaveLength(1);
    expect(links()[0]).toMatch(/^Plan: ./);
    container.querySelector<HTMLElement>(".e-notice a")!.click();
    expect(document.activeElement).toBe(container.querySelector(".e-sel-trigger"));
    plan.value = "Pro";
    await expect.poll(links).toEqual([]);
    expect(api.value!.validate()).toBe(true);
  });

  test("a bare required ESelect checks itself too", async () => {
    const { api } = await only(() => [
      h(ESelect, { bare: true, ariaLabel: "Plan", options: ["Basic"], required: true }),
    ]);
    expect(api.value!.validate()).toBe(false);
    expect(api.value!.issues).toHaveLength(1);
  });

  test("an empty required ERadioGroup is listed once, by the group's label, and its link focuses a radio", async () => {
    const { api, links, container } = await only(() => [
      h(ERadioGroup, { label: "Contact", options: ["Email", "Phone", "Post"], required: true }),
    ]);
    expect(api.value!.validate()).toBe(false);
    await expect.poll(links).toHaveLength(1);
    expect(links()[0]).toMatch(/^Contact: ./);
    container.querySelector<HTMLElement>(".e-notice a")!.click();
    expect(document.activeElement).toBe(container.querySelector(".e-radio"));
  });

  test("a server error on a checkbox, switch, segmented control, group or signature pad reaches the summary", async () => {
    const { api, links } = await only(() => [
      h(ECheckbox, { label: "Terms", error: "Accept the terms" }),
      h(ESwitch, { label: "Alerts", error: "Alerts are off for this plan" }),
      h(ESegmented, { label: "View", options: ["Day", "Week"], error: "Pick a view" }),
      h(ECheckboxGroup, { label: "Channels", options: ["Email", "Text"], error: "Pick one" }),
      h(ERadioGroup, { label: "Size", options: ["S", "M"], modelValue: "S", error: "Out of stock" }),
      h(ESignaturePad, { error: "Sign again" }),
      h(EFieldset, { legend: "Address", error: "We cannot deliver there" }, () => [h(ETextField, { label: "Street" })]),
    ]);
    expect(api.value!.validate()).toBe(false);
    await expect
      .poll(links)
      .toEqual([
        "Terms: Accept the terms",
        "Alerts: Alerts are off for this plan",
        "View: Pick a view",
        "Channels: Pick one",
        "Size: Out of stock",
        "Draw your signature: Sign again",
        "Address: We cannot deliver there",
      ]);
  });

  test("a required signature pad left empty stops the submit", async () => {
    const image = ref("");
    const { api } = await only(() => [h(ESignaturePad, { required: true, modelValue: image.value })]);
    expect(api.value!.validate()).toBe(false);
    image.value = "data:image/png;base64,iVBORw0KGgo=";
    await nextTick();
    expect(api.value!.validate()).toBe(true);
  });

  test("has no accessibility violations with the summary up", async () => {
    const { view } = setup();
    const { container } = await view;
    await page.getByRole("button", { name: "Save" }).click();
    await expectNoViolations(container);
  });
});
