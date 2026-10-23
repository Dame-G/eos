import { defineComponent, h } from "vue";
import { foldedRange } from "./fold.js";

export default defineComponent({
  name: "EMatchHighlight",
  props: {
    text: { type: String, required: true },
    query: { type: String, required: true },
  },
  setup(props) {
    return () => {
      const range = foldedRange(props.text, props.query);
      if (!range) return props.text;
      return [
        props.text.slice(0, range[0]),
        h("mark", props.text.slice(range[0], range[1])),
        props.text.slice(range[1]),
      ];
    };
  },
});
