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
