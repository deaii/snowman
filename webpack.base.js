const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

/**
 * @param {string} js 
 * @param {string} css 
 */
module.exports = function config(output) {
  return {
    mode: 'production',
    entry: './lib/index.ts',
    devtool: 'source-map',
    output: {
      filename: `engine${output}.js`,
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
          test: /\.ts$/,
          use: 'ts-loader',
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
    plugins: [
      new MiniCssExtractPlugin({ filename: `style${output}.css` }),
      require('autoprefixer'),
      new HtmlWebpackPlugin({
        hash: true,
        template: './lib/src/index.html',
        filename: `index${output}.html`
      }),
      //new ESLintPlugin({ files: 'lib/**/*.ts', }),
    ],
    externals: {
      jquery: 'jQuery',
      lodash: 'lodash'
    },
    devServer: {
      contentBase: path.join(__dirname, 'build'),
      compress: true,
      port: 9000,
    },
    resolve: {
      extensions: ['.ts', '.js'],
      fallback: {
        "path": false,
        "fs": false,
        "jquery": false,
        "lodash": false
      }
    }
  };
}
