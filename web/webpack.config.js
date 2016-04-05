var path = require("path");

module.exports = {
    entry: "./src/site.js",

    output: {
        path: path.join(__dirname, "public"),
        filename: "app.js"
    },

    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
        ]
    }
};

