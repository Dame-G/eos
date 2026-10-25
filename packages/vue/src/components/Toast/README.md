# EToast

A floating message that confirms or reports something just done. Show toasts with `useToast()` and an [`EToastProvider`](../ToastProvider/README.md) (see [Toasts](https://eos.dame.gg/guide/toasts)); use this component directly only to build something else. Use [`ENotice`](../Notice/README.md) for a message that stays in the page.

```vue
<EToast tone="success" title="Payment received" @close="hide">A receipt was sent to your email.</EToast>
```

## Props

<!-- props:start -->

| Prop       | Type                                                        | Default                             | Notes                                                                                                                                               |
| ---------- | ----------------------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`    | `string`                                                    | **Required**                        | What happened, in a few words.                                                                                                                      |
| `tone`     | `"neutral" \| "info" \| "success" \| "warning" \| "danger"` | `"info"`                            | `neutral` is for news that is neither good nor bad, `info` informs, `success` confirms, `warning` needs attention and `danger` is an error.         |
| `icon`     | `IconProp`                                                  | None                                | Replaces the icon of the tone.                                                                                                                      |
| `closable` | `boolean`                                                   | `true`                              | Shows the dismiss button. A toast floats over the page, so it has one unless it goes by itself.                                                     |
| `role`     | `"alert" \| "status" \| false`                              | `"alert" for danger, else "status"` | How it is announced as it appears: `alert` at once, `status` politely, `false` not at all, for a host that announces it (as `EToastProvider` does). |

<!-- props:end -->

`class`, `style` and attributes land on the rendered element.

## Slots

| Slot      | Use                                                                                                             |
| --------- | --------------------------------------------------------------------------------------------------------------- |
| `default` | One sentence of detail.                                                                                         |
| `action`  | A button. It sits at the end of the row when the toast is 36rem wide or more, and below the text when narrower. |

## Events

| Event   | Payload | Notes                           |
| ------- | ------- | ------------------------------- |
| `close` |         | The dismiss button was pressed. |

## Accessibility

- The title and detail are announced through the page's shared live regions as the toast appears, at once for `danger` and politely for the rest; the toast itself carries no live role, which a screen reader would miss as it arrives with its words.
- The dismiss button is named "Dismiss" (message `dismiss`). Turn it off only for a toast that goes by itself.

## Keyboard

| Key          | Action                                           |
| ------------ | ------------------------------------------------ |
| Tab          | Moves between the action and the dismiss button. |
| Enter, Space | Presses the focused button.                      |

## Related

[`EDialog`](../Dialog/README.md) for a message that needs an answer before the person goes on.
