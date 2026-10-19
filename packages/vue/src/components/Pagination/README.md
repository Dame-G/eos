# EPagination

Previous, Next and page-number buttons for paging through a long list.

```vue
<EPagination v-model="page" :page-count="12" />
```

## Props

| Prop         | Type     | Default | Notes                               |
| ------------ | -------- | ------- | ----------------------------------- |
| `modelValue` | `number` | `1`     | v-model: current page, from 1.      |
| `pageCount`  | `number` |         | Required. How many pages there are. |

`class`, `style` and attributes land on the `nav` element. It shows first, last and neighbouring pages with ellipses; under 32rem only Previous and Next remain. Hidden in print.

## Accessibility

- A `nav` named "Pagination"; pass `aria-label` to tell two pagers apart.
- The current page has `aria-current="page"`; each number is named "Page N".
