import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'

export default {
    mode: "development",
    entry: {
        app: './src/index.js'
    },
    /*module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ],
            },
        ]
    },*/
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html'
        }),
    ],
    devtool: 'source-map',
    devServer: {
        compress: true,
        port: 3000,
        hot: true
    },
}
