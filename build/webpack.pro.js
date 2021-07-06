const { merge } = require('webpack-merge')
const commonConfig = require('./webpack.common')

module.exports = merge(commonConfig, {
    mode: 'production',
    output: {
        library: {
            name: 'MyLibrary',
            type: 'umd',
            export: 'default'
        }
    }
}) 