# EDetailRow

A labelled account detail (name, email, phone) with a quiet Edit button. Stack several inside an `EPanel`.

```vue
<EPanel title="Contact">
  <EDetailRow label="Email" status="Verified" tone="success" @edit="editEmail">sam@example.com</EDetailRow>
  <EDetailRow label="Phone">(555) 123-4567</EDetailRow>
</EPanel>
```

## Props

| Prop       | Type       | Default         | Notes                                                 |
| ---------- | ---------- | --------------- | ----------------------------------------------------- |
| `label`    | `string`   |                 | Required. What the detail is; names the Edit button.  |
| `status`   | `string`   |                 | A word in a chip after the value, such as "Verified". |
| `tone`     | `ChipTone` |                 | The chip's tone.                                      |
| `editable` | `boolean`  | follows `@edit` | Forces the Edit button on or off.                     |

`class`, `style` and attributes land on the `div` element. The messages `edit` and `editItem` ("Edit {label}") are configurable.

## Slots

| Slot      | Use        |
| --------- | ---------- |
| `default` | The value. |

## Events

| Event  | Payload | Notes                                                                                                |
| ------ | ------- | ---------------------------------------------------------------------------------------------------- |
| `edit` |         | The Edit button was pressed. The button shows only when something listens, unless `editable` is set. |

## Accessibility

- The Edit button is named "Edit {label}", so several rows do not all say "Edit".
