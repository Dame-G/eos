import { computed } from "vue";
import { useConfig, useMessages } from "../config.js";

type Part = "month" | "day" | "year";

interface LocaleInfo {
  months: string[];
  monthsShort: string[];
  weekdays: string[];
  weekdaysShort: string[];
  weekStart: number;
  order: Part[];
  separator: string;
  rtl: boolean;
  long: Intl.DateTimeFormat | null;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const RTL = /^(ar|he|fa|ur|yi|ps|sd|ug|dv)(-|$)/i;
const cache = new Map<string, LocaleInfo>();

function build(locale: string): LocaleInfo {
  const hit = cache.get(locale);
  if (hit) return hit;
  let info: LocaleInfo;
  try {
    const names = (opts: Intl.DateTimeFormatOptions, count: number, at: (i: number) => number) => {
      const f = new Intl.DateTimeFormat(locale, { timeZone: "UTC", ...opts });
      return Array.from({ length: count }, (_, i) => f.format(new Date(at(i))));
    };
    const english = /^en/i.test(locale);
    const months = names({ month: "long" }, 12, (i) => Date.UTC(2021, i, 1));
    const weekdays = names({ weekday: "long" }, 7, (i) => Date.UTC(2021, 7, 1 + i));
    const weekdaysShort = names({ weekday: "short" }, 7, (i) => Date.UTC(2021, 7, 1 + i)).map((n) =>
      english ? n.slice(0, 2) : n,
    );
    const monthsShort = english
      ? months.map((n) => n.slice(0, 3))
      : names({ month: "short" }, 12, (i) => Date.UTC(2021, i, 1));
    const loc = new Intl.Locale(locale) as Intl.Locale & {
      getWeekInfo?: () => { firstDay?: number };
      weekInfo?: { firstDay?: number };
      getTextInfo?: () => { direction?: string };
      textInfo?: { direction?: string };
    };
    const week = loc.getWeekInfo ? loc.getWeekInfo() : loc.weekInfo;
    const text = loc.getTextInfo ? loc.getTextInfo() : loc.textInfo;
    const parts = new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC",
    }).formatToParts(new Date(Date.UTC(2021, 10, 22)));
    const order = parts
      .filter((p) => p.type === "month" || p.type === "day" || p.type === "year")
      .map((p) => p.type as Part);
    const literal = parts
      .filter((p) => p.type === "literal")
      .map((p) => p.value.replace(/[‎‏؜]/g, "").trim())
      .find(Boolean);
    info = {
      months,
      monthsShort,
      weekdays,
      weekdaysShort,
      weekStart: week?.firstDay ? week.firstDay % 7 : 0,
      order: order.length === 3 ? order : ["month", "day", "year"],
      separator: literal || "/",
      rtl: text?.direction ? text.direction === "rtl" : RTL.test(locale),
      long: new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
    };
  } catch {
    // An unknown tag makes Intl throw; English names from Intl are still better than the constants, which are for runtimes with no Intl.
    const english = locale === "en-US" ? undefined : build("en-US");
    info = english
      ? { ...english, rtl: RTL.test(locale) }
      : {
          months: MONTHS,
          monthsShort: MONTHS.map((n) => n.slice(0, 3)),
          weekdays: WEEKDAYS,
          weekdaysShort: WEEKDAYS.map((n) => n.slice(0, 2)),
          weekStart: 0,
          order: ["month", "day", "year"],
          separator: "/",
          rtl: RTL.test(locale),
          long: null,
        };
  }
  cache.set(locale, info);
  return info;
}

/** The text direction a locale is written in: `"rtl"` for Arabic, Hebrew, Persian and the like, else `"ltr"`. @internal */
export function localeDirection(locale: string): "ltr" | "rtl" {
  return build(locale).rtl ? "rtl" : "ltr";
}

/*
 * Intl formatters are slow to build and a table asks for one per cell, so each is built once per locale and options.
 * An unknown locale or currency makes Intl throw: the number formatter then falls back to the runtime's locale, and
 * the others return null so the caller writes the value plainly.
 */
const formatters = new Map<string, Intl.NumberFormat | Intl.ListFormat | Intl.Collator | null>();
function cached<T extends Intl.NumberFormat | Intl.ListFormat | Intl.Collator>(key: string, make: () => T): T | null {
  if (formatters.has(key)) return formatters.get(key) as T | null;
  let f: T | null;
  try {
    f = make();
  } catch {
    f = null;
  }
  formatters.set(key, f);
  return f;
}

