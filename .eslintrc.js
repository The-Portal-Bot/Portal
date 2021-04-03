module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "./tsconfig.eslint.json",
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: {
            jsx: false
        }
    },
    plugins: [
        "@typescript-eslint",
        // "prettier",
        // "unicorn",
        // "import"
    ],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        // "airbnb-typescript/base",
        // "plugin:unicorn/recommended",
        // "prettier",
        // "prettier/@typescript-eslint",
        // "plugin:prettier/recommended"
    ],
    env: {
        es6: true,
        browser: false,
        node: true
    },
    ignorePatterns: [
        "**/*.js"
    ],
    rules: {
        "@typescript-eslint/restrict-template-expressions": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "no-debugger": "off",
        "no-console": 0
    }
}