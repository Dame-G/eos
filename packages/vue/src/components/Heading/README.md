# EHeading

The three heading styles (36, 24 and 20px, weight 500) with an optional mono `kicker` above.

```vue
<EHeading :level="1" kicker="Statement 8842">Your visit on 22 September</EHeading>
```

## Props

| Prop     | Type          | Default | Notes                                                                             |
| -------- | ------------- | ------- | --------------------------------------------------------------------------------- |
| `level`  | `1 \| 2 \| 3` | `2`     | Sets both the element (`h1` to `h3`) and the size (36, 24 and 20px).              |
| `kicker` | `string`      | none    | A small uppercase mono label above the heading. It is a paragraph, not a heading. |

## Slots

| Slot      | What              |
| --------- | ----------------- |
| `default` | The heading text. |

Native attributes land on the wrapping `<div class="e-heading">`.

## Rules

- One level 1 per page; do not skip levels.
- To choose the element and the size separately, use the `headingLevel` prop of the component that owns the title (Panel, StatementCard), not this one.

## Accessibility

- The level is a real `h1` to `h3`, so the page outline is exposed to assistive technology.
