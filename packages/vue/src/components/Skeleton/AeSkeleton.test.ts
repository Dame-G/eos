import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AeSkeleton from "./AeSkeleton.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("AeSkeleton", () => {
  test("is a busy status that screen readers hear as Loading", async () => {
    const { container } = await render(AeSkeleton);
    await expect.element(page.getByRole("status")).toHaveTextContent("Loading");
    const el = container.querySelector(".ae-skeleton")!;
    expect(el.getAttribute("aria-busy")).toBe("true");
    expect(el.querySelector(".ae-sr")!.textContent).toBe("Loading");
  });

  test("is 96px tall and the full width by default", async () => {
    const { container } = await render(
      defineComponent({ render: () => h("div", { style: "width: 300px" }, [h(AeSkeleton)]) }),
    );
    const box = container.querySelector(".ae-skeleton")!.getBoundingClientRect();
    expect(box.height).toBe(96);
    expect(box.width).toBe(300);
  });

  test("height and width take px numbers or CSS lengths", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [h(AeSkeleton, { height: 20, width: 120 }), h(AeSkeleton, { height: "3rem", width: "50%" })]),
      }),
    );
    const [a, b] = [...container.querySelectorAll(".ae-skeleton")].map((e) => e.getBoundingClientRect());
    expect([a!.width, a!.height]).toEqual([120, 20]);
    expect(b!.height).toBe(48);
    expect(b!.width).toBeGreaterThan(0);
  });

  test("circle is round and square", async () => {
    const { container } = await render(AeSkeleton, { props: { circle: true, height: 56 } });
    const el = container.querySelector(".ae-skeleton")!;
    expect(el.className).toBe("ae-skeleton ae-skeleton--circle");
    const box = el.getBoundingClientRect();
    expect(box.width).toBe(56);
    expect(box.height).toBe(56);
    expect(getComputedStyle(el).borderTopLeftRadius).toBe("50%");
  });

  test("pulses", async () => {
    const { container } = await render(AeSkeleton);
    expect(getComputedStyle(container.querySelector(".ae-skeleton")!).animationName).toBe("ae-pulse");
  });

  test("attributes and styles fall through to the root", async () => {
    const { container } = await render(AeSkeleton, { attrs: { "data-testid": "s", class: "mine" } });
    const el = container.querySelector(".ae-skeleton")!;
    expect(el.getAttribute("data-testid")).toBe("s");
    expect(el.classList.contains("mine")).toBe(true);
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [h(AeSkeleton), h(AeSkeleton, { height: 20, width: 120 }), h(AeSkeleton, { circle: true })]),
      }),
    );
    await expectNoViolations(container);
  });
});
