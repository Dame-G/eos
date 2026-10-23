import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EPhoneField from "./EPhoneField.vue";
import { expectNoViolations } from "../../../test/axe.js";
import { expectPostingContract } from "../../../test/formPosting.js";

describe("EPhoneField", () => {
  test("is a labelled tel input that shows the number pad and can be filled by a browser", async () => {
    const { container } = await render(EPhoneField, { props: { label: "Mobile" } });
    await expect.element(page.getByRole("textbox", { name: "Mobile" })).toBeVisible();
    const input = container.querySelector("input")!;
    expect(input.type).toBe("tel");
    expect(input.getAttribute("inputmode")).toBe("tel");
    expect(input.autocomplete).toBe("tel");
    expect(input.className).toBe("e-input");
  });

  test("the label is Phone number by default", async () => {
    await render(EPhoneField);
    await expect.element(page.getByLabelText("Phone number")).toBeVisible();
  });

  test("name is set on the input", async () => {
    const { container } = await render(EPhoneField, { props: { label: "Mobile", name: "mobile" } });
    expect(container.querySelector("input")!.name).toBe("mobile");
  });

  test("groups digits as you type", async () => {
    const { container } = await render(EPhoneField, { props: { label: "Mobile" } });
    await page.getByRole("textbox", { name: "Mobile" }).fill("5551234567");
    expect(container.querySelector("input")!.value).toBe("(555) 123-4567");
  });

  test("groups partial numbers, drops a leading 1 and caps at ten digits", async () => {
    const { container } = await render(EPhoneField, { props: { label: "Mobile" } });
    const box = page.getByRole("textbox", { name: "Mobile" });
    await box.fill("55512");
    expect(container.querySelector("input")!.value).toBe("(555) 12");
    await box.fill("15551234567");
    expect(container.querySelector("input")!.value).toBe("(555) 123-4567");
    await box.fill("555123456789");
    expect(container.querySelector("input")!.value).toBe("(555) 123-4567");
  });

  test("typing with the keyboard formats each keystroke", async () => {
    const { container } = await render(EPhoneField, { props: { label: "Mobile" } });
    await userEvent.tab();
    await userEvent.keyboard("5551234567");
    expect(container.querySelector("input")!.value).toBe("(555) 123-4567");
  });

  test("editing in the middle keeps the caret next to the digit just typed", async () => {
    const { container } = await render(EPhoneField, { props: { label: "Mobile" } });
    const input = container.querySelector("input")!;
    await page.getByRole("textbox", { name: "Mobile" }).fill("5551234567");
    input.focus();
    input.setSelectionRange(4, 4);
    await userEvent.keyboard("9");
    expect(input.value).toBe("(555) 912-3456");
    expect(input.selectionStart).toBe(7);
  });

  test("a leading 1 is dropped as soon as it is typed, so the text never shifts later", async () => {
    const { container } = await render(EPhoneField, { props: { label: "Mobile" } });
    await userEvent.tab();
    await userEvent.keyboard("15");
    expect(container.querySelector("input")!.value).toBe("5");
    await userEvent.keyboard("551234567");
    expect(container.querySelector("input")!.value).toBe("(555) 123-4567");
  });

  test("format e164 keeps a plus and up to 15 digits", async () => {
    const { container } = await render(EPhoneField, { props: { label: "Mobile", format: "e164" } });
    await page.getByRole("textbox", { name: "Mobile" }).fill("+44 20 7946 0958");
    expect(container.querySelector("input")!.value).toBe("+442079460958");
  });

  test("readonly shows the number and blocks editing", async () => {
    const { container } = await render(EPhoneField, {
      props: { label: "Mobile", readonly: true, modelValue: "5551234567" },
    });
    const input = container.querySelector("input")!;
    expect(input.readOnly).toBe(true);
    expect(input.value).toBe("(555) 123-4567");
  });

  test("format none leaves the text alone", async () => {
    const { container } = await render(EPhoneField, { props: { label: "Mobile", format: "none" } });
    await page.getByRole("textbox", { name: "Mobile" }).fill("+44 20 7946 0958");
    expect(container.querySelector("input")!.value).toBe("+44 20 7946 0958");
  });

  test("v-model gets the formatted value, and a model value is formatted for display", async () => {
    const model = ref("5551234567");
    const got: string[] = [];
    const { container } = await render(
      defineComponent({
        render: () =>
          h(EPhoneField, {
            label: "Mobile",
            modelValue: model.value,
            "onUpdate:modelValue": (v: string) => {
              got.push(v);
              model.value = v;
            },
          }),
      }),
    );
    expect(container.querySelector("input")!.value).toBe("(555) 123-4567");
    await page.getByRole("textbox", { name: "Mobile" }).fill("2125550100");
    expect(got.at(-1)).toBe("(212) 555-0100");
    model.value = "3105550123";
    await nextTick();
    expect(container.querySelector("input")!.value).toBe("(310) 555-0123");
  });

  test("a keystroke that formats away does not leave stray text in the input", async () => {
    const { container } = await render(EPhoneField, { props: { label: "Mobile", modelValue: "555" } });
    await page.getByRole("textbox", { name: "Mobile" }).fill("555x");
    await nextTick();
    expect(container.querySelector("input")!.value).toBe("555");
  });

  test("passes name and autocomplete overrides to the input; class stays on the wrapper", async () => {
    const { container } = await render(EPhoneField, {
      props: { label: "Mobile" },
      attrs: { name: "phone", autocomplete: "tel-national", class: "mine" },
    });
    const input = container.querySelector("input")!;
    expect(input.name).toBe("phone");
    expect(input.autocomplete).toBe("tel-national");
    expect((container.firstElementChild as HTMLElement).className).toContain("mine");
  });

  test("hint, error, required and disabled behave like a text field", async () => {
    const hinted = await render(EPhoneField, { props: { label: "A", hint: "We text codes", required: true } });
    expect(hinted.container.querySelector(".e-field-hint")!.textContent).toBe("We text codes");
    expect(hinted.container.querySelector("input")!.required).toBe(true);
    const bad = await render(EPhoneField, { props: { label: "B", error: "Enter a phone number" } });
    expect(bad.container.querySelector("input")!.getAttribute("aria-invalid")).toBe("true");
    const off = await render(EPhoneField, { props: { label: "C", disabled: true } });
    expect(off.container.querySelector("input")!.disabled).toBe(true);
  });

  test("has no accessibility violations: default, hinted, invalid, disabled", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(EPhoneField, { label: "Default" }),
            h(EPhoneField, { label: "Hinted", hint: "We text codes", modelValue: "5551234567" }),
            h(EPhoneField, { label: "Invalid", error: "Enter a phone number" }),
            h(EPhoneField, { label: "Disabled", disabled: true }),
          ]),
      }),
    );
    await expectNoViolations(container);
  });

  test("valueFormat e164 stores +1 and the digits, and shows the formatted number", async () => {
    const model = ref("");
    const { container } = await render(
      defineComponent({
        render: () =>
          h(EPhoneField, {
            modelValue: model.value,
            valueFormat: "e164",
            format: "us",
            "onUpdate:modelValue": (v: string) => (model.value = v),
          }),
      }),
    );
    await page.getByRole("textbox", { name: "Phone number" }).fill("5551234567");
    expect(model.value).toBe("+15551234567");
    expect(container.querySelector("input")!.value).toBe("(555) 123-4567");
  });

  test("valueFormat digits stores the digits alone, and a stored value is read back into the format", async () => {
    const model = ref("5551234567");
    const { container } = await render(
      defineComponent({
        render: () =>
          h(EPhoneField, {
            modelValue: model.value,
            valueFormat: "digits",
            format: "us",
            "onUpdate:modelValue": (v: string) => (model.value = v),
          }),
      }),
    );
    expect(container.querySelector("input")!.value).toBe("(555) 123-4567");
    await page.getByRole("textbox", { name: "Phone number" }).fill("5559876543");
    expect(model.value).toBe("5559876543");
  });

  test("clearable, size and loading pass through to the text field", async () => {
    const { container } = await render(EPhoneField, {
      props: { modelValue: "5551234567", clearable: true, size: "sm", loading: true },
    });
    expect(container.querySelector(".e-input-btn")).not.toBeNull();
    expect(container.querySelector(".e-input-spin")).not.toBeNull();
    expect(container.querySelector("input")!.getAttribute("data-size")).toBe("sm");
  });

  test("a disabled phone field posts nothing, and a named one joins a form it is outside of", async () => {
    await expectPostingContract(EPhoneField, { modelValue: "5551234567", format: "us" });
  });

  test("with valueFormat the form posts the model while the input shows the formatted number", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("form", [h(EPhoneField, { modelValue: "+15551234567", valueFormat: "e164", format: "us", name: "phone" })]),
      }),
    );
    const input = container.querySelector<HTMLInputElement>("input:not([type=hidden])")!;
    expect(input.value).toBe("(555) 123-4567");
    expect(input.hasAttribute("name")).toBe(false);
    expect(new FormData(container.querySelector("form")!).get("phone")).toBe("+15551234567");
  });
});
