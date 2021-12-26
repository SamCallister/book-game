const path = require("path");

module.exports = {
	entry: {
		bookGame: path.join(
			__dirname, "src", "js", "bookGame", "bookGameIndex.js"
		)
	},
	output: {
		path: path.join(__dirname, 'dist/'),
		filename: '[name].js',
	},
	module: {
		rules: [{
			test: /\.jsx?$/,
			exclude: [
				path.resolve(__dirname, "node_modules"),
			],
			include: path.resolve(__dirname, "src"),
			use: ["babel-loader"]
		},
		{
			test: /\.(png|jpg|gif)$/i,
			use: [
				{
					loader: 'url-loader',
					options: {
						limit: 5000,
					},
				},
			],
		},
		{
			test: /\.css$/i,
			exclude: [
				path.resolve(__dirname, "node_modules"),
			],
			include: path.resolve(__dirname, "src"),
			use: ['style-loader', 'css-loader'],
		},
		],
	},
	resolve: {
		extensions: [".json", ".js", ".jsx"],
	},

};