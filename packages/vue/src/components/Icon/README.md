# EIcon

One 20px icon in the colour of the surrounding text, for putting a glyph beside text.

```vue
<EIcon name="download" />
<EIcon name="check" small />
<EIcon :name="CreditCard" />
<EIcon name="lucide:credit-card" />
```

## Props

<!-- props:start -->

| Prop    | Type       | Default      | Notes                                                                                                                      |
| ------- | ---------- | ------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `name`  | `IconProp` | **Required** | A name (from the built-in list or your icon set, such as `"credit-card"` or `"lucide:credit-card"`), or an icon component. |
| `small` | `boolean`  | `false`      | 14px with the bold weight, for chips and stamps.                                                                           |
| `bold`  | `boolean`  | `false`      | The bold weight at the normal size, where the icon set has one.                                                            |

<!-- props:end -->

`class` and attributes land on the icon element. A name resolves through `createEos({ icons })`, then the set's resolver and aliases, then the built-in set. An unknown name draws nothing and logs once in development. Names ending in `-left` or `-right` mirror in right-to-left text. See [Bring your own icons](../../icons/README.md).

## Accessibility

- Decorative: `aria-hidden="true"`, not focusable. Whatever contains it carries the meaning in words.
- For an icon-only control use `EIconButton`.
