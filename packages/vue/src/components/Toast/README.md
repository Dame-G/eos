# EToast

A floating message that confirms or reports something just done. Show toasts through `useToast()` and [`EToastProvider`](../ToastProvider/README.md). Use this component directly only to build something else.

```vue
<EToast tone="success" title="Payment received" @close="hide">A receipt was sent to your email.</EToast>
```

## Props

<!-- props:start -->

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `title` | `string` | **Required** | What happened, in a few words. |
| `tone` | `"info" \| "success" \| "warning" \| "danger"` | `"info"` | `danger` is announced at once and the other tones politely. |
| `icon` | `IconProp` | None | Replaces the icon of the tone. |
| `closable` | `boolean` | None | Forces the dismiss button on or off. Left out, it shows when a `@close` listener is attached. |

<!-- props:end -->

`class`, `style` and attributes land on the rendered element.

## Slots

| Slot      | Use                                                                                                             |
| --------- | --------------------------------------------------------------------------------------------------------------- |
| `default` | One sentence of detail.                                                                                         |
| `action`  | A button. It sits at the end of the row when the toast is 36rem wide or more, and below the text when narrower. |

## Events

| Event   | Payload | Notes                                                                              |
| ------- | ------- | ---------------------------------------------------------------------------------- |
| `close` |         | The dismiss button was pressed. The button shows only when a listener is attached. |

## Accessibility

- `role="alert"` for danger, `role="status"` for the other tones.
- The dismiss button is named by the `dismiss` message.
