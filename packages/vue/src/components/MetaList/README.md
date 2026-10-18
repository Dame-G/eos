# EMetaList

Short facts, one per line, each with an icon: when, where, who to call. AppointmentCard is built on it.

```vue
<EMetaList
  :items="[{ icon: 'calendar', text: 'Thursday, October 22' }, null, { icon: 'map-pin', text: 'Main office' }]"
/>
```

## Props

| Prop    | Type                                                     | Notes                                                                          |
| ------- | -------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `items` | `({ icon?: IconName; text: string \| VNode } \| null)[]` | The facts. `null` and `undefined` items are skipped. Exported type `MetaItem`. |

It renders a `ul` with one `li` per fact; `class`, `style` and attributes fall through to the list.

## Accessibility

- The icon is decoration (EIcon is hidden from assistive technology), so every item must say its meaning in words.
- Real list semantics: screen readers announce the number of items.
