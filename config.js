
var paths = {
	src: 'src/',
	srcComponents: 'src/components/',
	srcVendor: 'src/vendor/',
	srcViews: 'src/views/',
	dist: 'dist/',
	distAssets: 'dist/assets/',
	amdConfig: './src/amd-config.json'
};
paths.assets = [
		paths.src + 'assets/**/*.*',
		paths.srcComponents + '*/assets/**/*.*',
		paths.srcViews + '*/assets/**/*.*'
];
// source files are all files directly in module sub directories and core files,
// excluding abstract files/dirs starting with '_'.
paths.srcFiles = [
		paths.src + '*',
		paths.srcComponents + '*/*',
		paths.srcViews + '*/*' //,
//		'!' + paths.src + '_*',
//		'!' + paths.srcComponents + '_*/*',
//		'!' + paths.srcViews + '_*/*'
];
paths.htmlFiles = paths.srcFiles.map(function(path){ return path + '.html'; });
paths.jsFiles   = paths.srcFiles.map(function(path){ return path + '.js'; });
paths.lessFiles = paths.srcFiles.map(function(path){ return path + '.less'; });

module.exports = {
	paths: paths
};