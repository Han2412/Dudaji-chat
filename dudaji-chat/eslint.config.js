import js from '@eslint/js';
import globals from 'globals';
import pluginReact from 'eslint-plugin-react';
import pluginNode from 'eslint-plugin-node';

export default [
  // Cấu hình cho các file frontend (JSX, JS trong src/component)
  {
    files: ['src/component/**/*.{jsx,js}', 'src/**/*.{jsx,js}'],
    plugins: {
      react: pluginReact,
    },
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    extends: [
      js.configs.recommended,
      pluginReact.configs.flat.recommended,
    ],
    rules: {
      'react/prop-types': 'off', // Tắt nếu không dùng PropTypes
    },
    settings: {
      react: {
        version: 'detect', // Tự động phát hiện phiên bản React
      },
    },
  },
  // Cấu hình cho các file backend (JS trong src/model)
  {
    files: ['src/model/*.js', 'server/*.js'],
    plugins: {
      node: pluginNode,
    },
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
      },
    },
    extends: [
      js.configs.recommended,
      'plugin:node/recommended',
    ],
    rules: {
      'node/no-unsupported-features/es-syntax': 'off', // Cho phép ES module
    },
  },
  // Bỏ qua các thư mục không cần lint
  {
    ignores: ['node_modules', 'dist', 'Uploads'],
  },
];