import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

const eslintConfig = [{
  ignores: [
    '.next/**',
    'node_modules/**',
    'out/**',
    'build/**',
    '.vercel/**',
    'public/**',
  ],
}, ...nextCoreWebVitals, ...nextTypescript, ...compat.config({
  extends: ['prettier'],

  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
  }
})];

export default eslintConfig;
