# ECommandPalette

A search box over a list of commands, opened from anywhere with a shortcut. For choosing a value in a form use [`ECombobox`](../Combobox/README.md), and for results that navigate use [`ESearchResults`](../SearchResults/README.md).

```vue
<script setup lang="ts">
const open = ref(false);
const commands = [
  { id: "invoice", label: "Create invoice", group: "Billing", icon: "plus", shortcut: "mod+i" },
  { id: "settings", label: "Open settings", group: "Account" },
];
</script>

<template>
  <ECommandPalette v-model:open="open" label="Command palette" :items="commands" @select="run" />
</template>
```

## Props

<!-- props:start -->

| Prop          | Type                                           | Default                      | Notes                                                                                                                                     |
| ------------- | ---------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `open`        | `boolean`                                      | `false`                      | `v-model:open`: whether it is open. Without a binding it keeps its own state.                                                             |
| `items`       | `CommandItem[]`                                | **Required**                 | The commands, in the order to list them when nothing is typed.                                                                            |
| `label`       | `string`                                       | **Required**                 | The palette's accessible name, such as "Command palette".                                                                                 |
| `placeholder` | `string`                                       | `"Type a command or search"` | Placeholder in the search box.                                                                                                            |
| `shortcut`    | `string \| false`                              | `"mod+k"`                    | The shortcut that opens and closes it from anywhere on the page, or `false` for none. Read once when the component is created.            |
| `filter`      | `(item: CommandItem, query: string) => number` | —                            | Your own match: return a score above 0 to include the item (higher lists first), or 0 to leave it out. It replaces the built-in matching. |

<!-- props:end -->

The `CommandItem` type (`id`, `label`, `description`, `group`, `icon`, `shortcut`, `keywords`, `disabled`) is exported. Matching needs every typed word to appear in a command's label, description, group or keywords. Label-start matches list first. Pass `filter` for your own (fuzzy matching, say).

`shortcut` is read once. `item.shortcut` only displays keycaps (`formatShortcut`). Bind the keys yourself with `useShortcuts`.

## Slots

| Slot   | Use                                                                            |
| ------ | ------------------------------------------------------------------------------ |
| `item` | A command's row content, with `item`, `active` and the typed `query` in scope. |

## Events

| Event    | Payload       | When                                     |
| -------- | ------------- | ---------------------------------------- |
| `select` | `CommandItem` | A command is chosen. The palette closes. |

## Accessibility

- A modal dialog named by `label`, with focus on a `combobox` input that controls a `listbox`. The active option is `aria-activedescendant`, and focus stays in the input.
- Arrow Up and Down move (wrapping, skipping disabled commands), Home and End jump, Enter chooses, Escape closes. Focus returns to what had it.
- The number of results, or "No results", is announced politely as the person types. Messages `resultsCount`, `noResults` and `commandPlaceholder` are configurable.
