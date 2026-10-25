# EMetric

One figure with its label, an optional change and a line of help. Use it for the numbers a page leads with and [`ETable`](../Table/README.md) for many.

```vue
<EMetric label="Balance" value="$1,240.00" delta="+4.2%" trend="up" help="Since last month" />
```

## Props

<!-- props:start -->

| Prop    | Type                               | Default      | Notes                                                                                                                                                                    |
| ------- | ---------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `label` | `string`                           | **Required** | What is measured, as a short label above the figure.                                                                                                                     |
| `value` | `number \| string`                 | **Required** | The figure. A number is formatted for the locale; a string is shown as given, so format a currency or a unit yourself.                                                   |
| `delta` | `string`                           | None         | The change, written as you want it shown, such as "+4.2%" or "12 more than last month". Set `trend` with it.                                                             |
| `trend` | `"up" \| "down" \| "flat"`         | None         | The direction of the change. It chooses the arrow and the colour, and is read out with the delta ("Up +4.2%").                                                           |
| `tone`  | `"muted" \| "success" \| "danger"` | None         | The colour of the change, when it is not what the direction suggests: `danger` for a cost that went up. Left out, up is `success`, down is `danger` and flat is `muted`. |
| `help`  | `string`                           | None         | A line of explanation under the figure, such as the period it covers.                                                                                                    |

<!-- props:end -->

`class`, `style` and attributes land on the `dl` element.

## Slots

| Slot   | Use                                                     |
| ------ | ------------------------------------------------------- |
| `help` | The help line, instead of `help`, for text with a link. |

## Accessibility

- A `dl`: the label is the term and the figure, change and help are its descriptions, so a screen reader reads "Balance, $1,240.00".
- The change is read as words with its direction ("Up +4.2%", "Down 1%", "No change"); the arrow is decoration, and colour only backs up the arrow and the words.

Not focusable.

## Related

[`EKicker`](../Kicker/README.md) for the label style, [`EStamp`](../Stamp/README.md) for a status.
