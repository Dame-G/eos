import { describe, expect, test, vi } from "vitest";
import { defineComponent, h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ECodeBlock from "./ECodeBlock.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("ECodeBlock", () => {
  test("shows the code in a group named by the language, with a copy button beside it", async () => {
    const { container } = await render(ECodeBlock, { props: { code: "npm install @eos-ui/vue", lang: "bash" } });
    const pre = container.querySelector("pre")!;
    expect(pre.textContent).toBe("npm install @eos-ui/vue");
    expect(pre.hasAttribute("aria-label")).toBe(false);
    expect(pre.tabIndex).toBe(-1);
    const region = container.querySelector(".e-code-body") as HTMLElement;
    expect(region.getAttribute("role")).toBe("group");
    await new Promise((r) => requestAnimationFrame(r));
    expect(region.hasAttribute("tabindex")).toBe(false);
    await expect.element(page.getByRole("group", { name: "Bash" })).toBeVisible();
    await expect.element(page.getByRole("button", { name: "Copy code" })).toBeVisible();
  });

  test("without a language the group is named Code, and the keyboard reaches it with Tab", async () => {
    await render(ECodeBlock, { props: { code: "x".repeat(400) } });
    await userEvent.tab();
    await expect.element(page.getByRole("group", { name: "Code" })).toHaveFocus();
  });

  test("the group is a tab stop only while it scrolls, never with wrap; label names it", async () => {
    const long = "x".repeat(400);
    const scrolls = await render(ECodeBlock, { props: { code: long, lang: "ts" } });
    const body = () => scrolls.container.querySelector<HTMLElement>(".e-code-body")!;
    await expect.poll(() => body().getAttribute("tabindex")).toBe("0");
    await expect.element(page.getByRole("group", { name: "TypeScript" })).toBeVisible();
    const wrapped = await render(ECodeBlock, { props: { code: long, wrap: true, label: "Install command" } });
    await new Promise((r) => requestAnimationFrame(r));
    expect(wrapped.container.querySelector(".e-code-body")!.hasAttribute("tabindex")).toBe(false);
    await expect.element(page.getByRole("group", { name: "Install command" })).toBeVisible();
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

  test("blocks with no gap between them join: one shared hairline, rounded only at the outer corners", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { style: { width: "343px" } }, [
            h(ECodeBlock, { code: "a" }),
            h(ECodeBlock, { code: "b" }),
            h(ECodeBlock, { code: "c" }),
          ]),
      }),
    );
    const [first, middle, last] = [...container.querySelectorAll<HTMLElement>(".e-code")];
    const box = (el: HTMLElement) => el.getBoundingClientRect();
    expect(box(middle!).top).toBeCloseTo(box(first!).bottom, 1);
    expect(box(last!).top).toBeCloseTo(box(middle!).bottom, 1);
    expect(getComputedStyle(first!).borderEndStartRadius).toBe("0px");
    expect(getComputedStyle(first!).borderStartStartRadius).not.toBe("0px");
    expect(getComputedStyle(middle!).borderStartStartRadius).toBe("0px");
    expect(getComputedStyle(middle!).borderEndStartRadius).toBe("0px");
    expect(getComputedStyle(last!).borderStartStartRadius).toBe("0px");
    expect(getComputedStyle(last!).borderEndStartRadius).not.toBe("0px");
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth);
  });

  test("wrap folds long lines instead of scrolling; lineNumbers numbers plain code line by line", async () => {
    const long = "word ".repeat(120);
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { style: { width: "320px" } }, [
            h(ECodeBlock, { code: long, wrap: true }),
            h(ECodeBlock, { code: "one\ntwo\nthree", lineNumbers: true }),
          ]),
      }),
    );
    const [wrapped, numbered] = [...container.querySelectorAll<HTMLElement>(".e-code")];
    const body = wrapped!.querySelector<HTMLElement>(".e-code-body")!;
    expect(body.scrollWidth).toBeLessThanOrEqual(body.clientWidth + 1);
    const lines = [...numbered!.querySelectorAll(".line")];
    expect(lines.map((l) => l.textContent)).toEqual(["one", "two", "three"]);
    expect(getComputedStyle(lines[2]!, "::before").content).toBe("counter(line)");
    expect(numbered!.querySelector("pre")!.textContent).toBe("onetwothree");
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

  test("the body carries the block's start corners, so the block's clip cannot cut its focus ring", async () => {
    const corner = (el: Element, which: string) =>
      parseFloat(getComputedStyle(el).getPropertyValue(`border-${which}-radius`));
    const { container } = await render(ECodeBlock, { props: { code: "const a = 1;" } });
    container.classList.add("e-root");
    const block = container.querySelector(".e-code")!;
    const body = container.querySelector(".e-code-body")!;
    for (const md of ["2px", "8px", "14px"]) {
      (container as HTMLElement).style.setProperty("--e-radius-md", md);
      for (const which of ["top-left", "bottom-left"]) {
        expect(corner(block, which)).toBe(parseFloat(md));
        expect(corner(body, which)).toBe(parseFloat(md));
      }
    }
  });

  test("the block does not clip: its ring is painted once, and the scroller inside owns the overflow", async () => {
    const { container } = await render(ECodeBlock, { props: { code: "x".repeat(400) } });
    container.classList.add("e-root");
    const block = getComputedStyle(container.querySelector(".e-code")!);
    expect(block.overflowX).toBe("visible");
    expect(block.overflowY).toBe("visible");
    expect(getComputedStyle(container.querySelector(".e-code-body")!).overflowX).toBe("auto");
  });
});
