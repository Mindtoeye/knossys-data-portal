const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const resolve = require('path').resolve;
const { IgnorePlugin } = require('webpack');

const optionalPlugins = [];
if (process.platform !== "darwin") { // don't ignore on OSX
  optionalPlugins.push(new IgnorePlugin({ resourceRegExp: /^fsevents$/ }));
}

const config = {
  mode: 'development',
  target: "node",
  devtool: 'eval-source-map',
  output:{
    path: resolve('./dist/'),
    filename: 'bundle.js'
  },
  plugins: [
    ...optionalPlugins,
  ],
  resolve: {
    extensions: ['.js','.jsx','.css','.scss']
  },
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env','@babel/preset-react']
        }
      }
    },{
      test: /\.(sa|sc|c)ss$/,
      use: [
        // Creates `style` nodes from JS strings
        "style-loader",
        // Translates CSS into CommonJS
        "css-loader",
        // Compiles Sass to CSS
        "sass-loader",
      ],
    },
    {
      test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              esModule: false,
            },
          },
        ],

     type: 'javascript/auto'
    }]
  }
};

module.exports = config;
