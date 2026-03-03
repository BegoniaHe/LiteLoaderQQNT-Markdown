import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";

const compat = new FlatCompat({
    baseDirectory: import.meta.dirname,
    recommendedConfig: js.configs.recommended,
});

export default [
    {
        ignores: ["dist/**", "node_modules/**", "webpack.*.js", "*.config.js"],
    },
    ...compat.config({
        parser: "@typescript-eslint/parser",
        parserOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            ecmaFeatures: {
                jsx: true,
            },
            project: "./tsconfig.json",
        },
        env: {
            browser: true,
            node: true,
            es2022: true,
        },
        extends: [
            "eslint:recommended",
            "plugin:@typescript-eslint/recommended",
            "plugin:react-hooks/recommended",
        ],
        plugins: ["@typescript-eslint", "react-hooks"],
        rules: {
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-namespace": "off",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],
            "no-console": "off",
        },
    }),
];