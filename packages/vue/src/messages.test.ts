import { describe, expect, test } from "vitest";
import { createApp, defineComponent, h } from "vue";
import { createEos } from "./plugin.js";
import { useMessages, type Translate } from "./config.js";
import { defaultMessages } from "./messages.js";

function translator(options: Parameters<typeof createEos>[0] = {}): Translate {
  let t!: Translate;
  const host = document.createElement("div");
  createApp(
    defineComponent({
      setup() {
        t = useMessages();
        return () => h("div");
      },
    }),
  )
    .use(createEos(options))
    .mount(host);
  return t;
}

describe("plural messages", () => {
  test("the built-in counts use the singular for 1", () => {
    const t = translator();
    expect(t("resultsCount", { n: 1 })).toBe("1 result");
    expect(t("resultsCount", { n: 4 })).toBe("4 results");
    expect(t("rows", { n: 1 })).toBe("1 row");
    expect(t("rows", { n: 0 })).toBe("0 rows");
    expect(t("rowsAnnounce", { n: 1 })).toBe("1 row.");
    expect(t("rowsAnnounce", { n: 12 })).toBe("12 rows.");
  });

  test("a plain string override is used for every count", () => {
    const t = translator({ messages: { rows: "{n} Zeilen" } });
    expect(t("rows", { n: 1 })).toBe("1 Zeilen");
    expect(t("rows", { n: 2 })).toBe("2 Zeilen");
  });

  test("an override picks its form with the locale's plural rules", () => {
    const messages = { rows: { one: "{n} wiersz", few: "{n} wiersze", many: "{n} wierszy", other: "{n} wiersza" } };
    const t = translator({ locale: "pl", messages });
    expect(t("rows", { n: 1 })).toBe("1 wiersz");
    expect(t("rows", { n: 3 })).toBe("3 wiersze");
    expect(t("rows", { n: 5 })).toBe("5 wierszy");
    expect(t("rows", { n: 1.5 })).toBe("1.5 wiersza");
  });

  test("falls back to other when a category is missing or there is no count", () => {
    const t = translator({ messages: { rows: { other: "{n} lines" } } });
    expect(t("rows", { n: 1 })).toBe("1 lines");
    expect(translator()("rows")).toBe("{n} rows");
    expect(translator()("rows", { n: "x" })).toBe("x rows");
  });

  test("every plural default has an other form", () => {
    for (const value of Object.values(defaultMessages)) {
      if (typeof value !== "string") expect(typeof value.other).toBe("string");
    }
  });
});
