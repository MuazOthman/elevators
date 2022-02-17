module.exports = {
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2019,
    project: "./tsconfig.json",
    sourceType: "module",
  },
  rules: {
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto",
      },
    ],
    "@typescript-eslint/no-empty-interface": ["error"],
    "@typescript-eslint/no-unused-expressions": ["error"],
    "@typescript-eslint/no-use-before-define": ["error"],
    "@typescript-eslint/no-useless-constructor": ["error"],
    "@typescript-eslint/return-await": ["error"],
    "@typescript-eslint/await-thenable": ["error"],
    "@typescript-eslint/prefer-as-const": ["warn"],
    "@typescript-eslint/prefer-namespace-keyword": ["warn"],
    "@typescript-eslint/prefer-readonly": ["warn"],
    "@typescript-eslint/promise-function-async": ["error"],
    "@typescript-eslint/naming-convention": [
      "warn",
      {
        selector: "variable",
        types: ["boolean"],
        format: ["PascalCase"],
        prefix: ["is", "should", "has", "can", "did", "will"],
      },
      {
        selector: "interface",
        format: ["PascalCase"],
        custom: {
          regex: "^I[A-Z]",
          match: true,
        },
      },
      {
        selector: "memberLike",
        modifiers: ["private"],
        format: ["camelCase"],
        leadingUnderscore: "require",
      },
    ],
  },
};
  