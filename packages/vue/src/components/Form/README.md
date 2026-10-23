# EForm

A form that checks its fields before it submits and, when some are invalid, lists them in one summary and moves focus there. Use [`EFieldset`](../Fieldset/README.md) inside it to group fields.

```vue
<EForm :submitting="saving" @submit.prevent="save">
  <ETextField v-model="name" label="Name" required />
  <ETextField v-model="email" label="Email" type="email" required :error="emailError" />
  <EButton type="submit" :loading="saving">Save</EButton>
</EForm>
```

## Props

<!-- props:start -->

| Prop          | Type                   | Default     | Notes                                                                                                                                              |
| ------------- | ---------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `submitting`  | `boolean`              | `false`     | The form is being sent. Sets `aria-busy` and ignores a second submit until it clears. When it clears with errors on the fields, the summary shows. |
| `summary`     | `boolean`              | `true`      | Lists the invalid fields in a notice above the form after a submit that failed.                                                                    |
| `focusTarget` | `"summary" \| "field"` | `"summary"` | Where focus goes after a failed submit: the summary, or the first invalid field (use it with `summary` off).                                       |

<!-- props:end -->

`class`, `style` and attributes land on the `form` element, which has `novalidate` so the browser's own bubbles stay off. The fields lay out in one column, `gap-loose` apart.

The checks are the fields' `error` props and the browser's constraint validation (`required`, `pattern`, `min`, `max`, `type="email"`), so a field needs no extra code to take part. Every control that takes an `error` registers it, including `ECheckbox`, `ESwitch`, `ESegmented`, the groups, `EFieldset` and `ESignaturePad`. Controls the browser cannot check check themselves: an empty required `ESelect` (it posts through hidden inputs) and an empty required `ESignaturePad` stop the submit with the browser's own message. A group of radios is listed once, by its label, and its link focuses the chosen radio or the first. A custom control joins with `useFormField({ id, label, error, check })`. `@submit` fires once they pass, with the event; call `preventDefault()` (`@submit.prevent`) to send the data yourself. A submit button with `formnovalidate` skips the checks.

## Slots

| Slot      | Use                               |
| --------- | --------------------------------- |
| `default` | The fields and the submit button. |

## Events

| Event     | Payload       | Notes                                                               |
| --------- | ------------- | ------------------------------------------------------------------- |
| `submit`  | `SubmitEvent` | The form passed every check.                                        |
| `invalid` | `FormIssue[]` | The submit was stopped. Each issue is `{ id, label, message }`.     |
| `reset`   | `Event`       | The form was reset. Values bound with `v-model` are yours to reset. |

## Methods

Exposed through a template ref: `validate()` runs the checks of a submit, shows the summary and returns whether the form is valid. `reset()` resets the native values, clears the summary and emits `reset`. `focusFirstInvalid()` focuses the first invalid field. `issues` is the list in the summary and `form` is the element.

When `submitting` goes from true to false and the fields now carry `error` text (a server's answer), the summary shows and takes focus the same way.

## Accessibility

- The summary is a danger [`ENotice`](../Notice/README.md) announced as an alert, titled "There is a problem". Each entry is a link that moves focus to its field.
- Focus moves to the summary after a failed submit, or to the first invalid field with `focusTarget="field"`.
- The list follows the fields while it is up, so a corrected field drops out.
- `submitting` sets `aria-busy` on the form. Keep the submit button labelled and use its `loading` state to show progress.
- Show the same `error` on the field: the summary names the problem, the field says it where it happens.

## Keyboard

| Key   | Action                                               |
| ----- | ---------------------------------------------------- |
| Enter | In a field, submits the form (the checks run first). |
| Tab   | Moves through the fields, then the buttons.          |

## Related

[`EField`](../Field/README.md) and the `*Field` components register their errors with it. [`ENotice`](../Notice/README.md) for a message that is not about a form.
