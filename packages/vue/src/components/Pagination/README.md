# EPagination

Paging through a long list.

```vue
<EPagination v-model="page" :page-count="12" />
```

## Props

| Prop        | Type     | Notes                                                   |
| ----------- | -------- | ------------------------------------------------------- |
| `v-model`   | `number` | The current page, from 1. Leave it off for local state. |
| `pageCount` | `number` | Required. How many pages there are.                     |

`class`, `style` and other attributes land on the `<nav>`. Pass `aria-label` to tell two pagers on a page apart.

## Rules

- A `nav` named "Pagination". The current page has `aria-current="page"`; every number is named "Page N".
- Shows the first, last and neighbouring pages with ellipses (hidden from screen readers). A gap that would hide a single page shows that page instead.
- Previous and Next are outline Buttons and disable at the ends. On a narrow screen (under 32rem) only Previous and Next remain.
- Hidden when printed.
