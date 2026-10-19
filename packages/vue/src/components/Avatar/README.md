# EAvatar

A person, as a photo or as their initials on a rounded tile.

```vue
<EAvatar name="Ada Lovelace" />
<EAvatar name="Ada Lovelace" src="/people/ada.jpg" large />
```

## Props

| Prop    | Type      | Default | Notes                                                                                            |
| ------- | --------- | ------- | ------------------------------------------------------------------------------------------------ |
| `name`  | `string`  |         | Required. Read by screen readers. The initials are the first letters of its first and last word. |
| `src`   | `string`  |         | Photo URL. The initials show if it fails to load.                                                |
| `small` | `boolean` |         | 28px, for rows.                                                                                  |
| `large` | `boolean` |         | 56px, for a profile or practitioner. The default is 40px.                                        |

`class`, `style` and attributes land on the `span` element.

## Accessibility

- The root is `role="img"` with `aria-label` set to `name`; the photo has no alt text of its own.
