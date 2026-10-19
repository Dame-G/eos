# ESkeleton

A placeholder block shown while content loads. Size it like what is coming.

```vue
<ESkeleton :height="220" />
<ESkeleton circle :height="56" />
```

## Props

| Prop     | Type               | Default    | Notes                                           |
| -------- | ------------------ | ---------- | ----------------------------------------------- |
| `height` | `number \| string` | `96`       | A number is px; a string is any CSS length.     |
| `width`  | `number \| string` | full width | Same units as `height`.                         |
| `circle` | `boolean`          |            | A round block; set `height`, the width follows. |

`class`, `style` and attributes land on the `div` element; `style` is merged with the size.

## Accessibility

- `role="status"` and `aria-busy="true"`, with screen-reader text "Loading".
