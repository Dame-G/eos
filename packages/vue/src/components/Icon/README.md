# EIcon

One icon, 20px by default, in the colour of the surrounding text, for putting a glyph beside text.

```vue
<EIcon name="download" />
<EIcon name="check" size="sm" />
<EIcon name="info" size="xl" />
<EIcon :name="CreditCard" />
<EIcon name="lucide:credit-card" />
```

## Props

<!-- props:start -->

| Prop    | Type       | Default      | Notes                                                                                                                                                                                        |
| ------- | ---------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`  | `IconProp` | **Required** | A name (from the built-in list or your icon set, such as `"credit-card"` or `"lucide:credit-card"`), or an icon component.                                                                   |
| `size`  | `Size`     | `"md"`       | `sm` is 14px (drawn in the bold weight) for chips and stamps, `md` 20px, `lg` 28px and `xl` 40px.                                                                                            |
| `small` | `boolean`  | `false`      | **Deprecated.** Use `size="sm"`.                                                                                                                                                             |
| `bold`  | `boolean`  | `false`      | The bold weight at the normal 20px size, where the icon set has one.                                                                                                                         |
| `label` | `string`   | None         | Makes the icon informative: it becomes an image with this name. Without it the icon is decoration and hidden from screen readers.                                                            |
| `flip`  | `boolean`  | None         | Turns the icon around in right-to-left text, for a component icon that points one way. A name with a `left` or `right` part (`chevron-left`) does so without it; `:flip="false"` stops that. |

<!-- props:end -->

`class` and attributes land on the icon element. A name resolves through `createEos({ icons })`, then the set's resolver and aliases, then the built-in set. An unknown name draws nothing and logs once in development. Names with a `left` or `right` part (`chevron-left`, `arrow-right`) mirror in right-to-left text; a physical alignment such as `text-align-left` does not. `flip` turns a component icon around in right-to-left text too, and `:flip="false"` stops a named one. `size` is `sm` (14px, drawn in the bold weight), `md` (20px, the default), `lg` (28px) or `xl` (40px). `small` is deprecated: use `size="sm"`. See [Bring your own icons](../../icons/README.md).

## Accessibility

- Decorative: `aria-hidden="true"`, not focusable. Whatever contains it carries the meaning in words.
- With a `label` it is an image (`role="img"`) with that name, for an icon that carries meaning on its own.
- For an icon-only control use `EIconButton`.

## Keyboard

| Key | Action                    |
| --- | ------------------------- |
| Tab | An icon is not focusable. |

## Related

[`EIconButton`](../IconButton/README.md) when the icon is a button, [`EStamp`](../Stamp/README.md) for an icon with a status word.
