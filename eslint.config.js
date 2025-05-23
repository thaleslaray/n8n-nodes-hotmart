const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');

module.exports = [
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json'
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // Regras básicas
      'no-console': 'warn',
      'no-unused-vars': 'off', // Usar a versão do TypeScript
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      
      // Permite any (comum em nodes n8n)
      '@typescript-eslint/no-explicit-any': 'warn',
      
      // Permite require()
      '@typescript-eslint/no-var-requires': 'off',
      
      // Permite funções vazias
      '@typescript-eslint/no-empty-function': 'warn'
    }
  },
  {
    ignores: [
      'dist/**/*',
      'node_modules/**/*',
      '**/*.js.map',
      'gulpfile.js'
    ]
  }
];