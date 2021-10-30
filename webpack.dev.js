import HtmlWebpackPlugin from 'html-webpack-plugin'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))

export default {
  mode: 'development',
  entry: {
    app: './src/app.jsx'
  },
  module: {
    rules: [
      {
        test: /\.jsx$/,
        use: [
          {
            loader: join(__dirname, '/lib/blast-jsx/index.js')
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ],
  devtool: 'source-map',
  devServer: {
    compress: true,
    port: 3000,
    hot: true
  }
}
