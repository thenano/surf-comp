const path = require("path");
const buildPath = path.join(__dirname, "public");

module.exports = {
    entry: ["./src/site.js", "webpack-dev-server/client?http://localhost:8080"],

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
        contentBase: buildPath,
        host: "0.0.0.0",
        port: 8080,
        historyApiFallback: true
    }
};

