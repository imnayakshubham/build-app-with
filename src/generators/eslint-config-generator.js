export function generateESLintConfig(answers) {
  return {
    root: true,
    env: { browser: true, es2020: true },
    extends: [
      'eslint:recommended',
      ...(answers.typescript ? ['@typescript-eslint/recommended'] : []),
      'plugin:react-hooks/recommended',
    ],
    ignorePatterns: ['dist', '.eslintrc.cjs'],
    parser: answers.typescript ? '@typescript-eslint/parser' : undefined,
    plugins: ['react-refresh'],
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  };
}