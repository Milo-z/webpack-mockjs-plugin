const path = require('path');
const fs = require('fs'); 

function setConfig(mockjs, src) {
	
	let configOptions;
	
	try {
		let filesPath = path.resolve(src);
		configOptions = require(filesPath);
		
	} catch(e) {
		configOptions = {};
	}
	
	mockjs.Random.extend(configOptions);
}


module.exports = setConfig
