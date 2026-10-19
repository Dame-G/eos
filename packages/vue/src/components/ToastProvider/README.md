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

`EToastProvider` has no props. `toast.show(options)` returns the toast's id; `toast.dismiss(id)` removes one and `toast.clear()` removes all. `useToast()` throws outside a provider. To show toasts from code outside components, provide a store with `provide(TOAST_KEY, createToasts())` and call `show` on it.

## Options

The options of `toast.show`.

| Option     | Type                                           | Default | Notes                                                                             |
| ---------- | ---------------------------------------------- | ------- | --------------------------------------------------------------------------------- |
| `title`    | `string`                                       |         | Required. What happened, in a few words.                                          |
| `message`  | `string`                                       |         | One sentence of detail.                                                           |
| `tone`     | `"info" \| "success" \| "warning" \| "danger"` | `info`  | `danger` is announced at once.                                                    |
| `action`   | vnode or function returning one                |         | A button, such as `() => h(EButton, { variant: "outline" }, () => "Undo")`.       |
| `duration` | `number` (ms)                                  | `5000`  | `0` stays until dismissed; that is the default for `danger` and with an `action`. |

## Slots

| Slot      | Use                                            |
| --------- | ---------------------------------------------- |
| `default` | The app. Call `useToast()` anywhere inside it. |

## Accessibility

- The region is a labelled `region` (the `toastRegion` message); each toast is announced when it appears (`alert` for danger, `status` otherwise).
- Timers pause while the pointer or focus is on a toast (WCAG 2.2.1).
- A message that must stay until dealt with is an `ENotice`, not a toast.
