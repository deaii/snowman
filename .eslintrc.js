module.exports = {
    extends: ['airbnb-typescript'],
    parserOptions: {
      project: './tsconfig.json',
    },
    rules: {
      // Sometimes, classes have default and non-default exports.  We can
      // combine these into a single import statement for normal imports, but
      // not for type imports
      'import/no-duplicates': 'off'
    }
};
