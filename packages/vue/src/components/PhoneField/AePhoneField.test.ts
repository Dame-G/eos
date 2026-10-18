import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AePhoneField from "./AePhoneField.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("AePhoneField", () => {
  test("is a labelled tel input that shows the number pad and can be filled by a browser", async () => {
    const { container } = await render(AePhoneField, { props: { label: "Mobile" } });
    await expect.element(page.getByRole("textbox", { name: "Mobile" })).toBeVisible();
    const input = container.querySelector("input")!;
    expect(input.type).toBe("tel");
    expect(input.getAttribute("inputmode")).toBe("tel");
    expect(input.autocomplete).toBe("tel");
    expect(input.className).toBe("ae-input");
  });

  test("the label is Phone number by default", async () => {
    await render(AePhoneField);
    await expect.element(page.getByLabelText("Phone number")).toBeVisible();
  });

  test("groups digits as you type (the reference test)", async () => {
    const { container } = await render(AePhoneField, { props: { label: "Mobile" } });
    await page.getByRole("textbox", { name: "Mobile" }).fill("5551234567");
    expect(container.querySelector("input")!.value).toBe("(555) 123-4567");
  });

  test("groups partial numbers, drops a leading 1 and caps at ten digits", async () => {
    const { container } = await render(AePhoneField, { props: { label: "Mobile" } });
    const box = page.getByRole("textbox", { name: "Mobile" });
    await box.fill("55512");
    expect(container.querySelector("input")!.value).toBe("(555) 12");
    await box.fill("15551234567");
    expect(container.querySelector("input")!.value).toBe("(555) 123-4567");
    await box.fill("555123456789");
    expect(container.querySelector("input")!.value).toBe("(555) 123-4567");
  });

  test("typing with the keyboard formats each keystroke", async () => {
    const { container } = await render(AePhoneField, { props: { label: "Mobile" } });
    await userEvent.tab();
    await userEvent.keyboard("5551234567");
    expect(container.querySelector("input")!.value).toBe("(555) 123-4567");
  });

  test("format none leaves the text alone", async () => {
    const { container } = await render(AePhoneField, { props: { label: "Mobile", format: "none" } });
    await page.getByRole("textbox", { name: "Mobile" }).fill("+44 20 7946 0958");
    expect(container.querySelector("input")!.value).toBe("+44 20 7946 0958");
  });

  test("v-model gets the formatted value, and a model value is formatted for display", async () => {
    const model = ref("5551234567");
    const got: string[] = [];
    const { container } = await render(
      defineComponent({
        render: () =>
          h(AePhoneField, {
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
    const { container } = await render(AePhoneField, { props: { label: "Mobile", modelValue: "555" } });
    await page.getByRole("textbox", { name: "Mobile" }).fill("555x");
    await nextTick();
    expect(container.querySelector("input")!.value).toBe("555");
  });

  test("passes name and autocomplete overrides to the input; class stays on the wrapper", async () => {
    const { container } = await render(AePhoneField, {
      props: { label: "Mobile" },
      attrs: { name: "phone", autocomplete: "tel-national", class: "mine" },
    });
    const input = container.querySelector("input")!;
    expect(input.name).toBe("phone");
    expect(input.autocomplete).toBe("tel-national");
    expect((container.firstElementChild as HTMLElement).className).toContain("mine");
  });

  test("hint, error, required and disabled behave like a text field", async () => {
    const hinted = await render(AePhoneField, { props: { label: "A", hint: "We text codes", required: true } });
    expect(hinted.container.querySelector(".ae-field-hint")!.textContent).toBe("We text codes");
    expect(hinted.container.querySelector("input")!.required).toBe(true);
    const bad = await render(AePhoneField, { props: { label: "B", error: "Enter a phone number" } });
    expect(bad.container.querySelector("input")!.getAttribute("aria-invalid")).toBe("true");
    const off = await render(AePhoneField, { props: { label: "C", disabled: true } });
    expect(off.container.querySelector("input")!.disabled).toBe(true);
  });

  test("has no accessibility violations: default, hinted, invalid, disabled", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(AePhoneField, { label: "Default" }),
            h(AePhoneField, { label: "Hinted", hint: "We text codes", modelValue: "5551234567" }),
            h(AePhoneField, { label: "Invalid", error: "Enter a phone number" }),
            h(AePhoneField, { label: "Disabled", disabled: true }),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});
