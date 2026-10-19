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

| Prop            | Type                  | Default | Notes                                                                                                               |
| --------------- | --------------------- | ------- | ------------------------------------------------------------------------------------------------------------------- |
| `items`         | `SearchResultItem[]`  |         | Required. `{ label, description?, href?, to? }`, best first. With no `href` or `to` a link goes to `#`.             |
| `label`         | `string`              |         | Required. The accessible name of the list, such as "Search results".                                                |
| `emptyText`     | `string`              |         | Shown when `items` is empty. Leave it out to render nothing, for example before anyone has typed.                   |
| `query`         | `string`              |         | The text that was searched for. Its first match in each title and description is marked, as in `ECombobox` options. |
| `linkComponent` | `string \| Component` | `a`     | Renders each link. Pass `RouterLink` and give items `to`; it receives `to` or `href` and the class `e-opt`.         |

`class`, `style` and attributes land on the `div` element around the list. Exposes `focusFirst()` (focus the first result) and `focus()` (focus the result that has focus, or the first).

## Events

| Event    | Payload                                     | Notes                                                                                                                                                                                                              |
| -------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `select` | `item: SearchResultItem, event: MouseEvent` | A result was opened by click or Enter. A click with Ctrl, Meta, Shift or Alt, or with a non-primary button, does not emit, so "open in a new tab" still works. Call `event.preventDefault()` to navigate yourself. |
| `edge`   |                                             | ArrowUp was pressed on the first result. Move focus back to your search box.                                                                                                                                       |

## Accessibility

- A list of links, named by `label`; Enter and click open a result, Tab reaches each one.
- ArrowDown and ArrowUp move focus between results; ArrowUp on the first result emits `edge` so you can return focus to the search box. ArrowDown from the box is yours to wire with `focusFirst()`.
- The result under the pointer or with focus gets a tint and an outline, so it is not shown by colour alone; in forced-colors mode it uses the system highlight colours.
- The component does not announce the number of results. Put a polite live region (`role="status"`) beside it that says "3 results" or "No results".
- The marked text is underlined and bold, not only coloured.
