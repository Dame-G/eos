# AeToastProvider and useToast

Put the provider once around the app, then call `useToast()` anywhere inside it.

```vue
<!-- App.vue -->
<AeToastProvider><RouterView /></AeToastProvider>
```

```ts
const toast = useToast();
const id = toast.show({ title: "Payment received", message: "A receipt was sent to your email.", tone: "success" });
toast.dismiss(id);
toast.clear();
```

## `toast.show(options)`

| Option     | Type                                           | Default | Notes                                                                                        |
| ---------- | ---------------------------------------------- | ------- | -------------------------------------------------------------------------------------------- |
| `title`    | `string`                                       |         | What happened, in a few words.                                                               |
| `message`  | `string`                                       |         | One sentence of detail.                                                                      |
| `tone`     | `"info" \| "success" \| "warning" \| "danger"` | `info`  |                                                                                              |
| `action`   | a vnode or a function returning one            |         | A Button, such as `() => h(AeButton, { variant: "outline" }, () => "Undo")`.                 |
| `duration` | `number` (ms)                                  | `5000`  | `0` stays until dismissed. The default is `0` for `danger` and for a toast with an `action`. |

It returns the toast's id. `toast.dismiss(id)` removes one, `toast.clear()` removes all. Outside a provider `useToast()` throws.

## Behaviour

- The region is rendered once, at the bottom end of the screen, as a labelled `region` ("Notifications", the `toastRegion` message), in the configured portal target inside an `ae-root` element.
- Each toast is a live region: `status` for the polite tones, `alert` for danger, so it is announced when it appears.
- The timers pause while the pointer or keyboard focus is on a toast, and run on with the time they had left (WCAG 2.2.1). A toast cannot vanish while it is being read or used.
- A toast has no motion of its own, so `prefers-reduced-motion` has nothing to turn off. The region is hidden in print.

## Showing toasts from code outside components

`createToasts()` makes a store. Provide it once under `TOAST_KEY` and the provider shows that store, so a router guard or a state store can show toasts:

```ts
const toasts = createToasts();
app.provide(TOAST_KEY, toasts);
toasts.show({ title: "Signed out", tone: "info" });
```

## Rules

- Success and information go after five seconds. An error, or a toast with an action, stays until dismissed.
- A message that must stay until dealt with is an AeNotice, not a toast.
