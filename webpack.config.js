/* eslint-disable */
const path = require('path');
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = (env, argv) => {
    const mode = argv.mode || 'production';

    let config = {
        mode: argv.mode || 'production',
        devtool: 'source-map',
        resolve: {
            modules: ['node_modules', path.resolve(__dirname, './')],
            extensions: ['.ts', '.tsx', '.js', '.jsx'],
        },
        entry: ['./src/index.tsx'],
        output: {
            path: path.join(__dirname, 'public/dist'),
            filename: 'bundle.js'
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: 'ts-loader'
                },
                {
                    test: /\.js/,
                    use: ['babel-loader'],
                    include: path.join(__dirname, 'src')
                },
                {
                    test: /\.s?css$/,
                    use: ['style-loader', 'css-loader', 'sass-loader']
                }
            ]
        },
        devServer: {
            host: '0.0.0.0',
            contentBase: [path.join(__dirname, 'public'), path.join(__dirname, 'src')],
            compress: true,
            port: 9000,
            hot: true,
            inline: true,
        },
        plugins: [],
    };

    if (mode === 'production') {
        config.plugins.push(new CompressionPlugin());
    }

    return config;
};