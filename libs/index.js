const path = require("path");
const fs = require('fs');
const Mock = require('mockjs');
const glob = require('glob');
const setConfig = require('./config.js');

let configOptions;

function MockPlugin() {
    let options = arguments[0];
    configOptions = arguments[1];

    //加载设置的mock规则
    configOptions && setConfig(Mock, configOptions.config);

    options = checkOptions(options);
	
    let apply = function(compiler) {
        compiler.hooks.emit.tapAsync('MockPlugin', (compilation, callback) => {
			
            emit(options, compilation, callback);

        });
    };

    return {
        apply: apply
    };
}

//检查参数是否满足
function checkOptions(options) {
	
    if (!Array.isArray(options)) {
		
        options = [options];
    }
	
    options.forEach(function(item) {
        if (!item.from || !item.output) {
            throw ("mock error arguments");
        }
    });
	
	return options;
}

//获取文件任务
function emit(options, compilation, callback) {

    var tasks = [];
    //添加任务清单
    options.forEach(function(item) {
        setTask(tasks, item, compilation);
    });

    //执行完任务，编译完成
    Promise.all(tasks).then(function() {
        console.log("mock end");
        callback();
    });

}

//获取编译任务
function setTask(tasks, opObj, compilation) {

    if (opObj.from) { //配置了文件来源


        let writeUrl = opObj.output;

       
        let fileList = [];
		
		    fileList = glob.sync(opObj.from);
		
		
        fileList.forEach(function(file) {
			
            //文件来源路径
            let filePath = file;

            //增加文件监听
            if (configOptions.watch) {
                compilation.fileDependencies.add(filePath);
            }
			

            //输出的文件路径
            let outFilename = getOutFile(file, writeUrl);
				
			
			
            let fileObj;

            //文件内容
            let fileStr = readFile(filePath);
            

			fileStr = fileStr.replace(/^\s+|\s+$/g, "");
			try {
				fileObj = JSON.parse(fileStr);
			} catch (e) {
				fileObj = { "error": "parse error" + outFilename };
			}

			//mock后的数据
			let data = Mock.mock(fileObj);
			data = JSON.stringify(data, null, 2);

			tasks.push(Promise.resolve().then(function() {
				webpackTo(outFilename, data, compilation);
			}));
            

        });
    }
}


/**
 * 获取编译后的文件名称
 *
 * @param {string} file     [文件名称]
 * @param {string} writeUrl [配置输出的文件字段]
 *
 * @return {string} [编译后的文件路径]
 */
function getOutFile(file, writeUrl) {
    
    let fileExt = path.extname(file);
	let filename = path.basename(file, fileExt);
	let dirname = path.basename(path.dirname(file));
	
    //ext name字段匹配
    if (/\[name\]|\[dirname\]/.test(writeUrl)) {
        filename = writeUrl.replace(/\[dirname\]/, dirname).replace(/\[name\]/, filename);
    } else {
        filename = path.join(writeUrl, filename + fileExt);
    }

    return filename;
}

function readFile(filePath) {
    let fileStr = fs.readFileSync(filePath, 'utf-8');
    return fileStr;
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