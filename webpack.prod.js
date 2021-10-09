import UglifyJsPlugin from 'uglifyjs-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))

export default {
  mode: 'production',
  entry: './src/app.js',
  output: {
    filename: './main.js',
    path: join(__dirname, 'build')
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ],
  optimization: {
    minimizer: [new UglifyJsPlugin()],
    minimize: true
  },
  resolve: {
    symlinks: false
  },
  devtool: 'source-map'
}
