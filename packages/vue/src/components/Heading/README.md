# EHeading

The six heading levels, with an optional kicker label above.

```vue
<EHeading :level="1" kicker="Statement 8842">Your visit on October 22</EHeading>
```

## Props

<!-- props:start -->

| Prop     | Type                         | Default | Notes                                                                                                                                                                                         |
| -------- | ---------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `level`  | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2`     | 1 to 6. Sets both the element (`h1` to `h6`) and the size. The default sizes are 36, 24, 20, 18, 16 and 14px, and `textScale` rescales them. Use one level 1 per page and do not skip levels. |
| `kicker` | `string`                     | —       | A label above the heading. It renders an `EKicker`, which is not itself a heading.                                                                                                            |

<!-- props:end -->

`class`, `style` and attributes land on the `div` element.

## Slots

| Slot      | Use               |
| --------- | ----------------- |
| `default` | The heading text. |

## Accessibility

- Renders an `h1` to `h6`. Use one level 1 per page and do not skip levels.
