import { describe, expect, expectTypeOf, test } from "vitest";
import { createApp, defineComponent, h } from "vue";
import { createEos } from "./plugin.js";
import { useMessages, type Translate } from "./config.js";
import { defaultMessages, type MessageVars } from "./messages.js";

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
    expect(t("rangeDone", { start: "Jun 3", end: "Jun 3", n: 1 })).toBe("Jun 3 to Jun 3 (1 day)");
    expect(t("rangeDone", { start: "Jun 3", end: "Jun 5", n: 3 })).toBe("Jun 3 to Jun 5 (3 days)");
  });

  test("a rangeDone override written with {days} still works", () => {
    const t = translator({ messages: { rangeDone: "{start}-{end}: {days}d" } });
    expect(t("rangeDone", { start: "A", end: "B", n: 2, days: 2 })).toBe("A-B: 2d");
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

describe("selection and file counts", () => {
  test("selected, filesAdded and filesRejected follow the plural rules", () => {
    const t = translator();
    expect(t("selected", { n: 1 })).toBe("1 selected");
    expect(t("selected", { n: 3 })).toBe("3 selected");
    expect(t("filesAdded", { n: 1 })).toBe("1 file added");
    expect(t("filesAdded", { n: 4 })).toBe("4 files added");
    expect(t("filesRejected", { n: 1 })).toBe("1 file was not accepted");
    expect(t("filesRejected", { n: 2 })).toBe("2 files were not accepted");
  });

  test("whole-sentence messages keep word order in the translator's hands", () => {
    const t = translator({ messages: { paginationFor: "{caption} : pagination", dayToday: "aujourd'hui, {date}" } });
    expect(t("paginationFor", { caption: "Orders" })).toBe("Orders : pagination");
    expect(t("dayToday", { date: "lundi 3" })).toBe("aujourd'hui, lundi 3");
    expect(translator()("sortedAsc", { col: "Name" })).toBe("Sorted by Name, ascending.");
    expect(translator()("dayTodayMarked", { date: "Mon", mark: "times available" })).toBe(
      "Mon, today, times available",
    );
    expect(translator()("dateRange", { start: "A", end: "B" })).toBe("A to B");
  });
});

describe("message catalogue", () => {
  const sources = import.meta.glob(
    ["./**/*.vue", "./**/*.ts", "!./**/*.test.ts", "!./**/*.stories.ts", "!./messages.ts"],
    {
      query: "?raw",
      import: "default",
      eager: true,
    },
  ) as Record<string, string>;
  const code = Object.values(sources).join("\n");

  // Keys read dynamically (status.*), or waiting for their component to move to them.
  const allowUnused = new Set<string>([
    ...Object.keys(defaultMessages).filter((k) => k.startsWith("status.")),
    "dateRange",
  ]);

  test("every message is used by a component, or is allowed to be public only", () => {
    const unused = Object.keys(defaultMessages).filter(
      (key) => !allowUnused.has(key) && !new RegExp(`["'\`]${key.replaceAll(".", String.raw`\.`)}["'\`]`).test(code),
    );
    expect(unused).toEqual([]);
  });

  test("placeholders are simple names, and every plural form uses only those of its other form", () => {
    const names = (text: string) => [...text.matchAll(/\{([^}]*)\}/g)].map((m) => m[1]!);
    for (const [key, value] of Object.entries(defaultMessages)) {
      const forms: Record<string, string> = typeof value === "string" ? { other: value } : value;
      const known = new Set(names(forms.other!));
      for (const [form, text] of Object.entries(forms)) {
        for (const name of names(text)) {
          expect(name, `${key}.${form}`).toMatch(/^[A-Za-z]\w*$/);
          expect(known.has(name), `${key}.${form} uses {${name}} that other does not`).toBe(true);
        }
      }
    }
  });

  test("the variables of a built-in message are typed from its text", () => {
    expectTypeOf<MessageVars<"pageOf">>().toEqualTypeOf<"n" | "total">();
    expectTypeOf<MessageVars<"filesTooLarge">>().toEqualTypeOf<"n" | "max">();
    expectTypeOf<MessageVars<"required">>().toEqualTypeOf<never>();
  });
});