/** A number in a locale, or in the runtime's locale when the tag is not one Intl knows. */
function numberFormat(locale: string): Intl.NumberFormat {
  return cached(`n|${locale}`, () => new Intl.NumberFormat(locale)) ?? cached("n|", () => new Intl.NumberFormat())!;
}

/** Money in a locale and currency, with the currency's own number of decimals (none for yen). Null when either is unknown. */
function moneyFormat(locale: string, currency: string): Intl.NumberFormat | null {
  return cached(`m|${locale}|${currency}`, () => new Intl.NumberFormat(locale, { style: "currency", currency }));
}

/** Compares text in a locale's order, numbers inside it by value ("2" before "10"), ignoring case and accents. @internal */
export function collator(locale: string | undefined): Intl.Collator {
  return (
    cached(`c|${locale ?? ""}`, () => new Intl.Collator(locale, { numeric: true, sensitivity: "base" })) ??
    cached("c|", () => new Intl.Collator(undefined, { numeric: true, sensitivity: "base" }))!
  );
}

const pad2 = (n: number) => (n < 10 ? "0" : "") + n;

function asciiDigits(s: string): string {
  return s
    .replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x660))
    .replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 0x6f0));
}

/**
 * Everything the components need from the configured locale: month and weekday names (Sunday first),
 * the first day of the week, the date order and separator, parsing dates, and formatting dates, numbers, lists and money.
 * Reads `createEos({ locale })`, so changing the locale re-renders everything that uses it.
 */
export function useLocale() {
  const config = useConfig();
  const t = useMessages();
  const info = computed(() => build(config.locale));

  function formatDate(d: Date | null | undefined): string {
    if (!d) return "";
    const v = { month: pad2(d.getMonth() + 1), day: pad2(d.getDate()), year: String(d.getFullYear()).padStart(4, "0") };
    return info.value.order.map((p) => v[p]).join(info.value.separator);
  }

  function parseDate(s: string): Date | null {
    const m = /^(\d{1,4})[/\-.\s]+(\d{1,2})[/\-.\s]+(\d{1,4})$/.exec(asciiDigits(String(s)).trim());
    if (!m) return null;
    const nums = [m[1]!, m[2]!, m[3]!];
    const v = { month: 0, day: 0, year: 0 };
    info.value.order.forEach((p, i) => (v[p] = Number(nums[i])));
    if (nums[info.value.order.indexOf("year")]!.length !== 4) return null;
    const d = new Date(v.year, v.month - 1, v.day, 12);
    return d.getMonth() === v.month - 1 && d.getDate() === v.day ? d : null;
  }

  return {
    locale: computed(() => config.locale),
    months: computed(() => info.value.months),
    monthsShort: computed(() => info.value.monthsShort),
    weekdays: computed(() => info.value.weekdays),
    weekdaysShort: computed(() => info.value.weekdaysShort),
    weekStart: computed(() => info.value.weekStart),
    dateOrder: computed(() => info.value.order),
    dateSeparator: computed(() => info.value.separator),
    dateFormatLabel: (): string =>
      t("dateFormat") ||
      info.value.order.map((p) => (p === "month" ? "MM" : p === "day" ? "DD" : "YYYY")).join(info.value.separator),
    formatDate,
    parseDate,
    formatLong: (d: Date): string =>
      info.value.long
        ? info.value.long.format(d)
        : `${info.value.weekdays[d.getDay()]}, ${info.value.months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
    /** Money in the configured locale and currency (or the ones given), with the currency's own decimals: "$162.40", "¥1,000". */
    formatMoney: (n: number, options: { locale?: string; currency?: string } = {}): string =>
      moneyFormat(options.locale ?? config.locale, options.currency ?? config.currency)?.format(Number(n)) ?? String(n),
    /** A number in the configured locale: "1,234.5", "1.234,5". */
    formatNumber: (n: number): string => numberFormat(config.locale).format(n),
    /** Items joined with the locale's words: "Ada, Grace and 3 more". */
    formatList: (items: string[], type: "conjunction" | "disjunction" = "conjunction"): string => {
      const make = (locale?: string) => () => new Intl.ListFormat(locale, { style: "long", type });
      const f = cached(`l|${config.locale}|${type}`, make(config.locale)) ?? cached(`l||${type}`, make());
      return f ? f.format(items) : items.join(", ");
    },
  };
}
