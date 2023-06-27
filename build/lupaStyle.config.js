import scss from "rollup-plugin-scss";

export default {
  input: "styles/clients/lupa/lupa.js",
  output: {
    file: "dist/style.js",
    format: "esm",
  },
  plugins: [
    scss({
      output: `dist/style.css`,
      outputStyle: "compressed",
    }),
  ],
};
