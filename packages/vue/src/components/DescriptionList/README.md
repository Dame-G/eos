# EDescriptionList

Label and text rows, ruled apart, for facts such as what a statement covers or when it is due. Use [`ETable`](../Table/README.md) when the data has columns, and [`EMetric`](../Metric/README.md) for a figure a page leads with.

```vue
<EDescriptionList
  :items="[
    { label: 'Covers', text: 'Visit on September 12' },
    { label: 'Due', text: 'October 31' },
  ]"
/>
```

## Props

<!-- props:start -->

| Prop    | Type                                       | Default      | Notes                                                                                                            |
| ------- | ------------------------------------------ | ------------ | ---------------------------------------------------------------------------------------------------------------- |
| `items` | `(DescriptionItem \| null \| undefined)[]` | **Required** | The rows, as `{ label?, text, icon?, stamp?, stampTone?, editable? }`. `null` and `undefined` items are skipped. |

<!-- props:end -->

`class`, `style` and attributes land on the `dl` element, or on the `ul` element in a plain list.

A list where no item has a `label` renders as a plain list of facts. It has no Edit button, so `editable` has no effect there.

## Slots

| Slot     | Use                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------- |
| `action` | Adds content after a row's text and badge, such as a Button or IconButton. Receives `item` and `index`. |

## Events

| Event  | Payload         | Notes                                              |
| ------ | --------------- | -------------------------------------------------- |
| `edit` | `item`, `index` | The Edit button of an `editable` item was pressed. |

## Accessibility

- A `dl` with `dt` and `dd` pairs, so screen readers announce each pair. A plain list is a `ul`.
- The Edit button is named "Edit" followed by the item's label.

## Keyboard

| Key          | Action                                                                       |
| ------------ | ---------------------------------------------------------------------------- |
| Tab          | Moves to each Edit button and any control in an `action` slot, in row order. |
| Enter, Space | Presses the focused button.                                                  |

## Related

[`EStamp`](../Stamp/README.md) for the stamp, [`ETable`](../Table/README.md) when the data has columns.
