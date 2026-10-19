# EToast

A floating message that confirms or reports something just done. Show toasts through `useToast()` and `EToastProvider`; use this component directly only to build something else.

```vue
<EToast tone="success" title="Payment received" @close="hide">A receipt was sent to your email.</EToast>
```

## Props

| Prop       | Type                                           | Default | Notes                                                               |
| ---------- | ---------------------------------------------- | ------- | ------------------------------------------------------------------- |
| `title`    | `string`                                       |         | Required. What happened, in a few words.                            |
| `tone`     | `"info" \| "success" \| "warning" \| "danger"` | `info`  | `danger` is announced at once.                                      |
| `icon`     | `IconProp`                                     |         | Replaces the tone's icon.                                           |
| `closable` | `boolean`                                      |         | Forces the dismiss button on or off. Left out, it follows `@close`. |

`class`, `style` and attributes land on the rendered element.

## Slots

| Slot      | Use                                                                              |
| --------- | -------------------------------------------------------------------------------- |
| `default` | One sentence of detail.                                                          |
| `action`  | A button; at the end of the row at 36rem wide or more, below the text otherwise. |

## Events

| Event   | Payload | Notes                                                                      |
| ------- | ------- | -------------------------------------------------------------------------- |
| `close` |         | The dismiss button was pressed; it shows only when a listener is attached. |

## Accessibility

- `role="alert"` for danger, `role="status"` for the other tones.
- The dismiss button is named by the `dismiss` message.
