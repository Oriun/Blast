import HtmlWebpackPlugin from 'html-webpack-plugin'

export default {
  mode: 'development',
  entry: {
    app: './src/app.js'
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
