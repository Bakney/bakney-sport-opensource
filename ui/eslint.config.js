import eslintPluginSvelte from 'eslint-plugin-svelte';
export default [
  // add more generic rule sets here, such as:
  // js.configs.recommended,
  ...eslintPluginSvelte.configs['flat/prettier'],
  {
    rules: {
        semi: [2, 'always']
    },
    languageOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        globals: {
            __bakney: 'readonly',
            jQuery: 'readonly',
            moment: 'readonly',
            KTApp: 'readonly',
            ApexCharts: 'readonly',
        }
    },
  }
];