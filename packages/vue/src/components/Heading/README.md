# EHeading

The three heading styles (36, 24 and 20px) with an optional kicker label above.

```vue
<EHeading :level="1" kicker="Statement 8842">Your visit on October 22</EHeading>
```

## Props

| Prop     | Type          | Default | Notes                                                          |
| -------- | ------------- | ------- | -------------------------------------------------------------- |
| `level`  | `1 \| 2 \| 3` | `2`     | Sets both the element (`h1` to `h3`) and the size.             |
| `kicker` | `string`      |         | Small uppercase label above the heading; not itself a heading. |

`class`, `style` and attributes land on the `div` element.

## Slots

| Slot      | Use               |
| --------- | ----------------- |
| `default` | The heading text. |

## Accessibility

- Renders an `h1` to `h3`: one level 1 per page, and do not skip levels.
