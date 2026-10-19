# EUpload

A dropzone for attaching files, clickable and droppable, listing the chosen files with their size.

```vue
<EUpload v-model="files" label="Insurance card" accept=".pdf,.jpg,.png" multiple hint="Up to 5 MB each." />
<EUpload label="Referral" @files="upload" />
```

## Props

| Prop         | Type      | Default   | Notes                                                                         |
| ------------ | --------- | --------- | ----------------------------------------------------------------------------- |
| `modelValue` | `File[]`  | `[]`      | v-model: the chosen files.                                                    |
| `label`      | `string`  |           | Required.                                                                     |
| `hideLabel`  | `boolean` |           | Keeps the label for screen readers only.                                      |
| `accept`     | `string`  |           | Extensions, such as `.pdf,.jpg`. Passed to the input and shown as "PDF, JPG". |
| `multiple`   | `boolean` |           |                                                                               |
| `name`       | `string`  |           | Submitted with a form.                                                        |
| `hint`       | `string`  |           | Say what is accepted and how large before the person tries.                   |
| `error`      | `string`  |           | Replaces the hint, marks the input invalid and is announced.                  |
| `required`   | `boolean` |           | The `required` attribute and the word "Required".                             |
| `optional`   | `boolean` |           | The word "Optional".                                                          |
| `disabled`   | `boolean` |           | Ignores drops and clicks.                                                     |
| `id`         | `string`  | generated | Id of the file input.                                                         |

`class` and `style` land on the wrapper `div`; other attributes land on the `input type="file"` element. Exposes `input` and `focus()`.

## Events

| Event   | Payload         | Notes                                                    |
| ------- | --------------- | -------------------------------------------------------- |
| `files` | `files: File[]` | The chosen or dropped files, the same list as the model. |

## Accessibility

- The visually hidden file input is the control and takes keyboard focus; its accessible name is the label followed by the dropzone text.
- Say the accepted types and size limit in `hint`.
