'use strict';
var Webpack = require('webpack');
var path = require('path');
var appPath = path.resolve(__dirname, 'client');
var nodeModulesPath = path.resolve(__dirname, 'node_modules');
var buildPath = path.resolve(__dirname, 'public', 'build');

var config = {
  context: __dirname,
  devtool: 'eval-source-map',
  entry: [
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/dev-server',
    path.resolve(appPath, 'main.jsx')],
  output: {
    path: buildPath,
    filename: 'bundle.js',
    publicPath: '/build/',
  },
  resolve: {
    extensions: [
      '.js',
      '.jsx',
    ],
  },
  module: {
    loaders: [{
      test: /\.js$|\.jsx$/,
      loader: 'babel-loader',
      exclude: [nodeModulesPath],
      query: {
        presets: ['react', 'es2015'],
      },
    }, {
      test: /\.css$/,
      loader: 'style-loader!css-loader',
    }, {
      test: /\.scss$/,
      loader: 'style-loader!css-loader!sass-loader?outputStyle=expanded',
    },
    { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,   loader: 'url-loader?limit=10000&minetype=application/font-woff' },
    { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,  loader: 'url-loader?limit=10000&minetype=application/font-woff' },
    { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,    loader: 'url-loader?limit=10000&minetype=application/octet-stream' },
    { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,    loader: 'file' },
    { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,    loader: 'url-loader?limit=10000&minetype=image/svg+xml' },
    ],
  },
  plugins: [new Webpack.HotModuleReplacementPlugin()],
};

module.exports = config;
