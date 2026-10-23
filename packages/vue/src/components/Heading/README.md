# EHeading

The six heading levels, with an optional kicker label above.

```vue
<EHeading :level="1" kicker="Statement 8842">Your visit on October 22</EHeading>
```

## Props

<!-- props:start -->

| Prop     | Type                                                                     | Default                   | Notes                                                                                                                                                                                                              |
| -------- | ------------------------------------------------------------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `level`  | `1 \| 2 \| 3 \| 4 \| 5 \| 6`                                             | `2`                       | 1 to 6. The step of the type scale and, unless `as` is set, the element (`h1` to `h6`). The sizes are 36, 24, 20, 18, 16 and 14px, and `textScale` rescales them. Use one level 1 per page and do not skip levels. |
| `as`     | `"h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6" \| "p" \| "div" \| "span"` | `the heading for `level`` | The element, when it should differ from the level: `as="h3"` with `level` 2 is an `h3` drawn at the size of an `h2`. Use `p`, `div` or `span` for text that looks like a heading but is not part of the outline.   |
| `kicker` | `string`                                                                 | None                      | A label above the heading. It renders an `EKicker`, which is not itself a heading.                                                                                                                                 |

<!-- props:end -->

`class`, `style` and attributes land on the heading element. With a `kicker` there is a bare `div` around the kicker and the heading, and they still land on the heading. `as` sets the element and `level` the size, so a heading can sit at the right level in the outline and still be drawn at another size.

## Slots

| Slot      | Use               |
| --------- | ----------------- |
| `default` | The heading text. |

## Accessibility

- Renders an `h1` to `h6`. Use one level 1 per page and do not skip levels.
- `as="p"`, `div` or `span` draws heading-sized text that is not part of the outline.

## Keyboard

| Key | Action                      |
| --- | --------------------------- |
| Tab | A heading is not focusable. |

## Related

[`EKicker`](../Kicker/README.md) for the small label above, [`EPageHeader`](../PageHeader/README.md) for the top of a page.
