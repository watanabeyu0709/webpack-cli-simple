/*
* 总体：热加载(不含组件热加载),全局挂载,自动清理产出文件夹
* html：html模板引擎,svg行内挂载
* css: less sass 分离样式表 自动补全前缀hack 支持css4(与less sass 冲突 选择性使用)
* js: 支持es6 typescript 代码分离
* 图片：压缩 编码
* 字体：压缩
*/

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');//html模板引擎
const CleanWebpackPlugin = require('clean-webpack-plugin');//构建时清理
const ExtractTextPlugin = require("extract-text-webpack-plugin");//分离样式表
const extractCSS = new ExtractTextPlugin(process.env.NODE_ENV === 'production'?'css/[name]-css.[chunkhash].css':'css/[name]-css.css');//导出css
const extractSass = new ExtractTextPlugin(process.env.NODE_ENV === 'production'?'css/[name]-sass.[chunkhash].css':'css/[name]-sass.css');//导出sass

module.exports = {
    devtool: process.env.NODE_ENV === 'production'?"inline-source-map":"source map",
    entry: {
        index: './src/js/index.js',
        /* //其他页面
        other: './src/js/other.js'*/
    },
    output: {
        filename: process.env.NODE_ENV === 'production'?'js/[name].bundle.[chunkhash].js':'js/[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: extractCSS.extract({
                    fallback: 'style-loader',
                    use: ['css-loader?importLoaders=1','postcss-loader'],
                    publicPath: "../"
                }),
            },
            {
                test: /\.less$/,
                use: extractSass.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'less-loader','postcss-loader'],
                    publicPath: "../"
                })
            },
            {
                test: /\.scss/i,
                use: extractSass.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'sass-loader','postcss-loader'],
                    publicPath: "../"
                })
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['es2015']
                    }
                }
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: [
                    'file-loader?hash=sha512&digest=hex&name=img/[hash].[ext]',
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            gifsicle: {
                                interlaced: false,
                            },
                            optipng: {
                                optimizationLevel:process.env.NODE_ENV === 'production'?7:1,
                            },
                            pngquant: {
                                quality: '65-90',
                                speed: 4
                            },
                            mozjpeg: {
                                progressive: true,
                                quality: 65
                            }
                        }
                    }
                ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    'file-loader?name=font/[hash:8].[ext]'
                ]
            },
            {
                test: /\.html$/,
                use: [
                    'html-loader',
                    'markup-inline-loader?strict=[markup-inline]',
                ]
            }
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    plugins: [
        //全局挂载
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery",
        }),
        //清理dist
        new CleanWebpackPlugin(['dist']),
        //自动产出html
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: __dirname + "/src/index.tmpl.html",
            inject: 'body',
            hash: true,
            chunks: ['index'],
        }),
        /* //其他页面
        new HtmlWebpackPlugin({
            filename: 'other.html',
            template: __dirname + "/src/other.tmpl.html",
            inject: 'body',
            hash: true,
            chunks: ['other'],
        }),*/
        //丑化JS
        new webpack.optimize.UglifyJsPlugin({
            compress: process.env.NODE_ENV === 'production'
        }),
        //提出公共模块 需要页面中引用
        /*new webpack.optimize.CommonsChunkPlugin({
            name: 'common'
        }),*/
        //样式导出配置
        extractCSS,
        extractSass
    ]
};
