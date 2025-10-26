import js from "@eslint/js";
import next from "eslint-config-next";
import prettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  ...next,
  prettier
];
