# AeSearchBar

The one box you look things up in: a flat outlined field with a Button inside. One per page, at the top.

```vue
<AeSearchBar v-model="query" placeholder="Search statements and visits" @submit="search" />
<AeSearchBar label="Search help" action="Find" disabled />
```

## Props

| Prop          | Type      | Notes                                                                          |
| ------------- | --------- | ------------------------------------------------------------------------------ |
| `v-model`     | `string`  | The text. Leave it off for local state.                                        |
| `label`       | `string`  | What screen readers call the box. Default "Search". There is no visible label. |
| `placeholder` | `string`  | Say what can be searched, briefly. Default "Search".                           |
| `action`      | `string`  | The Button's text. Default "Search".                                           |
| `name`        | `string`  | The name submitted with a form. Default `q`.                                   |
| `disabled`    | `boolean` | Disables the box and the Button. Say why in a Notice.                          |

## Events

| Event    | Payload  | Notes                                     |
| -------- | -------- | ----------------------------------------- |
| `submit` | `string` | The current text, on Enter or the Button. |

The form's default submit is prevented; the page does not reload.

## Attributes

`inheritAttrs` is off. `class` and `style` stay on the `<form role="search">`; everything else (`autocomplete`, `maxlength`, `aria-*`, `data-*`, listeners such as `@focus`) lands on the `<input>`.

## Rules

- The form is a `search` landmark. Use one per page.
- The box is 48px tall, like every input; the Button inside is 6px shorter and has a 3px larger hit area.
- The edge darkens on hover; focus turns it `focus-field` and draws a 2px outline round the whole bar.
- Hidden when printed.
- Uses the shared input styles in `../TextField/input.css`.
