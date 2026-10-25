import { inject, shallowRef, type InjectionKey, type VNodeChild } from "vue";
import type { IconProp } from "../icons/types.js";
import { isProduction } from "../env.js";

import type { Tone } from "../types.js";

/** The tones a toast takes: every `Tone`. `neutral` is for news that is neither good nor bad. */
export type ToastTone = Tone;

export interface ToastOptions {
  /** What happened, in a few words. */
  title: string;
  /** One sentence of detail under the title. */
  message?: string;
  /** `info` by default. `danger` is announced at once and stays until dismissed. */
  tone?: ToastTone;
  /** Replaces the icon of the tone. */
  icon?: IconProp;
  /** Shows the dismiss button. `true` by default, and always shown for a toast that has no duration, since nothing else would remove it. */
  closable?: boolean;
  /** Identifies the toast. Showing another with the same key updates the one on screen and restarts its timer, so a repeated event stays one toast. */
  key?: string;
  /** A Button, as a vnode or a function that returns one. A toast with an action stays until dismissed. */
  action?: VNodeChild | (() => VNodeChild);
  /** Milliseconds before it goes. 5000 for success and info. `0` for none, the default for danger and for a toast with an action. */
  duration?: number;
}

/** What `promise()` shows at each stage: a title, or the full options. `success` and `error` may be functions of the result or the error. */
export interface ToastPromiseOptions<T> {
  loading: string | Omit<ToastOptions, "tone">;
  success: string | Omit<ToastOptions, "tone"> | ((value: T) => string | Omit<ToastOptions, "tone">);
  error: string | Omit<ToastOptions, "tone"> | ((reason: unknown) => string | Omit<ToastOptions, "tone">);
}

export interface ToastItem extends Omit<ToastOptions, "tone" | "duration"> {
  id: string;
  tone: ToastTone;
  /** Milliseconds. 0 stays until dismissed. */
  duration: number;
}

/** What `useToast()` gives a component. */
export interface ToastApi {
  /** Shows a toast and returns its id. */
  show(options: ToastOptions): string;
  /** Changes a toast on screen, such as its title or tone, and restarts its timer. Does nothing for an id that has gone. */
  update(id: string, patch: Partial<ToastOptions>): void;
  /** Shows `loading` until the promise settles, then turns that toast into `success` or `error`. It returns the promise, so the caller still handles the result. */
  promise<T>(promise: Promise<T>, options: ToastPromiseOptions<T>): Promise<T>;
  /** Removes one toast. */
  dismiss(id: string): void;
  /** Removes every toast. */
  clear(): void;
}

/** The store behind the API: the list the region renders, and the timers. */
export interface ToastStore extends ToastApi {
  /** The toasts on screen, oldest first. */
  readonly items: readonly ToastItem[];
  /** How many toasts stay on screen. Showing one more removes the oldest. `EToastProvider` sets it from its `limit`. */
  limit: number;
  /** Stops every timer, keeping the time each toast has left. Used while the pointer or focus is on a toast. */
  pause(): void;
  /** Starts the timers again with the time that was left. */
  resume(): void;
}

export const TOAST_KEY: InjectionKey<ToastStore> = Symbol("eos.toasts");

const DEFAULT_DURATION = 5000;

function fallbackDuration(options: Pick<ToastOptions, "tone" | "action">): number {
  return options.action || options.tone === "danger" ? 0 : DEFAULT_DURATION;
}

function asOptions(value: string | Omit<ToastOptions, "tone">): Omit<ToastOptions, "tone"> {
  return typeof value === "string" ? { title: value } : value;
}

/**
 * Creates a toast store. `createEos().install` provides one for the whole app, so `useToast()` works anywhere in it.
 * Without the plugin, an `EToastProvider` makes one for the components inside it. An app that wants `useToast()`
 * elsewhere without the plugin (a router guard, a store) provides one itself: `app.provide(TOAST_KEY, createToasts())`.
 * Either way the toasts are shown by an `EToastProvider`, once, near the root of the app.
 */
