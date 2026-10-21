import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ESpinner from "./ESpinner.vue";
import { createEos } from "../../plugin.js";
import { expectNoViolations } from "../../../test/axe.js";

describe("ESpinner", () => {
  test("is a status that reads out Loading when it has no label", async () => {
    const { container } = await render(ESpinner);
    await expect.element(page.getByRole("status")).toHaveTextContent("Loading");
    const sr = container.querySelector(".e-sr")!;
    expect(sr.textContent).toBe("Loading");
    expect(container.querySelector(".e-spinner-label")).toBeNull();
  });

  test("a label is shown and replaces the screen-reader text", async () => {
    const { container } = await render(ESpinner, { props: { label: "Processing your payment" } });
    expect(container.querySelector(".e-spinner-label")!.textContent).toBe("Processing your payment");
    expect(container.querySelector(".e-sr")).toBeNull();
    await expect.element(page.getByText("Processing your payment")).toBeVisible();
  });

  test("the ring is hidden from assistive technology and spins", async () => {
    const { container } = await render(ESpinner);
    const ring = container.querySelector("svg")!;
    expect(ring.getAttribute("aria-hidden")).toBe("true");
    expect(getComputedStyle(ring.querySelector(".e-ring-arc")!).animationName).toBe("e-spin");
    expect(getComputedStyle(ring.querySelector(".e-ring-track")!).animationName).toBe("none");
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
