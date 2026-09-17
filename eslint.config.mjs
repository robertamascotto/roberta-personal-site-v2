import nextConfig from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      ".sanity/**",
      "public/**",
    ],
  },
  ...nextConfig,
  {
    rules: {
      "padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: "import", next: "*" },
        { blankLine: "any", prev: "import", next: "import" },
      ],
      // Disable new react-hooks rules that flag valid Next.js patterns
      // Server components with try/catch for data fetching are valid
      "react-hooks/error-boundaries": "off",
      // Setting state in useEffect for route changes is a valid pattern
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default eslintConfig;
