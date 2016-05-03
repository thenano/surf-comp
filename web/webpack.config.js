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

if (isDev) {
    entry.push('webpack-dev-server/client?http://localhost:8080');
}

let plugins = [
    new ExtractTextPlugin(isProd ? '[name].[hash].css' : '[name].css'),

    new HtmlWebpackPlugin({
        template: './src/index.html',
        inject: 'body',
        chunks: 'app'
    })
];

if (isProd) {
    plugins.push(
        new webpack.NoErrorsPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"development"'
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
        filename: isProd ? '[name].[hash].js' : '[name].js'
    },

    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"},
            { test: /\.less$/, exclude: /node_modules/, loader: ExtractTextPlugin.extract('style', 'css?sourceMap!less')},
            { test: /\.(woff|woff2|ttf|eot|svg)(\?]?.*)?$/, loader: 'file?name=assets/fonts/[name].[ext]?[hash]'},
            { test: /\.mp4$/, loader: 'file?name=assets/v/[name].[ext]'}
        ]
    },

    plugins: plugins,

    devtool: 'source-map',

    devServer: {
        proxy: {
            '/api*': {
                target: "http://127.0.0.1:3000",
                secure: false,
            }
        },

        contentBase: buildPath,
        host: "0.0.0.0",
        hot: true,
        port: 8080,
        historyApiFallback: true
    }
};

