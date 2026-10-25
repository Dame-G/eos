import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { render } from "vitest-browser-vue";
import { localeDirection, useLocale } from "./useLocale.js";
import { createEos } from "../plugin.js";

async function locale(options: Parameters<typeof createEos>[0] = {}) {
  let api!: ReturnType<typeof useLocale>;
  const eos = createEos({ themeTarget: null, ...options });
  await render(
    defineComponent({
      setup() {
        api = useLocale();
        return () => h("div");
      },
    }),
    { global: { plugins: [eos] } },
  );
  return { api, eos };
}

describe("useLocale", () => {
  test("en-US: month first, slashes, Sunday first, English names", async () => {
    const { api } = await locale();
    expect(api.dateOrder.value).toEqual(["month", "day", "year"]);
    expect(api.dateSeparator.value).toBe("/");
    expect(api.weekStart.value).toBe(0);
    expect(api.months.value[0]).toBe("January");
    expect(api.monthsShort.value[9]).toBe("Oct");
    expect(api.weekdays.value[0]).toBe("Sunday");
    expect(api.weekdaysShort.value.slice(0, 2)).toEqual(["Su", "Mo"]);
    expect(api.formatDate(new Date(2026, 9, 5, 12))).toBe("10/05/2026");
    expect(api.dateFormatLabel()).toBe("MM/DD/YYYY");
    expect(localeDirection("en-US")).toBe("ltr");
    expect(api.formatLong(new Date(2026, 9, 22, 12))).toBe("Thursday, October 22, 2026");
  });

  test("en-GB: day first and Monday first", async () => {
    const { api } = await locale({ locale: "en-GB" });
    expect(api.dateOrder.value).toEqual(["day", "month", "year"]);
    expect(api.weekStart.value).toBe(1);
    expect(api.formatDate(new Date(2026, 9, 5, 12))).toBe("05/10/2026");
    expect(api.parseDate("05/10/2026")).toEqual(new Date(2026, 9, 5, 12));
    expect(api.dateFormatLabel()).toBe("DD/MM/YYYY");
  });

  test("de-DE: dots, German names", async () => {
    const { api } = await locale({ locale: "de-DE" });
    expect(api.dateSeparator.value).toBe(".");
    expect(api.months.value[9]).toBe("Oktober");
    expect(api.weekStart.value).toBe(1);
    expect(api.formatDate(new Date(2026, 9, 22, 12))).toBe("22.10.2026");
  });

  test("he-IL: right to left, Sunday first, Hebrew names, ASCII digits in typed dates", async () => {
    const { api } = await locale({ locale: "he-IL" });
    expect(localeDirection("he-IL")).toBe("rtl");
    expect(api.weekStart.value).toBe(0);
    expect(api.months.value[0]).not.toBe("January");
    expect(api.formatDate(new Date(2026, 9, 22, 12))).toMatch(/^\d\d[./-]\d\d[./-]2026$/);
    const typed = api.formatDate(new Date(2026, 9, 22, 12));
    expect(api.parseDate(typed)).toEqual(new Date(2026, 9, 22, 12));
  });

  test("ar: right to left; Arabic-Indic digits typed by the person still parse", async () => {
    const { api } = await locale({ locale: "ar" });
    expect(localeDirection("ar")).toBe("rtl");
    const text = api.formatDate(new Date(2026, 9, 22, 12));
    expect(text).toMatch(/^\d{2}.\d{2}.2026$/);
    const order = api.dateOrder.value;
    const parts = { day: "٢٢", month: "١٠", year: "٢٠٢٦" };
    const typed = order.map((p) => parts[p]).join("/");
    expect(api.parseDate(typed)).toEqual(new Date(2026, 9, 22, 12));
  });

  test("parseDate accepts slashes, dashes, dots and spaces; rejects impossible days and short years", async () => {
    const { api } = await locale();
    const want = new Date(2026, 9, 22, 12);
    for (const s of ["10/22/2026", "10-22-2026", "10.22.2026", "10 22 2026", " 1/2/2026 "])
      expect(api.parseDate(s)).not.toBeNull();
    expect(api.parseDate("10/22/2026")).toEqual(want);
    expect(api.parseDate("13/45/2020")).toBeNull();
    expect(api.parseDate("02/30/2026")).toBeNull();
    expect(api.parseDate("10/22/26")).toBeNull();
    expect(api.parseDate("hello")).toBeNull();
    expect(api.parseDate("")).toBeNull();
    expect(api.parseDate("02/29/2024")).toEqual(new Date(2024, 1, 29, 12));
    expect(api.parseDate("02/29/2025")).toBeNull();
  });

  test("formatDate and parseDate round trip, and formatDate of nothing is empty", async () => {
    const { api } = await locale({ locale: "de-DE" });
    const dte = new Date(1981, 9, 22, 12);
    expect(api.parseDate(api.formatDate(dte))).toEqual(dte);
    expect(api.formatDate(null)).toBe("");
    expect(api.formatDate(undefined)).toBe("");
  });

  test("the dateFormat message overrides the label", async () => {
    const { api } = await locale({ messages: { dateFormat: "JJ/MM/AAAA" } });
    expect(api.dateFormatLabel()).toBe("JJ/MM/AAAA");
  });

  test("formatMoney uses the configured locale and currency", async () => {
    expect((await locale()).api.formatMoney(162.4)).toBe("$162.40");
    const de = (await locale({ locale: "de-DE", currency: "EUR" })).api.formatMoney(162.4);
    expect(de.replace(/\s/g, " ")).toBe("162,40 €");
    expect((await locale()).api.formatMoney(5, { currency: "GBP", locale: "en-GB" })).toBe("£5.00");
  });

  test("formatMoney uses the currency's own decimals", async () => {
    const { api } = await locale({ currency: "JPY" });
    expect(api.formatMoney(1000)).toBe("¥1,000");
    expect(api.formatMoney(1.5, { currency: "KWD" })).toMatch(/1\.500/);
  });

  test("formatNumber and formatList follow the locale, and an unknown one does not throw", async () => {
    const { api, eos } = await locale({ locale: "de-DE" });
    expect(api.formatNumber(1234.5)).toBe("1.234,5");
    expect(api.formatList(["Ada", "Grace", "Linus"])).toBe("Ada, Grace und Linus");
    eos.config.locale = "not a locale!";
    expect(() => api.formatNumber(1)).not.toThrow();
    expect(api.formatList(["Ada", "Grace"])).toContain("Grace");
    expect(api.formatMoney(5)).toBe("5");
  });

  test("changing the config locale updates everything that was read", async () => {
    const { api, eos } = await locale();
    expect(api.months.value[9]).toBe("October");
    eos.config.locale = "fr-FR";
    expect(api.months.value[9]).toBe("octobre");
    expect(api.weekStart.value).toBe(1);
    expect(api.formatDate(new Date(2026, 9, 22, 12))).toBe("22/10/2026");
  });

  test("works without the plugin", async () => {
    let api!: ReturnType<typeof useLocale>;
    await render(
      defineComponent({
        setup() {
          api = useLocale();
          return () => h("div");
        },
      }),
    );
    expect(api.formatDate(new Date(2026, 9, 22, 12))).toBe("10/22/2026");
  });

  test("an unknown tag falls back to English names from Intl, keeping the direction its language implies", async () => {
    const { api } = await locale({ locale: "ar-@@bad" });
    expect(api.months.value[0]).toBe("January");
    expect(localeDirection("ar-@@bad")).toBe("rtl");
    expect(localeDirection("zz-@@bad")).toBe("ltr");
  });
});
