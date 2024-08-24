import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import unicorn from "eslint-plugin-unicorn";
import vitest from "eslint-plugin-vitest";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node },
		},
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	unicorn.configs["flat/recommended"],
	prettier,
	{
		files: ["*.test.ts"],
		languageOptions: {
			globals: { ...vitest.environments.env.globals },
		},
		plugins: {
			vitest,
		},
		rules: {
			...vitest.configs.recommended.rules,
		},
	},
	{
		rules: {
			"unicorn/numeric-separators-style": "off",
			"unicorn/prefer-string-raw": "off",
			"unicorn/prefer-top-level-await": "off",
			"unicorn/prevent-abbreviations": "off",
		},
	},
	{
		ignores: ["__data__"],
	},
];
