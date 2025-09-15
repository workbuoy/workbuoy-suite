module.exports = {
  rules: {
    'no-restricted-imports': ['error', {
      paths: [
        { name: './policy.ts', message: 'Use core/policy (v2 facade)' },
        { name: './eventBus.ts', message: 'Use core/eventBusV2 (priority+DLQ)' }
      ],
      patterns: ['**/_legacy/**']
    }]
  }
};
