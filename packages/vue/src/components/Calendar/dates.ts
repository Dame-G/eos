/** The same day at noon. */
export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, 12);
}

/** Adds months, keeping the day of the month or the last day of a shorter month. */
export function addMonths(d: Date, n: number): Date {
  const next = new Date(d.getFullYear(), d.getMonth() + n, 1, 12);
  const last = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(d.getDate(), last));
  return next;
}

/** Negative when `a` is before `b`, by whole days. */
export function compareDays(a: Date, b: Date): number {
  return startOfDay(a).getTime() - startOfDay(b).getTime();
}

export function sameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  return !!a && !!b && compareDays(a, b) === 0;
}

/** A key that is unique per day, safe in an element id. */
export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** `YYYY-MM-DD`, the value a form submits. Empty for no date. */
export function isoDate(d: Date | null | undefined): string {
  if (!d) return "";
  const p = (n: number) => (n < 10 ? "0" : "") + n;
  return `${String(d.getFullYear()).padStart(4, "0")}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const formats = new Map<string, Intl.DateTimeFormat>();
function format(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = locale + JSON.stringify(options);
  let f = formats.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(locale, options);
    formats.set(key, f);
  }
  return f;
}

/** "October 2026", ordered and written the way `locale` does it. `fallback` is used when Intl cannot. */
export function formatMonthYear(locale: string, d: Date, fallback: string): string {
  try {
    return format(locale, { month: "long", year: "numeric" }).format(d);
  } catch {
    return fallback;
  }
}

/** "Oct 22", ordered the way `locale` does it. */
export function formatMonthDay(locale: string, d: Date, fallback: string): string {
  try {
    return format(locale, { month: "short", day: "numeric" }).format(d);
  } catch {
    return fallback;
  }
}
