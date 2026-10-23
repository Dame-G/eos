import { describe, expect, test } from "vitest";
import { h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import * as Vue from "vue";
import EToast from "./EToast.vue";
import EButton from "../Button/EButton.vue";
import { expectNoViolations } from "../../../test/axe.js";

async function inBox(width: number, props: Record<string, unknown>, slots: Record<string, () => unknown>) {
  const box = document.createElement("div");
  box.className = "e-root";
  box.style.width = `${width}px`;
  document.body.append(box);
  await render(EToast, { container: box, props, slots } as never);
  return box;
}

const action = () => h(EButton, { variant: "outline" }, () => "Undo");

describe("EToast", () => {
  test("is a floating surface with a title, detail and the icon of its tone", async () => {
    const { container } = await render(EToast, { props: { title: "Saved" }, slots: { default: "All changes kept." } });
    const el = container.querySelector(".e-toast")!;
    expect(el.classList.contains("e-surface--raised")).toBe(true);
    expect(el.classList.contains("e-toast--info")).toBe(true);
    expect(el.querySelector(".e-toast-title")!.textContent).toBe("Saved");
    expect(el.querySelector(".e-toast-text")!.textContent).toBe("All changes kept.");
    expect(el.querySelector(".e-notice-icon svg")).not.toBeNull();
  });

  test("danger is an alert, the other tones a status", async () => {
    const a = await render(EToast, { props: { title: "Failed", tone: "danger" } });
    expect(a.container.querySelector(".e-toast")!.getAttribute("role")).toBe("alert");
    expect(a.container.querySelector(".e-toast--danger")).not.toBeNull();
    for (const tone of ["info", "success", "warning"] as const) {
      const { container } = await render(EToast, { props: { title: "x", tone } });
      expect(container.querySelector(".e-toast")!.getAttribute("role")).toBe("status");
      expect(container.querySelector(`.e-toast--${tone}`)).not.toBeNull();
    }
  });

  test("is 24rem wide, and up to 40rem with an action", async () => {
    const plain = await inBox(900, { title: "Saved" }, {});
    expect(Math.round(plain.querySelector(".e-toast")!.getBoundingClientRect().width)).toBe(384);
    const withAction = await inBox(900, { title: "Saved" }, { action });
    expect(withAction.querySelector(".e-toast")!.classList.contains("e-toast--actions")).toBe(true);
    expect(Math.round(withAction.querySelector(".e-toast")!.getBoundingClientRect().width)).toBe(640);
  });

  test("the action is at the end when there is room and under the text when not", async () => {
    const wide = await inBox(720, { title: "Saved" }, { default: () => "Detail.", action });
    const a = wide.querySelector(".e-notice-actions")!.getBoundingClientRect();
    const b = wide.querySelector(".e-notice-body")!.getBoundingClientRect();
    expect(a.left).toBeGreaterThanOrEqual(b.right - 2);
    const narrow = await inBox(320, { title: "Saved" }, { default: () => "Detail.", action });
    const a2 = narrow.querySelector(".e-notice-actions")!.getBoundingClientRect();
    const b2 = narrow.querySelector(".e-notice-body")!.getBoundingClientRect();
    expect(a2.top).toBeGreaterThanOrEqual(b2.bottom - 2);
  });

  test("the dismiss button shows by default, emits close, and closable turns it off", async () => {
    let got = 0;
    await render(EToast, { props: { title: "x", onClose: () => got++ } });
    await page.getByRole("button", { name: "Close notification" }).click();
    expect(got).toBe(1);
    const off = await render(EToast, { props: { title: "x", closable: false } });
    expect(off.container.querySelector(".e-notice-dismiss")).toBeNull();
  });

  test("a custom icon replaces the icon of the tone", async () => {
    const a = await render(EToast, { props: { title: "x", tone: "success" } });
    const b = await render(EToast, { props: { title: "x", tone: "success", icon: "pin" } });
    expect(a.container.querySelector(".e-notice-icon")!.innerHTML).not.toBe(
      b.container.querySelector(".e-notice-icon")!.innerHTML,
    );
  });

  test("the tone colours a slab-bold border on the inline-start edge", async () => {
    const { container } = await render(EToast, { props: { title: "x", tone: "danger" } });
    const style = getComputedStyle(container.querySelector(".e-toast")!);
    expect(style.borderInlineStartColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(style.borderInlineStartStyle).toBe("solid");
    expect(parseFloat(style.borderInlineStartWidth)).toBeGreaterThan(parseFloat(style.borderTopWidth));
  });

  test("live=false leaves out the alert and status roles", async () => {
    const { container } = await render(EToast, { props: { title: "x", tone: "danger", live: false } });
    expect(container.querySelector(".e-toast")!.hasAttribute("role")).toBe(false);
  });

  test("class and data attributes fall through to the root", async () => {
    const { container } = await render(EToast, { props: { title: "x" }, attrs: { class: "mine", "data-x": "1" } });
    const el = container.querySelector<HTMLElement>(".e-toast")!;
    expect(el.classList.contains("mine")).toBe(true);
    expect(el.dataset.x).toBe("1");
  });

  test("axe finds nothing in any tone", async () => {
    for (const tone of ["info", "success", "warning", "danger"] as const) {
      const { container } = await render(EToast, {
        props: { title: "Saved", tone, onClose: () => {} },
        slots: { default: "Detail.", action },
      });
      container.classList.add("e-root");
      await expectNoViolations(container);
    }
  });

  test("closable follows the prop, not whether anyone listens", async () => {
    const closable = Vue.ref<boolean | undefined>(undefined);
    const { container } = await render(
      Vue.defineComponent({
        render: () => Vue.h(EToast, { title: "x", closable: closable.value }),
      }),
    );
    expect(container.querySelector(".e-notice-dismiss")).not.toBeNull();
    closable.value = false;
    await expect.poll(() => container.querySelector(".e-notice-dismiss")).toBeNull();
    closable.value = true;
    await expect.poll(() => container.querySelector(".e-notice-dismiss")).not.toBeNull();
  });
});
