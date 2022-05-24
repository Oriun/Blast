import HtmlWebpackPlugin from 'html-webpack-plugin'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url))


const checkIfExists = name => { try { var _ = require(name); return true } catch (er) { return false } }
const useStyles = checkIfExists('css-loader') && checkIfExists('style-loader')
const useSass = useStyles && checkIfExists('sass-loader') && checkIfExists('sass')
const useResolveUrlLoader = checkIfExists('resolve-url-loader')
const useSvg = checkIfExists('@oriun/blast-svg')

const rules = [
  {
    test: /\.[jt]sx$/,
    use: ['@oriun/blast-jsx']
  }
]
if (useStyles) rules.push({
  test: /\.css$/,
  use: ['style-loader', 'css-loader', ...(useResolveUrlLoader ? ['resolve-url-loader'] : [])]
})
if (useSass) rules.push({
  test: /\.s[ac]ss$/,
  use: ['style-loader', 'css-loader', 'sass-loader', ...(useResolveUrlLoader ? ['resolve-url-loader'] : [])]
})
if (useSvg) rules.push({
  test: /\.svg$/,
  use: ['@oriun/blast-svg']
})

export default {
  mode: 'development',
  entry: {
    app: './src/app.jsx'
  },
  module: {
    rules
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ],
  devtool: 'source-map',
  devServer: {
    compress: true,
    port: 3002,
    hot: true
  },
  resolveLoader: {
    modules: ['node_modules']
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json", ".svg", ".html", ".css", ".scss"]
  }
}
