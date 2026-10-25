---
"@eos-ui/vue": minor
---

Display and data components: renames, a faster `EDataGrid`, and fixes.

Breaking (rename or remove, then update every use):

- `EDefinition` is renamed `EToggletip` (folder `Toggletip`, class `e-definition-term` is now `e-toggletip-term`). `EDefinition` still works for this minor as a deprecated alias that warns once in development.
- `ETable` `size="sm"` is now the boolean `dense`. `EDataGrid` takes `dense` too.
- `EContainer` `size` is renamed `width` (`sm`, `md`, `lg`, `full`).
- `ESurface` `size` is removed. Set `padding` to a gap name, a space number or a CSS length (`size="lg"` was `padding="section"`; `size="sm"` was `padding="var(--e-gap-base) var(--e-pad-card)"`). Left out, the padding is `pad-card` as before. `flush` is padding 0 and wins over `padding`. The classes `e-surface--pad-sm|md|lg` are gone.
- `EAvatar` `as="button"` is now the boolean `interactive`.
- `EDataGrid` `cards` is opt-in, as on `ETable`: pass `cards` to keep rows turning into cards below 40rem.
- The message `codeCopied` is renamed `copied`.
- The table classes `e-table-wrap--striped` and `e-table-wrap--dense` are now `e-table--striped` and `e-table--dense` on the `table`, and `e-gridtable--busy` is `e-table--busy`. The `ETable` and `EDataGrid` frame is drawn in `--e-border` (the grid used `--e-border-strong`).
- `EText` and `EMetric` take `tone="muted"` for the quieter colour. `tone="neutral"` still renders muted for this minor and warns in development; it will mean the default ink. Across the library `neutral` means no tone, the default look.

Added:

- `EDataGrid`: `striped`, `dense`, an `#empty` slot (with `{ filtered, clearFilters }`), `virtual.height` as any CSS length, and virtual rows that are measured, so a larger text size keeps them in step with the scroll.
- `EActions` `stack="narrow" | "always"` stacks its buttons full width, by its own width.
- `ECopyButton` declares `variant` and `size`.
- `ECodeBlock` `label`; `ts`, `vue`, `sh` and other common languages are read by name.
- `EDescriptionList` `as="dl" | "ul"` chooses the list.
- `useLocale()` returns `formatNumber` and `formatList`, cached per locale and safe with an unknown locale.
- `EHighlight`'s markup (`<code class="e-highlight e-highlight--code">`, `<mark class="e-highlight">`) is documented as a public static form.
- The popover title row and body rules (`e-pop-head`, `e-pop-title`, `e-pop-body`) move to `styles/popover.css`.

Fixed:

- `EDataGrid` searches an index built once per rows and columns, sorts with a cached collator, and only formats a cell when a filter needs it; `searchDebounce` holds back client-side filtering too. A failed load is announced assertively and its empty state uses the danger tone. `manual` without `total` warns in development. The cards Sort by menu lists only shown columns, and the Columns menu title is no longer a heading.
- `EMetric` and `EAvatarGroup` no longer throw on an invalid `locale`. `EAvatarGroup` never shows a "+1" tile.
- Money in `EDataGrid` currency cells and `formatMoney` uses the currency's own decimals (¥1,000, not ¥1,000.00).
- The quiet `EIconButton` shows its busy style while `loading`.
- `ETable` and `ECodeBlock` are a tab stop only while they scroll (`maxHeight` alone, or `wrap`, no longer makes one). As cards, an `ETable` row heading (`th scope="row"`) is the card's title.
- `ESearchResults` selects a button result on a modified click; only links are left to the browser.
- `EEmptyState` wraps its text in a `div`, so the slot may hold paragraphs.
- `EText` warns when `truncate` and `lines` are both set; `lines` wins.
