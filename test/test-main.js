var allTestFiles = [];
var amdConfig;
var xhr;
var TEST_REGEXP = /(spec|test)\.js$/i;
var JSON_REGEXP = /\.json$/i;

var pathToModule = function(path) {
  return path.replace(/^\/base\//, '').replace(/\.js$/, '');
};
Object.keys(window.__karma__.files).forEach(function(file) {
	if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    allTestFiles.push(pathToModule(file));
  }
	//the amd-config json file is passed to be able to access the paths config.
	//extract uri here for use in ajax call.
	if(JSON_REGEXP.test(file)){
		amdConfig = file;
	}
});
xhr = new XMLHttpRequest();
xhr.addEventListener('load', configureRequireJs);
xhr.open('GET', amdConfig);
xhr.send();

function configureRequireJs(response) {
	var pathsConfig = (function (paths) {
		var karmaPaths = {};
		Object.keys(paths).forEach(function (path) {
			//todo: prefixed folder should not be hardcoded here
			karmaPaths[path] = 'src/' + paths[path];
		});
		return karmaPaths;
	}(JSON.parse(response.currentTarget.responseText).paths));

	require.config({
		// Karma serves files under /base, which is the basePath from your config file
		baseUrl: '/base',

		paths: pathsConfig,
		// dynamically load all test files
		deps: allTestFiles,

		// we have to kickoff jasmine, as it is asynchronous
		callback: window.__karma__.start
	});
}

