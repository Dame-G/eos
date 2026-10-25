# EEmptyState

The panel shown when a list, search or table has no content. Never leave a list silently blank. Use [`ESkeleton`](../Skeleton/README.md) while the content is still loading.

```vue
<EEmptyState icon="file" title="No statements yet">
  They appear here after your first visit.
  <template #action><EButton>Book a visit</EButton></template>
</EEmptyState>
```

## Props

<!-- props:start -->

| Prop           | Type                         | Default      | Notes                                                                                                                                                      |
| -------------- | ---------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `icon`         | `IconProp`                   | None         | An icon above the title.                                                                                                                                   |
| `title`        | `string`                     | **Required** | What is missing, in the person's words.                                                                                                                    |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `3`          | The level of the title's heading element, 1 to 6, chosen to fit the page outline.                                                                          |
| `bare`         | `boolean`                    | `false`      | Removes the outline, for use inside a table or panel.                                                                                                      |
| `tone`         | `"neutral" \| "danger"`      | `"neutral"`  | `danger` colours the icon in the error colour, for a failed load or a search that broke rather than one that found nothing. `neutral` is the default look. |
| `size`         | `"sm" \| "md"`               | `"md"`       | `sm` is more compact with a smaller icon, for use inside a panel or a table.                                                                               |

<!-- props:end -->

`class`, `style` and attributes land on the `div` element.

## Slots

| Slot      | Use                                                                                     |
| --------- | --------------------------------------------------------------------------------------- |
| `default` | One or two sentences on why it is empty and what to do: text, or paragraphs and a link. |
| `action`  | The next step, an `EButton`.                                                            |

## Accessibility

- The title is a heading. Set `headingLevel` to keep the outline correct.

## Keyboard

| Key | Action                                    |
| --- | ----------------------------------------- |
| Tab | Moves to the action in the `action` slot. |

## Related

[`ENotice`](../Notice/README.md) for a message about a problem.
