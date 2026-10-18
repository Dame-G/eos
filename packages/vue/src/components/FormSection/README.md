# AeFormSection

A titled section of a longer form, with a short description. A form of more than about six fields should be sections, each answering one question ("Your details", "How you will pay"), or steps of a Stepper.

```vue
<AeFormSection title="Your details" description="As they appear on your card.">
  <AeTextField v-model="name" label="Name" />
  <AeTextField v-model="email" label="Email" type="email" />
</AeFormSection>
```

## Props

| Prop           | Type               | Notes                                                                      |
| -------------- | ------------------ | -------------------------------------------------------------------------- |
| `title`        | `string`           | Required. The question the section answers.                                |
| `description`  | `string`           | A short line under the title.                                              |
| `headingLevel` | `1 \| 2 \| 3 \| 4` | The heading element. Default 2.                                            |
| `gap`          | `number \| string` | Space between the fields: a space token number or a CSS length. Default 4. |
| `id`           | `string`           | The heading's id. Generated when left out.                                 |

Slot: the fields (default), spaced evenly with `AeStack`. `class` and other attributes land on the `<section>`.

## Rules

- A `section` labelled by its heading, so it is a landmark region for screen readers.
- Sections after the first are ruled apart with a hairline and `space-6` of padding; the first has neither.
