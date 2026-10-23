# Composables

Functions to call inside `setup()`. Each is exported from `@eos-ui/vue`.

## Conventions

- One composable per file: `useThing.ts` exports `useThing` (and its types). A helper that is not a composable (`focusInside`) lives here too when components share it. The file is exported from the package automatically by `scripts/gen-index.mjs`.
- Each has a test next to it (`useThing.test.ts`) that runs in a real browser.
- Safe for the server: touch `window`, `document` and the clipboard only inside `onMounted` or an event handler, and do nothing when they are missing.
- Take reactive input as `MaybeRefOrGetter`, read it with `toValue`, and return refs or computeds, so callers can pass props directly.
- Clean up what you start (`onScopeDispose` or `onBeforeUnmount`). Ids come from `useUid`, never a module counter. Words come from `useMessages()`.
- Read configuration with `useConfig()`, which works without the plugin.

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

## `focusInside(event)`

A click handler for a boxed input: a click on the padding or an icon puts the cursor in the input, while a button or link inside keeps its own click. Bind it with `@click="focusInside"` on the wrapper.

## `useFieldAttrs()`

For a form control built on `EField`: keeps `class` and `style` on the wrapper and sends every other attribute to the real input. Use it with `defineOptions({ inheritAttrs: false })`.

## `useQuietFocus(open, inside)`

Keeps a popup from taking focus when it is opened from outside (`v-model:open`, or open from the first render). `ESelect`, `EDatePicker` and `ERangePicker` use it. `inside(el)` says whether an element belongs to the popup.

```ts
const quiet = useQuietFocus(shown, (el) => !!el.closest(".e-calpanel"));
// on the trigger: @click="quiet.intent"
// in onOpenAutoFocus: if (!quiet.personOpened()) return;  // opened from outside: leave focus alone
// in onCloseAutoFocus: if (!quiet.returnsFocus()) e.preventDefault();
```

`intent()` marks the next open as a person's. `personOpened()` and `returnsFocus()` answer once. `undoFocusSteal()` hands focus back to the element that had it when a popup that opened from outside pulls it in anyway (a Reka select does), for 400 ms.
