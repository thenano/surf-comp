const path = require("path");
const buildPath = path.join(__dirname, "public");

module.exports = {
    entry: [
        "./src/site.js",
        "webpack-dev-server/client?http://localhost:8080"
    ],

    output: {
        path: buildPath,
        filename: "app.js"
    },

    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
        ]
    },

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

