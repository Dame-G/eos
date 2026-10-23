import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ESignaturePad from "./ESignaturePad.vue";
import { expectNoViolations } from "../../../test/axe.js";

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

function inkBounds(cv: HTMLCanvasElement) {
  const data = cv.getContext("2d")!.getImageData(0, 0, cv.width, cv.height).data;
  let max = 0;
  let min = cv.width;
  for (let y = 0; y < cv.height; y++) {
    for (let x = 0; x < cv.width; x++) {
      if (data[(y * cv.width + x) * 4 + 3]! > 0) {
        min = Math.min(min, x);
        max = Math.max(max, x);
      }
    }
  }
  return { min: min / cv.width, max: max / cv.width };
}

function inked(cv: HTMLCanvasElement) {
  return inkBounds(cv).max > 0;
}

function dataUrl(): string {
  const c = document.createElement("canvas");
  c.width = 200;
  c.height = 80;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "black";
  ctx.fillRect(20, 30, 160, 20);
  return c.toDataURL("image/png");
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

  test("drawing reports a PNG, hides the placeholder and enables Clear; Clear resets", async () => {
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

  test("a data URL set through v-model is drawn on the pad, and the pad stops looking empty", async () => {
    const { container } = await render(ESignaturePad, { props: { modelValue: dataUrl() } });
    const cv = container.querySelector("canvas")!;
    await expect.poll(() => inked(cv)).toBe(true);
    expect(container.querySelector(".e-pad-placeholder")).toBeNull();
    await expect.element(page.getByRole("button", { name: "Clear signature" })).not.toBeDisabled();
  });

  test("a data URL that arrives later is drawn too", async () => {
    const model = ref("");
    const { container } = await render(
      defineComponent({
        render: () =>
          h(ESignaturePad, { modelValue: model.value, "onUpdate:modelValue": (v: string) => (model.value = v) }),
      }),
    );
    const cv = container.querySelector("canvas")!;
    expect(inked(cv)).toBe(false);
    model.value = dataUrl();
    await expect.poll(() => inked(cv)).toBe(true);
  });

  test("the strokes keep their place when the pad is resized", async () => {
    const { container } = await render(
      defineComponent({ render: () => h("div", { id: "box", style: { width: "400px" } }, [h(ESignaturePad)]) }),
    );
    const cv = container.querySelector("canvas")!;
    draw(cv);
    await nextTick();
    const before = inkBounds(cv);
    container.querySelector<HTMLElement>("#box")!.style.width = "200px";
    await expect.poll(() => Math.round(cv.getBoundingClientRect().width)).toBeLessThan(250);
    await expect.poll(() => inked(cv)).toBe(true);
    const after = inkBounds(cv);
    expect(Math.abs(after.max - before.max)).toBeLessThan(0.03);
    expect(Math.abs(after.min - before.min)).toBeLessThan(0.03);
  });

  test("the canvas is an image named by the label and described by the instructions", async () => {
    const { container } = await render(ESignaturePad, { props: { id: "p" } });
    const canvas = container.querySelector("canvas")!;
    expect(canvas.getAttribute("role")).toBe("img");
    expect(canvas.getAttribute("aria-label")).toBe("Draw your signature");
    expect(canvas.getAttribute("aria-describedby")).toBe("p-hint");
    expect(canvas.hasAttribute("tabindex")).toBe(false);
  });

  test("a hint shows under the pad and is described with the instructions", async () => {
    const { container } = await render(ESignaturePad, { props: { id: "p", hint: "Sign inside the box" } });
    const canvas = container.querySelector("canvas")!;
    expect(canvas.getAttribute("aria-describedby")).toBe("p-hint p-msg");
    expect(container.querySelector("#p-msg")!.textContent).toBe("Sign inside the box");
    expect(canvas.hasAttribute("aria-invalid")).toBe(false);
  });

  test("an error replaces the hint, marks the pad invalid and is announced", async () => {
    const { container } = await render(ESignaturePad, {
      props: { id: "p", hint: "Sign inside the box", error: "Sign here" },
    });
    const canvas = container.querySelector("canvas")!;
    expect(canvas.getAttribute("aria-invalid")).toBe("true");
    expect(canvas.getAttribute("aria-describedby")).toBe("p-hint p-msg");
    const msg = container.querySelector("#p-msg")!;
    expect(msg.getAttribute("role")).toBe("alert");
    expect(msg.textContent).toContain("Sign here");
    expect(container.querySelector(".e-pad-surface")!.hasAttribute("data-invalid")).toBe(true);
    expect(container.textContent).not.toContain("Sign inside the box");
  });

  test("required adds the word to what screen readers hear", async () => {
    const { container } = await render(ESignaturePad, { props: { id: "p", required: true } });
    expect(container.querySelector("#p-hint")!.textContent).toMatch(/^Required\. /);
  });

  test("readonly keeps the signature, ignores drawing and disables Clear", async () => {
    const got: string[] = [];
    const { container } = await render(ESignaturePad, {
      props: { readonly: true, modelValue: dataUrl() },
      attrs: { "onUpdate:modelValue": (v: string) => got.push(v) },
    });
    await expect.poll(() => container.querySelector(".e-pad-placeholder")).toBeNull();
    draw(container.querySelector("canvas")!);
    await nextTick();
    expect(got).toEqual([]);
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
        render: () =>
          h("div", [
            h(ESignaturePad, { id: "a" }),
            h(ESignaturePad, { id: "b", disabled: true }),
            h(ESignaturePad, { id: "c", error: "Sign here", required: true, readonly: true }),
          ]),
      }),
    );
    await expectNoViolations(container);
    draw(container.querySelector("canvas")!);
    await nextTick();
    await expectNoViolations(container);
  });
});
