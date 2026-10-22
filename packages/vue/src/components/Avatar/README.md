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

| Prop    | Type                 | Default      | Notes                                                                                                                   |
| ------- | -------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `name`  | `string`             | **Required** | The person's name. Screen readers read it, and the initials are the first letters of its first and last word.           |
| `src`   | `string`             | None         | A photo URL. The initials show if it fails to load.                                                                     |
| `small` | `boolean`            | `false`      | Makes the avatar smaller, for rows and bars.                                                                            |
| `large` | `boolean`            | `false`      | Makes the avatar larger, for a profile or a practitioner on an appointment card.                                        |
| `as`    | `"span" \| "button"` | `"span"`     | `button` renders a `button` with `type="button"`, named by `name`, for use as the `trigger` of an `EMenu`, for example. |

<!-- props:end -->

`class`, `style` and attributes land on the `span` or `button` element.

## Accessibility

- The `span` root is `role="img"` with `aria-label` set to `name`. The photo has no alt text of its own.
- As a `button` the root has no role and is named by hidden text set to `name`. The initials are hidden from screen readers.
