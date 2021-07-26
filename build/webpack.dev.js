const { merge } = require('webpack-merge')
const commonConfig = require('./webpack.common')
const htmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

module.exports = merge(commonConfig, {
    mode: 'development',
    plugins: [
        new htmlWebpackPlugin({
            publicPath: '/',
            template: path.resolve(__dirname, '../public/index.html')
        })
    ]
}) 