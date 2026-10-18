# EStepper

Where you are in a multi-step flow such as registration. Done steps are filled with a check, the current step is outlined in black and bold, upcoming steps are dashed. It runs in a row, and stacks vertically with connector lines on a phone (viewport 32rem and under).

```vue
<EStepper
  label="Registration"
  :steps="[
    { label: 'About you', state: 'done' },
    { label: 'Contact', state: 'done' },
    { label: 'Insurance', state: 'current' },
    { label: 'Forms', state: 'upcoming' },
    { label: 'Review', state: 'upcoming' },
  ]"
/>
```

## Props

| Prop    | Type     | Default    | Notes                                                                                      |
| ------- | -------- | ---------- | ------------------------------------------------------------------------------------------ |
| `steps` | `Step[]` |            | `{ label, state }` with `state` one of `done`, `current`, `upcoming` (`todo` is an alias). |
| `label` | `string` | "Progress" | The list's name for assistive technology.                                                  |

`class`, `style` and attributes fall through to the `ol`.

## Accessibility

- An ordered list with a name. The current step has `aria-current="step"`.
- A done step shows a check and says "(done)" to screen readers. The states are told apart by shape, not colour alone: dashed, thick outline, filled.
- The numbers are visible text in each dot.

## Rules

- A stepper shows progress; it does not navigate. Put the Back and Continue buttons with the form.
- Keep step names to one or two words.
