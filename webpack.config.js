const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js'
    },



  devServer: {
    static: './dist',
    compress: true,
    port: 8080,
  },
  
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_DEBUG' : JSON.stringify('development')
        }),
        new CopyWebpackPlugin(
            { 
              patterns: [
                { from: 'src/index.js', to: './' },
                { from: 'src/index.html', to: './' }
              ]
            }
          ),

          
    ],

    resolve: {
        fallback: {
            util: require.resolve("util/"),
          }
      },
};