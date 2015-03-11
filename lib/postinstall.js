var wrench = require('wrench');
var fs = require('fs');
wrench.copyDirRecursive('boilerplate/src', './../../src', {forceDelete: true}, function(){
	wrench.copyDirRecursive('boilerplate/test', './../../test', {forceDelete: true}, function(){
		fs.createReadStream('boilerplate/gulpfile.js').pipe(fs.createWriteStream('./../../gulpfile.js'));
		fs.createReadStream('boilerplate/.jscsrc').pipe(fs.createWriteStream('./../../.jscsrc'));
		fs.createReadStream('boilerplate/.jshintignore').pipe(fs.createWriteStream('./../../.jshintignore'));
		fs.createReadStream('boilerplate/.recessrc').pipe(fs.createWriteStream('./../../.recessrc'));
		fs.createReadStream('boilerplate/bower.json').pipe(fs.createWriteStream('./../../bower.json'));
	});
});