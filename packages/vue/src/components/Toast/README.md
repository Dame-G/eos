# EToast

A floating message that confirms or reports something just done. Show toasts through `useToast()` and [`EToastProvider`](../ToastProvider/README.md). Use this component directly only to build something else.

```vue
<EToast tone="success" title="Payment received" @close="hide">A receipt was sent to your email.</EToast>
```

## Props

<!-- props:start -->

| Prop       | Type                                                        | Default      | Notes                                                                                                                                                                |
| ---------- | ----------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`    | `string`                                                    | **Required** | What happened, in a few words.                                                                                                                                       |
| `tone`     | `"neutral" \| "info" \| "success" \| "warning" \| "danger"` | `"info"`     | `danger` is announced at once and the other tones politely. `neutral` is for news that is neither good nor bad.                                                      |
| `icon`     | `IconProp`                                                  | None         | Replaces the icon of the tone.                                                                                                                                       |
| `closable` | `boolean`                                                   | `true`       | Shows the dismiss button.                                                                                                                                            |
| `live`     | `boolean`                                                   | `true`       | Announces the toast to screen readers as it appears (`alert` for `danger`, `status` for the rest). Turn it off when the host announces it, as `EToastProvider` does. |

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

- `role="alert"` for danger, `role="status"` for the other tones (`neutral`, `info`, `success`, `warning`), unless `live` is off.
- The dismiss button is named by the `dismiss` message, as `ENotice`'s is ("Dismiss"). Turn it off with `:closable="false"` only for a toast that goes by itself.

## Keyboard

| Key          | Action                                           |
| ------------ | ------------------------------------------------ |
| Tab          | Moves between the action and the dismiss button. |
| Enter, Space | Presses the focused button.                      |

## Related

[`ENotice`](../Notice/README.md) for a message that stays in the page, [`EToastProvider`](../ToastProvider/README.md) to show toasts.
