# ECopyButton

An icon button that copies text and shows a check mark. For a block of code use [`ECodeBlock`](../CodeBlock/README.md), which has one built in.

```vue
<ECopyButton :text="inviteLink" label="Copy invite link" />
```

## Props

<!-- props:start -->

| Prop      | Type                       | Default      | Notes                                                                             |
| --------- | -------------------------- | ------------ | --------------------------------------------------------------------------------- |
| `text`    | `string \| (() => string)` | **Required** | What to copy: the text, or a function that returns it when the button is pressed. |
| `label`   | `string`                   | `"Copy"`     | The accessible name. Say what is copied when a page has several.                  |
| `timeout` | `number`                   | `2000`       | Milliseconds the check mark shows after copying.                                  |

<!-- props:end -->

`class`, `style`, attributes and listeners (`@click`, `aria-*`) land on the `button` element.

## Events

| Event  | Payload   | When                                                        |
| ------ | --------- | ----------------------------------------------------------- |
| `copy` | `boolean` | After each attempt, with whether the text was copied or not |

## Accessibility

- A `button` named by `label`. "Copied" is announced politely, "Couldn't copy" assertively. Both are the messages `codeCopied` and `copyFailed`.
- Without a clipboard (an insecure page) it falls back to selecting hidden text. If that fails too, nothing is copied and the failure is announced.
