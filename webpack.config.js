const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './lib/index.ts',
  devtool: 'source-map',
  output: {
    filename: 'engine.js',
    path: path.resolve(__dirname, 'build'),
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Outputs the result to a file.
          MiniCssExtractPlugin.loader,
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
      {
        test: /\.tsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    minimizer: [
      new TerserPlugin(),
      new CssMinimizerPlugin(),
    ],
  },
  externals: {
    jquery: 'jquery',
    lodash: 'lodash',
    bootstrap: 'bootstrap'
  },
  plugins: [
    new MiniCssExtractPlugin(),
    require('autoprefixer'),
    new ESLintPlugin({ files: 'lib/**/*.ts', })

  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  }
};
