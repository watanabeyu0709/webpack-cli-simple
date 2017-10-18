/*
    总体：热加载(不含组件热加载),全局挂载,自动清理产出文件夹,区分处理开发和发布环境

    html：html模板引擎,svg行内挂载

    css: less sass 分离样式表 自动补全前缀hack 支持css4(与less sass 冲突 选择性使用)

    js: 支持es6 typescript 代码分离 提取公共模块 丑化

    图片：压缩 base64编码

    字体：压缩
*/

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');//html模板引擎
const CleanWebpackPlugin = require('clean-webpack-plugin');//构建时清理
const ExtractTextPlugin = require("extract-text-webpack-plugin");//分离样式表
const extractCSS = new ExtractTextPlugin(process.env.NODE_ENV === 'production'?'css/[name]-css.[chunkhash].css':'css/[name]-css.css');//导出css
const extractSass = new ExtractTextPlugin(process.env.NODE_ENV === 'production'?'css/[name]-sass.[chunkhash].css':'css/[name]-sass.css');//导出sass
const babili = require('babili-webpack-plugin')//babel压缩

let webpackConfig = module.exports = {
    devtool: process.env.NODE_ENV === 'production'?"cheap-module-source-map":"cheap-module-eval-source-map",
    entry: {
        index: ['babel-polyfill','./src/js/index.js'],
        /* //其他页面
        other: ['babel-polyfill','./src/js/other.js'],*/
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
                        presets: [
                            ["env", {
                                "targets": {
                                    "browsers": ["> 1%", "last 2 versions", "not ie <= 8"],
                                    "node":"current"
                                }
                            }]
                        ]
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
                                optimizationLevel:process.env.NODE_ENV.includes('production')?7:1,
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
        //react 压缩处理
        (process.env.NODE_ENV === 'production')?
            new webpack.DefinePlugin({
                "process.env": {
                    NODE_ENV: JSON.stringify("production")
                }
            }):function(){},
        //自动产出html
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: __dirname + "/src/template.html",
            inject: 'body',
            hash: true,
            chunks: ['index'],
        }),
        //丑化JS
        (process.env.NODE_ENV === 'production') ? new babili() : function(){},
        //样式导出配置
        extractCSS,
        extractSass
    ]
};

/*/!*循环自动生成HTML*!/
for(let page in webpackConfig.entry){
    webpackConfig.plugins.push(new HtmlWebpackPlugin({
        filename: page+'.html',
        template: __dirname + "/src/template.html",
        inject: 'body',
        hash: true,
        chunks: [page],
    }))
}*/
