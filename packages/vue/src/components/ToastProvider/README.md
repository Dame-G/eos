# EToastProvider

Renders the toast region once at the app root and provides `useToast()`, so any component inside can show a toast. Use [`ENotice`](../Notice/README.md) for a message that stays on the page.

```vue
<!-- App.vue -->
<EToastProvider><RouterView /></EToastProvider>
```

```ts
const toast = useToast();
const id = toast.show({ title: "Uploading", duration: 0 });
toast.update(id, { title: "Uploaded", tone: "success" });

toast.promise(pay(), {
  loading: "Paying",
  success: (receipt) => ({ title: "Payment received", message: `Receipt ${receipt.number} was sent to your email.` }),
  error: "Payment failed",
});

toast.show({ title: "3 rows deleted", key: "rows-deleted" }); // a repeat updates this toast
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

The options of `toast.show`. `toast.update(id, patch)` takes any of them.

| Option     | Type                                                        | Default      | Notes                                                                                                                      |
| ---------- | ----------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `title`    | `string`                                                    | **Required** | What happened, in a few words.                                                                                             |
| `message`  | `string`                                                    | None         | One sentence of detail under the title.                                                                                    |
| `tone`     | `"neutral" \| "info" \| "success" \| "warning" \| "danger"` | `"info"`     | `danger` is announced at once. `neutral` is for news that is neither good nor bad.                                         |
| `icon`     | `IconProp`                                                  | the tone's   | An icon name or component, in place of the tone's icon.                                                                    |
| `closable` | `boolean`                                                   | `true`       | Shows the dismiss button. A toast with `duration: 0` always shows it, since nothing else would remove it.                  |
| `key`      | `string`                                                    | None         | Identifies the toast. Showing another with the same key updates the one on screen and restarts its timer, so it stays one. |
| `action`   | `VNodeChild \| (() => VNodeChild)`                          | None         | A button, such as `() => h(EButton, { variant: "outline" }, () => "Undo")`. A toast with an action stays until dismissed.  |
| `duration` | `number`                                                    | `5000`       | Milliseconds before it goes. `0` stays until dismissed, the default for `danger` and with an `action`.                     |

`toast.promise` takes `loading`, `success` and `error`, each a title or the options above without `tone`: the stages are `info`, `success` and `danger`. `success` and `error` may also be functions of the result or the error. The loading toast stays until the promise settles, and its `message`, `action`, `closable` and `duration` do not carry over to the result.

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

| Key          | Action                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------- |
| F8           | Moves focus to the notifications.                                                        |
| Tab          | Moves into the region and between a toast's buttons.                                     |
| Escape       | Dismisses the toast that has focus. On the region itself, returns focus to where it was. |
| Enter, Space | Presses the focused button. Focus inside pauses the timers.                              |

## Related

[`EToast`](../Toast/README.md) is the toast itself.
