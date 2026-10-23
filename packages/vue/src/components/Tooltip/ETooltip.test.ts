import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ETooltip from "./ETooltip.vue";
import EIconButton from "../IconButton/EIconButton.vue";
import { createEos } from "../../plugin.js";
import { expectNoViolations } from "../../../test/axe.js";

const tip = () => document.querySelector<HTMLElement>("[role=tooltip]");
const bubble = () => document.querySelector<HTMLElement>(".e-tip-bubble");
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function mount(label = "Download receipt") {
  return render(ETooltip, {
    props: { label },
    slots: { default: () => h(EIconButton, { icon: "download", label: "Download" }) },
  });
}

describe("ETooltip", () => {
  test("renders only its child until it is wanted; the child keeps its own name", async () => {
    const { container } = await mount();
    expect(container.querySelectorAll("button").length).toBe(1);
    await expect.element(page.getByRole("button", { name: "Download" })).toBeVisible();
    expect(tip()).toBeNull();
    expect(bubble()).toBeNull();
  });

  test("shows on keyboard focus, is described-by the trigger, and Escape hides it while focus stays", async () => {
    const { container } = await mount();
    const button = container.querySelector("button")!;
    await userEvent.tab();
    expect(document.activeElement).toBe(button);
    await expect.poll(() => bubble()?.textContent?.trim()).toContain("Download receipt");
    expect(tip()!.textContent).toBe("Download receipt");
    expect(button.getAttribute("aria-describedby")).toBe(tip()!.id);
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => bubble()).toBeNull();
    expect(document.activeElement).toBe(button);
    expect(button.hasAttribute("aria-describedby")).toBe(false);
  });

  test("hides when focus leaves", async () => {
    await mount();
    await userEvent.tab();
    await expect.poll(() => bubble()).not.toBeNull();
    await userEvent.tab();
    await expect.poll(() => bubble()).toBeNull();
  });

  test("shows on hover after a short delay, and hides when the pointer leaves", async () => {
    await wait(350); // a tooltip that closed a moment ago would let this one skip its delay
    await mount();
    const button = page.getByRole("button", { name: "Download" });
    await button.hover();
    await wait(100);
    expect(bubble()).toBeNull();
    await expect.poll(() => bubble()?.textContent?.trim(), { timeout: 3000 }).toContain("Download receipt");
    await userEvent.unhover(button);
    await expect.poll(() => bubble(), { timeout: 3000 }).toBeNull();
  });

  test("shows while a finger is on the control", async () => {
    const { container } = await mount();
    const button = container.querySelector("button")!;
    button.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerType: "touch" }));
    await expect.poll(() => bubble()).not.toBeNull();
    button.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerType: "touch" }));
    await wait(100);
    expect(bubble()).not.toBeNull();
  });

  test("a press hides it, so it never covers what you are about to read", async () => {
    await mount();
    await userEvent.tab();
    await expect.poll(() => bubble()).not.toBeNull();
    await page.getByRole("button", { name: "Download" }).click();
    await expect.poll(() => bubble()).toBeNull();
  });

  test("the bubble is dark on light, small text, centred, at most 16rem wide", async () => {
    await mount("A long explanation that goes on and on and on and on and on and on and on and on and on");
    await userEvent.tab();
    await expect.poll(() => bubble()).not.toBeNull();
    const style = getComputedStyle(bubble()!);
    expect(style.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(style.textAlign).toBe("center");
    expect(bubble()!.getBoundingClientRect().width).toBeLessThanOrEqual(256 + 1);
  });

  test("the bubble renders in the configured portal target and is an e-root; attributes land on it", async () => {
    const target = document.createElement("div");
    target.id = "themed-tip";
    document.body.appendChild(target);
    await render(ETooltip, {
      props: { label: "Download receipt" },
      attrs: { "data-test": "x" },
      slots: { default: () => h(EIconButton, { icon: "download", label: "Download" }) },
      global: { plugins: [createEos({ portalTarget: "#themed-tip" })] },
    });
    await userEvent.tab();
    await expect.poll(() => bubble()).not.toBeNull();
    expect(target.contains(bubble())).toBe(true);
    expect(bubble()!.classList.contains("e-root")).toBe(true);
    expect(bubble()!.dataset["test"]).toBe("x");
    await userEvent.keyboard("{Escape}");
    target.remove();
  });

  test("side puts the bubble on that edge of the control", async () => {
    const places: Record<string, (b: DOMRect, c: DOMRect) => boolean> = {
      bottom: (b, c) => b.top >= c.bottom - 1,
      top: (b, c) => b.bottom <= c.top + 1,
      end: (b, c) => b.left >= c.right - 1,
      start: (b, c) => b.right <= c.left + 1,
    };
    for (const side of Object.keys(places) as (keyof typeof places)[]) {
      const { container, unmount } = await render(
        defineComponent({
          render: () =>
            h("div", { style: { padding: "160px 300px" } }, [
              h(ETooltip, { label: "Side", side: side as "top" }, () =>
                h(EIconButton, { icon: "download", label: "Download" }),
              ),
            ]),
        }),
      );
      await userEvent.tab();
      await expect.poll(() => bubble()).not.toBeNull();
      expect(
        places[side]!(bubble()!.getBoundingClientRect(), container.querySelector("button")!.getBoundingClientRect()),
      ).toBe(true);
      await userEvent.keyboard("{Escape}");
      await expect.poll(() => bubble()).toBeNull();
      unmount();
    }
  });

  test("start follows a right-to-left locale, and close fires when it hides", async () => {
    const emitted_: Record<string, unknown[][]> = {};
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { style: { padding: "160px 300px" } }, [
            h(ETooltip, { label: "Start", side: "start", onClose: () => (emitted_.close ??= []).push([]) }, () =>
              h(EIconButton, { icon: "download", label: "Download" }),
            ),
          ]),
      }),
      { global: { plugins: [createEos({ dir: "rtl" })] } },
    );
    const emitted = () => emitted_;
    await userEvent.tab();
    await expect.poll(() => bubble()).not.toBeNull();
    expect(bubble()!.getBoundingClientRect().left).toBeGreaterThanOrEqual(
      container.querySelector("button")!.getBoundingClientRect().right - 1,
    );
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => bubble()).toBeNull();
    expect(emitted().close).toHaveLength(1);
    document.documentElement.removeAttribute("dir");
  });

  test("after one tooltip closes the next opens without waiting out the delay", async () => {
    await render(
      defineComponent({
        render: () =>
          h("div", [
            h(ETooltip, { label: "First", delay: 600 }, () => h(EIconButton, { icon: "download", label: "One" })),
            h(ETooltip, { label: "Second", delay: 600 }, () => h(EIconButton, { icon: "download", label: "Two" })),
          ]),
      }),
    );
    const one = page.getByRole("button", { name: "One" });
    const two = page.getByRole("button", { name: "Two" });
    await one.hover();
    await expect.poll(() => bubble()?.textContent?.trim(), { timeout: 3000 }).toContain("First");
    await userEvent.unhover(one);
    await two.hover();
    const started = Date.now();
    await expect
      .poll(() => [...document.querySelectorAll(".e-tip-bubble")].some((b) => b.textContent?.includes("Second")))
      .toBe(true);
    expect(Date.now() - started).toBeLessThan(500);
  });

  test("unmounting while a finger is held leaves no timer behind", async () => {
    const { container, unmount } = await mount();
    const button = container.querySelector("button")!;
    button.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerType: "touch" }));
    await expect.poll(() => bubble()).not.toBeNull();
    button.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerType: "touch" }));
    unmount();
    await wait(1700);
    expect(bubble()).toBeNull();
  });

  test("axe: closed and open", async () => {
    const { container } = await mount();
    await expectNoViolations(container);
    await userEvent.tab();
    await expect.poll(() => bubble()).not.toBeNull();
    await expectNoViolations(document.body);
  });
});
