# AePanel

The generic flat container. Outlined, never shadowed, because a Panel is not clickable. Put statements, detail rows and forms inside it. It is an AeSurface rendered as a `section`.

```vue
<AePanel kicker="Account" title="Contact details">
  <template #action><AeButton variant="outline">Edit</AeButton></template>
  <AeDescriptionList :items="details" />
</AePanel>
```

## Props

| Prop           | Type                         | Default | Notes                                                           |
| -------------- | ---------------------------- | ------- | --------------------------------------------------------------- |
| `kicker`       | `string`                     |         | A small mono label above the title.                             |
| `title`        | `string`                     |         | The heading. With a title or an `action` there is a header row. |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `3`     | The title's heading element.                                    |

`class`, `style`, `id` and `aria-*` attributes fall through to the `section`.

## Slots

| Slot      | Use                                               |
| --------- | ------------------------------------------------- |
| `default` | The body.                                         |
| `action`  | The header's action at the end, usually a Button. |

## Accessibility

- It is a `section`, which is a landmark only when it has a name: give it `aria-label` or rely on the title's heading to make it findable.
- In print the shadow becomes a 1px border and the panel does not break across pages.