export function createToasts(): ToastStore {
  const list = shallowRef<ToastItem[]>([]);
  const timers = new Map<
    string,
    { remaining: number; started: number; handle: ReturnType<typeof setTimeout> | null }
  >();
  let counter = 0;
  let paused = false;
  const store: ToastStore = {
    limit: 5,
    get items() {
      return list.value;
    },
    show,
    update,
    promise,
    dismiss,
    clear,
    pause,
    resume,
  };

  function arm(id: string) {
    const timer = timers.get(id);
    if (!timer || paused || timer.handle !== null) return;
    timer.started = Date.now();
    timer.handle = setTimeout(() => dismiss(id), timer.remaining);
  }

  function dismiss(id: string) {
    const timer = timers.get(id);
    if (timer?.handle != null) clearTimeout(timer.handle);
    timers.delete(id);
    list.value = list.value.filter((item) => item.id !== id);
  }

  function track(id: string, duration: number) {
    const timer = timers.get(id);
    if (timer?.handle != null) clearTimeout(timer.handle);
    timers.delete(id);
    if (duration <= 0) return;
    timers.set(id, { remaining: duration, started: 0, handle: null });
    arm(id);
  }

  /** A toast that never goes must be closable, or nothing could remove it. */
  function reachable(item: ToastItem): ToastItem {
    if (item.duration > 0 || item.closable !== false) return item;
    if (!isProduction())
      console.warn("[eos] A toast with no duration needs its close button, so `closable: false` is ignored.");
    return { ...item, closable: true };
  }

  function show(options: ToastOptions): string {
    const tone = options.tone ?? "info";
    const duration = options.duration ?? fallbackDuration({ ...options, tone });
    const existing = options.key === undefined ? undefined : list.value.find((item) => item.key === options.key);
    if (existing) {
      list.value = list.value.map((item) =>
        item.id === existing.id ? reachable({ ...options, id: existing.id, tone, duration }) : item,
      );
      track(existing.id, duration);
      return existing.id;
    }
    const id = `toast-${++counter}`;
    list.value = [...list.value, reachable({ ...options, id, tone, duration })];
    track(id, duration);
    while (list.value.length > Math.max(1, store.limit)) dismiss(list.value[0]!.id);
    return id;
  }

  function update(id: string, patch: Partial<ToastOptions>) {
    const current = list.value.find((item) => item.id === id);
    if (!current) return;
    const merged = { ...current, ...patch, tone: patch.tone ?? current.tone };
    const retoned = "tone" in patch || "action" in patch;
    const duration = patch.duration ?? (retoned ? fallbackDuration(merged) : current.duration);
    list.value = list.value.map((item) => (item.id === id ? reachable({ ...merged, id, duration }) : item));
    track(id, duration);
  }

  function promise<T>(work: Promise<T>, options: ToastPromiseOptions<T>): Promise<T> {
    const id = show({ ...asOptions(options.loading), duration: 0 });
    // The loading toast's own message, action and duration do not carry over to the result.
    const settle = (tone: ToastTone, text: string | Omit<ToastOptions, "tone">) =>
      update(id, {
        message: undefined,
        action: undefined,
        closable: undefined,
        duration: undefined,
        ...asOptions(text),
        tone,
      });
    return work.then(
      (value) => {
        settle("success", typeof options.success === "function" ? options.success(value) : options.success);
        return value;
      },
      (reason: unknown) => {
        settle("danger", typeof options.error === "function" ? options.error(reason) : options.error);
        throw reason;
      },
    );
  }

  function clear() {
    for (const timer of timers.values()) if (timer.handle != null) clearTimeout(timer.handle);
    timers.clear();
    list.value = [];
  }

  function pause() {
    paused = true;
    for (const timer of timers.values()) {
      if (timer.handle === null) continue;
      clearTimeout(timer.handle);
      timer.handle = null;
      timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.started));
    }
  }

  function resume() {
    paused = false;
    for (const id of timers.keys()) arm(id);
  }

  return store;
}

/**
 * Show toasts from anywhere in an app that installed `createEos()` or provided `TOAST_KEY`, or from inside an `EToastProvider`. It throws anywhere else:
 * `const toast = useToast(); toast.show({ title: "Saved", tone: "success" })`.
 */
export function useToast(): ToastApi {
  const store = inject(TOAST_KEY, null);
  if (!store)
    throw new Error("useToast needs createEos() installed, TOAST_KEY provided, or an enclosing EToastProvider");
  return { show: store.show, update: store.update, promise: store.promise, dismiss: store.dismiss, clear: store.clear };
}
