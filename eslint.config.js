const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const prettier = require('eslint-plugin-prettier');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/component-class-suffix': ['error', { suffixes: ['Component', 'Page'] }],
      'prettier/prettier': 'off'
    },
    plugins: {
      prettier
    }
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended],
    rules: {}
  }
);
