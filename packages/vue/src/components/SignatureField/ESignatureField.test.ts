import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ESignatureField, { type SignatureValue } from "./ESignatureField.vue";
import { expectNoViolations } from "../../../test/axe.js";
import { expectPostingContract } from "../../../test/formPosting.js";

const date = new Date(2026, 8, 22);

function draw(cv: HTMLCanvasElement) {
  const r = cv.getBoundingClientRect();
  const ev = (type: string, x: number, y: number) =>
    cv.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        clientX: r.left + x,
        clientY: r.top + y,
      }),
    );
  ev("pointerdown", 10, 50);
  ev("pointermove", 80, 70);
  ev("pointerup", 80, 70);
}

async function mount(props: Record<string, unknown> = {}) {
  const model = ref<SignatureValue>({ method: "type", name: "", image: "", agreed: false });
  const got: SignatureValue[] = [];
  const result = await render(
    defineComponent({
      render: () =>
        h(ESignatureField, {
          date,
          ...props,
          modelValue: model.value,
          "onUpdate:modelValue": (v: SignatureValue) => {
            got.push(v);
            model.value = v;
          },
        }),
    }),
  );
  return { ...result, model, got };
}

describe("ESignatureField", () => {
  test("is a fieldset named Signature with a typed-name field, the date and an agreement", async () => {
    const { container } = await mount();
    await expect.element(page.getByRole("group", { name: "Signature" })).toBeVisible();
    await expect.element(page.getByRole("textbox", { name: /Type your full name/ })).toBeVisible();
    await expect.element(page.getByRole("checkbox", { name: "I agree and want to sign this form." })).toBeVisible();
    expect(container.querySelector(".e-sign-date")!.textContent).toBe("September 22, 2026");
    expect(container.querySelector(".e-sign-empty")!.textContent).toBe("Your signature appears here");
  });

  test("a hint is announced with the group", async () => {
    const { container } = await mount({ hint: "Sign as the patient" });
    const fs = container.querySelector("fieldset")!;
    expect(fs.getAttribute("aria-describedby")).toBe(container.querySelector(".e-sign > .e-field-hint")!.id);
    expect(fs.hasAttribute("aria-invalid")).toBe(false);
  });

  test("an error replaces the hint and goes down to the typed-name input, not onto the fieldset", async () => {
    const { container } = await mount({ hint: "Sign as the patient", error: "Sign the form" });
    expect(container.querySelector("fieldset")!.hasAttribute("aria-invalid")).toBe(false);
    expect(container.textContent).not.toContain("Sign as the patient");
    const input = container.querySelector<HTMLInputElement>("input[type=text]")!;
    expect(input.getAttribute("aria-invalid")).toBe("true");
    const alerts = container.querySelectorAll("[role=alert]");
    expect(alerts).toHaveLength(1);
    expect(alerts[0]!.textContent).toContain("Sign the form");
    expect(input.getAttribute("aria-describedby")).toContain(alerts[0]!.id);
  });

  test("in draw mode the error marks the pad", async () => {
    const { container } = await mount({ mode: "draw", error: "Sign the form" });
    expect(container.querySelector(".e-pad-surface")!.hasAttribute("data-invalid")).toBe(true);
    expect(container.querySelector("canvas")!.getAttribute("aria-describedby")).toContain(
      container.querySelector("[role=alert]")!.id,
    );
    expect(container.querySelectorAll("[role=alert]")).toHaveLength(1);
  });

  test("name submits the typed name, or the drawn image, through a hidden input", async () => {
    const { container } = await mount({ name: "signature" });
    await page.getByRole("textbox", { name: /Type your full name/ }).fill("Ada Lovelace");
    expect(container.querySelector<HTMLInputElement>("input[type=hidden][name=signature]")!.value).toBe("Ada Lovelace");
    const none = await mount();
    expect(none.container.querySelector("input[type=hidden]")).toBeNull();
  });

  test("a custom label and agreement are used", async () => {
    await mount({ label: "Consent form", agreement: "I accept the terms." });
    await expect.element(page.getByRole("group", { name: "Consent form" })).toBeVisible();
    await expect.element(page.getByRole("checkbox", { name: "I accept the terms." })).toBeVisible();
  });

  test("typing the name and agreeing reports both, and shows the name on the line", async () => {
    const { container, got, model } = await mount();
    await page.getByRole("textbox", { name: /Type your full name/ }).fill("Maria Okafor");
    await page.getByRole("checkbox", { name: /I agree/ }).click();
    await nextTick();
    expect(got.at(-1)).toEqual({ method: "type", name: "Maria Okafor", image: "", agreed: true });
    expect(model.value.name).toBe("Maria Okafor");
    expect(container.querySelector(".e-sign-line")!.textContent).toContain("Maria Okafor");
    expect(container.querySelector(".e-sign-line")!.hasAttribute("aria-live")).toBe(false);
  });

  test("the name uses a handwriting face on the signature line", async () => {
    const { container } = await mount();
    await page.getByRole("textbox", { name: /Type your full name/ }).fill("Ana");
    await nextTick();
    expect(getComputedStyle(container.querySelector(".e-sign-name")!).fontStyle).toBe("italic");
  });

  test("a model value fills the name and the agreement", async () => {
    const { container } = await render(ESignatureField, {
      props: { date, modelValue: { method: "type", name: "Lee", image: "", agreed: true } },
    });
    await expect.element(page.getByRole("textbox", { name: /Type your full name/ })).toHaveValue("Lee");
    await expect.element(page.getByRole("checkbox", { name: /I agree/ })).toBeChecked();
    expect(container.querySelector(".e-sign-name")!.textContent).toBe("Lee");
  });

  test("without v-model it keeps its own state", async () => {
    await render(ESignatureField, { props: { date } });
    await page.getByRole("textbox", { name: /Type your full name/ }).fill("Local");
    await expect.element(page.getByRole("textbox", { name: /Type your full name/ })).toHaveValue("Local");
  });

  test("mode both adds a Type and Draw switch; Draw shows the pad and the date", async () => {
    const { container, got } = await mount({ mode: "both" });
    await expect.element(page.getByRole("radio", { name: "Type" })).toBeChecked();
    await page.getByRole("radio", { name: "Draw" }).click({ force: true });
    await expect.element(page.getByRole("img", { name: "Draw your signature" })).toBeVisible();
    expect(container.querySelector("input[type=text]")).toBeNull();
    expect(container.querySelector(".e-sign-date--solo")!.textContent).toBe("September 22, 2026");
    expect(got.at(-1)!.method).toBe("draw");
  });

  test("a drawn signature reports its image; switching back to Type drops the image but keeps the name", async () => {
    const { container, got } = await mount({ mode: "both" });
    await page.getByRole("textbox", { name: /Type your full name/ }).fill("Kim");
    await page.getByRole("radio", { name: "Draw" }).click({ force: true });
    draw(container.querySelector("canvas")!);
    await nextTick();
    expect(got.at(-1)!.image).toMatch(/^data:image\/png/);
    expect(got.at(-1)!.method).toBe("draw");
    expect(got.at(-1)!.name).toBe("Kim");
    await page.getByRole("radio", { name: "Type" }).click({ force: true });
    expect(got.at(-1)!.image).toBe("");
    expect(got.at(-1)!.method).toBe("type");
    await expect.element(page.getByRole("textbox", { name: /Type your full name/ })).toHaveValue("Kim");
  });

  test("mode draw shows only the pad", async () => {
    const { container } = await mount({ mode: "draw" });
    expect(container.querySelector("canvas")).not.toBeNull();
    expect(container.querySelector("input[type=text]")).toBeNull();
    expect(container.querySelector(".e-seg")).toBeNull();
  });

  test("the switch and the pad's Clear work from the keyboard", async () => {
    await mount({ mode: "both" });
    page.getByRole("radio", { name: "Type" }).element().focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(page.getByRole("radio", { name: "Draw" })).toBeChecked();
    await expect.element(page.getByRole("button", { name: "Clear signature" })).toBeVisible();
  });

  test("the typed name autocompletes as a name and is required only when asked", async () => {
    const { container } = await mount();
    const input = container.querySelector<HTMLInputElement>("input[type=text]")!;
    expect(input.required).toBe(false);
    expect(input.autocomplete).toBe("name");
    const req = await mount({ required: true });
    expect(req.container.querySelector<HTMLInputElement>("input[type=text]")!.required).toBe(true);
    expect(req.container.querySelectorAll(".e-field-flag")).toHaveLength(1);
    const drawn = await mount({ required: true, mode: "draw" });
    expect(drawn.container.querySelector(".e-fieldset-legend .e-field-flag")!.textContent).toBe("Required");
  });

  test("disabled disables the fields and the agreement", async () => {
    await mount({ disabled: true, mode: "both" });
    await expect.element(page.getByRole("textbox", { name: /Type your full name/ })).toBeDisabled();
    await expect.element(page.getByRole("checkbox", { name: /I agree/ })).toBeDisabled();
  });

  test("a named field posts the typed name, nothing while disabled, and joins a form it is outside of", async () => {
    await expectPostingContract(ESignatureField, {
      modelValue: { method: "type", name: "Ada Lovelace", image: "", agreed: true },
    });
  });

  test("disabled does not submit the hidden input", async () => {
    const { container } = await mount({ disabled: true, name: "signature" });
    const hidden = container.querySelector<HTMLInputElement>("input[type=hidden]")!;
    expect(hidden.disabled).toBe(true);
    const form = document.createElement("form");
    form.append(hidden);
    expect(new FormData(form).has("signature")).toBe(false);
  });

  test("readonly shows the value, blocks changes and still submits", async () => {
    const { container, got } = await mount({ readonly: true, name: "signature", mode: "both" });
    const input = container.querySelector<HTMLInputElement>("input[type=text]")!;
    expect(input.readOnly).toBe(true);
    expect(input.disabled).toBe(false);
    await page.getByRole("checkbox", { name: /I agree/ }).click({ force: true });
    // The Type and Draw switch is read-only, not disabled: it stays focusable and readable.
    await expect.element(page.getByRole("radio", { name: "Draw" })).toBeEnabled();
    expect(container.querySelector(".e-seg")!.getAttribute("aria-readonly")).toBe("true");
    await page.getByRole("radio", { name: "Draw" }).click({ force: true });
    expect(got).toEqual([]);
    expect(container.querySelector<HTMLInputElement>("input[type=hidden]")!.disabled).toBe(false);
  });

  test("has no accessibility violations: typed, both, drawn, disabled", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(ESignatureField, { date, label: "Typed" }),
            h(ESignatureField, { date, label: "Either", mode: "both" }),
            h(ESignatureField, { date, label: "Drawn", mode: "draw" }),
            h(ESignatureField, { date, label: "Locked", mode: "both", disabled: true }),
            h(ESignatureField, { date, label: "Read only", readonly: true, required: true }),
            h(ESignatureField, { date, label: "Invalid", mode: "draw", error: "Sign", hint: "Hint" }),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});
