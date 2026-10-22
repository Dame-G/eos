# EHighlight

A short run of text set off by the accent colour: a name, a value or a word worth noticing inside a sentence. Use [`ECodeBlock`](../CodeBlock/README.md) for a block of code.

```vue
<p>Set <EHighlight code>brand</EHighlight> to rebrand every component.</p>
<p>Payment is <EHighlight>due Oct 22</EHighlight>.</p>
<p>The accent is <EHighlight code swatch="#2c95b4">#2c95b4</EHighlight>.</p>
```

## Props

<!-- props:start -->

| Prop     | Type      | Default | Notes                                                                                                                                                     |
| -------- | --------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `code`   | `boolean` | `false` | Renders a `code` element in the mono font, for a name, value or snippet inside a sentence. Without it the element is a `mark`, for a word worth noticing. |
| `swatch` | `string`  | None    | A CSS colour drawn as a square after the text, for a colour value such as `#2c95b4`. The square is decoration, so put the value itself in the text.       |

<!-- props:end -->

`class`, `style` and attributes land on the `code` or `mark` element. The text is the `secondary` colour on a faint tint of the same colour, so the theme's `accent` input sets both. The tint adds no padding, border or margin, so the text takes the room plain text would.

## Slots

| Slot      | Use               |
| --------- | ----------------- |
| `default` | The text to mark. |

## Accessibility

- `code` renders a `code` element and the default renders a `mark`, so assistive technology can announce them as code or as marked text.
- Check a custom `accent` for contrast, since the text is set in `secondary`. Forced-colors mode uses the system highlight colour.
