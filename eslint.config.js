import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Seulement les deux règles "classiques" du plugin, pas son preset
      // "recommended" complet : depuis la v7, celui-ci embarque les règles
      // de pureté/immutabilité pensées pour le React Compiler (aucun mutation
      // pendant le rendu). Ce projet est du React Three Fiber : muter des
      // objets Three.js dans useFrame() (hors cycle de rendu React) est le
      // pattern standard et performant de R3F, pas une erreur.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
)
