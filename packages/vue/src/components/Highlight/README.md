# EHighlight

A short run of text set off in the accent colour: a name, a value or a word worth noticing inside a sentence. Use [`ECodeBlock`](../CodeBlock/README.md) for a block of code.

```vue
<p>Set <EHighlight code>brand</EHighlight> to rebrand every component.</p>
<p>Payment is <EHighlight>due Oct 22</EHighlight>.</p>
```

## Props

<!-- props:start -->

| Prop   | Type      | Default | Notes                                                                                                                                                     |
| ------ | --------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `code` | `boolean` | `false` | Renders a `code` element in the mono font, for a name, value or snippet inside a sentence. Without it the element is a `mark`, for a word worth noticing. |

<!-- props:end -->

`class`, `style` and attributes land on the `code` or `mark` element. The marker is the `secondary` token, so the theme's `accent` input sets its colour.

## Slots

| Slot      | Use               |
| --------- | ----------------- |
| `default` | The text to mark. |

## Accessibility

- `code` renders a `code` element and the default renders a `mark`, so assistive technology can announce them as code or as marked text.
- The text stays `ink` on a soft accent wash, at least 5:1 for any accent. Forced-colors mode uses the system highlight colours.
