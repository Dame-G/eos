import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EMetric from "./EMetric.vue";
import { createEos } from "../../plugin.js";
import { expectNoViolations } from "../../../test/axe.js";

describe("EMetric", () => {
  test("shows the label as a kicker above the figure in the numeral style", async () => {
    const { container } = await render(EMetric, { props: { label: "Balance", value: "$1,240.00" } });
    container.classList.add("e-root");
    const label = container.querySelector("dt")!;
    expect(label.classList.contains("e-kicker")).toBe(true);
    expect(label.textContent).toBe("Balance");
    const value = container.querySelector(".e-metric-value")!;
    expect(value.textContent).toBe("$1,240.00");
    expect(getComputedStyle(value).fontVariantNumeric).toContain("tabular-nums");
    expect(label.getBoundingClientRect().bottom).toBeLessThanOrEqual(value.getBoundingClientRect().top);
  });

  test("a number is formatted for the locale", async () => {
    const plugin = createEos({ locale: "de", warnOnContrast: false });
    const { container } = await render(EMetric, {
      props: { label: "Visits", value: 12345.5 },
      global: { plugins: [plugin] },
    });
    expect(container.querySelector(".e-metric-value")!.textContent).toBe("12.345,5");
  });

  test("an unknown locale does not break the figure", async () => {
    const plugin = createEos({ locale: "not a locale!", warnOnContrast: false });
    const { container } = await render(EMetric, { props: { label: "Visits", value: 12 }, global: { plugins: [plugin] } });
    expect(container.querySelector(".e-metric-value")!.textContent).toBe("12");
  });

  test("the delta is read with its direction, and the arrow is decoration", async () => {
    const { container } = await render(EMetric, { props: { label: "Visits", value: 10, delta: "+4.2%", trend: "up" } });
    const delta = container.querySelector(".e-metric-delta")!;
    expect(delta.querySelector(".e-sr")!.textContent).toBe("Up +4.2%");
    expect(delta.querySelector("[aria-hidden=true]:not(svg)")!.textContent).toBe("+4.2%");
    expect(delta.querySelector("svg")!.getAttribute("aria-hidden")).toBe("true");
    for (const [trend, text] of [
      ["down", "Down -1%"],
      ["flat", "No change"],
    ] as const) {
      const r = await render(EMetric, { props: { label: "x", value: 1, delta: "-1%", trend } });
      expect(r.container.querySelector(".e-metric-delta .e-sr")!.textContent).toBe(text);
    }
  });

  test("the delta colour follows the trend unless tone overrides it", async () => {
    const colour = async (props: Record<string, unknown>) => {
      const { container } = await render(EMetric, { props: { label: "x", value: 1, delta: "5", ...props } });
      container.classList.add("e-root");
      return getComputedStyle(container.querySelector(".e-metric-delta")!).color;
    };
    const up = await colour({ trend: "up" });
    expect(await colour({ trend: "down" })).not.toBe(up);
    expect(await colour({ trend: "up", tone: "danger" })).toBe(await colour({ trend: "down" }));
    expect(await colour({ trend: "flat" })).not.toBe(up);
  });

  test("help is text under the figure, or a slot", async () => {
    const a = await render(EMetric, { props: { label: "x", value: 1, help: "Last 30 days" } });
    await expect.element(page.getByText("Last 30 days")).toBeVisible();
    const b = await render(EMetric, {
      props: { label: "x", value: 1 },
      slots: { help: () => h("a", { href: "#" }, "How") },
    });
    expect(b.container.querySelector(".e-metric-help a")).not.toBeNull();
    expect(a.container.querySelector(".e-metric-delta")).toBeNull();
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { class: "e-root" }, [
            h(EMetric, { label: "Balance", value: 1200, delta: "+4%", trend: "up", help: "This month" }),
            h(EMetric, { label: "Overdue", value: "2", delta: "-1", trend: "down" }),
            h(EMetric, { label: "Visits", value: "9", delta: "same", trend: "flat" }),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});
