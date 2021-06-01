const base = require ('./webpack.base');

const config = base('.full');

delete config.externals;

module.exports = config;
