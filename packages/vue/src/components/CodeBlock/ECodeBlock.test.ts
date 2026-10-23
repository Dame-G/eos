import { describe, expect, test, vi } from "vitest";
import { defineComponent, h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ECodeBlock from "./ECodeBlock.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("ECodeBlock", () => {
  test("shows the code in a focusable group named by the language, with a copy button beside it", async () => {
    const { container } = await render(ECodeBlock, { props: { code: "npm install @eos-ui/vue", lang: "bash" } });
    const pre = container.querySelector("pre")!;
    expect(pre.textContent).toBe("npm install @eos-ui/vue");
    expect(pre.hasAttribute("aria-label")).toBe(false);
    expect(pre.tabIndex).toBe(-1);
    const region = container.querySelector(".e-code-body") as HTMLElement;
    expect(region.getAttribute("role")).toBe("group");
    expect(region.tabIndex).toBe(0);
    await expect.element(page.getByRole("group", { name: "bash" })).toBeVisible();
    await expect.element(page.getByRole("button", { name: "Copy code" })).toBeVisible();
  });

  test("without a language the group is named Code, and the keyboard reaches it with Tab", async () => {
    await render(ECodeBlock, { props: { code: "x".repeat(400) } });
    await userEvent.tab();
    await expect.element(page.getByRole("group", { name: "Code" })).toHaveFocus();
  });

  test("custom slot content scrolls inside the same focusable group", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h(ECodeBlock, { style: "width: 200px" }, { default: () => h("pre", [h("code", "x".repeat(300))]) }),
      }),
    );
    const region = container.querySelector<HTMLElement>(".e-code-body")!;
    expect(region.scrollWidth).toBeGreaterThan(region.clientWidth);
    await userEvent.tab();
    expect(document.activeElement).toBe(region);
  });

  test("blocks stacked back to back add no margin", async () => {
    const { container } = await render(
      defineComponent({ render: () => h("div", [h(ECodeBlock, { code: "a" }), h(ECodeBlock, { code: "b" })]) }),
    );
    expect(getComputedStyle(container.querySelectorAll(".e-code")[1]!).marginTop).toBe("0px");
  });

  test("the button sits beside the code, not over it", async () => {
    const { container } = await render(ECodeBlock, { props: { code: "x".repeat(400) } });
    const body = container.querySelector(".e-code-body")!.getBoundingClientRect();
    const side = container.querySelector(".e-code-side")!.getBoundingClientRect();
    expect(side.left).toBeGreaterThanOrEqual(body.right - 1);
  });

  test("the copy area keeps its own height in a tall block", async () => {
    const short = await render(ECodeBlock, { props: { code: "one" } });
    const tall = await render(ECodeBlock, {
      props: { code: Array.from({ length: 12 }, (_, i) => `line ${i}`).join("\n") },
    });
    const sideHeight = (root: Element) => root.querySelector(".e-code-side")!.getBoundingClientRect().height;
    const block = tall.container.querySelector(".e-code")!.getBoundingClientRect().height;
    expect(Math.round(sideHeight(tall.container))).toBe(Math.round(sideHeight(short.container)));
    expect(sideHeight(tall.container)).toBeLessThan(block);
  });

  test("copies the text and says so", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    await render(ECodeBlock, { props: { code: "one\ntwo", copyLabel: "Copy CSS" } });
    await page.getByRole("button", { name: "Copy CSS" }).click();
    expect(writeText).toHaveBeenCalledWith("one\ntwo");
    await expect.poll(() => document.querySelector("[data-e-announcer=polite]")!.textContent).toBe("Copied");
    vi.unstubAllGlobals();
  });

  test("a slot holds your own markup, and the first pre is what is copied", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    await render(
      defineComponent({
        render: () =>
          h(ECodeBlock, null, { default: () => h("pre", [h("code", [h("span", "const a"), h("span", " = 1")])]) }),
      }),
    );
    await page.getByRole("button", { name: "Copy code" }).click();
    expect(writeText).toHaveBeenCalledWith("const a = 1");
    vi.unstubAllGlobals();
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(ECodeBlock, { props: { code: "const a = 1;", lang: "ts" } });
    await expectNoViolations(container);
  });
});
