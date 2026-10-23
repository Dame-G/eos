# EToastProvider

Renders the toast region once at the app root and provides `useToast()`, so any component inside can show a toast.

```vue
<!-- App.vue -->
<EToastProvider><RouterView /></EToastProvider>
```

```ts
const toast = useToast();
const id = toast.show({ title: "Payment received", message: "A receipt was sent to your email.", tone: "success" });
toast.dismiss(id);
toast.clear();
```

`toast.show(options)` returns the toast's id. `toast.update(id, patch)` changes one on screen and restarts its timer. `toast.promise(promise, { loading, success, error })` shows `loading`, turns that toast into `success` or `error` when the promise settles and returns the promise. `toast.dismiss(id)` removes one and `toast.clear()` removes all. With `createEos()` installed, the app already has a toast store, so `useToast()` works anywhere in the app, including code outside the component tree, and toasts appear once an `EToastProvider` is mounted. Without the plugin, `EToastProvider` makes its own store for the components inside it and `useToast()` throws anywhere else. To use `useToast()` elsewhere without the plugin, provide a store with `app.provide(TOAST_KEY, createToasts())`.

## Props

<!-- props:start -->

| Prop    | Type     | Default | Notes                                                                |
| ------- | -------- | ------- | -------------------------------------------------------------------- |
| `limit` | `number` | `5`     | How many toasts stay on screen. Showing one more removes the oldest. |

<!-- props:end -->

## Options

The options of `toast.show`.

| Option     | Type                                           | Default    | Notes                                                                                     |
| ---------- | ---------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------- |
| `title`    | `string`                                       |            | Required. What happened, in a few words.                                                  |
| `message`  | `string`                                       |            | One sentence of detail.                                                                   |
| `tone`     | `"info" \| "success" \| "warning" \| "danger"` | `info`     | `danger` is announced at once.                                                            |
| `icon`     | icon name                                      | the tone's | Replaces the icon of the tone.                                                            |
| `closable` | `boolean`                                      | `true`     | Shows the dismiss button. It is always shown when `duration` is `0`.                      |
| `key`      | `string`                                       |            | Showing another toast with the same key updates the one on screen and restarts its timer. |
| `action`   | vnode or function returning one                |            | A button, such as `() => h(EButton, { variant: "outline" }, () => "Undo")`.               |
| `duration` | `number` (ms)                                  | `5000`     | `0` stays until dismissed. That is the default for `danger` and with an `action`.         |

## Slots

| Slot      | Use                                             |
| --------- | ----------------------------------------------- |
| `default` | The app. `useToast()` works anywhere inside it. |

## Accessibility

- The region is a labelled `region` (the `toastRegion` message) that exists only while a toast is showing. Toasts carry no live role: each one is announced through the page's shared live regions when it appears, assertively for `danger`.
- The region is exempt from the `aria-hidden` that a modal `EDialog` puts on the rest of the page, and takes clicks while the dialog is open, so a toast raised from a dialog is announced and can be dismissed.
- Timers pause while the pointer or focus is on a toast, and while the tab is hidden (WCAG 2.2.1).
- While a modal `EDialog` or `EDrawer` is open its focus trap keeps keyboard focus inside, so the toasts there are reached by pointer and by the announcement.
- A message that must stay until dealt with is an `ENotice`, not a toast.

## Keyboard

| Key         | Does                                                                                     |
| ----------- | ---------------------------------------------------------------------------------------- |
| F8          | Moves focus to the notifications.                                                        |
| Tab         | Moves into the region and between a toast's buttons.                                     |
| Escape      | Dismisses the toast that has focus. On the region itself, returns focus to where it was. |
| Enter/Space | Presses the focused button. Focus inside pauses the timers.                              |

## Related

[`EToast`](../Toast/README.md) is the toast itself, [`ENotice`](../Notice/README.md) a message that stays in the page.
