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

- Hidden from assistive technology (`aria-hidden="true"`), so a page of placeholders adds no live-region noise. Mark the region that is loading with `aria-busy="true"` or announce the result with `useAnnouncer()`.
- The pulse stops under reduced motion.

## Keyboard

Not focusable and takes no keys.

## Related

[`ESpinner`](../Spinner/README.md) for a single wait, [`EProgress`](../Progress/README.md) for a known fraction.
