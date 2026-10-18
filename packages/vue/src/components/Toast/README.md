# EToast

A floating message that confirms or reports something just done: ENotice's tones, icons and layout, lifted with the float shadow. Show toasts through `useToast()` and EToastProvider, which own the region, the timers and the pause on hover. Use EToast directly only to build something else, or in a preview.

```vue
<EToast tone="success" title="Payment received" @close="hide">A receipt was sent to your email.</EToast>
```

## Props

| Prop    | Type                                           | Default | Notes                          |
| ------- | ---------------------------------------------- | ------- | ------------------------------ |
| `title` | `string`                                       |         | What happened, in a few words. |
| `tone`  | `"info" \| "success" \| "warning" \| "danger"` | `info`  | `danger` is announced at once. |
| `icon`  | icon name                                      |         | Replaces the icon of the tone. |

`class`, `style` and attributes fall through to the root.

## Events and slots

| Name      | Use                                                                                                 |
| --------- | --------------------------------------------------------------------------------------------------- |
| `close`   | Emitted by the dismiss button, which shows only when a `@close` listener is attached.               |
| `default` | One sentence of detail.                                                                             |
| `action`  | A Button. At the end of the row when the toast is 36rem wide or more, under the text when narrower. |

## Size and timing

It is 24rem wide; with an action, up to 40rem. Success and information toasts go after five seconds. An error, or a toast with an action, stays until dismissed (see EToastProvider).

## Accessibility

- `role="alert"` for danger, `role="status"` for the other tones.
- The dismiss button is named "Dismiss". In forced colours the toast has a border.
