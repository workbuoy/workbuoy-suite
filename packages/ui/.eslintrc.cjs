module.exports = {
  extends: ["../../.eslintrc.cjs"],
  // Do not let ESLint load the TS resolver at all
  settings: {
    "import/resolver": {
      node: { extensions: [".js", ".jsx", ".ts", ".tsx"] },
      // Explicitly neuter TS resolver so it doesn't initialize unrs-resolver
      typescript: { project: null },
    },
  },
  // Disable import rules that require module resolution in this workspace
  rules: {
    "import/no-unresolved": "off",
    "import/default": "off",
    "import/namespace": "off",
    "import/no-named-as-default": "off",
    "import/no-named-as-default-member": "off",
  },
  overrides: [
    {
      files: ["**/*.stories.tsx", "**/*.test.tsx"],
      rules: {
        // keep them off for stories/tests too (explicit, even if redundant)
        "import/no-unresolved": "off",
        "import/default": "off",
        "import/namespace": "off",
        "import/no-named-as-default": "off",
        "import/no-named-as-default-member": "off",
      },
    },
  ],
};
