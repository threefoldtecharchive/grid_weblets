const { join } = require("path");

module.exports = {
    transpileDependencies: [
      'vuetify'
    ],
    outputDir: join(__dirname, 'docs'),
    publicPath: '/easy-docs/'
}