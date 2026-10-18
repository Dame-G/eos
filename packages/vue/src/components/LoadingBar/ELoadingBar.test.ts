import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ELoadingBar from "./ELoadingBar.vue";
import { createEos } from "../../plugin.js";
import { expectNoViolations } from "../../../test/axe.js";

describe("ELoadingBar", () => {
  test("is a busy progress bar named Loading by default", async () => {
    const { container } = await render(ELoadingBar);
    await expect.element(page.getByRole("progressbar", { name: "Loading" })).toBeInTheDocument();
    expect(container.querySelector(".e-loadbar")!.getAttribute("aria-busy")).toBe("true");
  });

  test("a label says what is loading", async () => {
    await render(ELoadingBar, { props: { label: "Loading statements" } });
    await expect.element(page.getByRole("progressbar", { name: "Loading statements" })).toBeInTheDocument();
  });

  test("is 8px tall, fills its container and has a sliding fill", async () => {
    const { container } = await render(
      defineComponent({ render: () => h("div", { style: "width: 300px" }, [h(ELoadingBar)]) }),
    );
    const bar = container.querySelector(".e-loadbar")!.getBoundingClientRect();
    expect(bar.height).toBe(8);
    expect(bar.width).toBe(300);
    const fill = container.querySelector(".e-loadbar-fill")!;
    expect(getComputedStyle(fill).animationName).toBe("e-load");
    expect(fill.getBoundingClientRect().width).toBeCloseTo(120, 0);
  });

  test("uses the configured word", async () => {
    const plugin = createEos({ messages: { loading: "Chargement" }, warnOnContrast: false });
    await render(ELoadingBar, { global: { plugins: [plugin] } });
    await expect.element(page.getByRole("progressbar", { name: "Chargement" })).toBeInTheDocument();
  });

  test("attributes fall through to the root", async () => {
    const { container } = await render(ELoadingBar, { attrs: { "data-testid": "b", class: "mine" } });
    const el = container.querySelector(".e-loadbar")!;
    expect(el.getAttribute("data-testid")).toBe("b");
    expect(el.classList.contains("mine")).toBe(true);
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(
      defineComponent({ render: () => h("div", [h(ELoadingBar), h(ELoadingBar, { label: "Loading list" })]) }),
    );
    await expectNoViolations(container);
  });
});
