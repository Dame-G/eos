# AeUpload

A dropzone for attaching files. The whole area is the click target and a drop target; chosen files list below with their size. Say what is accepted and how large before the person tries.

```vue
<AeUpload v-model="files" label="Insurance card" accept=".pdf,.jpg,.png" multiple hint="Up to 5 MB each." />
<AeUpload label="Referral" @files="upload" />
```

## Props

| Prop        | Type      | Notes                                                                         |
| ----------- | --------- | ----------------------------------------------------------------------------- |
| `v-model`   | `File[]`  | The chosen files. Leave it off for local state.                               |
| `label`     | `string`  | Required.                                                                     |
| `hideLabel` | `boolean` | Keeps the label for screen readers only.                                      |
| `accept`    | `string`  | Extensions, such as `.pdf,.jpg`. Passed to the input and shown as "PDF, JPG". |
| `multiple`  | `boolean` |                                                                               |
| `name`      | `string`  | Submitted with a form.                                                        |
| `hint`      | `string`  | Say what is accepted and how large.                                           |
| `error`     | `string`  | Replaces the hint, marks the input invalid, announced.                        |
| `required`  | `boolean` | The `required` attribute and the word "Required".                             |
| `optional`  | `boolean` | The word "Optional".                                                          |
| `disabled`  | `boolean` | Ignores drops and clicks and dims the edge.                                   |
| `id`        | `string`  | The file input's id. Generated when left out.                                 |

## Events

| Event   | Payload         | Notes                                                              |
| ------- | --------------- | ------------------------------------------------------------------ |
| `files` | `files: File[]` | The chosen or dropped files; the same list as `update:modelValue`. |

`class` and `style` stay on the wrapper; other attributes land on the `<input type="file">`. Exposed: `input` and `focus()`.

## Rules

- The visually hidden file input is the control: it takes focus with the keyboard and the dropzone draws the focus outline. The input has two labels, the field label and the dropzone text.
- Dragging over highlights the zone; a disabled upload ignores drops.
- File sizes are shown in KB.
