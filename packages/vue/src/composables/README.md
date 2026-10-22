# Composables

Functions to call inside `setup()`. Each is exported from `@eos-ui/vue`.

## `useAnnouncer()`

Says something to screen reader users without showing it. One hidden live region per politeness is shared by the whole page and created on first use. On the server it does nothing.

```ts
const { announce } = useAnnouncer();
announce("3 rows selected");
announce("Payment failed", { assertive: true }); // interrupts: for errors
```

Announce the result of an action the person cannot otherwise see. Do not repeat what is already in a live region on screen. The same message twice in a row is still spoken.

## `useShortcuts(map, options?)`

Binds keys to functions for as long as the component lives, and returns a function that removes them early.

```ts
useShortcuts({
  "mod+k": openSearch, // Cmd on Apple devices, Ctrl elsewhere
  "mod+shift+p": openPalette,
  escape: close,
  "?": showHelp,
});
```

Combine `mod`, `ctrl`, `cmd` (or `meta`), `alt` and `shift` with `+`. Key names are `event.key` in lower case, with `esc`, `space`, `up`, `down`, `left` and `right` as short forms. Modifiers must match exactly. Shift is ignored for symbols such as `?`.

- Key-only shortcuts (no Ctrl, Cmd or Alt) are skipped while a text field has focus, so typing "g" in a search box does not fire `g`. Shortcuts with a modifier, and Escape, still run. Set `allowInInputs` to change that.
- A held key does not repeat, and text being composed (an IME) is left alone.
- Options: `target` (an element or ref, the document by default), `enabled` (a ref or getter), `allowInInputs`, `preventDefault` (on by default).

`formatShortcut("mod+k")` gives the keycaps to show in [`EKbd`](../components/Kbd/README.md): `["⌘", "K"]` on a Mac, `["Ctrl", "K"]` elsewhere.

## `useCopy(options?)`

Copies text and tells you when it worked. [`ECopyButton`](../components/CopyButton/README.md) and [`ECodeBlock`](../components/CodeBlock/README.md) use it.

```ts
const { copied, failed, copy } = useCopy({ timeout: 2000 });
await copy("npm install @eos-ui/vue"); // true if it reached the clipboard
```

`copied` and `failed` go back to false after `timeout` (2000 ms). "Copied" is announced politely and "Couldn't copy" assertively through `useAnnouncer`. Pass `announce: false` to stay silent. Where the async clipboard is missing (an insecure page) it falls back to selecting hidden text.

## `useToast()`

Shows a toast from anywhere in an app that installed `createEos()`, or from inside an [`EToastProvider`](../components/ToastProvider/README.md) without the plugin. The toast appears once an `EToastProvider` is mounted.

```ts
const toast = useToast();
toast.show({ title: "Saved", tone: "success" });
```

## `useUid(given?)`

A stable id for wiring a label, hint and error to a control. It matches between server and client. Pass the component's own `id` prop to let the consumer choose: `useUid(() => props.id)`.

## `useLocale()`

Everything date and money components need from the configured locale: month and weekday names, the first day of the week, date order and separator, and formatting and parsing of dates and money.

## `useFieldAttrs()`

For a form control built on `EField`: keeps `class` and `style` on the wrapper and sends every other attribute to the real input. Use it with `defineOptions({ inheritAttrs: false })`.
