# EErrorSummary

The list of what went wrong, placed at the top of a form after a failed submit.

```vue
<EErrorSummary :errors="[{ field: 'Email', message: 'Enter an email address' }, { message: 'Choose a date' }]" />
```

## Props

| Prop           | Type                         | Default              | Notes                                                         |
| -------------- | ---------------------------- | -------------------- | ------------------------------------------------------------- |
| `errors`       | `ErrorSummaryItem[]`         |                      | Required. `{ field?, message }`; renders nothing while empty. |
| `title`        | `string`                     | `There is a problem` | The heading.                                                  |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2`                  | Heading level of the title.                                   |
| `autoFocus`    | `boolean`                    | `true`               | Moves focus to the summary when errors appear.                |

`class`, `style` and attributes land on the `div` element. Keep each field's own error; the summary does not replace them, and the messages should match them.

## Accessibility

- A `role="alert"` named by its heading; it takes focus when errors appear.
- `field` is shown first ("Email: Enter an email address"); omit it when the message already names the field.
