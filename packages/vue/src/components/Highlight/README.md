# EHighlight

A short run of text set off in the accent colour: a name, a value or a word worth noticing inside a sentence. Use `ECodeBlock` for a block of code.

```vue
<p>Set <EHighlight code>brand</EHighlight> to rebrand every component.</p>
<p>Payment is <EHighlight>due Oct 22</EHighlight>.</p>
```

## Props

| Prop   | Type      | Default | Notes                                                                                                                                   |
| ------ | --------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `code` | `boolean` |         | Renders a `code` element in the mono font, for a name, value or snippet. Without it the element is a `mark`, for a word worth noticing. |

`class`, `style` and attributes land on the `code` or `mark` element. The marker is the `secondary` token, so the theme's accent input sets its colour. It has no border and repeats its padding and rounded ends on every line when the text wraps.

## Slots

| Slot      | Use               |
| --------- | ----------------- |
| `default` | The text to mark. |

## Accessibility

- `code` renders a `code` element and the default renders a `mark`, so assistive technology can announce them as code or as marked text.
- The text stays `ink`; the marker is a 38% accent wash behind it, so the text keeps at least 5:1 against it for any accent, in light and dark themes.
- In forced-colors mode it is drawn with the system highlight colours.
