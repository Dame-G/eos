# EMetaList

A list of short facts, one per line, each with an icon: when, where, who to call.

```vue
<EMetaList :items="[{ icon: 'calendar', text: 'Thursday, October 22' }, null, { icon: 'pin', text: 'Main office' }]" />
```

## Props

| Prop    | Type         | Default | Notes                                                                                             |
| ------- | ------------ | ------- | ------------------------------------------------------------------------------------------------- |
| `items` | `MetaItem[]` |         | Required. `{ icon?: IconProp, text: string \| VNode }`. `null` and `undefined` items are skipped. |

`class`, `style` and attributes land on the `ul` element.

## Accessibility

- Icons are decorative: each item's `text` carries the meaning.
