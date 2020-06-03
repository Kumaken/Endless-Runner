const path = require('path');
module.exports = {
	entry: './src/app.ts',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/
			}
		]
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js']
	},
	output: {
		filename: 'app.js',
		path: path.resolve(__dirname, 'dist'),
		publicPath: '/dist/'
	},
	// this enables live reloading! none else works!
	devServer: {
		watchContentBase: true
	},
	mode: 'development'
};
