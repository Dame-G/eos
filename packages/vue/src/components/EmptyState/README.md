# EEmptyState

The panel shown when a list, search or table has no content. Never leave a list silently blank.

```vue
<EEmptyState icon="file" title="No statements yet">
  They appear here after your first visit.
  <template #action><EButton>Book a visit</EButton></template>
</EEmptyState>
```

## Props

| Prop           | Type                         | Default | Notes                                                 |
| -------------- | ---------------------------- | ------- | ----------------------------------------------------- |
| `title`        | `string`                     |         | Required. What is missing, in the person's words.     |
| `icon`         | `IconProp`                   |         | Icon in a round badge above the title.                |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `3`     | Heading level of the title; fit the page outline.     |
| `bare`         | `boolean`                    |         | Removes the outline, for use inside a table or panel. |

`class`, `style` and attributes land on the `div` element.

## Slots

| Slot      | Use                                                   |
| --------- | ----------------------------------------------------- |
| `default` | One or two sentences: why it is empty and what to do. |
| `action`  | The next step, a button.                              |

## Accessibility

- The title is a heading; set `headingLevel` to keep the outline correct.
