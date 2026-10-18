import { defineComponent, h } from "vue";

/** Shows `text` with the first match of `query` marked, as the reference does while people type. */
export default defineComponent({
  name: "AeHighlight",
  props: {
    /** The text to show. */
    text: { type: String, required: true },
    /** The lower-case text people typed. The first match in `text` is marked. */
    query: { type: String, required: true },
  },
  setup(props) {
    return () => {
      const i = props.query ? props.text.toLowerCase().indexOf(props.query) : -1;
      if (i < 0) return props.text;
      return [
        props.text.slice(0, i),
        h("mark", props.text.slice(i, i + props.query.length)),
        props.text.slice(i + props.query.length),
      ];
    };
  },
});
