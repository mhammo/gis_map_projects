const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;
const merge = require('webpack-merge');

module.exports = (env) => {
    const isDevBuild = true;

    // Configuration in common to both client-side and server-side bundles
    const sharedConfig = () => ({
        stats: { modules: false },
        resolve: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
        output: {
            filename: '[name].js',
            publicPath: 'dist/' // Webpack dev middleware, if enabled, handles requests for this URL prefix
        },
        module: {
            rules: [
                { test: /\.tsx?$/, include: /src/, use: 'awesome-typescript-loader?silent=true' },
                { 
                    test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf)$/, 
                    use: {
                        loader: 'file-loader',
                        options: {
                            publicPath: ''
                        }
                    }
                },
                { 
                    test: /\.js?$/, 
                    exclude: /(node_modules)/, 
                    include: /src/, 
                    use: { 
                        loader: "babel-loader", 
                        options: { presets: ["@babel/preset-env"] } 
                    } 
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
        plugins: [new CheckerPlugin()]
    });

    // Configuration for client-side bundle suitable for running in browsers
    const clientBundleOutputDir = './dist';
    const bundleConfig = merge(sharedConfig(), {
        entry: { 'main-client': ['./src/index.js'] },
        module: {
            rules: [
                { test: /\.css$/, use: ExtractTextPlugin.extract({ use: isDevBuild ? 'css-loader' : 'css-loader?minimize' }) },
                {
                    test: /\.scss$/,
                    loader: ExtractTextPlugin.extract(['css-loader', 'postcss-loader', 'sass-loader'])
                }
            ]
        },
        output: { 
            path: path.join(__dirname, clientBundleOutputDir),
            library: 'sibsvis' // Change this to whatever you want your library to be listed under
			// 				   // I.E with the current setting you'd load the file into your HTML and reference your function as 'exports.[function-name]'
            },
        plugins: [
            new ExtractTextPlugin({ // define where to save the file
                filename: '[name].bundle.css',
                allChunks: true,
              }),
        ].concat(isDevBuild ? [
            // Plugins that apply in development builds only
            new webpack.SourceMapDevToolPlugin({
                filename: '[file].map', // Remove this line if you prefer inline source maps
                moduleFilenameTemplate: path.relative(clientBundleOutputDir, '[resourcePath]') // Point sourcemap entries to the original file locations on disk
            })
        ] : [
            // Plugins that apply in production builds only
            new webpack.optimize.UglifyJsPlugin()
        ])
    });


    return [bundleConfig];
};