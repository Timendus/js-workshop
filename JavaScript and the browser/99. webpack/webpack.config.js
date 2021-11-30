const path = require('path');

module.exports = {
  mode: 'development',
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'docs'),
    filename: 'index.js'
  },
  devServer: {
    port: 9000,
    static: {
      directory: path.join(__dirname, 'docs'),
    }
  }
}
