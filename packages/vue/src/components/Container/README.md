# EContainer

The page-width column: a maximum width, centred, with the page gutter at its sides. Use [`EStack`](../Stack/README.md) inside it to space the blocks, and [`ESurface`](../Surface/README.md) for a bordered card.

```vue
<EContainer as="main" width="md">
  <EStack gap="section">...</EStack>
</EContainer>
```

## Props

<!-- props:start -->

| Prop     | Type                             | Default | Notes                                                                                                                                                |
| -------- | -------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `as`     | `string`                         | `"div"` | The element to render, such as `main` or `section`.                                                                                                  |
| `width`  | `"sm" \| "md" \| "lg" \| "full"` | `"lg"`  | The widest it grows: `sm` 40rem, `md` 60rem, `lg` 80rem, or `full` for the whole width. It is centred when narrower than its parent.                 |
| `gutter` | `boolean`                        | `true`  | Keeps the page gutter at its sides, so content never touches the screen edge. `false` for a container that sits inside another that already has one. |

<!-- props:end -->

`class`, `style` and attributes land on the rendered element.

## Slots

| Slot      | Use          |
| --------- | ------------ |
| `default` | The content. |

## Accessibility

- Layout only: no role. Use `as="main"` for the one main landmark of a page, and `section` with an `aria-label` for a named region.
- The gutter is `gutter-min` on a phone and grows with the viewport, so text keeps clear of the screen edge when it is zoomed.

Not focusable.

## Related

[`EStack`](../Stack/README.md) for the blocks inside, [`EGrid`](../Grid/README.md) for columns.
