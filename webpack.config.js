const { readFileSync } = require('fs')
const { DefinePlugin } = require('webpack')

function encodeFile(abf) {
  return Buffer.from(abf).toString('base64')
}

module.exports = {
  target: 'webworker',
  entry: './index.js',
  mode: process.env.ENV === 'development' ? 'development' : 'production',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  resolve: {
    fallback: {
      buffer: require.resolve('buffer/'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      stream: require.resolve('stream-browserify'),
      timers: require.resolve('timers-browserify'),
      url: require.resolve('url/'),
    },
  },
  optimization: {
    minimize: false,
  },
  plugins: [
    new DefinePlugin({
      STATIC: {
        HEADER: JSON.stringify(readFileSync('assets/motd.txt', 'utf-8')),
        ROBOTS_TXT: JSON.stringify(readFileSync('assets/robots.txt', 'utf-8')),
        PAGE_404: JSON.stringify(readFileSync('assets/robots.txt', 'utf-8')),
        IMAGE: JSON.stringify(encodeFile(readFileSync('assets/image.png'))),
        ICON: JSON.stringify(encodeFile(readFileSync('assets/icon.ico'))),
        PAGE_TEMPLATE: readFileSync('assets/page_templ.js', 'utf-8').replace(
          /^;/,
          ''
        ),
      },
    }),
  ],
}
