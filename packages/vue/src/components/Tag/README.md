# ETag

A small paper tag that labels or categorises something, and can be removed. Use [`EStamp`](../Stamp/README.md) for the status of a record and [`EButton`](../Button/README.md) for an action.

```vue
<ETag label="Cardiology" />
<ETag label="Lab results" tone="info" icon="file" />
<ETag label="Ada Lovelace" removable @remove="people.splice(i, 1)" />
```

## Props

<!-- props:start -->

| Prop        | Type                                                        | Default      | Notes                                                                                                                                                   |
| ----------- | ----------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`     | `string`                                                    | **Required** | The text of the tag. It also names the Remove button, as "Remove Cardiology".                                                                           |
| `tone`      | `"neutral" \| "info" \| "success" \| "warning" \| "danger"` | `"neutral"`  | `neutral` has no colour. The others colour the text, and leave the tag on the neutral surface: a tag names a category, and `EStamp` is the status mark. |
| `size`      | `"sm" \| "md"`                                              | `"md"`       | `sm` is shorter, for a dense list.                                                                                                                      |
| `icon`      | `IconProp`                                                  | None         | A decorative icon before the text.                                                                                                                      |
| `removable` | `boolean`                                                   | `false`      | Adds a Remove button that emits `remove`. The tag does not remove itself.                                                                               |

<!-- props:end -->

`class`, `style` and attributes land on the `span` element.

## Slots

| Slot      | Use                                                                                                      |
| --------- | -------------------------------------------------------------------------------------------------------- |
| `default` | The content, instead of `label`, for text with a different style. `label` still names the Remove button. |

## Events

| Event    | Payload | Notes                                                                    |
| -------- | ------- | ------------------------------------------------------------------------ |
| `remove` |         | The Remove button was pressed, or Delete or Backspace was pressed on it. |

## Accessibility

- Plain text in a `span`; the tone is backed by the words, not only the colour.
- The Remove button is 24px with a hit area that reaches 4px past it, and is named by the label ("Remove Cardiology"). The button disappears with its tag, so move focus to the next tag or a field after removing, and announce the result with `useAnnouncer()`.
- A long label is cut with an ellipsis inside the width it is given.

## Keyboard

| Key               | Action                                      |
| ----------------- | ------------------------------------------- |
| Tab               | Moves to the Remove button of a tag.        |
| Enter, Space      | Presses the Remove button.                  |
| Delete, Backspace | Removes the tag while its button has focus. |

## Related

[`EAvatarGroup`](../AvatarGroup/README.md) for people.
