import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { render } from "vitest-browser-vue";
import EAmount from "./EAmount.vue";
import { createEos } from "../../plugin.js";
import { expectNoViolations } from "../../../test/axe.js";

const text = (el: Element | null) => (el?.textContent ?? "").trim();
const plain = (s: string) => s.replace(/[\u00a0\u202f]/g, " ");

describe("EAmount", () => {
  test("shows the amount in the configured currency, with two decimals", async () => {
    const { container } = await render(EAmount, { props: { amount: 162.4 } });
    expect(container.firstElementChild!.className).toBe("e-amount");
    expect(text(container.querySelector(".e-amount-main"))).toBe("$162.40");
    expect(container.querySelector(".e-amount-label")).toBeNull();
    expect(container.querySelector(".e-amount-meta")).toBeNull();
  });

  test("the label sits above the figure", async () => {
    const { container } = await render(EAmount, { props: { amount: 10, label: "You owe" } });
    const label = container.querySelector(".e-amount-label")!;
    expect(text(label)).toBe("You owe");
    expect(label.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      container.querySelector(".e-amount-main")!.getBoundingClientRect().top + 1,
    );
  });

  test("details: a number is money, text is shown as it is", async () => {
    const { container } = await render(EAmount, {
      props: {
        amount: 162.4,
        details: [
          { label: "Insurance paid", value: 80 },
          { label: "Due", value: "Oct 22" },
        ],
      },
    });
    const spans = [...container.querySelectorAll(".e-amount-meta span")].map((s) => plain(text(s)));
    expect(spans).toEqual(["Insurance paid $80.00", "Due Oct 22"]);
  });

  test("an empty details list draws nothing", async () => {
    const { container } = await render(EAmount, { props: { amount: 1, details: [] } });
    expect(container.querySelector(".e-amount-meta")).toBeNull();
  });

  test("the figure is in mono tabular numerals", async () => {
    const { container } = await render(EAmount, { props: { amount: 1234.5 } });
    const style = getComputedStyle(container.querySelector(".e-amount-main")!);
    expect(style.fontVariantNumeric).toContain("tabular-nums");
  });

  test("currency and locale follow the plugin: EUR in de-DE and JPY in ja-JP", async () => {
    const de = await render(EAmount, {
      props: { amount: 162.4, details: [{ label: "Paid", value: 10 }] },
      global: { plugins: [createEos({ themeTarget: null, locale: "de-DE", currency: "EUR" })] },
    });
    expect(plain(text(de.container.querySelector(".e-amount-main")))).toBe("162,40 €");
    expect(plain(text(de.container.querySelector(".e-amount-meta span")))).toBe("Paid 10,00 €");
    const ja = await render(EAmount, {
      props: { amount: 1500 },
      global: { plugins: [createEos({ themeTarget: null, locale: "ja-JP", currency: "JPY" })] },
    });
    expect(plain(text(ja.container.querySelector(".e-amount-main")))).toMatch(/1,500\.00$/);
    expect(text(ja.container.querySelector(".e-amount-main"))).toMatch(/[¥￥]/);
  });

  test("currency and locale on one figure override the configuration", async () => {
    const { container } = await render(EAmount, {
      props: { amount: 162.4, currency: "EUR", locale: "fr-FR", details: [{ label: "Paid", value: 5 }] },
    });
    expect(plain(text(container.querySelector(".e-amount-main")))).toBe("162,40 €");
    expect(plain(text(container.querySelector(".e-amount-meta span")))).toBe("Paid 5,00 €");
  });

  test("class, style and data attributes fall through to the root", async () => {
    const { container } = await render(EAmount, {
      props: { amount: 1 },
      attrs: { class: "mine", style: "max-width: 200px", "data-x": "1" },
    });
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toBe("e-amount mine");
    expect(root.dataset.x).toBe("1");
    expect(root.style.maxWidth).toBe("200px");
  });

  test("axe: bare, labelled, with details", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(EAmount, { amount: 1 }),
            h(EAmount, { amount: 2, label: "Balance" }),
            h(EAmount, { amount: 3, label: "Paid", details: [{ label: "Insurance", value: 1 }] }),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});
