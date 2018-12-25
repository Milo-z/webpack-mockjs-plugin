const path = require("path");
const fs = require('fs');
const Mock = require('mockjs');
const setConfig = require('./config.js');

function MockPlugin() {
  let options = arguments[0];
  let configOptions = arguments[1];
  
  //加载设置的mock规则
  configOptions && setConfig(Mock, configOptions.config);
  
  if(!Array.isArray(options)) {
	  options = [options];
  }

  options.forEach(function(item) {
	  if(!item.from || !item.output) {
		  throw("mock error arguments");
		  return;
	  } 
  });
  
  
  let apply = function(compiler) {
    compiler.hooks.emit.tapAsync('MockPlugin', (compilation, callback) => {

	  emit(options, compilation, callback);
 
    });
  }
  
  return  {
	  apply: apply
  }
}

//获取文件任务
function emit(options, compilation, callback) {
	
	var tasks = [];
	options.forEach(function(item) {
		getTask(tasks, item, compilation);
	});
	
	//编译完成
	Promise.all(tasks).then(function () {
		console.log("mock end");
		callback();
	});
	
}

//获取编译任务
function getTask(tasks, opObj, compilation) {
	if(opObj.from) {
		let filesPath = path.resolve(opObj.from);
			
		let writeUrl = opObj.output;
		
		
		let stats = fs.statSync(filesPath);
		let fileList;
		
		if(stats.isFile()) {
			
		} else if(stats.isDirectory()) {
			fileList = fs.readdirSync(filesPath);
		}
		
		fileList.forEach(function(file) {
		
			let fileStr = fs.readFileSync(path.join(filesPath,file), 'utf-8');
			let filename = path.basename(file, path.extname(file));
			filename = path.join(writeUrl, filename);
			
			if((opObj.ext && path.extname(file) == ("." + opObj.ext) ) || !opObj.ext) {

				fileStr = fileStr.replace(/^\s+|\s+$/g,"");
				
				fileObj = JSON.parse(fileStr);
					
				let data = Mock.mock(fileObj);
				data = JSON.stringify(data);
				tasks.push(Promise.resolve().then(function () {
					webpackTo(filename, data, compilation);
				}));
			}
			
		});
	}
}

//准备写文件
function webpackTo(url, data, compilation) {

	compilation.assets[url] = {
        source() {
          return data;
        },
        size() {
          return data.length;
        }
      };
	
	
}
module.exports = MockPlugin;