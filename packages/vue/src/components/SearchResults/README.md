# ESearchResults

A list of search results as links, with a title and a muted line under it, arrow-key movement between them and the matched text marked.

```vue
<ESearchBar
  ref="bar"
  v-model="query"
  label="Search the docs"
  hide-action
  @keydown.down.prevent="results?.focusFirst()"
/>
<ESearchResults
  ref="results"
  label="Search results"
  :query="query"
  :items="[
    { label: 'Dialog', description: 'Components › Containers', href: '/components/Dialog' },
    { label: 'Drawer', description: 'Components › Containers', href: '/components/Drawer' },
  ]"
  empty-text="Nothing found."
  @select="open"
  @edge="bar?.focus()"
/>
```

## Props

<!-- props:start -->

| Prop            | Type                  | Default      | Notes                                                                                                                                                                                          |
| --------------- | --------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `items`         | `SearchResultItem[]`  | **Required** | The results, best first: `{ label, description?, href?, to? }`. With no `href` or `to` a link goes to `#`.                                                                                     |
| `label`         | `string`              | **Required** | The accessible name of the list, such as "Search results".                                                                                                                                     |
| `emptyText`     | `string`              | —            | Shown when there are no results, such as `Nothing found for "tax"`. Without it nothing shows, for example before anyone has typed.                                                             |
| `query`         | `string`              | —            | The text that was searched for: its first match in each title and description is marked, as in `ECombobox` options.                                                                            |
| `linkComponent` | `string \| Component` | `"a"`        | What renders each link: `"a"`, `RouterLink` or any component that takes `href` or `to` and a default slot. It receives `to` or `href` and the class `e-opt`. Give items `to` for `RouterLink`. |

<!-- props:end -->

`class`, `style` and attributes land on the `div` element around the list. Exposes `focusFirst()` (focus the first result) and `focus()` (focus the result that has focus, or the first).

## Events

| Event    | Payload                                     | Notes                                                                                                                                                                                                              |
| -------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `select` | `item: SearchResultItem, event: MouseEvent` | A result was opened by click or Enter. A click with Ctrl, Meta, Shift or Alt, or with a non-primary button, does not emit, so "open in a new tab" still works. Call `event.preventDefault()` to navigate yourself. |
| `edge`   |                                             | ArrowUp was pressed on the first result. Move focus back to your search box.                                                                                                                                       |

## Accessibility

- A list of links named by `label`. Tab reaches each one. ArrowDown and ArrowUp move between them. Wire ArrowDown from the search box to `focusFirst()`.
- It does not announce the result count. Put a polite live region (`role="status"`) beside it that says "3 results" or "No results".
