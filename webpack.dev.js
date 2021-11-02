const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require("path");

module.exports = merge(common, {
	mode: "development",
	devtool: 'source-map',
	output: {
		path: path.join(__dirname, 'public/dist/'),
		filename: '[name].js',
	},
	devServer: {
		liveReload: true,
		watchFiles: ['public/index.html', 'src/js/**/*.js'],
		static: { serveIndex: false }
	}
});