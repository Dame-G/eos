# ELinkCard

A card that is one link: a title that says where it goes and a line or two under it, where the whole card is the click target. Use it for an index of pages or a set of next steps. Use [`ESurface`](../Surface/README.md) for a card that holds several links or buttons, and [`ELink`](../Link/README.md) for a link in a sentence.

```vue
<EGrid as="ul" min="17rem" :gap="3">
  <ELinkCard as="li" size="sm" title="EButton" href="/components/Button">
    A button for an action, or a link that looks like one.
  </ELinkCard>
</EGrid>
```

## Props

<!-- props:start -->

| Prop            | Type                                  | Default      | Notes                                                                                                     |
| --------------- | ------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------- |
| `title`         | `string`                              | **Required** | The link text, at the top of the card. Say where it goes: it is the whole card's name for screen readers. |
| `href`          | `string`                              | None         | Where the card goes. Give `href` or, with a `linkComponent`, `to`.                                        |
| `to`            | `unknown`                             | None         | A router location, passed to `linkComponent` as `to` (for `RouterLink`). Use it instead of `href`.        |
| `linkComponent` | `string \| Component`                 | `"a"`        | What renders the link: `RouterLink` or any component that takes `href` or `to` and a default slot.        |
| `external`      | `boolean`                             | `false`      | Opens in a new tab (`target="_blank"`, `rel="noreferrer"`) and tells screen readers so.                   |
| `as`            | `ElementTag`                          | `"div"`      | The element of the card: `li` inside a list (`EGrid as="ul"`), `article` for a block of its own.          |
| `size`          | `Extract<Size, "sm" \| "md" \| "lg">` | `"md"`       | The padding: `sm` for a dense index, `md` or `lg`.                                                        |

<!-- props:end -->

`class`, `style` and attributes land on the card element. The title is the link, and its `::after` is stretched over the card, so a click anywhere on it follows the link. With a `linkComponent` the link gets `to` (or `href`) and the class `e-linkcard-link`.

## Slots

| Slot      | Use                                                                               |
| --------- | --------------------------------------------------------------------------------- |
| `default` | A line or two under the title. Keep links and buttons out of it: the card is one. |

## Accessibility

- The card is one link, named by its `title`, so a screen reader lists it once by that name and the text under it is not read as part of the name.
- Hover recolours the border and tints the ground, and never thickens the border. Focus draws the focus ring around the whole card.
- With `external` the link opens a new tab and says so to screen readers.
- In a list, render the cards `as="li"` inside `EGrid as="ul"` or `EStack as="ul"`, so the count is announced.

## Keyboard

| Key   | Action                    |
| ----- | ------------------------- |
| Tab   | Moves to the card's link. |
| Enter | Follows the link.         |

## Related

[`ESurface`](../Surface/README.md) for a card with several actions, [`ELink`](../Link/README.md) for a link in text, [`EGrid`](../Grid/README.md) to lay cards out.
