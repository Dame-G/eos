# EIconButton

An icon-only control with a 48px target.

```vue
<EIconButton icon="download" label="Download receipt" @click="download" />
```

## Props

| Prop       | Type       | Default | Notes                                                                             |
| ---------- | ---------- | ------- | --------------------------------------------------------------------------------- |
| `icon`     | `IconName` | none    | Required. The glyph.                                                              |
| `label`    | `string`   | none    | Required. The accessible name; write it as an action, such as "Download receipt". |
| `disabled` | `boolean`  | unset   |                                                                                   |

No slots. Native attributes and listeners land on the `<button>`: `@click`, `aria-*`, and `popovertarget` and `popovertargetaction` to open a native popover.

## Rules

- Use it where a text Button would crowd the row; never for the main action.
- Pair it with a Tooltip when the icon is not obvious.
- It is `type="button"`, so it never submits a form.

## Accessibility

- A real `<button>` named by `aria-label`; the icon is hidden from assistive technology. Tab focuses it, Enter and Space press it, and it has the focus ring.
- Hidden when printed.
