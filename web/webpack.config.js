'use strict';

const webpack = require('webpack');
const path = require("path");
const buildPath = path.join(__dirname, "../api/public");
const args = require('yargs').argv;

const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

let isProd = args.prod;
let isDev = args.dev;

let entry = ["./src/site.js"];
let devtool;

if (isDev) {
    entry.push('webpack-dev-server/client?http://localhost:8080');
    devtool = 'source-map';
}

if (isProd) {
    entry.unshift("babel-polyfill");
}

let plugins = [
    new ExtractTextPlugin('[name].[hash].css'),
    new HtmlWebpackPlugin({
        template: './src/index.ejs',
        inject: 'body',
        chunks: 'app'
    })
];

if (isDev) {
    plugins.push(
        new webpack.DefinePlugin({
            'FACEBOOK_APP_ID': '1569714466676200'
        })
    );
}

if (isProd) {
    plugins.push(
        new webpack.NoErrorsPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"',
            'FACEBOOK_APP_ID': '1569119533402360'
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            mangle: true
        }),
        new webpack.optimize.OccurenceOrderPlugin()
    );
}

module.exports = {
    entry: entry,

    output: {
        path: buildPath,
        publicPath: '/',
        filename: '[name].[hash].js'
    },

    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"},
            { test: /\.less$/, exclude: /node_modules/, loader: ExtractTextPlugin.extract('style', 'css?sourceMap!less')},
            { test: /\.(woff|woff2|ttf|eot|svg)(\?]?.*)?$/, loader: 'file?name=assets/fonts/[name].[ext]?[hash]'},
            { test: /\.mp4$/, loader: 'file?name=assets/v/[name].[ext]'},
            { test: /\.jpg/, loader: 'file?name=assets/i/[name].[ext]'}
        ]
    },

    quiet: false,
    noInfo: false,

    plugins: plugins,

    devtool: devtool,

    devServer: {
        proxy: {
            '/api*': {
                target: "http://127.0.0.1:3000",
                secure: false
            }
        },

        contentBase: buildPath,
        host: "0.0.0.0",
        port: 8080,
        historyApiFallback: true
    }
};

