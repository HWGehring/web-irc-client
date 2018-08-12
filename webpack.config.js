"use strict";
const webpack = require('webpack');
const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: ['./ui/app/index.js', './ui/style/index.scss'],
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'public/build')
    },
    module: {
        rules: [
            {
                test: /\.woff2?$|\.ttf$|\.eot$|\.svg$/,
                use: [{
                    loader: "file-loader"
                }]
            },
            {
                test: /\.scss$/,
                use: [
                    "style-loader", // creates style nodes from JS strings
                    "css-loader", // translates CSS into CommonJS
                    "sass-loader" // compiles Sass to CSS, using Node Sass by default
                ]
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('index.css')
    ]
};
