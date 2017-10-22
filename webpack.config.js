
const _    = require('lodash')
const path = require('path')

const webpack             = require('webpack')
const LiveReloadPlugin    = require('webpack-livereload-plugin')
const HtmlWebpackPlugin   = require('html-webpack-plugin')
const BowerResolvePlugin  = require('bower-resolve-webpack-plugin')
const MinifyPlugin        = require("babel-minify-webpack-plugin")
const CreateFilePlugin    = require('webpack-create-file-plugin')
const GenerateAssetPlugin = require('generate-asset-webpack-plugin')


if (process.env.NODE_ENV === "production") {
  plugins = _.compact([
    new webpack.DefinePlugin({'process.env.NODE_ENV': JSON.stringify('production')})
  //, new webpack.optimize.ModuleConcatenationPlugin()
  //, new MinifyPlugin()
  , new CreateFilePlugin({files:['.nojekyll']})
  , (!process.env.DOMAIN)? null : new GenerateAssetPlugin({
      filename: "CNAME"
    , fn: ((x, cb) => cb(null, process.env.DOMAIN))
    })
  ])
} else {
  plugins = [
    new HtmlWebpackPlugin({
      template: './client/index.html',
      filename: 'index.html',
      inject: 'body'
    })
  , new LiveReloadPlugin({
      appendScriptTag: true
    })
  ]
}


module.exports = {
  entry: './client/index.js',

  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'index_bundle.js'
  },

  externals: [
    { xmlhttprequest: '{XMLHttpRequest:XMLHttpRequest}' }
  ],

  resolve: {
      extensions: ['.js', '.jsx', '.json', '*']
  },

  devtool: 'source-map',
  module: {
    rules: [
    {
      test: /\.js$/,
      use: ["source-map-loader"],
      enforce: "pre"
    },
    {
      test: /\.jsx?$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'babel-loader',
      options: {
        presets: ['react']
      }
    },
    {
      test: /\.css$/,
      loader: 'style-loader!css-loader'
    },
    {
      test: /\.jpe?g$|\.gif$|\.png$|\.ttf$|\.eot$|\.svg$/,
      use: 'file-loader?name=[name].[ext]?[hash]'
    },
    {
      test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'url-loader?limit=10000&mimetype=application/fontwoff'
    }
    ]
  },
  plugins: plugins
};
