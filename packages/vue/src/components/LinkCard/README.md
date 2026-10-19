# ELinkCard

A card with a title, a short description and one link, where the whole card is the click target.

```vue
<EGrid as="ul" min="17rem" :gap="3">
  <ELinkCard as="li" href="/components/Dialog" title="EDialog" description="A modal question or short form." />
  <ELinkCard as="li" href="/components/Drawer" title="EDrawer" kicker="Containers" description="A panel that slides in from the edge." />
</EGrid>
```

## Props

| Prop            | Type                         | Default | Notes                                                                                                          |
| --------------- | ---------------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| `title`         | `string`                     |         | Required. The card's title, and the text of its link.                                                          |
| `href`          | `string`                     |         | Where the card goes. With no `href` or `to` the link goes to `#`.                                              |
| `to`            | `unknown`                    |         | A router location, used instead of `href` with `linkComponent`.                                                |
| `description`   | `string`                     |         | A line under the title saying what is there.                                                                   |
| `kicker`        | `string`                     |         | A small mono label above the title.                                                                            |
| `headingLevel`  | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `3`     | Heading level of the title; pick the one that fits the page outline.                                           |
| `external`      | `boolean`                    |         | Opens in a new tab (`target="_blank"`, `rel="noreferrer"`).                                                    |
| `as`            | `string`                     | `div`   | The element to render. Use `li` when the cards sit in a list, such as `<EGrid as="ul">`.                       |
| `linkComponent` | `string \| Component`        | `a`     | Renders the link. Pass `RouterLink` and give `to`; it receives `to` or `href` and the class `e-linkcard-link`. |

`class`, `style` and attributes land on the rendered element. The card stretches to the height of its grid row.

## Slots

| Slot      | Use                                                                                                                    |
| --------- | ---------------------------------------------------------------------------------------------------------------------- |
| `default` | More under the description, such as a stamp or a count. Do not put links or buttons in it: the whole card is one link. |

Listen for `@click` on the card, or use the router.

## Accessibility

- One link per card, inside the title's heading, so the link is named by the title and the heading appears in heading navigation. An `::after` overlay on the link makes the whole card the hit area without nesting interactive content.
- Hovering the card draws a border and darkens the link; keyboard focus on the link draws the focus ring around the whole card.
- In forced-colors mode the hover border and focus outline use the system highlight colour.
