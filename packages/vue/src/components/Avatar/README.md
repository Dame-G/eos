# EAvatar

A person, as a photo or as their initials on a rounded tile.

```vue
<EAvatar name="Ada Lovelace" />
<EAvatar name="Ada Lovelace" src="/people/ada.jpg" large />
<EMenu label="Account" :items="items">
  <template #trigger><EAvatar name="Ada Lovelace" as="button" /></template>
</EMenu>
```

## Props

| Prop    | Type                 | Default | Notes                                                                                                                     |
| ------- | -------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------- |
| `name`  | `string`             |         | Required. Read by screen readers. The initials are the first letters of its first and last word.                          |
| `src`   | `string`             |         | Photo URL. The initials show if it fails to load.                                                                         |
| `small` | `boolean`            |         | 28px, for rows.                                                                                                           |
| `large` | `boolean`            |         | 56px, for a profile or practitioner. The default is 40px.                                                                 |
| `as`    | `"span" \| "button"` | `span`  | `button` renders a `button` with `type="button"`, a pointer cursor and a focus ring, such as the `trigger` of an `EMenu`. |

`class`, `style` and attributes land on the `span` or `button` element.

## Accessibility

- The `span` root is `role="img"` with `aria-label` set to `name`; the photo has no alt text of its own.
- As a `button` the root has no role and is named by hidden text set to `name`; the initials are hidden from screen readers.
