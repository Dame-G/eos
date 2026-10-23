import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ESpinner from "./ESpinner.vue";
import { createEos } from "../../plugin.js";
import { expectNoViolations } from "../../../test/axe.js";

describe("ESpinner", () => {
  test("without a label it reads Loading but is not a live region", async () => {
    const { container } = await render(ESpinner);
    const sr = container.querySelector(".e-sr")!;
    expect(sr.textContent).toBe("Loading");
    expect(container.querySelector(".e-spinner")!.hasAttribute("role")).toBe(false);
    expect(container.querySelector(".e-spinner-label")).toBeNull();
  });

  test("a label is shown and replaces the screen-reader text", async () => {
    const { container } = await render(ESpinner, { props: { label: "Processing your payment" } });
    expect(container.querySelector(".e-spinner-label")!.textContent).toBe("Processing your payment");
    expect(container.querySelector(".e-sr")).toBeNull();
    expect(container.querySelector(".e-spinner")!.getAttribute("role")).toBe("status");
    await expect.element(page.getByText("Processing your payment")).toBeVisible();
  });

  test("the ring is hidden from assistive technology and spins", async () => {
    const { container } = await render(ESpinner);
    const ring = container.querySelector("svg")!;
    expect(ring.getAttribute("aria-hidden")).toBe("true");
    expect(getComputedStyle(ring.querySelector(".e-ring-arc")!).animationName).toBe("e-spin");
    expect(getComputedStyle(ring.querySelector(".e-ring-track")!).animationName).toBe("none");
  });

  test("small and large size the ring from the icon tokens", async () => {
    const sizes: number[] = [];
    for (const props of [{ small: true }, {}, { large: true }] as Record<string, boolean>[]) {
      const { container } = await render(ESpinner, { props });
      sizes.push(container.querySelector(".e-ring")!.getBoundingClientRect().width);
    }
    expect(sizes[0]).toBeLessThan(sizes[1]!);
    expect(sizes[1]).toBeLessThan(sizes[2]!);
  });

  test("block centres it in a panel", async () => {
    const { container } = await render(ESpinner, { props: { block: true } });
    const el = container.querySelector(".e-spinner")!;
    expect(el.className).toBe("e-spinner e-spinner--block");
    expect(getComputedStyle(el).justifyContent).toBe("center");
  });

  test("uses the configured words", async () => {
    const plugin = createEos({ messages: { loading: "Un moment" }, warnOnContrast: false });
    const { container } = await render(ESpinner, { global: { plugins: [plugin] } });
    expect(container.textContent).toContain("Un moment");
  });

  test("attributes fall through to the root", async () => {
    const { container } = await render(ESpinner, { attrs: { "data-testid": "s", class: "mine" } });
    const el = container.querySelector(".e-spinner")!;
    expect(el.getAttribute("data-testid")).toBe("s");
    expect(el.classList.contains("mine")).toBe(true);
  });

  test("has no accessibility violations in any state", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(ESpinner),
            h(ESpinner, { label: "Saving" }),
            h(ESpinner, { block: true, label: "Loading list" }),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});
