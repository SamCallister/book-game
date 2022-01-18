const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = merge(common, {
	plugins: [
		new CopyPlugin({
			patterns: [
				{ from: "public/data", to: "data" },
				{ from: "public/img", to: "img" },
			],
			options: {
				concurrency: 10,
			},
		}),
	],
	mode: 'production',
});