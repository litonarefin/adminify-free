const path = require("path");
var webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const mode = process.env.NODE_ENV === "production" ? "production" : "development";
const isProduction = "production" === mode;

module.exports = {
    mode,
    optimization: {
        splitChunks: {
            cacheGroups: {},
        },
        minimizer: [
            new CssMinimizerPlugin(),
            !!isProduction && new TerserPlugin(),
        ],
        minimize: !!isProduction,
    },

    plugins: [
        new MiniCssExtractPlugin({
            filename: !!isProduction ? "[name].min.css" : "[name].css",
        })
    ],

    entry: {
        "assets/admin/js/wp-adminify": "./dev/admin/wp-adminify.js",
        "assets/admin/js/wp-adminify-addons": "./dev/admin/addons.js",
        "assets/admin/js/frame": "./dev/admin/frame/index.js",
        "assets/admin/js/wp-adminify--folder": "./dev/admin/modules/folder/index.jsx",
        "assets/admin/js/wp-adminify--popup-folder": "./dev/admin/modules/folder/modal-popup-folder.js",
        "assets/admin/js/wp-adminify--setup-wizard": "./dev/admin/modules/setup-wizard/index.js",
        "assets/admin/js/wp-adminify-menu-editor": "./dev/admin/wp-adminify-menu-editor.js",
        "assets/admin/js/wp-adminify-theme-presetter": "./dev/admin/wp-adminify-theme-presetter.js",
        "assets/vendors/adminify-icon-picker/js/adminify-icon-picker":
            "./dev/vendors/adminify-icon-picker/js/adminify-icon-picker.js",
        // framework js
        "Libs/adminify-framework/assets/js/main": "./dev/admin/adminify-framework/main.js",

        // Dark light scripts
        "assets/admin/js/wp-adminify-dark-mode": "./dev/dark-mode/index.js",

        //SCSS to CSS
        "assets/admin/css/admin": "./dev/admin/frame/index.scss",
        "assets/admin/css/frame": "./dev/scss/frames/_iframe.scss",

        "assets/css/wp-adminify": "./dev/scss/style.scss",
        "assets/css/plugin-survey": "./dev/scss/plugin-survey.scss",
        "assets/css/adminify-menu-editor": "./dev/scss/_menu-editor.scss",
        "assets/css/setup": "./dev/admin/modules/setup-wizard/index.scss",
        "assets/css/wp-adminify-default-ui": "./dev/scss/default-ui/style.scss",
        "assets/vendors/adminify-icon-picker/css/style":
            "./dev/vendors/adminify-icon-picker/css/icon-picker.scss",
        "assets/vendors/font-icons/simple-line-icons/css/simple-line-icons":
            "./dev/vendors/font-icons/simple-line-icons/scss/simple-line-icons.scss",
        "assets/admin/css/wp-adminify--folder": "./dev/admin/modules/folder/folder.scss",
        // Libs
        "Libs/adminify-framework/assets/css/style": "./dev/scss/adminify-framework/style.scss",
        "Libs/adminify-framework/assets/css/style-rtl":
            "./dev/scss/adminify-framework/style-rtl.scss",
    },

    output: {
        path: path.resolve(__dirname, "./"),
        filename: !!isProduction ? "[name].min.js" : "[name].js",
        cssFilename: "[name].css",
    },

    // External libraries configuration
    externals: {
        jquery: "jQuery",
        wp: "wp",
        _wp_adminify: "_wp_adminify",
    },

    module: {
        rules: [
            {
                test: /\.(js|mjs|jsx|ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env", "@babel/preset-react"], // Adjust presets as per your needs
                    },
                },
            },
            {
                test: /.(otf|eot|ttf|woff|woff2|svg)(\?\S*)?$/,
                loader: "file-loader",
                exclude: /fonts/,
                options: {
                    //     // publicPath: "/fonts/",
                    name: "./[path][name].[ext]",
                    emitFile: false,
                },
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: !isProduction,
                            url: false,
                            importLoaders: 1,
                        },
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                ident: "postcss",
                                sourceMap: !isProduction,
                                plugins: ["postcss-preset-env"],
                            },
                        },
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: !isProduction,
                        },
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".tsx", ".jsx", ".js"],
    },
};
