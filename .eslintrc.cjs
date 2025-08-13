module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended' // Prettier entegre
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error' // Prettier hatalarını ESLint hatası yap
  },
};
