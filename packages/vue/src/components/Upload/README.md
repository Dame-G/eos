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
| `label`      | `string`  | **Required** | The visible label above the dropzone.                                                                                                                                                                                        |
| `hideLabel`  | `boolean` | `false`      | Keeps the label for screen readers and hides it from the page.                                                                                                                                                               |
| `accept`     | `string`  | None         | Accepted types, separated by commas: extensions such as `.pdf`, MIME types such as `image/png` and wildcards such as `image/*`. Passed to the input, shown under the prompt as "PDF, JPG" and also applied to dropped files. |
| `multiple`   | `boolean` | `false`      | Allows choosing more than one file. Without it only the first file of a choice or drop is kept.                                                                                                                              |
| `name`       | `string`  | None         | The name submitted with a form.                                                                                                                                                                                              |
| `hint`       | `string`  | None         | Help that says which files are accepted and how large, shown before the person tries.                                                                                                                                        |
| `error`      | `string`  | None         | What to fix. Replaces the hint, marks the input invalid and is announced.                                                                                                                                                    |
| `required`   | `boolean` | `false`      | Sets the `required` attribute and adds a word beside the label.                                                                                                                                                              |
| `optional`   | `boolean` | `false`      | Adds a word beside the label. Use it when most fields in the form are required.                                                                                                                                              |
| `disabled`   | `boolean` | `false`      | Disables the control, so it ignores drops and clicks.                                                                                                                                                                        |
| `id`         | `string`  | `generated`  | The id of the file input, which the label points at.                                                                                                                                                                         |

<!-- props:end -->

`class` and `style` land on the wrapper `div`. Other attributes land on the `input type="file"` element. Exposes `input` and `focus()`.

## Events

| Event   | Payload         | Notes                                                    |
| ------- | --------------- | -------------------------------------------------------- |
| `files` | `files: File[]` | The chosen or dropped files, the same list as the model. |

## Accessibility

- The visually hidden file input is the control and takes keyboard focus. Its accessible name is the label followed by the dropzone text.
- Say the accepted types and size limit in `hint`.
- `accept` and `multiple` apply to dropped files as well as chosen ones. Files that do not match are left out, and without `multiple` only the first file is kept.
- Adding files announces "2 files added", plus "1 file was not accepted" (assertively) when some were left out. Removing a file announces "Removed name.pdf" and returns focus to the input.
- Each listed file has a Remove button named "Remove name.pdf". Sizes are shown in bytes, kB or MB in the configured locale.
