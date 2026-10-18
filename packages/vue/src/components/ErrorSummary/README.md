# EErrorSummary

The list of what went wrong, placed at the top of a form after a failed submit. It is a danger ENotice holding a plain list.

```vue
<EErrorSummary :errors="[{ field: 'Email', message: 'Enter an email address' }, { message: 'Choose a date' }]" />
```

## Props

| Prop           | Type                         | Default              | Notes                                                               |
| -------------- | ---------------------------- | -------------------- | ------------------------------------------------------------------- |
| `errors`       | `ErrorSummaryItem[]`         |                      | `{ field?, message }`. Nothing is rendered while the list is empty. |
| `title`        | `string`                     | "There is a problem" | The heading (the `errorSummary` message).                           |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2`                  | The heading element.                                                |
| `autoFocus`    | `boolean`                    | `true`               | Moves focus to the summary when errors appear.                      |

`class`, `style` and attributes fall through to the root.

## Behaviour and accessibility

- It takes focus when errors appear (on first render, and again whenever the number of errors changes) and is a `role="alert"` named by its heading, so keyboard and screen reader users land on it.
- The list is plain text: it says what to fix, and each field shows its own error beside it. `field` is shown first in medium weight ("Email: Enter an email address"); leave it out when the message already names the field.

## Rules

- Messages repeat the field's own error text, written the same way: what is wrong and how to fix it.
- Keep the field-level errors; the summary does not replace them.
