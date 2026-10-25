import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { render } from "vitest-browser-vue";
import ESkeleton from "./ESkeleton.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("ESkeleton", () => {
  test("is hidden from assistive technology and adds no live region", async () => {
    const { container } = await render(ESkeleton);
    const el = container.querySelector(".e-skeleton")!;
    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(el.hasAttribute("role")).toBe(false);
    expect(el.textContent).toBe("");
  });

  test("is 96px tall and the full width by default", async () => {
    const { container } = await render(
      defineComponent({ render: () => h("div", { style: "width: 300px" }, [h(ESkeleton)]) }),
    );
    const box = container.querySelector(".e-skeleton")!.getBoundingClientRect();
    expect(box.height).toBe(96);
    expect(box.width).toBe(300);
  });

  test("height and width take px numbers or CSS lengths", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [h(ESkeleton, { height: 20, width: 120 }), h(ESkeleton, { height: "3rem", width: "50%" })]),
      }),
    );
    const [a, b] = [...container.querySelectorAll(".e-skeleton")].map((e) => e.getBoundingClientRect());
    expect([a!.width, a!.height]).toEqual([120, 20]);
    expect(b!.height).toBe(48);
    expect(b!.width).toBeGreaterThan(0);
  });

  test("circle is round and square", async () => {
    const { container } = await render(ESkeleton, { props: { circle: true, height: 56 } });
    const el = container.querySelector(".e-skeleton")!;
    expect(el.className).toBe("e-skeleton e-skeleton--circle");
    const box = el.getBoundingClientRect();
    expect(box.width).toBe(56);
    expect(box.height).toBe(56);
    expect(getComputedStyle(el).borderTopLeftRadius).toBe("50%");
  });

  test("pulses", async () => {
    const { container } = await render(ESkeleton);
    expect(getComputedStyle(container.querySelector(".e-skeleton")!).animationName).toBe("e-pulse");
  });

  test("the line variant shares the placeholder styling", async () => {
    const { container } = await render(defineComponent({ render: () => h("span", { class: "e-skel" }) }));
    const el = container.querySelector(".e-skel")!;
    expect(getComputedStyle(el).animationName).toBe("e-pulse");
    expect(el.getBoundingClientRect().height).toBe(16);
  });

  test("lines draws that many text lines, the last one shorter", async () => {
    const { container } = await render(
      defineComponent({ render: () => h("div", { style: "width: 300px" }, [h(ESkeleton, { lines: 3 })]) }),
    );
    const lines = [...container.querySelectorAll(".e-skeleton-lines > .e-skel")].map((e) => e.getBoundingClientRect());
    expect(lines).toHaveLength(3);
    expect(lines[0]!.width).toBe(300);
    expect(lines[2]!.width).toBe(180);
    expect(lines[1]!.top - lines[0]!.bottom).toBeGreaterThan(0);
    expect(container.querySelector(".e-skeleton-lines")!.getAttribute("aria-hidden")).toBe("true");
  });

  test("text is a single full-width line", async () => {
    const { container } = await render(ESkeleton, { props: { text: true } });
    expect(container.querySelectorAll(".e-skel")).toHaveLength(1);
    expect(container.querySelector(".e-skeleton")).toBeNull();
  });

  test("a label is announced politely as it appears, and kept as text that is not hidden", async () => {
    const { container } = await render(ESkeleton, { props: { label: "Loading invoices", lines: 2 } });
    const root = container.firstElementChild!;
    expect(root.hasAttribute("role")).toBe(false);
    expect(root.hasAttribute("aria-hidden")).toBe(false);
    await expect
      .poll(() => document.querySelector("[data-e-announcer=polite]")?.textContent)
      .toContain("Loading invoices");
    expect(root.querySelector(".e-sr")!.textContent).toBe("Loading invoices");
    await expectNoViolations(container);
  });

  test("attributes and styles fall through to the root", async () => {
    const { container } = await render(ESkeleton, { attrs: { "data-testid": "s", class: "mine" } });
    const el = container.querySelector(".e-skeleton")!;
    expect(el.getAttribute("data-testid")).toBe("s");
    expect(el.classList.contains("mine")).toBe(true);
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [h(ESkeleton), h(ESkeleton, { height: 20, width: 120 }), h(ESkeleton, { circle: true })]),
      }),
    );
    await expectNoViolations(container);
  });
});
