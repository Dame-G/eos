# EUpload

A dropzone for attaching files, clickable and droppable, listing the chosen files with their size.

```vue
<EUpload v-model="files" label="Insurance card" accept=".pdf,.jpg,.png" multiple hint="Up to 5 MB each." />
<EUpload label="Referral" @files="upload" />
```

## Props

<!-- props:start -->

| Prop         | Type      | Default      | Notes                                                                                                                                                                                                                        |
| ------------ | --------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue` | `File[]`  | `[]`         | `v-model`: the chosen files.                                                                                                                                                                                                 |
| `label`      | `string`  | **Required** | The visible label, a mono kicker above the dropzone.                                                                                                                                                                         |
| `hideLabel`  | `boolean` | `false`      | Keep the label for screen readers and remove it from the page.                                                                                                                                                               |
| `accept`     | `string`  | —            | Accepted types, separated by commas: extensions such as `.pdf`, MIME types such as `image/png` and wildcards such as `image/*`. Passed to the input, shown under the prompt as "PDF, JPG" and also applied to dropped files. |
| `multiple`   | `boolean` | `false`      | Allows choosing more than one file. Without it only the first file of a choice or drop is kept.                                                                                                                              |
| `name`       | `string`  | —            | The name submitted with a form.                                                                                                                                                                                              |
| `hint`       | `string`  | —            | Say what is accepted and how large before the person tries.                                                                                                                                                                  |
| `error`      | `string`  | —            | What to fix. Replaces the hint, marks the input invalid and is announced.                                                                                                                                                    |
| `required`   | `boolean` | `false`      | The `required` attribute and a word beside the label.                                                                                                                                                                        |
| `optional`   | `boolean` | `false`      | A word beside the label. Flag whichever is rarer.                                                                                                                                                                            |
| `disabled`   | `boolean` | `false`      | Ignores drops and clicks and dims the edge.                                                                                                                                                                                  |
| `id`         | `string`  | `generated`  | The id of the file input; the label points at it.                                                                                                                                                                            |

<!-- props:end -->

`class` and `style` land on the wrapper `div`; other attributes land on the `input type="file"` element. Exposes `input` and `focus()`.

## Events

| Event   | Payload         | Notes                                                    |
| ------- | --------------- | -------------------------------------------------------- |
| `files` | `files: File[]` | The chosen or dropped files, the same list as the model. |

## Accessibility

- The visually hidden file input is the control and takes keyboard focus; its accessible name is the label followed by the dropzone text.
- Say the accepted types and size limit in `hint`.
- `accept` and `multiple` apply to dropped files as well as chosen ones. Files that do not match are left out, and without `multiple` only the first file is kept.
- Adding files announces "2 files added", plus "1 file was not accepted" (assertively) when some were left out. Removing a file announces "Removed name.pdf" and returns focus to the input.
- Each listed file has a Remove button named "Remove name.pdf". Sizes are shown in bytes, kB or MB in the configured locale.
- With an `error` the dropzone edge turns to the danger colour. A disabled dropzone keeps its disabled look.
