const path = require('path');
const CleanWebpackPlugin =  require('clean-webpack-plugin')
const HtmlWebpackPlugin =  require('html-webpack-plugin')
const webpack =  require('webpack')
module.exports = {
	mode: "development",//模式
	entry: './src/index.ts',//入口文件
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
			},
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/
			}
		]
	},
	plugins: [
		new CleanWebpackPlugin(['dist']),//清空dist文件夹
		//设置html
		new HtmlWebpackPlugin({
			title:'Hello I am TypeScript~~ I am rebuild flv.js project!'
		}),
		new webpack.HotModuleReplacementPlugin()
	],
	resolve: {
		extensions: [ '.tsx', '.ts', '.js' ]
	},
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist')
	}
};