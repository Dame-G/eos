import { describe, expect, test } from "vitest";
import { defineComponent, h, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ESlider from "./ESlider.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("ESlider", () => {
  test("the focus ring is for the keyboard: a press hides it, the next key brings it back", async () => {
    const { container } = await render(ESlider, { props: { label: "Volume", modelValue: 30 } });
    container.classList.add("e-root");
    const thumb = container.querySelector(".e-slider-thumb") as HTMLElement;
    const ring = () => getComputedStyle(thumb).outlineStyle;
    await userEvent.tab();
    expect(ring()).toBe("solid");
    thumb.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 1, button: 0 }));
    await expect.poll(ring).toBe("none");
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(ring).toBe("solid");
  });

  test("the filled range stops at a disabled thumb instead of showing through it", async () => {
    const { container } = await render(ESlider, { props: { label: "Volume", modelValue: 60, disabled: true } });
    container.classList.add("e-root");
    const thumb = getComputedStyle(container.querySelector(".e-slider-thumb")!);
    expect(thumb.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("read-only is flat and shows no sign of being operable; editable is raised", async () => {
    const look = async (readonly: boolean) => {
      const { container, unmount } = await render(ESlider, { props: { label: "Volume", modelValue: 30, readonly } });
      container.classList.add("e-root");
      const thumb = container.querySelector(".e-slider-thumb")!;
      const style = getComputedStyle(thumb);
      const out = {
        raised: parseFloat(style.borderBottomWidth) > parseFloat(style.borderTopWidth),
        cursor: style.cursor,
        well: getComputedStyle(container.querySelector(".e-slider-track")!).boxShadow !== "none",
      };
      unmount();
      return out;
    };
    expect(await look(false)).toEqual({ raised: true, cursor: "grab", well: true });
    expect(await look(true)).toEqual({ raised: false, cursor: "default", well: false });
  });

  test("the thumb, its tick and the end of the filled range share one centre at every value", async () => {
    const marks = [0, 25, 50, 75, 100];
    for (const value of [0, 25, 50, 75, 100]) {
      const { container, unmount } = await render(ESlider, { props: { label: "Volume", modelValue: value, marks } });
      container.classList.add("e-root");
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const centre = (el: Element) => {
        const r = el.getBoundingClientRect();
        return r.left + r.width / 2;
      };
      const thumb = centre(container.querySelector(".e-slider-thumb")!);
      const tick = centre(container.querySelectorAll(".e-slider-mark")[marks.indexOf(value)]!);
      const range = container.querySelector(".e-slider-range")!.getBoundingClientRect().right;
      expect(Math.abs(thumb - tick), `tick at ${value}`).toBeLessThanOrEqual(1);
      expect(Math.abs(thumb - range), `range end at ${value}`).toBeLessThanOrEqual(1);
      unmount();
    }
  });

  test("is a slider named by its label, at min until a value is bound", async () => {
    await render(ESlider, { props: { label: "Volume", min: 10, max: 50 } });
    const thumb = page.getByRole("slider", { name: "Volume" });
    await expect.element(thumb).toHaveAttribute("aria-valuenow", "10");
    await expect.element(thumb).toHaveAttribute("aria-valuemin", "10");
    await expect.element(thumb).toHaveAttribute("aria-valuemax", "50");
  });

  test("the keys follow the slider pattern: arrows step, Page keys step by ten, Home and End jump", async () => {
    const model = ref(20);
    await render(
      defineComponent({
        render: () =>
          h(ESlider, {
            label: "Volume",
            step: 2,
            modelValue: model.value,
            "onUpdate:modelValue": (v: unknown) => (model.value = v as number),
          }),
      }),
    );
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    expect(model.value).toBe(22);
    await userEvent.keyboard("{ArrowDown}");
    expect(model.value).toBe(20);
    await userEvent.keyboard("{PageUp}");
    expect(model.value).toBeGreaterThan(20);
    await userEvent.keyboard("{End}");
    expect(model.value).toBe(100);
    await userEvent.keyboard("{Home}");
    expect(model.value).toBe(0);
  });

  test("format becomes aria-valuetext", async () => {
    await render(ESlider, { props: { label: "Price", modelValue: 40, format: (v: number) => `$${v}` } });
    await expect.element(page.getByRole("slider", { name: "Price" })).toHaveAttribute("aria-valuetext", "$40");
  });

  test("a range has two named thumbs and v-model is a pair", async () => {
    const got: unknown[] = [];
    await render(ESlider, {
      props: { label: "Price", range: true, modelValue: [20, 60], "onUpdate:modelValue": (v: unknown) => got.push(v) },
    });
    await expect.element(page.getByRole("slider", { name: "Price minimum" })).toHaveAttribute("aria-valuenow", "20");
    await expect.element(page.getByRole("slider", { name: "Price maximum" })).toHaveAttribute("aria-valuenow", "60");
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    expect(got).toEqual([[21, 60]]);
  });

  test("hint, error and required are wired to the thumb", async () => {
    const { container } = await render(ESlider, { props: { label: "Volume", hint: "0 to 100", required: true } });
    expect(container.querySelector(".e-field-flag")!.textContent).toBe("Required");
    await expect.element(page.getByRole("slider", { name: /Volume/ })).toHaveAccessibleDescription("0 to 100");
    const bad = await render(ESlider, { props: { label: "Loud", error: "Too loud" } });
    expect(bad.container.querySelector("[role=slider]")!.getAttribute("aria-invalid")).toBe("true");
    expect(bad.container.querySelector(".e-field-error")!.getAttribute("role")).toBe("alert");
  });

  test("name posts one hidden input per thumb, and a disabled slider posts nothing", async () => {
    const { container } = await render(ESlider, {
      props: { label: "Price", range: true, modelValue: [20, 60], name: "price" },
    });
    const form = document.createElement("form");
    form.append(container.firstElementChild!);
    document.body.append(form);
    expect(new FormData(form).getAll("price")).toEqual(["20", "60"]);
    form.remove();
    const off = await render(ESlider, { props: { label: "Price", modelValue: 5, name: "price", disabled: true } });
    const other = document.createElement("form");
    other.append(off.container.firstElementChild!);
    document.body.append(other);
    expect(new FormData(other).getAll("price")).toEqual([]);
    other.remove();
  });

  test("disabled takes the thumb out of the tab order", async () => {
    const { container } = await render(ESlider, { props: { label: "Volume", disabled: true } });
    expect(container.querySelector("[role=slider]")!.hasAttribute("tabindex")).toBe(false);
  });

  test("readonly keeps focus and the value but ignores the keys", async () => {
    const got: number[] = [];
    await render(ESlider, {
      props: {
        label: "Volume",
        modelValue: 30,
        readonly: true,
        "onUpdate:modelValue": (v: unknown) => got.push(v as number),
      },
    });
    await userEvent.tab();
    const thumb = page.getByRole("slider", { name: "Volume" });
    await expect.element(thumb).toHaveFocus();
    await expect.element(thumb).toHaveAttribute("aria-readonly", "true");
    await userEvent.keyboard("{ArrowRight}{End}");
    expect(got).toEqual([]);
    await expect.element(thumb).toHaveAttribute("aria-valuenow", "30");
  });

  test("marks draw a tick per step, or at the values given", async () => {
    const every = await render(ESlider, { props: { label: "A", min: 0, max: 4, marks: true } });
    expect(every.container.querySelectorAll(".e-slider-mark")).toHaveLength(5);
    const some = await render(ESlider, { props: { label: "B", marks: [0, 50, 100] } });
    expect(some.container.querySelectorAll(".e-slider-mark")).toHaveLength(3);
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(ESlider, { props: { label: "Volume", hint: "Loud", marks: true, step: 10 } });
    await expectNoViolations(container);
    const range = await render(ESlider, { props: { label: "Price", range: true } });
    await expectNoViolations(range.container);
  });
});
