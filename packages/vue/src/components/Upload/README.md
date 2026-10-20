# EUpload

A dropzone for attaching files, clickable and droppable, listing the chosen files with their size.

```vue
<EUpload v-model="files" label="Insurance card" accept=".pdf,.jpg,.png" multiple hint="Up to 5 MB each." />
<EUpload label="Referral" @files="upload" />
```

## Props

<!-- props:start -->

| Prop         | Type      | Default      | Notes                                                                                                   |
| ------------ | --------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| `modelValue` | `File[]`  | `[]`         | `v-model`: the chosen files.                                                                            |
| `label`      | `string`  | **Required** | The visible label, a mono kicker above the dropzone.                                                    |
| `hideLabel`  | `boolean` | `false`      | Keep the label for screen readers and remove it from the page.                                          |
| `accept`     | `string`  | —            | Accepted extensions, such as `.pdf,.jpg`. Passed to the input and shown under the prompt as "PDF, JPG". |
| `multiple`   | `boolean` | `false`      | Allows choosing more than one file.                                                                     |
| `name`       | `string`  | —            | The name submitted with a form.                                                                         |
| `hint`       | `string`  | —            | Say what is accepted and how large before the person tries.                                             |
| `error`      | `string`  | —            | What to fix. Replaces the hint, marks the input invalid and is announced.                               |
| `required`   | `boolean` | `false`      | The `required` attribute and a word beside the label.                                                   |
| `optional`   | `boolean` | `false`      | A word beside the label. Flag whichever is rarer.                                                       |
| `disabled`   | `boolean` | `false`      | Ignores drops and clicks and dims the edge.                                                             |
| `id`         | `string`  | `generated`  | The id of the file input; the label points at it.                                                       |

<!-- props:end -->

`class` and `style` land on the wrapper `div`; other attributes land on the `input type="file"` element. Exposes `input` and `focus()`.

## Events

| Event   | Payload         | Notes                                                    |
| ------- | --------------- | -------------------------------------------------------- |
| `files` | `files: File[]` | The chosen or dropped files, the same list as the model. |

## Accessibility

- The visually hidden file input is the control and takes keyboard focus; its accessible name is the label followed by the dropzone text.
- Say the accepted types and size limit in `hint`.
