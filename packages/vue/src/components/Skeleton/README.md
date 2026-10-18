# AeSkeleton

A single placeholder block shown while content loads. Make it the size of what is coming: a statement card is about 220px tall, one line of text about 20px.

```vue
<AeSkeleton :height="220" />
<AeSkeleton :height="20" :width="160" />
<AeSkeleton circle :height="56" />
```

## Props

| Prop     | Type               | Default    | Notes                                                        |
| -------- | ------------------ | ---------- | ------------------------------------------------------------ |
| `height` | `number \| string` | `96`       | A number is px; a string is any CSS length.                  |
| `width`  | `number \| string` | full width | A number is px; a string is any CSS length.                  |
| `circle` | `boolean`          | unset      | A round block, for a photo. Set `height`; the width follows. |

No slots. Native attributes land on the root `<div>`; the `style` you pass is merged with the size.

## Rules

- It pulses slowly, and is static under reduced motion.
- Use Spinner for a single action instead.

## Accessibility

- `role="status"` and `aria-busy="true"`, with screen-reader-only text "Loading" (message `loading`).
