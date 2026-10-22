import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EProgress from "./EProgress.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("EProgress", () => {
  test("is a progress bar named by its label, with the value and range", async () => {
    const { container } = await render(EProgress, { props: { label: "Upload", value: 40 } });
    await expect.element(page.getByRole("progressbar", { name: "Upload" })).toBeVisible();
    const bar = container.querySelector("[role=progressbar]")!;
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
    expect(bar.getAttribute("aria-valuenow")).toBe("40");
  });

  test("shows a percentage by default and fills that share", async () => {
    const { container } = await render(EProgress, { props: { label: "Upload", value: 40 } });
    expect(container.querySelector(".e-progress-value")!.textContent).toBe("40%");
    const track = container.querySelector(".e-progress-track")!.getBoundingClientRect().width;
    const fill = container.querySelector(".e-progress-fill")!.getBoundingClientRect().width;
    expect(fill / track).toBeCloseTo(0.4, 1);
  });

  test("max rescales the fill and the range", async () => {
    const { container } = await render(EProgress, { props: { label: "Steps", value: 2, max: 4 } });
    expect(container.querySelector(".e-progress-value")!.textContent).toBe("50%");
    expect(container.querySelector("[role=progressbar]")!.getAttribute("aria-valuemax")).toBe("4");
    expect((container.querySelector(".e-progress-fill") as HTMLElement).style.width).toBe("50%");
  });

  test("valueText replaces the percentage", async () => {
    const { container } = await render(EProgress, {
      props: { label: "Steps", value: 2, max: 4, valueText: "2 of 4" },
    });
    expect(container.querySelector(".e-progress-value")!.textContent).toBe("2 of 4");
  });

  test("the fill never leaves the track", async () => {
    const over = await render(EProgress, { props: { label: "A", value: 150 } });
    expect((over.container.querySelector(".e-progress-fill") as HTMLElement).style.width).toBe("100%");
    const under = await render(EProgress, { props: { label: "B", value: -10 } });
    expect((under.container.querySelector(".e-progress-fill") as HTMLElement).style.width).toBe("0%");
  });

  test("aria-valuenow is clamped to the range", async () => {
    const over = await render(EProgress, { props: { label: "A", value: 150 } });
    expect(over.container.querySelector("[role=progressbar]")!.getAttribute("aria-valuenow")).toBe("100");
    const under = await render(EProgress, { props: { label: "B", value: -10 } });
    expect(under.container.querySelector("[role=progressbar]")!.getAttribute("aria-valuenow")).toBe("0");
    const scaled = await render(EProgress, { props: { label: "C", value: 9, max: 4 } });
    expect(scaled.container.querySelector("[role=progressbar]")!.getAttribute("aria-valuenow")).toBe("4");
  });

  test("valueText becomes aria-valuetext, and is absent without it", async () => {
    const withText = await render(EProgress, { props: { label: "Steps", value: 2, max: 4, valueText: "2 of 4" } });
    expect(withText.container.querySelector("[role=progressbar]")!.getAttribute("aria-valuetext")).toBe("2 of 4");
    const without = await render(EProgress, { props: { label: "Steps", value: 2, max: 4 } });
    expect(without.container.querySelector("[role=progressbar]")!.hasAttribute("aria-valuetext")).toBe(false);
  });

  test("the track is 12px tall", async () => {
    const { container } = await render(EProgress, { props: { label: "Upload", value: 40 } });
    expect(container.querySelector(".e-progress-track")!.getBoundingClientRect().height).toBe(12);
  });

  test("attributes fall through to the root", async () => {
    const { container } = await render(EProgress, {
      props: { label: "Upload", value: 40 },
      attrs: { "data-testid": "p", class: "mine" },
    });
    const el = container.querySelector(".e-progress")!;
    expect(el.getAttribute("data-testid")).toBe("p");
    expect(el.classList.contains("mine")).toBe(true);
  });

  test("without a value it is indeterminate: no value attributes, no percentage, a moving fill", async () => {
    const { container } = await render(EProgress, { props: { label: "Checking your account" } });
    const bar = container.querySelector("[role=progressbar]")!;
    await expect.element(page.getByRole("progressbar", { name: "Checking your account" })).toBeVisible();
    expect(bar.hasAttribute("aria-valuenow")).toBe(false);
    expect(bar.hasAttribute("aria-valuemax")).toBe(false);
    expect(bar.getAttribute("aria-busy")).toBe("true");
    expect(container.querySelector(".e-progress-value")!.textContent).toBe("");
    const fill = container.querySelector(".e-progress-fill") as HTMLElement;
    expect(fill.style.width).toBe("");
    expect(getComputedStyle(fill).animationName).not.toBe("none");
  });

  test("indeterminate with no label is named Loading and shows no text row", async () => {
    const { container } = await render(EProgress);
    await expect.element(page.getByRole("progressbar", { name: "Loading" })).toBeVisible();
    expect(container.querySelector(".e-progress-head")).toBeNull();
  });

  test("a value of 0 is still determinate", async () => {
    const { container } = await render(EProgress, { props: { label: "Upload", value: 0 } });
    expect(container.querySelector("[role=progressbar]")!.getAttribute("aria-valuenow")).toBe("0");
    expect(container.querySelector(".e-progress--indeterminate")).toBeNull();
  });

  test("has no accessibility violations at empty, partial and full", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(EProgress, { label: "Empty", value: 0 }),
            h(EProgress, { label: "Partial", value: 40 }),
            h(EProgress, { label: "Full", value: 4, max: 4, valueText: "4 of 4" }),
            h(EProgress, { label: "Unknown length" }),
            h(EProgress),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});
