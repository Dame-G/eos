import { defineComponent, h } from "vue";

export default defineComponent({
  name: "EHighlight",
  props: {
    text: { type: String, required: true },
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
