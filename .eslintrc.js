module.exports = {
    extends: ['airbnb-typescript'],
    parserOptions: {
        project: './tsconfig.eslint.json'
    },
    rules: {
      // We don't expose our components to users, and we use TypeScript to catch
      // most typing issues, so this feels like overkill.
      "react/prop-types": "off",

      // I use underscores to make sure that certain component props are accidentally
      // accessed or modified by passages.
      "no-underscore-dangle": "off",

      // Preact uses the 'h' import and is necessary in all JSX/TSX files.
      "no-unused-vars": [
        "error",
        {
          "varsIgnorePattern": "^h$"
        }
      ],

      // Ditto
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "varsIgnorePattern": "^h$"
        }
      ],

      // We use Preact, not React, so this is a false positive.
      "react/react-in-jsx-scope": "off",

      "radix": [
        "error",
        "as-needed"
      ],
    }
};
