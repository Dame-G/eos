# EPanel

A flat, outlined container (an `ESurface` rendered as a `section`) for statements, detail rows and forms.

```vue
<EPanel kicker="Account" title="Contact details">
  <template #action><EButton variant="outline">Edit</EButton></template>
  <EDescriptionList :items="details" />
</EPanel>
```

## Props

| Prop           | Type                         | Default | Notes                                                   |
| -------------- | ---------------------------- | ------- | ------------------------------------------------------- |
| `kicker`       | `string`                     |         | Small mono label above the title.                       |
| `title`        | `string`                     |         | Heading. A title or an `action` adds a header row.      |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `3`     | Heading level of the title; fit it to the page outline. |

`class`, `style` and attributes land on the `section` element.

## Slots

| Slot      | Use                                         |
| --------- | ------------------------------------------- |
| `default` | The body.                                   |
| `action`  | Header action at the end, usually a button. |

## Accessibility

- A `section` is a landmark only when named: give it `aria-label`.
