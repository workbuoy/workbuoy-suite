module.exports = {
  root: false,
  extends: ['../.eslintrc.cjs'],
  env: {
    jest: true,
  },
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
};
