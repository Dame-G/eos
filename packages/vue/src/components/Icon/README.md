# EIcon

One icon, 20px by default, in the colour of the surrounding text, for putting a glyph beside text. Use [`EIconButton`](../IconButton/README.md) when the icon is pressed.

```vue
<EIcon name="download" />
<EIcon name="check" size="sm" />
<EIcon name="info" size="xl" />
<EIcon :name="CreditCard" />
<EIcon name="lucide:credit-card" />
```

## Props

<!-- props:start -->

| Prop    | Type                           | Default      | Notes                                                                                                                                                                                        |
| ------- | ------------------------------ | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`  | `IconProp`                     | **Required** | A name (from the built-in list or your icon set, such as `"credit-card"` or `"lucide:credit-card"`), or an icon component.                                                                   |
| `size`  | `"sm" \| "md" \| "lg" \| "xl"` | `"md"`       | `sm` is 14px (drawn in the bold weight) for chips and stamps, `md` 20px, `lg` 28px and `xl` 40px.                                                                                            |
| `bold`  | `boolean`                      | `false`      | The bold weight at the normal 20px size, where the icon set has one.                                                                                                                         |
| `label` | `string`                       | None         | Makes the icon informative: it becomes an image with this name. Without it the icon is decoration and hidden from screen readers.                                                            |
| `flip`  | `boolean`                      | None         | Turns the icon around in right-to-left text, for a component icon that points one way. A name with a `left` or `right` part (`chevron-left`) does so without it; `:flip="false"` stops that. |

<!-- props:end -->

`class` and attributes land on the icon element. A name resolves through `createEos({ icons })`, then the set's resolver and aliases, then the built-in set. An unknown name draws nothing and logs once in development. A physical alignment such as `text-align-left` does not mirror in right-to-left text. See [Bring your own icons](../../icons/README.md) and the [icons guide](https://eos.dame.gg/guide/icons).

## Accessibility

- Decorative: `aria-hidden="true"`, not focusable. Whatever contains it carries the meaning in words.
- With a `label` it is an image (`role="img"`) with that name, for an icon that carries meaning on its own.
- For an icon-only control use `EIconButton`.

Not focusable.

## Related

[`EStamp`](../Stamp/README.md) for an icon with a status word.
