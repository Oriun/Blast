import webpack from 'webpack'
import UglifyJsPlugin from 'uglifyjs-webpack-plugin'
import CompressionPlugin from 'compression-webpack-plugin'

export default {
  mode: 'production',
  entry: './lib/blast/dist/index.js',
  output: {
    filename: './blast.min.js',
    library: 'Blast'
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    }),
    new CompressionPlugin()
  ],
  optimization: {
    minimizer: [new UglifyJsPlugin()],
    minimize: true
  }
}
