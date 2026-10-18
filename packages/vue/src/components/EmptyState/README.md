# EEmptyState

The panel shown when a list, search or table has no content. It has a dashed outline, the system's sign for an empty slot.

```vue
<EEmptyState icon="file" title="No statements yet">
  They appear here after your first visit.
  <template #action><EButton>Book a visit</EButton></template>
</EEmptyState>
```

## Props

| Prop           | Type                         | Default | Notes                                                 |
| -------------- | ---------------------------- | ------- | ----------------------------------------------------- |
| `title`        | `string`                     |         | What is missing, in the person's words.               |
| `icon`         | icon name                    |         | A glyph in a round badge above the title.             |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `3`     | The title's heading element.                          |
| `bare`         | `boolean`                    |         | Removes the outline, for use inside a table or panel. |

`class`, `style` and attributes fall through to the root.

## Slots

| Slot      | Use                                                   |
| --------- | ----------------------------------------------------- |
| `default` | One or two sentences: why it is empty and what to do. |
| `action`  | The next step, a Button.                              |

## Rules

- Say what is missing in the person's words. Never leave a list silently blank.
- The title is a heading, so pick the level that fits the page outline.
