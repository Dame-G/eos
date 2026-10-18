# AeAvatar

A person, as a photo or as their initials on a rounded tile (the same shape as the date on an appointment card).

```vue
<AeAvatar name="Ada Lovelace" />
<AeAvatar name="Ada Lovelace" src="/people/ada.jpg" large />
```

## Props

| Prop    | Type      | Default | Notes                                                                               |
| ------- | --------- | ------- | ----------------------------------------------------------------------------------- |
| `name`  | `string`  | none    | Required. Read by screen readers; the initials come from it (first and last word).  |
| `src`   | `string`  | none    | A photo URL. If it fails to load, the initials appear.                              |
| `small` | `boolean` | unset   | 28px, for rows.                                                                     |
| `large` | `boolean` | unset   | 56px, for a practitioner on an appointment card or a profile. Default size is 40px. |

No slots. Native attributes land on the root `<span>`.

## Rules

- The photo is cropped to a rounded tile and is always decorative beside the name, so it has no alt text of its own.
- Show a photo only where the practice or the person chose to supply one.

## Accessibility

- The root is `role="img"` with `aria-label` set to `name`. The initials and the photo are not read separately.
