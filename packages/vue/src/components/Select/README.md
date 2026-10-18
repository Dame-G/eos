# ESelect

A dropdown built from a button and a listbox, for when options need more than a line of text. Built on `EField` and Reka UI's Select. There is deliberately no native `<select>`: one control looks and behaves the same everywhere.

```vue
<ESelect v-model="method" label="Pay with" name="method" :options="['Visa', 'Bank', 'Cash']" />
<ESelect
  v-model="plan"
  label="Plan"
  hint="You can change it later."
  :options="[
    { value: 'basic', label: 'Basic', description: 'Free, forever' },
    { value: 'pro', label: 'Pro', description: '$12 a month', icon: 'star' },
    { value: 'team', label: 'Team', disabled: true },
  ]"
/>
```

## Props

| Prop          | Type                    | Notes                                                                                              |
| ------------- | ----------------------- | -------------------------------------------------------------------------------------------------- |
| `v-model`     | `string`                | The `value` of the chosen option. An empty string is nothing chosen. Leave it off for local state. |
| `label`       | `string`                | The mono kicker above the control. Required unless `bare`. It also names the list.                 |
| `options`     | `(string \| EOption)[]` | Required. A string is both value and label. See below.                                             |
| `placeholder` | `string`                | What the button says while nothing is chosen. Default "Select" (the `select` message).             |
| `hideLabel`   | `boolean`               | Keeps the label for screen readers and removes it from the page.                                   |
| `hint`        | `string`                | Help under the control, 8px away, the same gap as the label above.                                 |
| `error`       | `string`                | Replaces the hint, turns the edge `danger`, marks the button `aria-invalid`.                       |
| `required`    | `boolean`               | The word "Required" beside the label and `aria-required` on the button.                            |
| `optional`    | `boolean`               | The word "Optional". Flag whichever is rarer.                                                      |
| `disabled`    | `boolean`               | Dashed and tinted; never opens.                                                                    |
| `name`        | `string`                | Submits the chosen value with a form. A hidden input carries it.                                   |
| `bare`        | `boolean`               | Only the control, no label, hint or error. Give it `ariaLabel`. For dense places such as filters.  |
| `ariaLabel`   | `string`                | The accessible name when `bare`.                                                                   |
| `id`          | `string`                | The button's id; the label points at it. Generated when left out.                                  |

An option is a string, or `{ value, label, description?, icon?, group?, disabled? }` (exported as `EOption`). A `value` is never an empty string. `description` is a muted second line. A new `group` heading starts wherever `group` changes from the option before, so keep each group's options together.

## Attributes and listeners

`inheritAttrs` is off. `class` and `style` stay on the wrapper (`div.e-field`, or the `bare` wrapper); everything else lands on the button: `aria-*`, `data-*`, and listeners such as `@focus` and `@blur`. An `aria-describedby` of your own is joined to the hint or error id.

## Keyboard

| Key                              | Closed                                                           | Open                                                                  |
| -------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------- |
| Enter, Space, ArrowDown, ArrowUp | Opens with the chosen option (or the first) focused              | Enter or Space chooses the focused option                             |
| ArrowDown, ArrowUp               |                                                                  | Moves, skipping disabled options                                      |
| Home, End                        |                                                                  | First and last option                                                 |
| Letters                          | Chooses the next option starting with them, like a native select | Moves to the next option starting with them                           |
| Escape                           |                                                                  | Closes without choosing; focus returns to the button                  |
| Tab                              |                                                                  | Leaves the list (the button is out of the tab order while it is open) |

An outside press closes the list.

## Rules

- Use `ERadioGroup` or `ESegmented` for five or fewer options, `ECombobox` when the list is long enough that people need to type to find things.
- The list is as wide as the button and flips above it when there is no room below. It renders in the portal target (`createEos({ portalTarget })`, default `body`) and carries the `e-root` class, so a theme scoped to part of the page reaches it.
- The chosen option is bold with a check, so it never relies on colour. The button is 48px tall, like `ETextField`.
- Reka UI gives the roving focus, typeahead, positioning and ARIA. Focus moves into the list while it is open (the option is focused, not an `aria-activedescendant`), and the button goes `tabindex="-1"` meanwhile so the page behind a modal-style list has no tabbable element hidden from assistive technology.
- Every word (`Select`) goes through `useMessages()`.
- The shared panel and option styles live in `panel.css` in this folder: `ECombobox`, `EAutocomplete`, `EMultiSelect`, `EPopover` and `EMenu` import it.
