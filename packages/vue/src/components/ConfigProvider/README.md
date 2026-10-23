# EConfigProvider

Changes the theme, colour scheme, language, currency, direction, words or icons for one part of the page. Everything it leaves out comes from the parent, so the plugin's messages and icons still apply inside. Use it for a preview in another theme, a dark panel on a light page, or a block in another language. Set the whole app once with `createEos()` instead.

```vue
<EConfigProvider :theme="{ brand: '#8a2be2' }" scheme="dark" locale="ar">
  <ESurface>...</ESurface>
</EConfigProvider>
```

## Props

<!-- props:start -->

| Prop       | Type                           | Default | Notes                                                                                                                                                                                                                                                                   |
| ---------- | ------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `theme`    | `Theme \| ThemeInput`          | None    | A theme from `defineTheme()`, or the same options, for this part of the page. Its tokens are set on this element, so everything inside (and every menu, dialog and tooltip opened from inside) takes them. Left out, the page theme shows through.                      |
| `scheme`   | `"light" \| "dark"`            | None    | Shows the light or the dark variant of `theme` (of the default theme when there is none). The dark one is derived as `scheme: "auto"` derives it on a dark page, from the theme's `dark` options. Left out, a theme with `scheme: "auto"` follows the reader's setting. |
| `locale`   | `string`                       | None    | The language for this part (BCP 47). Sets `lang` on the element, and `dir` from the language unless `dir` is given. Left out, the parent's.                                                                                                                             |
| `currency` | `string`                       | None    | The currency for amounts in this part (ISO 4217). Left out, the parent's.                                                                                                                                                                                               |
| `dir`      | `"ltr" \| "rtl"`               | None    | The text direction for this part. Left out, the one `locale` is written in, or the parent's.                                                                                                                                                                            |
| `messages` | `Record<string, MessageValue>` | None    | Words for this part, laid over the parent's (and the plugin's) messages.                                                                                                                                                                                                |
| `icons`    | `IconsConfig`                  | None    | Icons for this part, laid over the parent's: `icons` and `aliases` are merged, `resolve` and `builtin` replace.                                                                                                                                                         |
| `as`       | `string`                       | `"div"` | The element to render.                                                                                                                                                                                                                                                  |
| `portal`   | `boolean`                      | `true`  | Renders menus, dialogs, tooltips and toasts opened from inside into this element, so they keep its theme and direction. `false` leaves them where the parent puts them.                                                                                                 |

<!-- props:end -->

`class`, `style` and attributes land on the rendered element. With a `theme` (or a `scheme`) the element carries the theme's tokens as inline custom properties and `data-e-theme`, and takes the `e-root` class, so text and controls inside take the new colours; give it a background (an `ESurface`, or `background: var(--e-background)`) when its theme differs from the page's. The tokens are in the server-rendered HTML too. A theme with `scheme: "auto"` follows the reader's setting once the page is in the browser; `scheme` fixes it.

`locale` sets `lang` on the element and `dir` from the language (`ar` gives `rtl`) unless `dir` is given. With `portal` (the default) menus, dialogs, tooltips and toasts opened from inside render inside this element, so they keep its theme and direction. Providers nest: each one reads the one around it.

## Slots

| Slot      | Use                                         |
| --------- | ------------------------------------------- |
| `default` | The part of the page the config applies to. |

## Accessibility

- `lang` tells screen readers which voice to read the part in, and `dir` lays it out right to left for Arabic, Hebrew, Persian and Urdu.
- A themed part keeps the contrast `defineTheme()` checks. Check a theme of your own with `defineTheme(...).issues`.
- The element has no role. Wrap the part in a landmark or a heading of its own when it is a section of the page.

## Keyboard

| Key | Action                                                          |
| --- | --------------------------------------------------------------- |
| Tab | Moves through the part as usual. The provider is not focusable. |

## Related

[`ESurface`](../Surface/README.md) for a themed block's ground, [`EToastProvider`](../ToastProvider/README.md) for toasts in a part of the page.
