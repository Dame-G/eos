import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AeSpinner from "./AeSpinner.vue";
import { createAegis } from "../../plugin.js";
import { expectNoViolations } from "../../../test/axe.js";

describe("AeSpinner", () => {
  test("is a status that reads out Loading when it has no label", async () => {
    const { container } = await render(AeSpinner);
    await expect.element(page.getByRole("status")).toHaveTextContent("Loading");
    const sr = container.querySelector(".ae-sr")!;
    expect(sr.textContent).toBe("Loading");
    expect(container.querySelector(".ae-spinner-label")).toBeNull();
  });

  test("a label is shown and replaces the screen-reader text", async () => {
    const { container } = await render(AeSpinner, { props: { label: "Processing your payment" } });
    expect(container.querySelector(".ae-spinner-label")!.textContent).toBe("Processing your payment");
    expect(container.querySelector(".ae-sr")).toBeNull();
    await expect.element(page.getByText("Processing your payment")).toBeVisible();
  });

  test("the ring is hidden from assistive technology and spins", async () => {
    const { container } = await render(AeSpinner);
    const ring = container.querySelector("svg")!;
    expect(ring.getAttribute("aria-hidden")).toBe("true");
    expect(getComputedStyle(ring).animationName).toBe("ae-spin");
  });

  test("block centres it in a panel", async () => {
    const { container } = await render(AeSpinner, { props: { block: true } });
    const el = container.querySelector(".ae-spinner")!;
    expect(el.className).toBe("ae-spinner ae-spinner--block");
    expect(getComputedStyle(el).justifyContent).toBe("center");
  });

  test("uses the configured words", async () => {
    const plugin = createAegis({ messages: { loading: "Un moment" }, warnOnContrast: false });
    const { container } = await render(AeSpinner, { global: { plugins: [plugin] } });
    expect(container.textContent).toContain("Un moment");
  });

  test("attributes fall through to the root", async () => {
    const { container } = await render(AeSpinner, { attrs: { "data-testid": "s", class: "mine" } });
    const el = container.querySelector(".ae-spinner")!;
    expect(el.getAttribute("data-testid")).toBe("s");
    expect(el.classList.contains("mine")).toBe(true);
  });

  test("has no accessibility violations in any state", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(AeSpinner),
            h(AeSpinner, { label: "Saving" }),
            h(AeSpinner, { block: true, label: "Loading list" }),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});
