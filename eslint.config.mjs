import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "public/**",
      ".harness/**",
      ".tutorial-video/**",
      ".playwright-mcp/**",
      "scripts/**",
      "next-env.d.ts",
      "*.tsbuildinfo",
      "tsconfig.tsbuildinfo",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // Relajar reglas que típicamente chocan con código de prototipo/MVP.
      // Son útiles como señales (warn) pero no deben bloquear el gate.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/prefer-as-const": "off",
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "warn",
      "react-hooks/exhaustive-deps": "warn",
      // Reglas nuevas y muy estrictas de eslint-plugin-react-hooks v7 que
      // dispararían errores en patrones comunes (Date.now() en handlers,
      // setState en useEffect cleanup-on-close). El spec pide relajarlas
      // para no reescribir código de prototipo.
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default config;
