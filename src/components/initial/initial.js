/**
 * initial component
 */
(function(window, document) {
	'use strict';

	var isCapableBrowser = 'querySelector' in document;

	/*! loadJS: load a JS file asynchronously. [c]2014 @scottjehl, Filament Group, Inc. (Based on http://goo.gl/REQGQ by Paul Irish). Licensed MIT */
	function loadJS( src, cb ){
		var ref = window.document.getElementsByTagName( "script" )[ 0 ];
		var script = window.document.createElement( "script" );
		script.src = src;
		script.async = true;
		ref.parentNode.insertBefore( script, ref );
		if (cb && typeof(cb) === "function") {
			script.onload = cb;
		}
		return script;
	}

	// load js async and toggle no-js class
	if (isCapableBrowser) {
		loadJS(filePaths.js.path, function () {
			// Enable styling differentiation between browsers who passed our isCapableBrowser test
			document.documentElement.className = document.documentElement.className.replace('no-js', 'js');
		});
	}

}(window, document));