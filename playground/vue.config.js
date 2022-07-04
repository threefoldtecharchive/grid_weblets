const { join } = require("path");

module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  outputDir: join(__dirname, '..', 'dist'),
  publicPath: '/',
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: require.resolve('@open-wc/webpack-import-meta-loader'),
          exclude: /\.vue$/,
        },

        {
          test: /\.m?js$/,
          include: /node_modules[/\\|]@polkadot/i,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@vue/cli-plugin-babel/preset',
              ],
              plugins: [
                "@babel/plugin-proposal-private-methods",
                "@babel/plugin-proposal-class-properties",
                '@babel/plugin-proposal-object-rest-spread',
              ]
            }
          }
        },
      ]
    }
  },
}
