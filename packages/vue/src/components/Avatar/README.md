# EAvatar

A person, as a photo or as their initials on a rounded tile.

```vue
<EAvatar name="Ada Lovelace" />
<EAvatar name="Ada Lovelace" src="/people/ada.jpg" size="lg" presence="online" />
<EMenu label="Account" :items="items">
  <template #trigger><EAvatar name="Ada Lovelace" as="button" /></template>
</EMenu>
```

## Props

<!-- props:start -->

| Prop       | Type                                        | Default      | Notes                                                                                                                                                                                             |
| ---------- | ------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`     | `string`                                    | **Required** | The person's name. Screen readers read it, and the initials are the first letter (a whole character, so a Chinese, Japanese, Korean or emoji one is never cut in two) of its first and last word. |
| `src`      | `string`                                    | None         | A photo URL. The initials show if it fails to load.                                                                                                                                               |
| `size`     | `Extract<Size, "sm" \| "md" \| "lg">`       | None         | `sm` (32px) for rows and bars, `md` (44px), `lg` (64px) for a profile or a practitioner on an appointment card.                                                                                   |
| `small`    | `boolean`                                   | `false`      | **Deprecated.** Use `size="sm"`.                                                                                                                                                                  |
| `large`    | `boolean`                                   | `false`      | **Deprecated.** Use `size="lg"`.                                                                                                                                                                  |
| `presence` | `"online" \| "away" \| "busy" \| "offline"` | None         | A presence dot at the corner. The name is read with it, as "Ada Lovelace, Online".                                                                                                                |
| `status`   | `"online" \| "away" \| "busy" \| "offline"` | None         | **Deprecated.** Use `presence`.                                                                                                                                                                   |
| `as`       | `"span" \| "button"`                        | `"span"`     | `button` renders a `button` with `type="button"`, named by `name`, for use as the `trigger` of an `EMenu`, for example.                                                                           |

<!-- props:end -->

`class`, `style` and attributes land on the `span` or `button` element. A name without spaces (Chinese, Japanese or Korean) gives its first character. `size` is `sm` (32px), `md` (44px) or `lg` (64px). `small` and `large` are deprecated: use `size`. The initials are capitalised in the configured `locale` (a Turkish `i` becomes `İ`).

## Accessibility

- The `span` root is `role="img"` with `aria-label` set to `name`. The photo has no alt text of its own.
- With `presence` the name is read with it ("Ada Lovelace, Online"); the dot differs by shape (the offline one is hollow) as well as colour.
- As a `button` the root has no role and is named by hidden text set to `name`. The initials are hidden from screen readers.

## Keyboard

| Key          | Action                                                                         |
| ------------ | ------------------------------------------------------------------------------ |
| Tab          | Moves focus to an avatar with `as="button"`. A `span` avatar is not focusable. |
| Enter, Space | Press an avatar with `as="button"`.                                            |

## Related

[`EAvatarGroup`](../AvatarGroup/README.md) for several people in one overlapping stack. [`EMenu`](../Menu/README.md) takes an avatar button as its trigger, and [`EIconButton`](../IconButton/README.md) is the button for an icon action.
