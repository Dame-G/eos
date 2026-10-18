import { describe, expect, test } from "vitest";
import { h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AeToast from "./AeToast.vue";
import AeButton from "../Button/AeButton.vue";
import { expectNoViolations } from "../../../test/axe.js";

async function inBox(width: number, props: Record<string, unknown>, slots: Record<string, () => unknown>) {
  const box = document.createElement("div");
  box.className = "ae-root";
  box.style.width = `${width}px`;
  document.body.append(box);
  await render(AeToast, { container: box, props, slots } as never);
  return box;
}

const action = () => h(AeButton, { variant: "outline" }, () => "Undo");

describe("AeToast", () => {
  test("is a floating surface with a title, detail and the icon of its tone", async () => {
    const { container } = await render(AeToast, { props: { title: "Saved" }, slots: { default: "All changes kept." } });
    const el = container.querySelector(".ae-toast")!;
    expect(el.classList.contains("ae-surface--float")).toBe(true);
    expect(el.classList.contains("ae-toast--info")).toBe(true);
    expect(el.querySelector(".ae-toast-title")!.textContent).toBe("Saved");
    expect(el.querySelector(".ae-toast-text")!.textContent).toBe("All changes kept.");
    expect(el.querySelector(".ae-notice-icon svg")).not.toBeNull();
  });

  test("danger is an alert, the other tones a status", async () => {
    const a = await render(AeToast, { props: { title: "Failed", tone: "danger" } });
    expect(a.container.querySelector(".ae-toast")!.getAttribute("role")).toBe("alert");
    expect(a.container.querySelector(".ae-toast--danger")).not.toBeNull();
    for (const tone of ["info", "success", "warning"] as const) {
      const { container } = await render(AeToast, { props: { title: "x", tone } });
      expect(container.querySelector(".ae-toast")!.getAttribute("role")).toBe("status");
      expect(container.querySelector(`.ae-toast--${tone}`)).not.toBeNull();
    }
  });

  test("is 24rem wide, and up to 40rem with an action", async () => {
    const plain = await inBox(900, { title: "Saved" }, {});
    expect(Math.round(plain.querySelector(".ae-toast")!.getBoundingClientRect().width)).toBe(384);
    const withAction = await inBox(900, { title: "Saved" }, { action });
    expect(withAction.querySelector(".ae-toast")!.classList.contains("ae-toast--actions")).toBe(true);
    expect(Math.round(withAction.querySelector(".ae-toast")!.getBoundingClientRect().width)).toBe(640);
  });

  test("the action is at the end when there is room and under the text when not", async () => {
    const wide = await inBox(720, { title: "Saved" }, { default: () => "Detail.", action });
    const a = wide.querySelector(".ae-notice-actions")!.getBoundingClientRect();
    const b = wide.querySelector(".ae-notice-body")!.getBoundingClientRect();
    expect(a.left).toBeGreaterThanOrEqual(b.right - 2);
    const narrow = await inBox(320, { title: "Saved" }, { default: () => "Detail.", action });
    const a2 = narrow.querySelector(".ae-notice-actions")!.getBoundingClientRect();
    const b2 = narrow.querySelector(".ae-notice-body")!.getBoundingClientRect();
    expect(a2.top).toBeGreaterThanOrEqual(b2.bottom - 2);
  });

  test("the dismiss button shows only when someone listens, and emits close", async () => {
    const none = await render(AeToast, { props: { title: "x" } });
    expect(none.container.querySelector(".ae-notice-dismiss")).toBeNull();
    let got = 0;
    await render(AeToast, { props: { title: "x", onClose: () => got++ } });
    await page.getByRole("button", { name: "Dismiss" }).click();
    expect(got).toBe(1);
  });

  test("class and data attributes fall through to the root", async () => {
    const { container } = await render(AeToast, { props: { title: "x" }, attrs: { class: "mine", "data-x": "1" } });
    const el = container.querySelector<HTMLElement>(".ae-toast")!;
    expect(el.classList.contains("mine")).toBe(true);
    expect(el.dataset.x).toBe("1");
  });

  test("axe finds nothing in any tone", async () => {
    for (const tone of ["info", "success", "warning", "danger"] as const) {
      const { container } = await render(AeToast, {
        props: { title: "Saved", tone, onClose: () => {} },
        slots: { default: "Detail.", action },
      });
      container.classList.add("ae-root");
      await expectNoViolations(container);
    }
  });
});
