import { describe, expect, test, vi } from "vitest";
import { defineComponent, h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ETag from "./ETag.vue";
// Loaded for its styles: the combobox draws its own chips and must not restyle a tag.
import "../Combobox/ECombobox.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("ETag", () => {
  test("shows its label in a pill and has no button by default", async () => {
    const { container } = await render(ETag, { props: { label: "Cardiology" } });
    container.classList.add("e-root");
    const tag = container.querySelector(".e-tag")!;
    expect(tag.textContent!.trim()).toBe("Cardiology");
    expect(container.querySelector("button")).toBeNull();
    // A pill, not an ellipse: the radius is the pill token, far larger than half the height.
    expect(parseFloat(getComputedStyle(tag).borderTopLeftRadius)).toBeGreaterThan(100);
  });

  test("is drawn by its own rules only: one border, even padding, text centred", async () => {
    const { container } = await render(ETag, { props: { label: "Cardiology" } });
    container.classList.add("e-root");
    const tag = container.querySelector(".e-tag")! as HTMLElement;
    const style = getComputedStyle(tag);
    expect(style.boxShadow).toBe("none");
    expect(style.paddingLeft).toBe(style.paddingRight);
    const text = tag.querySelector(".e-tag-text")!.getBoundingClientRect();
    const box = tag.getBoundingClientRect();
    expect(Math.abs(text.top - box.top - (box.bottom - text.bottom))).toBeLessThanOrEqual(1);
  });

  test("the default slot replaces the label", async () => {
    const { container } = await render(ETag, {
      props: { label: "Cardiology" },
      slots: { default: () => h("b", "Heart") },
    });
    expect(container.querySelector(".e-tag-text")!.textContent).toBe("Heart");
  });

  test("tone adds its modifier and changes the colours; neutral adds none", async () => {
    const colour = async (tone: "neutral" | "info" | "success" | "warning" | "danger") => {
      const { container } = await render(ETag, { props: { label: "x", tone } });
      container.classList.add("e-root");
      const tag = container.querySelector(".e-tag")!;
      return [tag.className, getComputedStyle(tag).backgroundColor];
    };
    const neutral = await colour("neutral");
    expect(neutral[0]).toBe("e-tag");
    for (const tone of ["info", "success", "warning", "danger"] as const) {
      const [cls, bg] = await colour(tone);
      expect(cls).toBe(`e-tag e-tag--${tone}`);
      expect(bg).not.toBe(neutral[1]);
    }
  });

  test("size sm is shorter", async () => {
    const height = async (size: "sm" | "md") => {
      const { container } = await render(ETag, { props: { label: "x", size } });
      container.classList.add("e-root");
      return container.querySelector(".e-tag")!.getBoundingClientRect().height;
    };
    expect(await height("sm")).toBeLessThan(await height("md"));
  });

  test("the Remove button is named by the label, is at least 24px and emits remove", async () => {
    const onRemove = vi.fn();
    const { container } = await render(ETag, { props: { label: "Cardiology", removable: true, onRemove } });
    container.classList.add("e-root");
    const button = page.getByRole("button", { name: "Remove Cardiology" });
    await expect.element(button).toBeVisible();
    const rect = container.querySelector("button")!.getBoundingClientRect();
    expect(rect.width).toBeGreaterThanOrEqual(24);
    expect(rect.height).toBeGreaterThanOrEqual(24);
    await button.click();
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  test("the Remove button works from the keyboard, with Enter, Space, Delete and Backspace", async () => {
    const onRemove = vi.fn();
    await render(ETag, { props: { label: "Cardiology", removable: true, onRemove } });
    await userEvent.tab();
    await expect.element(page.getByRole("button", { name: "Remove Cardiology" })).toHaveFocus();
    for (const key of ["{Enter}", " ", "{Delete}", "{Backspace}"]) {
      onRemove.mockClear();
      await userEvent.keyboard(key);
      expect(onRemove, key).toHaveBeenCalledTimes(1);
    }
  });

  test("the hit area of the Remove button reaches past the button", async () => {
    const { container } = await render(ETag, { props: { label: "x", removable: true } });
    container.classList.add("e-root");
    const after = getComputedStyle(container.querySelector("button")!, "::after");
    expect(parseFloat(after.width)).toBeGreaterThan(24);
  });

  test("a long label is cut with an ellipsis inside its box", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { class: "e-root", style: { width: "120px" } }, [
            h(ETag, { label: "word ".repeat(30), removable: true }),
          ]),
      }),
    );
    const tag = container.querySelector(".e-tag")!.getBoundingClientRect();
    expect(tag.width).toBeLessThanOrEqual(120);
    expect(container.querySelector("button")!.getBoundingClientRect().right).toBeLessThanOrEqual(tag.right);
  });

  test("has no accessibility violations in any tone", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { class: "e-root" }, [
            ...(["neutral", "info", "success", "warning", "danger"] as const).map((tone) =>
              h(ETag, { label: tone, tone, icon: "info", removable: true }),
            ),
            h(ETag, { label: "Small", size: "sm" }),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});
