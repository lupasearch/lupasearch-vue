import scss from "rollup-plugin-scss";

export default {
  input: "styles/searchContainer/searchContainer.js",
  output: {
    file: "dist/lupaContainerStyle.js",
    format: "esm",
  },
  plugins: [
    scss({
      output: `dist/lupaContainerStyle.css`,
      outputStyle: "compressed",
    }),
  ],
};
