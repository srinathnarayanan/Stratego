var path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

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
    })
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json']
  },
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'bundle.min.js'
  },
};