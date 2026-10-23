# EUpload

A dropzone for attaching files, clickable and droppable, listing the chosen files with their size.

```vue
<EUpload v-model="files" label="Insurance card" accept=".pdf,.jpg,.png" multiple hint="Up to 5 MB each." />
<EUpload label="Referral" @update:model-value="upload" />
```

## Props

<!-- props:start -->

| Prop         | Type      | Default      | Notes                                                                                                                                                                                                                                            |
| ------------ | --------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `modelValue` | `File[]`  | `[]`         | `v-model`: the chosen files.                                                                                                                                                                                                                     |
| `label`      | `string`  | **Required** | The visible label above the dropzone.                                                                                                                                                                                                            |
| `hideLabel`  | `boolean` | `false`      | Keeps the label for screen readers and hides it from the page.                                                                                                                                                                                   |
| `accept`     | `string`  | None         | Accepted types, separated by commas: extensions such as `.pdf`, MIME types such as `image/png` and wildcards such as `image/*`. Passed to the input, shown under the prompt as "PDF, JPG" and also applied to dropped files.                     |
| `multiple`   | `boolean` | `false`      | Allows choosing more than one file. New files are added to the list, and a file already in it (same name, size and date) is not added twice. Without it, a choice replaces the file, and the others of several are rejected with reason `count`. |
| `maxSize`    | `number`  | None         | The largest file allowed, in bytes. A larger one is left out and announced as "1 file is larger than 5 MB".                                                                                                                                      |
| `maxFiles`   | `number`  | None         | The most files the list can hold with `multiple`. Further files are left out and announced.                                                                                                                                                      |
| `name`       | `string`  | None         | The name submitted with a form.                                                                                                                                                                                                                  |
| `hint`       | `string`  | None         | Help that says which files are accepted and how large, shown before the person tries.                                                                                                                                                            |
| `error`      | `string`  | None         | What to fix. Replaces the hint, marks the input invalid and is announced.                                                                                                                                                                        |
| `required`   | `boolean` | `false`      | Sets the `required` attribute and adds a word beside the label.                                                                                                                                                                                  |
| `optional`   | `boolean` | `false`      | Adds a word beside the label. Use it when most fields in the form are required.                                                                                                                                                                  |
| `disabled`   | `boolean` | `false`      | Disables the control, so it ignores drops and clicks. A disabled control is not submitted.                                                                                                                                                       |
| `readonly`   | `boolean` | `false`      | Shows the files but blocks changes: drops and clicks do nothing and the remove buttons are disabled. The input stays focusable and the files are still submitted.                                                                                |
| `id`         | `string`  | `generated`  | The id of the file input, which the label points at.                                                                                                                                                                                             |

<!-- props:end -->

`class` and `style` land on the wrapper `div`. Other attributes land on the `input type="file"` element. Exposes `input` and `focus()`.

## Events

| Event    | Payload              | Notes                                                                                                                                                                        |
| -------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `files`  | `files: File[]`      | Deprecated: use `v-model` or `@update:model-value`, which carry the same list. Warns in development.                                                                         |
| `reject` | `{ file, reason }[]` | Files left out. `reason` is `type` (not in `accept`), `size` (over `maxSize`) or `count` (over `maxFiles`, or more than one file without `multiple`). Use it to set `error`. |

## Accessibility

- The visually hidden file input is the control and takes keyboard focus. Its accessible name is the label followed by the dropzone text.
- Say the accepted types and size limit in `hint`.
- `accept`, `maxSize`, `maxFiles` and `multiple` apply to dropped files as well as chosen ones. Files that do not fit are left out, and a choice where every file is left out keeps the list as it was. With `multiple` new files are added to the list and a file already listed is not added again. Without it a choice replaces the file, and the others of several are rejected with reason `count`.
- Adding files announces "2 files added", plus "1 file was not accepted", "1 file is larger than 5 MB" or "Only 3 files can be added" (assertively) when some were left out. Removing a file announces "Removed name.pdf" and returns focus to the input.
- With `readonly` the files stay listed and focusable but drops, the picker and Remove do nothing, and the files are still submitted. A file input has no `readonly` of its own and `aria-readonly` is not allowed on it, so the input is described as "Read only".
- Each listed file has a Remove button named "Remove name.pdf". Sizes are shown in bytes, kB or MB in the configured locale.

## Keyboard

| Key         | Does                                                                             |
| ----------- | -------------------------------------------------------------------------------- |
| Tab         | Focuses the file input (the zone shows the focus ring), then each Remove button. |
| Enter/Space | Opens the file picker, or removes the file on a Remove button.                   |

## Related

[`EField`](../Field/README.md) to wrap your own control, [`ESignaturePad`](../SignaturePad/README.md) to capture a drawn signature.
