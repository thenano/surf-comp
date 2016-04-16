'use strict';

const path = require("path");
const buildPath = path.join(__dirname, "public");
const args = require('yargs').argv;

const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

let isProd = args.prod;
let isDev = args.dev;

let entry = ["./src/site.js"];

if (isDev) {
    entry.push('webpack-dev-server/client?http://localhost:8080');
}

module.exports = {
    entry: [
        "./src/site.js",
        "webpack-dev-server/client?http://localhost:8080"
    ],
    // entry: entry,

    output: {
        path: buildPath,
        filename: isProd ? '[name].[hash].js' : '[name].js'
    },

    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"},
            { test: /\.less$/, exclude: /node_modules/, loader: ExtractTextPlugin.extract('style', 'css?sourceMap!less')}
        ]
    },
    plugins: [
        new ExtractTextPlugin(isProd ? '[name].[hash].css' : '[name].css'),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            inject: 'body',
            chunks: 'app'
            // favicon: 'client/src/assets/images/favicon.png'
        })
    ],
    devServer: {
        proxy: {
            '/api*': {
                target: "http://127.0.0.1:3000",
                secure: false,
                rewrite: function(req) {
                    req.url = req.url.replace(/^\/api/, '');
                }
            }
        },

        contentBase: buildPath,
        host: "0.0.0.0",
        port: 8080,
        historyApiFallback: true
    }
};

