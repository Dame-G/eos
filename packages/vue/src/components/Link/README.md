# ELink

An inline anchor for going somewhere. Things that change something are an [`EButton`](../Button/README.md). Use [`ELinkCard`](../LinkCard/README.md) when a whole card is the link.

```vue
<ELink href="/statements">All statements</ELink>
<ELink href="https://example.com/help" external>Help centre</ELink>
```

An icon before the text:

```vue
<ELink href="/statements/latest" icon="file">Latest statement</ELink>
```

## Props

<!-- props:start -->

| Prop            | Type                  | Default | Notes                                                                                                                                                    |
| --------------- | --------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `href`          | `string`              | None    | Where the link goes. Give `href` or, with a `linkComponent`, `to`.                                                                                       |
| `to`            | `unknown`             | None    | A router location, passed to `linkComponent` as `to` (for `RouterLink`). Use it instead of `href`.                                                       |
| `linkComponent` | `string \| Component` | `"a"`   | What renders the link: `RouterLink` or any component that takes `href` or `to` and a default slot. It receives `to` or `href` and the class `e-link`.    |
| `external`      | `boolean`             | `false` | Opens in a new tab (`target="_blank"`, `rel="noreferrer"`) and tells screen readers so.                                                                  |
| `icon`          | `IconProp`            | None    | An icon before the text: a built-in name, a name from your icon set, or an icon component. It is hidden from screen readers, so the text names the link. |

<!-- props:end -->

`class`, `style`, attributes and listeners (`@click`, `aria-*`, `download`) land on the `a` element. In print the address is written after the text.

## Slots

| Slot      | Use                                      |
| --------- | ---------------------------------------- |
| `default` | The link text, which says where it goes. |

## Accessibility

- An `a` with `href`. An `external` link adds hidden text "(opens in a new tab)" to its name.
- With an `icon` the underline covers the text only, not the icon.
- In print the address follows the text, except for in-page anchors, `mailto:` and `tel:` links.

## Keyboard

| Key   | Action                                               |
| ----- | ---------------------------------------------------- |
| Enter | Follows the link. A link does not activate on Space. |
| Tab   | Moves focus to the link.                             |

## Related

[`EButton`](../Button/README.md) with `href` for a call to action, [`ENavList`](../NavList/README.md) for a list of destinations.
