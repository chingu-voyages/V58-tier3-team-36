import next from "eslint-plugin-next";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    files: ["**/*.{js,jsx}"],
    plugins: {
      prettier,
      next,
    },
    rules: {
      ...prettierConfig.rules,
      "prettier/prettier": "error",
      "next/core-web-vitals": "warn",
    },
  },
];
