# EDetailRow

A labelled detail from the account (name, email, phone, address) with a quiet Edit button.

```vue
<EPanel title="Contact">
  <EDetailRow label="Email" status="Verified" tone="success" @edit="editEmail">sam@example.com</EDetailRow>
  <EDetailRow label="Phone">(555) 123-4567</EDetailRow>
</EPanel>
```

## Props

| Prop       | Type       | Notes                                                                        |
| ---------- | ---------- | ---------------------------------------------------------------------------- |
| `label`    | `string`   | What the detail is. Required. Names the Edit button.                         |
| `status`   | `string`   | A word in a chip after the value, such as "Verified".                        |
| `tone`     | `ChipTone` | The chip's tone.                                                             |
| `editable` | `boolean`  | Forces the Edit button on or off. Left out, it follows the `@edit` listener. |

## Slots and events

| Name      | Use                                                                                                                                                         |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default` | The value.                                                                                                                                                  |
| `@edit`   | Pressing Edit. The button appears when something listens for `edit`, checked on every render, so a listener added later counts. Set `editable` to override. |

The words come from the messages `edit` ("Edit") and `editItem` ("Edit {label}"). Until the catalogue has them the English wording is used.

## Accessibility

- The Edit button is labelled "Edit {label}" for screen readers, so several rows do not all say "Edit".
- Tab reaches Edit; Enter and Space fire `edit`.

## Rules

- Stack them inside an EPanel. On a phone the value takes the full width and the chip and Edit sit beneath.
- A long value wraps inside its column.
