###基于mockjs的webpack插件

解决webpack build后没有mock数据的问题

###安装

	npm i webpack-mockjs-plugin

###使用

在webpack.config.js中配置

	const mockjsPlugin = require('webpack-mockjs-plugin');

	module.exports = {

		new mockjsPlugin([{
			from: './src/assets/goform/', //mock数据文件夹路径
			output: '/goform/', //输出mock数据路径
			ext: "txt" //mock数据文件后缀，编译完后会去除后缀
		},{
			from: './src/assets/cgi-bin/',
			output: '/cgi-bin/',
			ext: "txt"
		}], {
			config: './build/mockConfig.js' //自定义mock规则路径
		})
	}


mockConfig配置文件如下：

	let Mock = require("mockjs")

	module.exports = {
		 ip: function(str) {
			 if(!str) {
				 return this.natural(0,255) + "." + this.natural(0,255) + "." + this.natural(0,255) + "." + this.natural(0,255);
			 }
			let str1 =  str.replace(/\d+-\d+/, function($1) {
				let arr = $1.split("-");
				return Mock.Random.int(arr[0], arr[1]);
			 });
			 return str1;
		 },
		 mac: function() {
			return Mock.mock(/([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}/)
		 }，
		... your rules
	 }