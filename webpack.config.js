const webpack = require('webpack');

module.exports = {
    mode:"development", 
    watch: false,
    entry: {
      "src": './example/Example.js'
    },
    output: {
      path: __dirname + '/example/build',
      filename: '[name]-bundle.js'
  
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
    ],
    module: {
      rules: [
      ],
    },
  }