const path = require('path');
module.exports = {
	// entry: './src/index.ts',
	entry: './src/index.js',
	devtool: 'inline-source-map',
	module: {
		rules: [
			//loader css
			{
				test:/\.css$/,
				use:[
					'style-loader',
					'css-loader'
				]
			},
			//图片
			{
				test:/\.(png|svg|jpg|gif)/,
				use:['file-loader']
			},
			// 字体
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/,
				use:['file-loader']
			}
			// {
			// 	test: /\.tsx?$/,
			// 	use: 'ts-loader',
			// 	exclude: /node_modules/
			// }
		]
	},
	resolve: {
		// extensions: [ '.tsx', '.ts', '.js' ]
	},
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist')
	}
};