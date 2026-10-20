# EHeading

The six heading styles (36, 24, 20, 18, 16 and 14px) with an optional kicker label above.

```vue
<EHeading :level="1" kicker="Statement 8842">Your visit on October 22</EHeading>
```

## Props

<!-- props:start -->

| Prop     | Type                         | Default | Notes                                                                                                                              |
| -------- | ---------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `level`  | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2`     | 1 to 6: sets both the element (`h1` to `h6`) and the size (36, 24, 20, 18, 16 and 14px). One level 1 per page; do not skip levels. |
| `kicker` | `string`                     | —       | A small mono label above the heading; renders an `EKicker`, which is not itself a heading.                                         |

<!-- props:end -->

`class`, `style` and attributes land on the `div` element.

## Slots

| Slot      | Use               |
| --------- | ----------------- |
| `default` | The heading text. |

## Accessibility

- Renders an `h1` to `h6`: one level 1 per page, and do not skip levels.
