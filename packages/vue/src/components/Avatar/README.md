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

<!-- props:start -->

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `name` | `string` | **Required** | The person's name. Screen readers read it; the initials are the first letters of its first and last word. |
| `src` | `string` | — | A photo URL. If it fails to load, the initials appear. |
| `small` | `boolean` | `false` | 32px, for rows and bars. |
| `large` | `boolean` | `false` | 64px, for a profile or practitioner on an appointment card. The default is 44px. |
| `as` | `"span" \| "button"` | `"span"` | `button` renders a `button` with `type="button"`, a pointer cursor and a focus ring, named by `name`, such as the `trigger` of an `EMenu`. Default `span`. |

<!-- props:end -->

`class`, `style` and attributes land on the `span` or `button` element.

## Accessibility

- The `span` root is `role="img"` with `aria-label` set to `name`; the photo has no alt text of its own.
- As a `button` the root has no role and is named by hidden text set to `name`; the initials are hidden from screen readers.
