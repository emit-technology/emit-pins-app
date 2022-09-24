const webpack = require('webpack');
const WorkerPlugin = require("worker-plugin");
const path = require('path');

const {
    override,
    addWebpackResolve,
    addWebpackPlugin,
    adjustStyleLoaders,
    addWebpackModuleRule,
    setWebpackPublicPath
} = require("customize-cra");


const publicPathPlugin = (config, env) => {
    config.output = {
        publicPath: '/',
    }
    return config
}

const config = override(
    // setWebpackPublicPath("./"),
    addWebpackResolve({
        fallback:  {
            "buffer": require.resolve('buffer'),
            "fs": false,
            "tls": false,
            "net": false,
            "http": require.resolve("stream-http"),
            "zlib": require.resolve("browserify-zlib") ,
            "path": require.resolve("path-browserify"),
            "stream": require.resolve("stream-browserify"),
            // "util": require.resolve("util/"),
            "crypto": require.resolve("crypto-browserify"),
            "os": require.resolve("os-browserify/browser"),
            "assert": require.resolve('assert'),
            "url": require.resolve('url'),
            "https": require.resolve('https-browserify')
        }
    }),
    addWebpackPlugin(new webpack.ProvidePlugin({
        Buffer: ['buffer','Buffer'],
    }),new WorkerPlugin()),

    addWebpackModuleRule(
        {
            test: /\.worker\.js$/,
            use: { loader: 'worker-loader' }
        }
    ),

    adjustStyleLoaders(({ use: [ , css, postcss, resolve, processor ] }) => {
        css.options.sourceMap = true;         // css-loader
        postcss.options.sourceMap = true;     // postcss-loader
        // when enable pre-processor,
        // resolve-url-loader will be enabled too
        if (resolve) {
            resolve.options.sourceMap = true;   // resolve-url-loader
        }
        // pre-processor
        if (processor && processor.loader.includes('sass-loader')) {
            processor.options.sourceMap = true; // sass-loader
        }
    })
);

// console.log("config", JSON.stringizfy(config));

module.exports = config;