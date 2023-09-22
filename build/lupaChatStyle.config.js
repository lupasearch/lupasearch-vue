import scss from "rollup-plugin-scss";

export default {
  input: "styles/chat/chat.js",
  output: {
    file: "dist/lupaChatStyle.js",
    format: "esm",
  },
  plugins: [
    scss({
      output: `dist/lupaChatStyle.css`,
      outputStyle: "compressed",
    }),
  ],
};
