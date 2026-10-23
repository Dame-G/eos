import { onScopeDispose, toValue, watchEffect, type MaybeRefOrGetter } from "vue";

export type ShortcutMap = Record<string, (event: KeyboardEvent) => void>;

export interface ShortcutOptions {
  /** Where to listen. The document by default. */
  target?: MaybeRefOrGetter<EventTarget | null | undefined>;
  /** Turns every shortcut off while this is false. */
  enabled?: MaybeRefOrGetter<boolean>;
  /** Also run key-only shortcuts while a text field has focus. Shortcuts with Ctrl, Cmd or Alt, and Escape, always run. */
  allowInInputs?: boolean;
  /** Call `preventDefault()` on a matched event. @default true */
  preventDefault?: boolean;
}

const ALIASES: Record<string, string> = {
  esc: "escape",
  space: " ",
  spacebar: " ",
  up: "arrowup",
  down: "arrowdown",
  left: "arrowleft",
  right: "arrowright",
  del: "delete",
  return: "enter",
  plus: "+",
};

interface Parsed {
  key: string;
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
  mod: boolean;
}

/** Whether this is an Apple device, where `mod` means Cmd. @internal */
export const isApple = (): boolean =>
  typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);

function parse(combo: string): Parsed {
  const out: Parsed = { key: "", ctrl: false, meta: false, alt: false, shift: false, mod: false };
  const parts = combo
    .trim()
    .toLowerCase()
    .split(/\s*\+\s*(?=.)/);
  for (const part of parts) {
    if (part === "mod") out.mod = true;
    else if (part === "ctrl" || part === "control") out.ctrl = true;
    else if (part === "meta" || part === "cmd" || part === "command") out.meta = true;
    else if (part === "alt" || part === "option") out.alt = true;
    else if (part === "shift") out.shift = true;
    else out.key = ALIASES[part] ?? part;
  }
  return out;
}

function matches(spec: Parsed, e: KeyboardEvent, apple: boolean): boolean {
  const wantCtrl = spec.ctrl || (spec.mod && !apple);
  const wantMeta = spec.meta || (spec.mod && apple);
  if (e.ctrlKey !== wantCtrl || e.metaKey !== wantMeta || e.altKey !== spec.alt) return false;
  // A symbol such as "?" is typed with Shift on some layouts and without on others, so Shift only counts for letters, digits and named keys.
  const symbol = spec.key.length === 1 && !/[a-z0-9]/.test(spec.key);
  if (!symbol && e.shiftKey !== spec.shift) return false;
  return e.key.toLowerCase() === spec.key;
}

function inTextField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return true;
  if (target instanceof HTMLInputElement)
    return !["button", "checkbox", "radio", "submit", "reset", "range", "color", "file", "image"].includes(target.type);
  return false;
}

/**
 * Binds keys to functions for as long as the component lives: `useShortcuts({ "mod+k": openSearch, escape: close })`.
 * `mod` is Cmd on Apple devices and Ctrl elsewhere. Combine with `+`: `mod+shift+p`, `alt+arrowup`, `?`.
 * Key-only shortcuts (no Ctrl, Cmd or Alt) are skipped while a text field has focus, so typing "g" in a search box does not fire `g`.
 * Returns a function that removes the shortcuts early.
 */
export function useShortcuts(map: ShortcutMap, options: ShortcutOptions = {}): () => void {
  const entries = Object.entries(map).map(([combo, run]) => ({ spec: parse(combo), run }));
  const apple = isApple();
  let detach: (() => void) | null = null;

  function onKeydown(e: Event) {
    const event = e as KeyboardEvent;
    if (event.defaultPrevented || event.isComposing || event.repeat) return;
    for (const { spec, run } of entries) {
      if (!matches(spec, event, apple)) continue;
      const modified = spec.ctrl || spec.meta || spec.alt || spec.mod;
      if (!modified && spec.key !== "escape" && !options.allowInInputs && inTextField(event.target)) continue;
      if (options.preventDefault !== false) event.preventDefault();
      run(event);
      return;
    }
  }

  const stopWatch = watchEffect((onCleanup) => {
    detach?.();
    detach = null;
    if (toValue(options.enabled) === false) return;
    const target = toValue(options.target) ?? (typeof document === "undefined" ? null : document);
    if (!target) return;
    target.addEventListener("keydown", onKeydown);
    detach = () => target.removeEventListener("keydown", onKeydown);
    onCleanup(() => detach?.());
  });

  const stop = () => {
    stopWatch();
    detach?.();
    detach = null;
  };
  onScopeDispose(stop);
  return stop;
}

/**
 * The keycaps for a shortcut, for `EKbd`: `formatShortcut("mod+k")` is `["⌘", "K"]` on a Mac and `["Ctrl", "K"]` elsewhere.
 */
export function formatShortcut(combo: string, apple: boolean = isApple()): string[] {
  const spec = parse(combo);
  const keys: string[] = [];
  if (spec.ctrl || (spec.mod && !apple)) keys.push(apple ? "⌃" : "Ctrl");
  if (spec.alt) keys.push(apple ? "⌥" : "Alt");
  if (spec.shift) keys.push(apple ? "⇧" : "Shift");
  if (spec.meta || (spec.mod && apple)) keys.push(apple ? "⌘" : "Win");
  const names: Record<string, string> = {
    escape: "Esc",
    " ": "Space",
    arrowup: "↑",
    arrowdown: "↓",
    arrowleft: "←",
    arrowright: "→",
    enter: "Enter",
  };
  keys.push(names[spec.key] ?? (spec.key.length === 1 ? spec.key.toUpperCase() : spec.key));
  return keys;
}
