const webpack = require('webpack');

module.exports = {
  entry: "./src/entry.js",
  output: { 
    path: __dirname + "/bin/",
    filename: "bundle.js"
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: "style-loader!css-loader" },
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'},
      { test: /\.html$/, loader: "html-loader" }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
      output: {
        comments: false,
      },
    }),
  ]
};