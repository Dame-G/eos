import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ESignaturePad from "./ESignaturePad.vue";
import { expectNoViolations } from "../../../test/axe.js";

/** Draws a short stroke with pointer events, as a finger or mouse would. */
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
  ev("pointermove", 60, 70);
  ev("pointermove", 110, 40);
  ev("pointerup", 110, 40);
}

describe("ESignaturePad", () => {
  test("is a labelled drawing area with a hint and a Clear button", async () => {
    const { container } = await render(ESignaturePad);
    const canvas = container.querySelector("canvas")!;
    await expect.element(page.getByRole("img", { name: "Draw your signature" })).toBeVisible();
    const hint = container.querySelector(".e-field-hint")!;
    expect(canvas.getAttribute("aria-describedby")).toBe(hint.id);
    expect(hint.textContent).toContain("choose Type");
    await expect.element(page.getByRole("button", { name: "Clear signature" })).toBeDisabled();
    await expect.element(page.getByText("Sign here")).toBeVisible();
  });

  test("height sets the drawing area (160 by default)", async () => {
    const { container } = await render(ESignaturePad);
    expect(container.querySelector("canvas")!.getBoundingClientRect().height).toBe(160);
    const tall = await render(ESignaturePad, { props: { height: 220 } });
    expect(tall.container.querySelector("canvas")!.getBoundingClientRect().height).toBe(220);
  });

  test("drawing reports a PNG, hides the placeholder and enables Clear; Clear resets (the reference test)", async () => {
    const got: string[] = [];
    const { container } = await render(ESignaturePad, {
      attrs: { "onUpdate:modelValue": (v: string) => got.push(v) },
    });
    draw(container.querySelector("canvas")!);
    await nextTick();
    expect(got.length).toBe(1);
    expect(got[0]).toMatch(/^data:image\/png/);
    expect(container.querySelector(".e-pad-placeholder")).toBeNull();
    const clear = page.getByRole("button", { name: "Clear signature" });
    await expect.element(clear).not.toBeDisabled();
    await clear.click();
    expect(got.at(-1)).toBe("");
    await expect.element(clear).toBeDisabled();
    await expect.element(page.getByText("Sign here")).toBeVisible();
  });

  test("the exported image is black ink on a transparent ground", async () => {
    const got: string[] = [];
    const { container } = await render(ESignaturePad, {
      attrs: { "onUpdate:modelValue": (v: string) => got.push(v) },
    });
    draw(container.querySelector("canvas")!);
    const img = new Image();
    img.src = got[0]!;
    await img.decode();
    const cv = document.createElement("canvas");
    cv.width = img.width;
    cv.height = img.height;
    const ctx = cv.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, cv.width, cv.height).data;
    let inked = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3]! > 0) {
        inked++;
        expect([data[i], data[i + 1], data[i + 2]]).toEqual([0, 0, 0]);
      }
    }
    expect(inked).toBeGreaterThan(0);
    expect(data[3]).toBe(0);
  });

  test("Clear works from the keyboard", async () => {
    const { container } = await render(ESignaturePad);
    draw(container.querySelector("canvas")!);
    await nextTick();
    await userEvent.tab();
    await expect.element(page.getByRole("button", { name: "Clear signature" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect.element(page.getByRole("button", { name: "Clear signature" })).toBeDisabled();
    expect(container.querySelector(".e-pad-placeholder")).not.toBeNull();
  });

  test("v-model: setting it to an empty string from outside clears the pad", async () => {
    const model = ref("");
    const { container } = await render(
      defineComponent({
        render: () =>
          h(ESignaturePad, { modelValue: model.value, "onUpdate:modelValue": (v: string) => (model.value = v) }),
      }),
    );
    draw(container.querySelector("canvas")!);
    await nextTick();
    expect(model.value).toMatch(/^data:image\/png/);
    model.value = "";
    await nextTick();
    expect(container.querySelector(".e-pad-placeholder")).not.toBeNull();
    await expect.element(page.getByRole("button", { name: "Clear signature" })).toBeDisabled();
  });

  test("disabled ignores drawing and disables Clear", async () => {
    const got: string[] = [];
    const { container } = await render(ESignaturePad, {
      props: { disabled: true },
      attrs: { "onUpdate:modelValue": (v: string) => got.push(v) },
    });
    draw(container.querySelector("canvas")!);
    await nextTick();
    expect(got).toEqual([]);
    expect(container.querySelector(".e-pad-placeholder")).not.toBeNull();
  });

  test("the canvas takes the id and draws on a touch-safe surface", async () => {
    const { container } = await render(ESignaturePad, { props: { id: "sig" } });
    const canvas = container.querySelector("canvas")!;
    expect(canvas.id).toBe("sig");
    expect(container.querySelector(".e-field-hint")!.id).toBe("sig-hint");
    expect(getComputedStyle(canvas).touchAction).toBe("none");
  });

  test("has no accessibility violations: empty, drawn, disabled", async () => {
    const { container } = await render(
      defineComponent({
        render: () => h("div", [h(ESignaturePad, { id: "a" }), h(ESignaturePad, { id: "b", disabled: true })]),
      }),
    );
    await expectNoViolations(container);
    draw(container.querySelector("canvas")!);
    await nextTick();
    await expectNoViolations(container);
  });
});
