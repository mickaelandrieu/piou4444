import js from "@eslint/js";
import tseslint from "typescript-eslint";
import security from "eslint-plugin-security";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      ".astro/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "*.config.{js,mjs,ts}",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  security.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // React 18 — JSX automatique, pas d'import React requis
      "no-undef": "off",
      // Désactivé : taux de faux positifs élevé sur les lookups par clé typée
      // (enums, IDs validés en amont). Les vrais cas d'injection sont
      // couverts par les validations explicites aux frontières d'API.
      "security/detect-object-injection": "off",
    },
  },
);
