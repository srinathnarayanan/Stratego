var path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const env = dotenv.config().parsed
  
// reduce it to a nice object, the same as before
const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {})

module.exports = {  
  entry: { 
    index: "./src/index.tsx"
  },
  target: 'web',
  module: {
    rules: [
      { test: /\.ts(x?)$/, loader: 'ts-loader' },      
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.css$/i, use: ['style-loader', 'css-loader']},
      { test: /\.(jpg|png)$/, loader: 'url-loader'},
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new CopyWebpackPlugin({
      // copies to {output}/static
      patterns: [{ from: 'src/Images', to: 'images' }]
    }),
    new webpack.DefinePlugin(envKeys)
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json']
  },
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'bundle.min.js'
  },
};