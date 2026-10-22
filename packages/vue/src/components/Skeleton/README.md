# ESkeleton

A placeholder block shown while content loads. Size it like what is coming.

```vue
<ESkeleton :height="220" />
<ESkeleton circle :height="56" />
```

## Props

<!-- props:start -->

| Prop     | Type               | Default      | Notes                                                   |
| -------- | ------------------ | ------------ | ------------------------------------------------------- |
| `height` | `number \| string` | `96`         | A number is in px and a string is any CSS length.       |
| `width`  | `number \| string` | `full width` | Same units as `height`.                                 |
| `circle` | `boolean`          | `false`      | A round block, for a photo. The width follows `height`. |

<!-- props:end -->

`class`, `style` and attributes land on the `div` element. `style` is merged with the size.

## Accessibility

- `role="status"` and `aria-busy="true"`, with screen-reader text "Loading".
