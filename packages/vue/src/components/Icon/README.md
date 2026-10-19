# EIcon

One 20px icon in the colour of the surrounding text, for putting a glyph beside text.

```vue
<EIcon name="download" />
<EIcon name="check" small />
<EIcon :name="CreditCard" />
<EIcon name="lucide:credit-card" />
```

## Props

| Prop    | Type       | Default | Notes                                                                                               |
| ------- | ---------- | ------- | --------------------------------------------------------------------------------------------------- |
| `name`  | `IconProp` |         | Required. A name (built-in or from your icon set) or an icon component; a component is drawn as is. |
| `small` | `boolean`  |         | 14px, bold weight; for chips and stamps.                                                            |
| `bold`  | `boolean`  |         | Bold weight at normal size, where the icon set has one.                                             |

`class` and attributes land on the icon element. A name resolves through `createEos({ icons })`, then the set's resolver and aliases, then the built-in set; an unknown name draws nothing and logs once in development. Names ending in `-left` or `-right` mirror in right-to-left text. See [Bring your own icons](../../icons/README.md).

## Accessibility

- Decorative: `aria-hidden="true"`, not focusable. Whatever contains it carries the meaning in words.
- For an icon-only control use `EIconButton`.
