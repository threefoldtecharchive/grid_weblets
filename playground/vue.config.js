const { join } = require("path");
const { DefinePlugin } = require("webpack");
const NodePolyfillWebpackPlugin = require("node-polyfill-webpack-plugin");

const network = process.env.NETWORK || "dev";

module.exports = {
  transpileDependencies: ["vuetify"],
  outputDir: join(__dirname, "..", "dist"),
  publicPath: "/",
  configureWebpack: {
    plugins: [
      new DefinePlugin({
        "process.env.NETWORK": JSON.stringify(network),
      }),
      new NodePolyfillWebpackPlugin(),
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: require.resolve("@open-wc/webpack-import-meta-loader"),
          exclude: /\.vue$/,
        },

        {
          test: /\.m?js$/,
          include: /node_modules[/\\|]@polkadot/i,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@vue/cli-plugin-babel/preset"],
              plugins: [
                "@babel/plugin-proposal-private-methods",
                "@babel/plugin-proposal-class-properties",
                "@babel/plugin-proposal-object-rest-spread",
              ],
            },
          },
        },
      ],
    },
    resolve: {
      alias: {
        crypto: require.resolve("crypto-browserify"),
      },
    },
  },
};
