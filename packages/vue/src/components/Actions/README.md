# EActions

A group of buttons in the order of the content, main action first, left-aligned, wrapping when there is no room. Hidden in print. Use [`EMenu`](../Menu/README.md) when three or more actions have no room, and [`EInline`](../Inline/README.md) for a row of other things.

```vue
<EActions bar as="footer">
  <EButton>Pay</EButton>
  <EButton variant="outline">Details</EButton>
</EActions>
```

## Props

<!-- props:start -->

| Prop    | Type                   | Default | Notes                                                                                                                                                                          |
| ------- | ---------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `as`    | `string`               | `"div"` | Sets the element to render. `footer` suits a bar at the end of a card.                                                                                                         |
| `bar`   | `boolean`              | `false` | Makes the group a footer bar for actions that end a card or an overlay. Buttons stack full width when the bar is narrow. Leave it off for the next step on a page.             |
| `stack` | `"narrow" \| "always"` | None    | Stacks the buttons full width: `narrow` below 32rem of the group's own width (as a `bar` does), `always` at every width. The group then fills its container's width.           |
| `label` | `string`               | None    | Names the group for screen readers, for example "Record actions", and renders `role="group"` with `aria-label`. Use it for buttons that belong together, such as a filter row. |

<!-- props:end -->

`class`, `style` and attributes land on the rendered element.

## Slots

| Slot      | Use                         |
| --------- | --------------------------- |
| `default` | The `EButton`s, main first. |

## Accessibility

- Source order is tab order: put the main action first.
- `label` adds no keyboard behaviour: every button stays its own tab stop.
- To mark a button as a toggle, pass `aria-pressed` to [`EButton`](../Button/README.md) (see [Recipes](https://eos.dame.gg/patterns/recipes)).

## Keyboard

Each button is its own tab stop, in source order.

## Related

[`EButton`](../Button/README.md) for a single action.
