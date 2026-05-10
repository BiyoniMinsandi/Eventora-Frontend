import coreWebVitals from 'eslint-config-next/core-web-vitals'

// `eslint-config-next` already ships a flat-config for ESLint v9.
// Keeping this file minimal makes `npm run lint` predictable.
const config = [
  ...coreWebVitals,
  {
    // pnpm can leave these around when switching package managers.
    ignores: ['node_modules/.ignored/**'],
  },
  {
    rules: {
      // These rules are too noisy for typical dashboard-style apps and
      // cause a lot of false positives in pages that hydrate from local data.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      'react/no-unescaped-entities': 'off',
    },
  },
]

export default config
