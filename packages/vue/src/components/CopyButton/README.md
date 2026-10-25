# ECopyButton

An icon button that copies text and shows a check mark. For a block of code use [`ECodeBlock`](../CodeBlock/README.md), which has one built in.

```vue
<ECopyButton :text="inviteLink" label="Copy invite link" />
```

## Props

<!-- props:start -->

| Prop      | Type                                                           | Default      | Notes                                                                             |
| --------- | -------------------------------------------------------------- | ------------ | --------------------------------------------------------------------------------- |
| `text`    | `string \| (() => string)`                                     | **Required** | What to copy: the text, or a function that returns it when the button is pressed. |
| `label`   | `string`                                                       | `"Copy"`     | The accessible name. Say what is copied when a page has several.                  |
| `timeout` | `number`                                                       | `2000`       | Milliseconds the check mark (or the alert, after a failure) shows.                |
| `variant` | `"quiet" \| "primary" \| "secondary" \| "outline" \| "danger"` | `"quiet"`    | The `EIconButton` variant.                                                        |
| `size`    | `"sm" \| "md" \| "lg"`                                         | `"md"`       | `sm` is a compact square, `lg` a larger one. Every size keeps a 44px target.      |

<!-- props:end -->

`class`, `style`, attributes and listeners (`@click`, `aria-*`) land on the `button` element.

## Events

| Event  | Payload   | When                                                        |
| ------ | --------- | ----------------------------------------------------------- |
| `copy` | `boolean` | After each attempt, with whether the text was copied or not |

## Accessibility

- A `button` named by `label`. "Copied" is announced politely, "Couldn't copy" assertively. Both are the messages `copied` and `copyFailed`.
- Without a clipboard (an insecure page) it falls back to selecting hidden text. If that fails too, nothing is copied, the icon turns to a red alert for `timeout` and the failure is announced.

## Keyboard

| Key          | Action           |
| ------------ | ---------------- |
| Enter, Space | Copies the text. |

## Related

[`ECodeBlock`](../CodeBlock/README.md) when the text is code, [`EIconButton`](../IconButton/README.md) for any other icon action.
