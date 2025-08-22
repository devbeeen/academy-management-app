/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */

const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const webpack = require('webpack');
const dotenv = require('dotenv');

module.exports = env => {
  // const { development, production } = env;

  // if (development) {
  //   dotenv.config({
  //     path: './.env.development',
  //   });
  // } else if (production) {
  //   dotenv.config({
  //     path: './.env.production',
  //   });
  // }

  dotenv.config({
    path: './.env',
  });

  console.log('env:', env);
  console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);

  return {
    entry: './src/index.tsx',
    output: {
      filename: 'bundle.[contenthash].js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
    },
    devtool: 'source-map',
    devServer: {
      historyApiFallback: true,
      port: 3002,
      open: true,
      hot: true,
    },
    module: {
      rules: [
        {
          test: /\.js$|jsx$|ts$|tsx/,
          use: ['babel-loader'],
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            /*
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1, // <= postcss-loader가 다음에 적용되도록
                // esModule: false, // webpack 5에서 ESM 충돌 방지
              },
            },
            */

            'css-loader',
            'postcss-loader', // Tailwind 적용 위해 추가
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: 'index.html',
        favicon: './public/data/favicon-32x32.png', // MEMO: 파비콘
      }),
      new MiniCssExtractPlugin({
        filename: './[name].css',
      }),
      new webpack.DefinePlugin({
        'process.env': JSON.stringify(process.env),
      }),
    ],
  };
};
