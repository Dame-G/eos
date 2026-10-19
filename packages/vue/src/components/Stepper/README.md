# EStepper

Shows where a person is in a multi-step flow such as registration. It displays progress and does not navigate.

```vue
<EStepper
  label="Registration"
  :steps="[
    { label: 'About you', state: 'done' },
    { label: 'Insurance', state: 'current' },
    { label: 'Review', state: 'upcoming' },
  ]"
/>
```

## Props

| Prop    | Type     | Default    | Notes                                                                                                                           |
| ------- | -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `steps` | `Step[]` |            | Required. `{ label, state }`; `state` is `done`, `current` or `upcoming` (`todo` is an alias). Keep labels to one or two words. |
| `label` | `string` | `Progress` | The list's accessible name.                                                                                                     |

`class`, `style` and attributes land on the `ol` element. The steps stack vertically on narrow screens.

## Accessibility

- An ordered list; the current step has `aria-current="step"`, and done steps are read as "(done)".
