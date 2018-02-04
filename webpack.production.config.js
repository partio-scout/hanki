var path = require('path');
var nodeModulesPath = path.resolve(__dirname, 'node_modules');
var buildPath = path.resolve(__dirname, 'public', 'build');
var mainPath = path.resolve(__dirname, 'client', 'main.jsx');

var config = {
  entry: mainPath,
  output: {
    path: buildPath,
    filename: 'bundle.js',
    publicPath: 'build/',
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
    },{
      test: /\.css$/,
      loader: 'style-loader!css-loader',
    },{
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
};

module.exports = config;
