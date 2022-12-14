const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = (env, argv) => {
    const libsToIgnore = {
        'angular': 'angular',
        'browser-image-compression': 'imageCompression'
    };
    return {
        externals: libsToIgnore,
        entry: {
            index: './index.ts'
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                    //include: /\./
                }
            ]
        },
        plugins: [
            new CopyPlugin({
                patterns: [
                    {
                        from: 'package.json'
                    }
                ]
            })
        ],
        resolve: {
            extensions: ['.tsx', '.ts', '.js']
        },
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'dist'),
            clean: true
        },
        devtool: argv.mode === 'development' ? 'inline-source-map' : false,
        target: 'web'
    };
};
