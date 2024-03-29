const { merge } = require('webpack-merge')
const commonConfig = require('./webpack.common')

module.exports = merge(commonConfig, {
    mode: 'production',
    output: {
        library: {
            name: 'PolyLine',
            type: 'umd',
            export: 'default'
        }
    }
}) 