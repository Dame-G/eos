# EIcon

One icon, 20px square, in the colour of the surrounding text. The other components use it for their own glyphs; use it directly to put an icon beside text.

```vue
<EIcon name="download" />
<EIcon name="check" small />
<EIcon name="lock" bold />
<EIcon :name="CreditCard" />
<EIcon name="lucide:credit-card" />
```

## Props

| Prop    | Type       | Notes                                                                                                                                             |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`  | `IconProp` | Required. A name, from the built-in list or your icon set (`"credit-card"`, `"lucide:credit-card"`), or an icon component (`:name="CreditCard"`). |
| `small` | `boolean`  | 14px with the bold weight, for chips and stamps.                                                                                                  |
| `bold`  | `boolean`  | The bold weight at the normal size, where the icon set has one.                                                                                   |

No slots. `class` and the other attributes land on the icon.

## The two forms of `name`

- **A component.** A Vue component is drawn as it is. Nothing is looked up, so it works with any icon library and ignores `createEos({ icons })`.
- **A name.** A string is resolved in this order, and the first match wins:
  1. `icons` in `createEos({ icons })`: an explicit map from name to icon.
  2. The set's `resolve` function, after `aliases` renames the name.
  3. The built-in Phosphor set (41 icons: `check`, `x`, `download`, `calendar`, `card`, `pin`, `menu` and so on; the names are listed in `src/icons/phosphor.ts` and exported as `iconNames`). Turned off by `builtin: false`.
  4. Nothing: a name that no step finds draws no icon, and in development logs `No icon named "..."` once.

A resolved icon may be a Vue component, a complete `<svg>` string, or a `[regular, bold]` pair of path markup. See [Bring your own icons](../../icons/README.md) for the Lucide, Tabler, Heroicons, Phosphor and Iconify adapters, aliases and the shapes in detail.

## Accessibility

- The icon is decoration: it has `aria-hidden="true"` and is not focusable. Whatever it sits in must say its meaning in words (a button label, a visible text). Do not use an icon alone to carry meaning.
- For an icon-only control use `EIconButton`, which supplies the accessible name.

## Rules

- Icons that point left or right (names ending in `-left` or `-right`) mirror in right-to-left text.
- The built-in glyphs are filled paths and take the text colour (`currentcolor`). Icons from other sets keep their own fill and stroke, which are usually `currentColor` too.
- `small` and `bold` both choose the bold weight; only `small` changes the size.
