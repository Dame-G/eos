# EHighlight

A short run of text set off by the accent colour: a name, a value or a word worth noticing inside a sentence. Use [`ECodeBlock`](../CodeBlock/README.md) for a block of code.

```vue
<p>Set <EHighlight code>brand</EHighlight> to rebrand every component.</p>
<p>Payment is <EHighlight>due Oct 22</EHighlight>.</p>
```

## Props

<!-- props:start -->

| Prop     | Type      | Default | Notes                                                                                                                                                              |
| -------- | --------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `code`   | `boolean` | `false` | Renders a `code` element in the mono font, for a name, value or snippet inside a sentence. Without it the element is a `mark`, for a word worth noticing.          |
| `swatch` | `string`  | —       | A CSS colour to show as a small square to the right of the text, for a colour value such as `#2c95b4`. The square is decoration: put the value itself in the text. |

<!-- props:end -->

Pass `swatch` a CSS colour to draw a small square of it to the right of the text, for a colour value: `<EHighlight code swatch="#2c95b4">#2c95b4</EHighlight>`. The square is hidden from assistive technology, so keep the value itself in the text.

`class`, `style` and attributes land on the `code` or `mark` element. The text colour changes and a faint tint of the same colour sits behind it; the tint is paint only, with no padding, border or margin, so the text takes the room plain text would. The colour is the `secondary` token, so the theme's `accent` input sets it.

## Slots

| Slot      | Use               |
| --------- | ----------------- |
| `default` | The text to mark. |

## Accessibility

- `code` renders a `code` element and the default renders a `mark`, so assistive technology can announce them as code or as marked text.
- The text is the `secondary` colour, the same one success text uses, so it is a dark green on a light page and a light green on a dark one in the default theme. A custom `accent` is checked against the soft tint it is paired with, not against `surface`, so check a new accent for contrast. Forced-colors mode uses the system highlight colour.
