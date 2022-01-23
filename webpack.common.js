const path = require("path");

module.exports = {
	entry: {
		bookGame: path.join(
			__dirname, "src", "js", "bookGame", "bookGameIndex.tsx"
		)
	},
	output: {
		path: path.join(__dirname, 'dist/'),
		filename: '[name].js',
		library: 'bookGame',
		libraryTarget: 'var'
	},
	module: {
		rules: [
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
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			}
		],
	},
	resolve: {
		extensions: [".json", ".js", ".jsx", '.tsx', '.ts'],
	},

};