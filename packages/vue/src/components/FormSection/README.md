# EFormSection

A titled section of a longer form. Split forms of more than about six fields into sections that each answer one question.

```vue
<EFormSection title="Your details" description="As they appear on your card.">
  <ETextField v-model="name" label="Name" />
  <ETextField v-model="email" label="Email" type="email" />
</EFormSection>
```

## Props

| Prop           | Type                         | Default   | Notes                                                     |
| -------------- | ---------------------------- | --------- | --------------------------------------------------------- |
| `title`        | `string`                     |           | Required. The question the section answers.               |
| `description`  | `string`                     |           | Short line under the title.                               |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2`       | Heading level of the title.                               |
| `gap`          | `number \| string`           | `4`       | Space between fields: a space token number or CSS length. |
| `id`           | `string`                     | generated | The heading's id.                                         |

`class`, `style` and attributes land on the `section` element.

## Slots

| Slot      | Use                               |
| --------- | --------------------------------- |
| `default` | The fields, spaced with `EStack`. |

## Accessibility

- A `section` labelled by its heading, so it is a landmark region.
