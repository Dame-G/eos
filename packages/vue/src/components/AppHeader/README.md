# EAppHeader

The bar across the top of the page, with logo, actions and a navigation row that scrolls sideways on narrow screens.

```vue
<EAppHeader sticky>
  <template #logo><RouterLink to="/">Acme</RouterLink></template>
  <template #actions><EButton variant="outline" icon="user">Maria</EButton></template>
  <ENavList label="Main" :link-component="RouterLink" :items="items" />
</EAppHeader>
```

## Props

<!-- props:start -->

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `sticky` | `boolean` | `false` | Pins the header to the top while the page scrolls. |

<!-- props:end -->

`class`, `style` and attributes land on the `header` element.

## Slots

| Slot      | Use                                                                             |
| --------- | ------------------------------------------------------------------------------- |
| `logo`    | The logo or name, usually a link home. Render your own `RouterLink`.            |
| `actions` | The person's menu or sign-in button, at the end of the bar. Keep to one or two. |
| `default` | The navigation, usually an `ENavList`, on its own row. Omit for no second row.  |

## Accessibility

- Renders the `banner` landmark: use one per page.
- Give the navigation a `label` (on `ENavList`) so it differs from other navigations.
- The navigation row is hidden in print.
